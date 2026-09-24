// content/ 빌드와 변환에서 같이 쓰는 계산. 추측이 아니라 기계적인 변환만 둔다.
import { JSDOM } from 'jsdom';

const { document } = new JSDOM('').window;
export const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escAttr = (t) => esc(t).replace(/"/g, '&quot;');
/** HTML 조각의 글자만 (공백은 하나로) */
export const text = (html) => { const d = document.createElement('div'); d.innerHTML = html ?? ''; return d.textContent.replace(/\s+/g, ' ').trim(); };
export const rawText = (html) => { const d = document.createElement('div'); d.innerHTML = html ?? ''; return d.textContent.trim(); };
/** 힌트에서 용어 이름을 ○○로 가린다 (두 글자 이상만) */
export const mask = (html, words) => words.filter((w) => w && w.length >= 2).reduce((acc, w) => acc.split(w).join('○○'), html);

/** 용어 표 한 행의 칸들: 뜻(desc) → 힌트(hint) → 추가 칸(extra) */
export function cellsOf(row) {
  const cells = [{ cls: 'ans', html: row.desc }];
  if (row.hint !== undefined) cells.push({ cls: row.hint_class ?? 'hint', html: row.hint });
  for (const x of row.extra ?? []) cells.push({ cls: 'ans', html: x });
  return cells;
}
/** 힌트를 따로 적지 않은 용어 카드의 기본 힌트: 힌트 칸에서 용어 이름을 가린 것 */
export function defaultTermHints(row, heads) {
  const parts = partsOf(row, heads);
  const term = rawText(row.term);
  const sub = rawText(row.sub ?? '');
  const hintPart = parts.slice(1).find((p) => p.hint) ?? parts.find((p, i) => i > 0);
  return hintPart ? [mask(hintPart.html, [term, sub, ...term.split(/\s*\/\s*/)])] : [];
}
export function partsOf(row, heads) {
  return cellsOf(row).map((c, i) => ({ label: heads[i + 1] ?? '', html: c.html, hint: !c.cls.split(' ').includes('ans') || c.cls.split(' ').includes('hint') }));
}

