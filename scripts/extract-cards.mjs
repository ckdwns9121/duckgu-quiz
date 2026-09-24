// 코스마다 학습 노트(public/<notes>.html)에서 퀴즈 카드를 뽑아 src/data/cards/<코스>.json으로 저장한다.
// 코스와 유닛 목록은 src/data/courses.json. 노트를 고친 뒤 `pnpm extract`를 다시 실행하면 퀴즈에도 반영된다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const { courses } = JSON.parse(readFileSync('src/data/courses.json', 'utf8'));
let document;
const text = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent.replace(/\s+/g, ' ').trim();
};

// ---------- 힌트 ----------
// 힌트는 정답을 직접 보여 주면 안 된다: 용어 이름은 ○○로 가리고, 코드 답이 든 줄은 뺀다.
const squash = (t) => t.toLowerCase().replace(/[\s'"`,[\]{}()]/g, '');
const mask = (html, words) => words.filter((w) => w && w.length >= 2).reduce((acc, w) => acc.split(w).join('○○'), html);
const nameWords = (title) => {
  const m = title.match(/^(.*?)\s*\((.*)\)$/);
  return m ? [m[1].trim(), m[2].trim()] : [title.trim()];
};
/**
 * 이 줄을 보여 주면 정답이 드러나는지.
 * 긴 답("7 5 7")은 줄 안에 통째로 있으면 드러난 것으로 본다.
 * "B", "1" 같은 짧은 답은 어느 줄에나 흔히 들어 있어서, 줄이 그 답으로 끝날 때("→ B")만 드러난 것으로 본다.
 */
export function revealsAnswer(line, answer) {
  const a = squash(answer);
  if (a.length > 3) return squash(line).includes(a);
  // "(B)", "\"B\"" 처럼 괄호나 따옴표로 짚어 주면 답을 알려 주는 것과 같다
  if (new RegExp(`[("'“]\\s*${answer.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[)"'”]`).test(line)) return true;
  const tokens = line.split(/[^0-9A-Za-z가-힣.-]+/).filter(Boolean);
  return tokens.length > 0 && squash(tokens[tokens.length - 1]) === a;
}
function answerHints(explainHtml, answer) {
  const box = document.createElement('div');
  box.innerHTML = explainHtml;
  const hints = [];
  const first = box.querySelector('.steps li');
  if (first && !revealsAnswer(first.textContent, answer)) hints.push(first.innerHTML.trim());
  const rule = [...box.querySelectorAll('p.why')].pop();
  if (rule && !revealsAnswer(rule.textContent, answer)) hints.push(rule.innerHTML.trim());
  return hints;
}
function firstSentence(html) {
  const t = text(html);
  const i = t.search(/[.]\s/);
  return i > 0 ? t.slice(0, i + 1) : t;
}


// ---------- 보기용 짧은 설명과, 묶음 카드 나누기 ----------
/** 보기에는 첫 문장만 쓴다. 폰에서 한 보기가 3~4줄이 되면 읽기 힘들다 */
const shortOf = (t) => {
  const i = t.search(/[.]\s|[.]$/);
  return (i > 0 ? t.slice(0, i) : t).trim();
};
/**
 * "RIP / OSPF / BGP"처럼 여러 개를 묶은 카드를 이름별 설명으로 나눈다.
 * 설명이 "RIP: …. OSPF: …."(또는 "IPv4 = …") 꼴이면 이름 뒤 콜론부터 다음 이름 앞까지가 그 설명이다.
 * 포트처럼 "22 / 23"이면 순서대로 짝짓는다. 나눌 수 없으면 빈 배열.
 */
function segmentsOf(term, meaningText) {
  const names = term.split(/\s+[\/·]\s+/).map((x) => x.trim()).filter(Boolean);
  if (names.length < 2) return [];
  const values = meaningText.split(/\s+\/\s+/);
  if (values.length === names.length && values.every((v) => v.length <= 12)) {
    return names.map((label, i) => ({ label, text: values[i].trim() }));
  }
  const found = [];
  let from = 0;
  for (const name of names) {
    const at = meaningText.indexOf(name, from);
    if (at < 0) return [];
    const rest = meaningText.slice(at);
    const m = rest.match(/^([^:=.]{0,14}?)\s*[:=]\s*/);
    if (!m) return [];
    found.push({ at, label: m[1].trim(), body: at + m[0].length });
    from = at + m[0].length;
  }
  return found.map((f, i) => {
    const end = i + 1 < found.length ? found[i + 1].at : meaningText.length;
    const body = shortOf(meaningText.slice(f.body, end).replace(/[,.]\s*$/, ''));
    return { label: f.label, text: mask(body, names) };
  });
}

mkdirSync('src/data/cards', { recursive: true });
for (const course of courses) {
document = new JSDOM(readFileSync(`public/${course.notes}`, 'utf8')).window.document;
const cards = [];
for (const unit of course.units.map((u) => u.id)) {
  const sec = document.getElementById(unit);
  if (!sec) throw new Error(`${course.id}: 노트에 섹션 #${unit}이 없음`);
  let table = 0;
  for (const el of sec.querySelectorAll('table, [data-id]')) {
    if (el.tagName === 'TABLE') { table++; continue; }
    const id = el.dataset.id;
    if (el.dataset.quiz === 'off') continue;
    if (el.tagName === 'TR') {
      const heads = [...el.closest('table').querySelectorAll('thead th')].map((th) => th.textContent.trim());
      const termCell = el.querySelector('td.term');
      const parts = [];
      [...el.querySelectorAll('td')].forEach((td, i) => {
        if (td.classList.contains('c') || td === termCell) return;
        parts.push({ label: heads[i] ?? '', html: td.innerHTML.trim(), hint: !td.classList.contains('ans') || td.classList.contains('hint') });
      });
      const clone = termCell.cloneNode(true);
      const small = clone.querySelector('small');
      const sub = small ? small.textContent.trim() : '';
      small?.remove();
      const term = clone.textContent.trim();
      const hintPart = parts.slice(1).find((p) => p.hint) ?? parts.find((p, i) => i > 0);
      const hints = hintPart ? [mask(hintPart.html, [term, sub, ...term.split(/\s*\/\s*/)])] : [];
      const meaning = text(parts[0]?.html ?? '');
      cards.push({
        kind: 'term', id, unit, table: `${unit}:${table}`, col: heads[1] ?? '용어', term, sub, meaning,
        short: mask(shortOf(meaning), [term, sub]), segments: segmentsOf(term, meaning), parts, hints,
      });
      continue;
    }
    const clone = el.cloneNode(true);
    clone.querySelectorAll('input, label.chk').forEach((n) => n.remove());
    const quizzes = [...clone.querySelectorAll('ul.quiz-opts')];
    if (quizzes.length) {
      quizzes.forEach((ul) => ul.remove());
      const explain = clone.querySelector('.ans')?.innerHTML.trim() ?? '';
      const title = clone.querySelector('h3')?.textContent.trim() ?? '';
      const pre = clone.querySelector('pre')?.outerHTML ?? '';
      const why = [...clone.querySelectorAll('.ans p.why')].pop();
      quizzes.forEach((ul, i) => {
        const options = [...ul.querySelectorAll('li')].map((li) => li.textContent.trim());
        const correct = ul.querySelector('li.ok')?.textContent.trim() ?? options[0];
        const hints = why && !why.textContent.includes(correct) ? [why.innerHTML.trim()] : [];
        cards.push({ kind: 'mcq', id: i ? `${id}-${i + 1}` : id, unit, title, q: ul.dataset.q, pre, options, correct, explain, hints });
      });
      continue;
    }
    // 조각으로 만들기 문제: 정답 조각은 .build-answer의 li 순서, 가짜 조각은 data-decoys
    if (el.dataset.build) {
      const tokens = [...clone.querySelectorAll('.build-answer li')].map((li) => li.textContent.trim());
      const decoys = (el.dataset.decoys ?? '').split('|').filter(Boolean);
      const explain = clone.querySelector('.ans')?.innerHTML.trim() ?? '';
      const title = clone.querySelector('h3')?.textContent.trim() ?? '';
      const q = clone.querySelector('.q')?.textContent.trim() ?? '';
      const why = [...clone.querySelectorAll('.ans p.why')].pop();
      const hints = [`첫 번째 조각은 <b>${tokens[0]}</b>`];
      if (why) hints.push(why.innerHTML.trim());
      cards.push({ kind: 'build', id, unit, mode: el.dataset.build, join: el.dataset.join ?? ' ', title, q, tokens, decoys, explain, hints });
      continue;
    }
    const ans = clone.querySelector('.ans');
    const title = (clone.querySelector('h3') ?? clone.querySelector('.name'))?.textContent.trim() ?? '';
    const explain = ans?.innerHTML.trim() ?? '';
    const answer = ans?.querySelector('.a')?.textContent.trim() ?? '';
    const svg = clone.querySelector('svg')?.outerHTML ?? '';
    const pre = clone.querySelector('pre')?.outerHTML ?? '';
    const q = clone.querySelector('.q')?.innerHTML.trim() ?? '';
    const mnemo = clone.querySelector('.mnemo')?.textContent.trim() ?? '';
    if (svg) cards.push({ kind: 'rel', id, unit, title, svg, explain, hints: [mask(firstSentence(explain), nameWords(title))] });
    else if (answer) cards.push({ kind: 'answer', id, unit, title, pre, q, answer, explain, hints: answerHints(explain, answer) });
    else {
      const box = document.createElement('div');
      box.innerHTML = explain;
      const rule = [...box.querySelectorAll('p.why')].pop();
      cards.push({ kind: 'recall', id, unit, title, pre, q, mnemo, explain, hints: rule ? [rule.innerHTML.trim()] : [] });
    }
  }
}
writeFileSync(`src/data/cards/${course.id}.json`, JSON.stringify(cards, null, 1) + '\n');
console.log(`${course.name}: 카드 ${cards.length}장 → src/data/cards/${course.id}.json`);
}
