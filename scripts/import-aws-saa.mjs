// 실행: node scripts/import-aws-saa.mjs /path/to/study/AWS-SAA
// 배포 시에는 가져온 YAML·학습자료를 사용한다. 원본 문제·정답 문서는 수정하지 않는다.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
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
const days = [15, 16, 17, 18, 19, 20, 22, 24, 26, 27, 29];
const courseDir = 'content/aws-saa';
mkdirSync(courseDir, { recursive: true });
const sections = (s) => [...s.matchAll(/^## (Q\d+-\d+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
const colors = ['#FF9900', '#4385ef', '#8b5cf6', '#13a87b'];
const units = [];
const edits = JSON.parse(readFileSync(new URL('./aws-saa-option-edits.json', import.meta.url), 'utf8'));
let total = 0;
let multi = 0;
for (const [index, day] of days.entries()) {
  const questions = readFileSync(join(source, `practice/day-${day}.md`), 'utf8');
  const answers = new Map(sections(readFileSync(join(source, `practice/answers/day-${day}.md`), 'utf8')).map((m) => [m[1], m[2]]));
  const name = questions.match(/^# .*?: (.+)$/m)[1];
  const id = `saa-day-${day}`;
  units.push(id);
  const items = sections(questions).map(([, qid, body]) => {
    const count = Number(body.match(/\*\*(\d+)개 선택/)[1]);
    const options = [...body.matchAll(/^- \*\*([A-Z])\.\*\* (.+)$/gm)].map((m) => [m[1], edits[m[2]] ?? m[2]]);
    const optionMap = Object.fromEntries(options);
    const answer = answers.get(qid);
    assert(answer, qid);
    const keys = answer.match(/\*\*정답: ([A-Z, ]+)\*\*/)[1].split(',').map((k) => k.trim());
    assert.equal(keys.length, count, qid);
    assert(keys.every((k) => optionMap[k]), qid);
    const prompt = body.split(/\*\*\d+개 선택/)[0].trim();
    // 보기 순서를 섞어도 오답 해설이 원래 A/B/C 문자를 가리키지 않도록 선택지 문장으로 바꾼다.
    let explanation = answer.replace(/^\s*\*\*정답:.*?\*\*\s*/, '')
      .replace(/^\| ([A-Z]) \|/gm, (_, key) => `| ${optionMap[key].replaceAll('|', '&#124;')} |`)
      .replaceAll('../../lessons/', '/study/lessons/').replace(/(\/study\/lessons\/[^)]+)\.md/g, '$1.html');
    explanation = marked.parse(explanation);
    total++;
    if (count > 1) multi++;
    return { id: qid, type: 'mcq', title: `${qid} · ${name}`, explain: explanation,
      quizzes: [{ q: prompt, answer: optionMap[keys[0]], wrong: options.filter(([k]) => !keys.includes(k)).map(([, v]) => v),
        ...(count > 1 ? { answers: keys.map((k) => optionMap[k]), options: options.map(([, v]) => v) } : {}) }] };
  });
  writeFileSync(`${courseDir}/${id}.yaml`, YAML.stringify({ id, name, part: `${day}일 차`, color: colors[index % colors.length], dark: '#985800',
    blocks: [{ tip: 'SAA 시험 범위를 바탕으로 만든 창작 문제입니다. 실제 기출문제가 아닙니다. 복수 정답은 지정한 개수를 모두 맞혀야 합니다.' }, { items }] }));
}
assert.equal(total, 320);
assert.equal(multi, 62);
writeFileSync(`${courseDir}/course.yaml`, YAML.stringify({ id: 'aws-saa', name: 'AWS-SAA', icon: 'SAA',
  desc: '보안·네트워크·컴퓨팅·저장소·서버리스와 모의고사 · 창작 320문제', color: '#FF9900', dark: '#CC7A00',
  notes: { file: 'notes-aws-saa.html', title: 'AWS-SAA 해설 · 덕구 퀴즈', h1: 'AWS-SAA 문제와 해설',
    lede: '실제 기출문제가 아닌 창작 320문제입니다. 공식 자료와 개념 학습자료를 해설에 연결했습니다. 문제를 먼저 풀려면 퀴즈 모드로 답을 가리세요.',
    back_label: '← AWS-SAA 레슨으로', footer: 'SAA 시험 범위에 맞춰 만든 창작 문제이며 AWS 공식 모의고사는 아닙니다.', storage_key: 'duckgu-saa-notes-v1' }, units }));

// 교재와 SVG도 함께 배포해 해설에서 선수 개념으로 바로 이동할 수 있게 한다.
mkdirSync('public/study/lessons/deep-dive', { recursive: true });
cpSync(join(source, 'assets'), 'public/study/assets', { recursive: true });
const style = '<style>body{font:17px/1.8 system-ui,sans-serif;max-width:850px;margin:auto;padding:24px;color:#243047}img,svg{max-width:100%;height:auto}table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #ccd3df;padding:8px}pre{overflow:auto;background:#eef1f5;padding:16px}a{color:#1769bb}</style>';
for (let day = 1; day <= 14; day++) for (const dir of ['lessons', 'lessons/deep-dive']) {
  const file = `day-${String(day).padStart(2, '0')}.md`;
  const md = readFileSync(join(source, dir, file), 'utf8');
  headingIds = new Map();
  const html = marked.parse(md).replace(/href="([^"]+)\.md(#[^"]*)?"/g, (_, p, fragment = '') => {
    if (p.startsWith('http')) return `href="${p}.md${fragment}"`;
    // 교재 내부 연결은 배포한 28편에 한정한다. 관리 문서·문제 목차는 퀴즈 코스로 연결한다.
    return /(?:^|\/)day-\d+$/.test(p) && !p.includes('practice') ? `href="${p}.html${fragment}"` : 'href="/course/aws-saa"';
  });
  writeFileSync(`public/study/${dir}/${file.replace('.md', '.html')}`, `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${md.split('\n')[0].replace(/^# /, '')}</title>${style}<body><a href="/course/aws-saa">← AWS-SAA 퀴즈</a>${html}</body></html>`);
}
console.log(`AWS-SAA ${total}문제(복수 정답 ${multi}) · 기본/심화 28편 가져옴`);
