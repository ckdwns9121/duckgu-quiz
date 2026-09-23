// public/notes.html(학습 노트)에서 퀴즈 카드를 뽑아 src/data/cards.json으로 저장한다.
// 노트를 고친 뒤 `pnpm extract`를 다시 실행하면 퀴즈에도 반영된다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const UNITS = ['code-c', 'code-java', 'code-py', 'code-sql', 'db', 'net', 'sec', 'uml'];
const { document } = new JSDOM(readFileSync('public/notes.html', 'utf8')).window;
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

const cards = [];
for (const unit of UNITS) {
  const sec = document.getElementById(unit);
  let table = 0;
  for (const el of sec.querySelectorAll('table, [data-id]')) {
    if (el.tagName === 'TABLE') { table++; continue; }
    const id = el.dataset.id;
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
      cards.push({ kind: 'term', id, unit, table: `${unit}:${table}`, col: heads[1] ?? '용어', term, sub, meaning: text(parts[0]?.html ?? ''), parts, hints });
      continue;
    }
    const clone = el.cloneNode(true);
    clone.querySelectorAll('input, label.chk').forEach((n) => n.remove());
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
mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/cards.json', JSON.stringify(cards, null, 1) + '\n');
console.log(`카드 ${cards.length}장 추출 → src/data/cards.json`);
