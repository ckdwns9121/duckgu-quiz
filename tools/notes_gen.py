"""코스 학습 노트 HTML 만들기 (여러 코스 공통).

유닛 목록(uid, 이름, 소개, 항목들)을 받아 public/<파일>을 쓴다. 스타일·스크립트는 public/notes.html(정보처리기사 노트)에서
그대로 가져온다. 항목 종류: answer(출력값), mcq(정답 고르기), build(조각 만들기), table(참고용 용어 표, 퀴즈 제외).
"""
import html

e = html.escape

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


def write_notes(units, *, course_id, title, h1, lede, back_label, out, key):
    src = open('public/notes.html', encoding='utf-8').read()
    head = src[:src.index('<div class="wrap">')]
    head = head.replace('<title>정보처리기사 노트 · 출근길 IT 퀴즈</title>', f'<title>{e(title)}</title>').replace('./course/jeongcheogi', f'./course/{course_id}')
    tail = src[src.index('  <footer>'):]
    tail = tail.replace("var KEY = 'jck-known-v1';", f"var KEY = '{key}';")
    body = f'<div class="wrap">\n  <div class="top">\n    <div>\n      <h1>{e(h1)}</h1>\n'
    body += f'      <p class="lede">{lede}</p>\n'
    body += f'      <p><a href="./course/{course_id}" style="font-weight:700">{e(back_label)}</a></p>\n'
    body += '    </div>\n    <div class="controls">\n      <label class="toggle" for="quiz-toggle"><input type="checkbox" id="quiz-toggle"> 퀴즈 모드 (답 가리기)</label>\n      <label class="toggle" for="known-toggle"><input type="checkbox" id="known-toggle"> 외운 것 숨기기</label>\n      <span class="progress" id="progress">외운 것 <b>0</b> / 0</span>\n    </div>\n  </div>\n\n'
    body += '  <nav aria-label="목차">\n' + ''.join(f'    <a href="#{u[0]}">{e(u[1])}</a>\n' for u in units) + '  </nav>\n'
    for n, (uid, name, lede_u, items) in enumerate(units, 1):
        body += f'\n  <section id="{uid}">\n    <div class="sec-head">\n      <span class="sub">PART {n}</span>\n      <h2>{e(name)}</h2>\n      <p>{e(lede_u)}</p>\n    </div>\n'
        grid_open = False
        for x in items:
            html_, kind = render(x)
            if kind == 'grid' and not grid_open:
                body += '    <div class="grid">\n'; grid_open = True
            if kind == 'block' and grid_open:
                body += '    </div>\n'; grid_open = False
            body += html_
        if grid_open: body += '    </div>\n'
        body += '  </section>\n'
    open(out, 'w', encoding='utf-8').write(head + body + '\n' + tail)
    print(out, 'written', body.count('data-id='), 'items')
