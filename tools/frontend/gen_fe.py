import html, sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fe_content import UNITS as BASE
from fe_quiz import NEW, ORDER
from fe_quiz_deep import UNIT_NEXT, NEXT_ORDER, REACT_DEEP, REACT_ORDER_ADD, BROWSER_DEEP, BROWSER_ORDER_ADD

# 심화 문제(3차)를 기존 유닛에 잇고, Next.js 유닛을 React 뒤에 넣는다
NEW = {**NEW, 'fe-react': NEW['fe-react'] + REACT_DEEP, 'fe-browser': NEW['fe-browser'] + BROWSER_DEEP, UNIT_NEXT[0]: UNIT_NEXT[3]}
ORDER = {**ORDER, 'fe-react': ORDER['fe-react'] + REACT_ORDER_ADD, 'fe-browser': ORDER['fe-browser'] + BROWSER_ORDER_ADD, UNIT_NEXT[0]: NEXT_ORDER}
_i = [u[0] for u in BASE].index('fe-react') + 1
BASE = BASE[:_i] + [(UNIT_NEXT[0], UNIT_NEXT[1], UNIT_NEXT[2], [])] + BASE[_i:]

# 기존 내용 + 새 문제를 합치고, 유닛 안 순서를 ORDER대로 (용어 표는 참고용이라 맨 뒤)
UNITS = []
for uid, name, lede, items in BASE:
    items = items + NEW.get(uid, [])
    by_id = {x['id']: x for x in items if 'id' in x}
    order = ORDER[uid]
    missing = [x['id'] for x in items if 'id' in x and x['id'] not in order]
    assert not missing, (uid, 'ORDER에 없는 문제', missing)
    UNITS.append((uid, name, lede, [by_id[i] for i in order] + [x for x in items if x['kind'] == 'table']))
e = html.escape
src = open('public/notes.html', encoding='utf-8').read()
head = src[:src.index('<div class="wrap">')]
head = head.replace('<title>정보처리기사 노트 · 출근길 IT 퀴즈</title>', '<title>프론트엔드 노트 · 출근길 IT 퀴즈</title>').replace('./course/jeongcheogi', './course/frontend')
tail = src[src.index('  <footer>'):]
tail = tail.replace("var KEY = 'jck-known-v1';", "var KEY = 'jck-known-frontend-v1';")

def chk(i): return f'<label class="chk"><input type="checkbox" id="k-{i}">외움</label>'
def opts(q, correct, *wrong):
    return f'\n        <ul class="quiz-opts" hidden data-q="{e(q)}"><li class="ok">{e(correct)}</li>' + ''.join(f'<li>{e(w)}</li>' for w in wrong) + '</ul>'

def render(x):
    k = x['kind']
    if k == 'answer':
        steps = ''.join(f'<li>{s}</li>' for s in x['steps'])
        return (f'      <article class="item" data-id="{x["id"]}">\n'
                f'        <div class="item-h"><span class="lang">{e(x["tag"])}</span><h3>{e(x["title"])}</h3>{chk(x["id"])}</div>\n'
                f'<pre>{e(x["code"])}</pre>\n'
                f'        <p class="q">출력은? (여러 줄이면 띄어쓰기로 이어서)</p>\n'
                f'        <div class="ans"><span class="a">{e(x["answer"])}</span><ol class="steps">{steps}</ol><p class="why"><b>기억할 것</b>: {x["why"]}</p></div>\n'
                f'      </article>\n'), 'grid'
    if k == 'mcq':
        pre = f'\n<pre>{e(x["code"])}</pre>' if x.get('code') else ''
        return (f'      <article class="item" data-id="{x["id"]}">\n'
                f'        <div class="item-h"><span class="lang">{e(x["tag"])}</span><h3>{e(x["title"])}</h3>{chk(x["id"])}</div>{pre}'
                + ''.join(opts(*q) for q in x['quizzes']) +
                f'\n        <p class="q">{e(x["quizzes"][0][0])}</p>\n'
                f'        <div class="ans">{x["explain"]}</div>\n      </article>\n'), 'grid'
    if k == 'build':
        lis = ''.join(f'<li>{e(t)}</li>' for t in x['tokens'])
        return (f'      <article class="item" data-id="{x["id"]}" data-build="{x["mode"]}" data-join="{e(x["join"])}" data-decoys="{e("|".join(x["decoys"]))}">\n'
                f'        <div class="item-h"><span class="lang">{e(x["tag"])}</span><h3>{e(x["title"])}</h3>{chk(x["id"])}</div>\n'
                f'        <p class="q">{e(x["q"])}</p>\n'
                f'        <div class="ans"><ol class="steps build-answer">{lis}</ol>{x["why"]}</div>\n      </article>\n'), 'grid'
    if k == 'table':
        heads = ''.join(f'<th>{e(h)}</th>' for h in x['heads'])
        rows = ''
        for (i, term, sub, meaning, hint) in x['rows']:
            small = f'<small>{e(sub)}</small>' if sub else ''
            # 용어 표는 노트에서 읽는 참고용. 퀴즈는 상황형 문제로 따로 낸다
            rows += (f'          <tr data-id="{i}" data-quiz="off"><td class="c"><input type="checkbox" id="k-{i}" aria-label="외움"></td>'
                     f'<td class="term">{e(term)}{small}</td><td class="ans">{meaning}</td><td class="hint">{hint}</td></tr>\n')
        return (f'    <p class="group-title">{e(x["title"])}</p>\n    <div class="table-wrap">\n      <table>\n'
                f'        <thead><tr><th class="c"></th>{heads}</tr></thead>\n        <tbody>\n{rows}        </tbody>\n      </table>\n    </div>\n'), 'block'

body = '<div class="wrap">\n  <div class="top">\n    <div>\n      <h1>프론트엔드 노트</h1>\n'
body += '      <p class="lede">출근길 IT 퀴즈의 프론트엔드 코스 노트입니다. JavaScript, 비동기, 브라우저, CSS, React, 웹 기본기를 면접과 실무에서 자주 헷갈리는 것 위주로 모았습니다. <b>퀴즈 모드</b>를 켜면 답이 가려집니다.</p>\n'
body += '      <p><a href="./course/frontend" style="font-weight:700">← 프론트엔드 레슨으로</a></p>\n'
body += '    </div>\n    <div class="controls">\n      <label class="toggle" for="quiz-toggle"><input type="checkbox" id="quiz-toggle"> 퀴즈 모드 (답 가리기)</label>\n      <label class="toggle" for="known-toggle"><input type="checkbox" id="known-toggle"> 외운 것 숨기기</label>\n      <span class="progress" id="progress">외운 것 <b>0</b> / 0</span>\n    </div>\n  </div>\n\n'
body += '  <nav aria-label="목차">\n' + ''.join(f'    <a href="#{u[0]}">{e(u[1])}</a>\n' for u in UNITS) + '  </nav>\n'
for n, (uid, name, lede, items) in enumerate(UNITS, 1):
    body += f'\n  <section id="{uid}">\n    <div class="sec-head">\n      <span class="sub">PART {n}</span>\n      <h2>{e(name)}</h2>\n      <p>{e(lede)}</p>\n    </div>\n'
    grid_open = False
    for x in items:
        out, kind = render(x)
        if kind == 'grid' and not grid_open:
            body += '    <div class="grid">\n'; grid_open = True
        if kind == 'block' and grid_open:
            body += '    </div>\n'; grid_open = False
        body += out
    if grid_open: body += '    </div>\n'
    body += '  </section>\n'
open('public/notes-frontend.html', 'w', encoding='utf-8').write(head + body + '\n' + tail)
print('written', body.count('data-id='), 'items')
