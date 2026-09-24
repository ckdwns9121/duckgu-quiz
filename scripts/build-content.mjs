// content/ 의 YAML(문제 원본)에서 앱 데이터와 노트를 만든다. 한 방향: YAML → JSON · HTML (HTML을 다시 읽지 않는다)
//   content/index.yaml            코스 순서, 준비 중 코스
//   content/<코스>/course.yaml     코스 정보, 노트 설정, 유닛 순서
//   content/<코스>/<유닛>.yaml     유닛 정보와 블록(그룹 제목, 팁, 용어 표, 문제 묶음)
// 만드는 것: src/data/courses.json, src/data/cards/<코스>.json, public/<노트 파일>
// 사용: pnpm content  (검사만: pnpm content --check → 만든 결과가 저장된 파일과 다르면 실패)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import YAML from 'yaml';
import { cellsOf, defaultTermHints, esc, escAttr, partsOf, rawText, text } from './content-lib.mjs';

const CHECK = process.argv.includes('--check');
const load = (p) => YAML.parse(readFileSync(p, 'utf8'));

// ---------- 카드 ----------
function unitCards(unit) {
  const cards = [];
  let table = 0;
  for (const b of unit.blocks) {
    if (b.table) {
      table++;
      const heads = b.table.heads;
      for (const row of b.table.rows) {
        if (row.quiz === false) continue;
        if (row.short === undefined) throw new Error(`${row.id}: 퀴즈에 쓰는 용어는 short(보기용 짧은 설명)가 있어야 한다`);
        cards.push({
          kind: 'term', id: row.id, unit: unit.id, table: `${unit.id}:${table}`, col: heads[0] ?? '용어',
          term: rawText(row.term), sub: rawText(row.sub ?? ''), meaning: text(row.desc),
          short: row.short, segments: row.segments ?? [], parts: partsOf(row, heads),
          hints: row.hints ?? defaultTermHints(row, heads),
        });
      }
    }
    for (const it of b.items ?? b.rel ?? []) cards.push(...itemCards(it, unit.id));
  }
  return cards;
}

const preOf = (it) => (it.code !== undefined ? `<pre>${esc(it.code)}</pre>` : '');
const answerExplain = (it) => it.explain ?? `<span class="a">${esc(it.answer)}</span><ol class="steps">${it.steps.map((s) => `<li>${s}</li>`).join('')}</ol><p class="why">${it.why}</p>`;
const buildExplain = (it) => it.explain ?? `<ol class="steps build-answer">${it.tokens.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>${it.why ?? ''}`;

function itemCards(it, unit) {
  const title = text(it.title);
  switch (it.type) {
    case 'mcq':
      return it.quizzes.map((q, i) => ({
        kind: 'mcq', id: i ? `${it.id}-${i + 1}` : it.id, unit, title, q: q.q, pre: preOf(it),
        options: [q.answer, ...q.wrong], correct: q.answer, explain: it.explain, hints: q.hints ?? [],
      }));
    case 'build':
      return [{ kind: 'build', id: it.id, unit, mode: it.mode, join: it.join ?? ' ', title, q: it.q, tokens: it.tokens, decoys: it.decoys ?? [], explain: buildExplain(it), hints: it.hints ?? [] }];
    case 'rel':
      return [{ kind: 'rel', id: it.id, unit, title, svg: it.svg, explain: it.explain, hints: it.hints ?? [] }];
    case 'answer':
      return [{ kind: 'answer', id: it.id, unit, title, pre: preOf(it), q: it.q, answer: it.answer, explain: answerExplain(it), hints: it.hints ?? [] }];
    default:
      throw new Error(`${it.id}: 모르는 type ${it.type}`);
  }
}

// ---------- 노트 HTML ----------
const chk = (id) => `<label class="chk"><input type="checkbox" id="k-${id}">외움</label>`;
function renderItem(it) {
  const attrs = it.type === 'build' ? ` data-build="${it.mode}" data-join="${escAttr(it.join ?? ' ')}" data-decoys="${escAttr((it.decoys ?? []).join('|'))}"` : '';
  const head = it.type === 'rel'
    ? `<div class="item-h"><span class="name" style="flex:1">${it.title}</span>${chk(it.id)}</div>`
    : `<div class="item-h">${it.tag ? `<span class="lang">${esc(it.tag)}</span>` : ''}<h3>${it.title}</h3>${chk(it.id)}</div>${it.mnemo ? `\n        <span class="mnemo">${it.mnemo}</span>` : ''}`;
  const pre = preOf(it);
  let body;
  if (it.type === 'mcq') {
    const uls = it.quizzes.map((q) => `<ul class="quiz-opts" hidden data-q="${escAttr(q.q)}"><li class="ok">${esc(q.answer)}</li>${q.wrong.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`).join('\n        ');
    body = `${head}${pre ? `\n${pre}` : ''}\n        <p class="q">${it.note_q ?? esc(it.quizzes[0].q)}</p>\n        ${uls}\n        <div class="ans">${it.explain}</div>`;
  } else if (it.type === 'build') {
    body = `${head}\n        <p class="q">${esc(it.q)}</p>\n        <div class="ans">${buildExplain(it)}</div>`;
  } else if (it.type === 'rel') {
    return `      <article class="item" data-id="${it.id}">\n        ${it.svg}\n        ${head}\n        <p class="ex ans">${it.explain}</p>\n      </article>\n`;
  } else {
    body = `${head}\n${pre}\n        <p class="q">${it.q}</p>\n        <div class="ans">${answerExplain(it)}</div>`;
  }
  return `      <article class="item" data-id="${it.id}"${attrs}>\n        ${body}\n      </article>\n`;
}
function renderTable(t) {
  const rows = t.rows.map((row) => {
    const cells = cellsOf(row).map((c) => `<td class="${c.cls}">${c.html}</td>`).join('');
    const off = row.quiz === false ? ' data-quiz="off"' : '';
    return `          <tr data-id="${row.id}"${off}><td class="c"><input type="checkbox" id="k-${row.id}" aria-label="외움"></td><td class="term">${row.term}${row.sub ? `<small>${row.sub}</small>` : ''}</td>${cells}</tr>\n`;
  }).join('');
  return `    <div class="table-wrap">\n      <table>\n        <thead><tr><th class="c"></th>${t.heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead>\n        <tbody>\n${rows}        </tbody>\n      </table>\n    </div>\n`;
}
function renderUnit(unit) {
  let html = `\n  <section id="${unit.id}">\n    <div class="sec-head">\n      <span class="sub">${unit.part}</span>\n      <h2>${unit.heading ?? esc(unit.name)}</h2>\n${unit.lede ? `      <p>${unit.lede}</p>\n` : ''}    </div>\n`;
  for (const b of unit.blocks) {
    if (b.group !== undefined) html += `    <p class="group-title">${b.group}</p>\n`;
    else if (b.tip !== undefined) html += `    <div class="tip">${b.tip}</div>\n`;
    else if (b.table) html += renderTable(b.table);
    else if (b.items) html += `    <div class="grid">\n${b.items.map(renderItem).join('')}    </div>\n`;
    else if (b.rel) html += `    <div class="rel">\n${b.rel.map(renderItem).join('')}    </div>\n`;
    else throw new Error(`${unit.id}: 모르는 블록 ${JSON.stringify(b).slice(0, 80)}`);
  }
  return html + '  </section>\n';
}
function renderNotes(course, units, head, tail) {
  const n = course.notes;
  let body = `<div class="wrap">\n  <div class="top">\n    <div>\n      <h1>${n.h1}</h1>\n      <p class="lede">${n.lede}</p>\n`;
  if (n.back_label) body += `      <p><a href="./course/${course.id}" style="font-weight:700">${esc(n.back_label)}</a></p>\n`;
  body += '    </div>\n    <div class="controls">\n      <label class="toggle" for="quiz-toggle"><input type="checkbox" id="quiz-toggle"> 퀴즈 모드 (답 가리기)</label>\n      <label class="toggle" for="known-toggle"><input type="checkbox" id="known-toggle"> 외운 것 숨기기</label>\n      <span class="progress" id="progress">외운 것 <b>0</b> / 0</span>\n    </div>\n  </div>\n\n';
  body += '  <nav aria-label="목차">\n' + units.map((u) => `    <a href="#${u.id}">${esc(u.nav ?? u.name)}</a>\n`).join('') + '  </nav>\n';
  body += units.map(renderUnit).join('');
  const h = head.replace('{{title}}', esc(n.title)).replace('{{course_id}}', course.id);
  const t = tail.replace('{{footer}}', n.footer).replace('{{storage_key}}', n.storage_key);
  return h + body + '\n' + t;
}

// ---------- 실행 ----------
const index = load('content/index.yaml');
const head = readFileSync('content/_notes/head.html', 'utf8');
const tail = readFileSync('content/_notes/tail.html', 'utf8');
const outputs = new Map();
const coursesJson = { courses: [], soon: index.soon ?? [] };
const seen = new Set();
for (const cid of index.courses) {
  const course = load(`content/${cid}/course.yaml`);
  const units = course.units.map((uid) => load(`content/${cid}/${uid}.yaml`));
  const cards = units.flatMap(unitCards);
  for (const c of cards) { if (seen.has(c.id)) throw new Error(`카드 id가 겹친다: ${c.id}`); seen.add(c.id); }
  coursesJson.courses.push({
    id: course.id, name: course.name, desc: course.desc, notes: course.notes.file, icon: course.icon, color: course.color, dark: course.dark,
    units: units.map((u) => ({ id: u.id, name: u.name, color: u.color, dark: u.dark })),
  });
  outputs.set(`src/data/cards/${cid}.json`, JSON.stringify(cards, null, 1) + '\n');
  outputs.set(`public/${course.notes.file}`, renderNotes(course, units, head, tail));
  console.log(`${course.name}: 카드 ${cards.length}장, 노트 ${course.notes.file}`);
}
outputs.set('src/data/courses.json', JSON.stringify(coursesJson, null, 1) + '\n');

if (CHECK) {
  const stale = [...outputs].filter(([p, s]) => !existsSync(p) || readFileSync(p, 'utf8') !== s).map(([p]) => p);
  if (stale.length) { console.error('content/에서 다시 만들어야 하는 파일:', stale.join(', '), '\n→ pnpm content'); process.exit(1); }
  console.log('저장된 파일이 content/와 같다');
} else {
  mkdirSync('src/data/cards', { recursive: true });
  for (const [p, s] of outputs) writeFileSync(p, s);
}
