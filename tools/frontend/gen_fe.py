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
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from notes_gen import write_notes

write_notes(
    UNITS, course_id='frontend', title='프론트엔드 노트 · 출근길 IT 퀴즈', h1='프론트엔드 노트',
    lede='출근길 IT 퀴즈의 프론트엔드 코스 노트입니다. JavaScript, 비동기, 브라우저, CSS, React, 웹 기본기를 면접과 실무에서 자주 헷갈리는 것 위주로 모았습니다. <b>퀴즈 모드</b>를 켜면 답이 가려집니다.',
    back_label='← 프론트엔드 레슨으로', out='public/notes-frontend.html', key='jck-known-frontend-v1',
)
