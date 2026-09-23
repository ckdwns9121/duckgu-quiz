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
      cards.push({ kind: 'term', id, unit, table: `${unit}:${table}`, col: heads[1] ?? '용어', term: clone.textContent.trim(), sub, meaning: text(parts[0]?.html ?? ''), parts });
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
    if (svg) cards.push({ kind: 'rel', id, unit, title, svg, explain });
    else if (answer) cards.push({ kind: 'answer', id, unit, title, pre, q, answer, explain });
    else cards.push({ kind: 'recall', id, unit, title, pre, q, mnemo, explain });
  }
}
mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/cards.json', JSON.stringify(cards, null, 1) + '\n');
console.log(`카드 ${cards.length}장 추출 → src/data/cards.json`);
