// 실행: node scripts/import-aws-saa.mjs /path/to/study/AWS-SAA
// 배포 시에는 가져온 YAML·학습자료를 사용한다. 원본 문제·정답 문서는 수정하지 않는다.
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import YAML from 'yaml';
import { marked } from 'marked';

// marked 기본 출력에는 제목 id가 없어 교재의 절별 링크가 끊긴다.
let headingIds = new Map();
marked.use({ renderer: { heading({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const slug = text.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
  const count = headingIds.get(slug) ?? 0;
  headingIds.set(slug, count + 1);
  return `<h${depth} id="${slug}${count ? `-${count}` : ''}">${text}</h${depth}>\n`;
} } });

const source = resolve(process.argv[2] ?? '../study/AWS-SAA');
const reviews = readdirSync(join(source, 'practice/reviews')).filter((f) => /^independent-.*\.json$/.test(f))
  .flatMap((f) => JSON.parse(readFileSync(join(source, 'practice/reviews', f), 'utf8')));
const reviewed = new Map(reviews.map((r) => [r.id, r]));
assert(reviews.length === 320 && reviewed.size === 320, '320문항의 독립 검토 결과가 필요합니다');
const sameSet = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const fingerprint = (q) => createHash('sha256').update(JSON.stringify({ domain: q.domain, id: q.id,
  options: Object.fromEntries(Object.entries(q.options).sort()), prompt: q.prompt, select: q.select })).digest('hex');
const days = [15, 16, 17, 18, 19, 20, 22, 24, 26, 27, 29];
const courseDir = 'content/aws-saa';
const revision = 'saa-r2';
mkdirSync(courseDir, { recursive: true });
const sections = (s) => [...s.matchAll(/^## (Q\d+-\d+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
const colors = ['#FF9900', '#4385ef', '#8b5cf6', '#13a87b'];
const units = [];
let total = 0;
let multi = 0;
for (const [index, day] of days.entries()) {
  const bank = JSON.parse(readFileSync(join(source, `practice/banks/day-${day}.json`), 'utf8'));
  assert(bank.questions.every((q) => q.exam_revision?.prerequisites?.length && q.exam_revision?.decisive_condition), `day-${day}: 개정 원본과 선수 개념 검토가 필요합니다`);
  for (const q of bank.questions) {
    const review = reviewed.get(q.id);
    assert(review?.status === 'pass' && review.question_hash === fingerprint(q) && sameSet(review.selected, q.answer), `${q.id}: 독립 검토한 원고와 다릅니다`);
  }
  const questions = readFileSync(join(source, `practice/day-${day}.md`), 'utf8');
  const answers = new Map(sections(readFileSync(join(source, `practice/answers/day-${day}.md`), 'utf8')).map((m) => [m[1], m[2]]));
  const name = questions.match(/^# .*?: (.+)$/m)[1];
  const id = `${revision}-day-${day}`;
  units.push(id);
  const items = sections(questions).map(([, qid, body]) => {
    const count = Number(body.match(/\*\*(\d+)개 선택/)[1]);
    const options = [...body.matchAll(/^- \*\*([A-Z])\.\*\* (.+)$/gm)].map((m) => [m[1], m[2]]);
    const optionMap = Object.fromEntries(options);
    const answer = answers.get(qid);
    assert(answer, qid);
    const keys = answer.match(/\*\*정답: ([A-Z, ]+)\*\*/)[1].split(',').map((k) => k.trim());
    assert.equal(keys.length, count, qid);
    assert(keys.every((k) => optionMap[k]), qid);
    const prompt = body.split(/\*\*\d+개 선택/)[0].trim();
    const original = bank.questions.find((q) => q.id === qid);
    assert(original?.prompt === prompt && sameSet(Object.values(original.options), options.map(([, v]) => v))
      && sameSet(original.answer.map((k) => original.options[k]), keys.map((k) => optionMap[k])), `${qid}: 원본과 렌더된 문제·정답이 다릅니다`);
    // 보기 순서를 섞어도 오답 해설이 원래 A/B/C 문자를 가리키지 않도록 선택지 문장으로 바꾼다.
    let explanation = answer.replace(/^\s*\*\*정답:.*?\*\*\s*/, '')
      .replace(/^\| ([A-Z]) \|/gm, (_, key) => `| ${optionMap[key].replaceAll('|', '&#124;')} |`)
      .replaceAll('../../lessons/', '/study/lessons/').replace(/(\/study\/lessons\/[^)\s]+)\.md(?=[#)])/g, '$1.html');
    explanation = marked.parse(explanation);
    total++;
    if (count > 1) multi++;
    return { id: `${revision}-${qid}`, source_id: qid, type: 'mcq', title: `${qid} · ${name}`, explain: explanation,
      quizzes: [{ q: prompt, answer: optionMap[keys[0]], wrong: options.filter(([k]) => !keys.includes(k)).map(([, v]) => v),
        ...(count > 1 ? { answers: keys.map((k) => optionMap[k]), options: options.map(([, v]) => v) } : {}) }] };
  });
  writeFileSync(`${courseDir}/${id}.yaml`, YAML.stringify({ id, name, part: `${day}일 차`, color: colors[index % colors.length], dark: '#985800',
    blocks: [{ tip: 'SAA 시험 범위를 바탕으로 만든 창작 문제입니다. 실제 기출문제가 아닙니다. 복수 정답은 지정한 개수를 모두 맞혀야 합니다.' }, { items }] }));
}
assert.equal(total, 320);
assert.equal(multi, 62);
writeFileSync(`${courseDir}/course.yaml`, YAML.stringify({ id: 'aws-saa', name: 'AWS-SAA', icon: 'SAA',
  desc: '공식 샘플 유형을 참고한 설계 판단 · 개정 2판 · 창작 320문제', color: '#FF9900', dark: '#CC7A00',
  notes: { file: 'notes-aws-saa.html', title: 'AWS-SAA 해설 · 덕구 퀴즈', h1: 'AWS-SAA 문제와 해설',
    lede: '공식 샘플의 판단 방식을 참고해 개정한 창작 320문제입니다. 실제 기출문제가 아닙니다. 문제를 먼저 풀려면 퀴즈 모드로 답을 가리세요.',
    back_label: '← AWS-SAA 레슨으로', footer: 'SAA 시험 범위에 맞춰 만든 창작 문제이며 AWS 공식 모의고사는 아닙니다.', storage_key: 'duckgu-saa-notes-v1' }, units }));

// 교재와 SVG도 함께 배포해 해설에서 선수 개념으로 바로 이동할 수 있게 한다.
mkdirSync('public/study/lessons/deep-dive', { recursive: true });
cpSync(join(source, 'assets'), 'public/study/assets', { recursive: true });
const style = '<style>body{font:17px/1.8 system-ui,sans-serif;max-width:850px;margin:auto;padding:24px;color:#243047}img,svg{max-width:100%;height:auto}table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #ccd3df;padding:8px}pre{overflow:auto;background:#eef1f5;padding:16px}a{color:#1769bb}</style>';
const handouts = [];
handouts.push(['lessons', 'service-reference.md']);
for (let day = 1; day <= 14; day++) for (const dir of ['lessons', 'lessons/deep-dive']) handouts.push([dir, `day-${String(day).padStart(2, '0')}.md`]);
if (existsSync(join(source, 'lessons/exam-supplement'))) {
  for (const file of readdirSync(join(source, 'lessons/exam-supplement')).filter((f) => f.endsWith('.md'))) handouts.push(['lessons/exam-supplement', file]);
}
for (const [dir, file] of handouts) {
  mkdirSync(`public/study/${dir}`, { recursive: true });
  const md = readFileSync(join(source, dir, file), 'utf8');
  headingIds = new Map();
  const html = marked.parse(md).replace(/href="([^"]+)\.md(#[^"]*)?"/g, (_, p, fragment = '') => {
    if (p.startsWith('http')) return `href="${p}.md${fragment}"`;
    // 교재 내부 연결은 배포한 28편에 한정한다. 관리 문서·문제 목차는 퀴즈 코스로 연결한다.
    const target = resolve(source, dir, `${p}.md`);
    return target.startsWith(`${source}/lessons/`) && existsSync(target) ? `href="${p}.html${fragment}"` : 'href="/course/aws-saa"';
  });
  writeFileSync(`public/study/${dir}/${file.replace('.md', '.html')}`, `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${md.split('\n')[0].replace(/^# /, '')}</title>${style}<body><a href="/course/aws-saa">← AWS-SAA 퀴즈</a>${html}</body></html>`);
}
console.log(`AWS-SAA 개정 2판 ${total}문제(복수 정답 ${multi}) · 학습자료 ${handouts.length}편 가져옴`);
