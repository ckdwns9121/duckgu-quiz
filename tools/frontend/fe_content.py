# 프론트엔드 코스 내용. 출력값 정답은 answers.json(node run.mjs로 cases.mjs를 실제 실행한 결과)에서 가져온다.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
import json
ANS = json.load(open(os.path.join(HERE, 'answers.json')))
import importlib.util, re
CODE = {}
src = open(os.path.join(HERE, 'cases.mjs'), encoding='utf-8').read()
for m in re.finditer(r"'([a-z0-9-]+)': `(.*?)`,", src, re.S):
    CODE[m.group(1)] = m.group(2)

def A(id_, tag, title, steps, why):
    return dict(kind='answer', id=id_, tag=tag, title=title, code=CODE[id_], answer=ANS[id_], steps=steps, why=why)
def T(title, heads, rows):
    return dict(kind='table', title=title, heads=heads, rows=rows)
def Q(id_, tag, title, quizzes, explain, code=None):
    return dict(kind='mcq', id=id_, tag=tag, title=title, quizzes=quizzes, explain=explain, code=code)
def B(id_, mode, join, tag, title, q, tokens, decoys, why):
    return dict(kind='build', id=id_, mode=mode, join=join, tag=tag, title=title, q=q, tokens=tokens, decoys=decoys, why=why)

UNITS = [
# =====================================================================
('fe-js', 'JavaScript 핵심', '호이스팅, 클로저, this, 비교 연산, 복사처럼 면접과 코드 리뷰에서 가장 많이 헷갈리는 것만 모았습니다.', [
 A('fe-js-hoist','JS','var 호이스팅',
   ['<code>var a</code> 선언이 맨 위로 끌어올려진 것처럼 동작하고, 값은 <b>undefined</b>로 시작','첫 <code>console.log(a)</code> → <b>undefined</b> (에러가 아님)','<code>a = 1</code> 대입 뒤 두 번째 출력 → <b>1</b>'],
   '<mark>var는 선언만 올라가고 값은 안 올라간다</mark>. let·const였다면 첫 줄에서 ReferenceError.'),
 A('fe-js-closure','JS','클로저 카운터',
   ['<code>makeCounter()</code>를 부를 때마다 <b>새 n</b>이 만들어짐','c1은 자기 n을 기억 → 1, 2','c2는 따로 만든 n → 1'],
   '<mark>클로저는 만들어질 때의 변수를 각자 따로 기억</mark>한다. c1과 c2는 서로의 n을 모른다.'),
 A('fe-js-varloop','JS','var + setTimeout 반복문',
   ['<code>var i</code>는 반복문 전체에서 <b>하나</b>뿐','setTimeout 콜백은 반복문이 다 끝난 뒤 실행 → 그때 i는 <b>3</b>','세 콜백이 같은 i를 보므로 3이 세 번'],
   '<mark>var는 함수 스코프라 반복마다 새로 안 생긴다</mark>. 해결: let으로 바꾸기.'),
 A('fe-js-letloop','JS','let + setTimeout 반복문',
   ['<code>let i</code>는 반복마다 <b>새 i</b>가 만들어짐','각 콜백이 자기 반복의 i를 기억 (클로저)','0, 1, 2 순서로 출력'],
   '<mark>let은 블록 스코프라 반복마다 새 변수</mark>. var 문제와 짝으로 외우기.'),
 A('fe-js-call','JS','this와 call',
   ['<code>obj.hi()</code> → 점 앞의 객체(obj)가 this → <b>A</b>','<code>obj.hi.call({ name: \'B\' })</code> → call로 넘긴 객체가 this → <b>B</b>'],
   '일반 함수의 this는 <mark>어떻게 불렀는지</mark>로 정해진다. 점 앞의 객체, 또는 call·apply·bind로 넘긴 객체.'),
 A('fe-js-equal','JS','== 와 ===',
   ['<code>0 == \'0\'</code> → 타입을 맞춰 비교 → <b>true</b>','<code>0 === \'0\'</code> → 타입이 다름 → <b>false</b>','<code>null == undefined</code> → 특별 규칙으로 <b>true</b>','<code>null === undefined</code> → <b>false</b>','<code>NaN === NaN</code> → NaN은 자기 자신과도 다름 → <b>false</b>'],
   '<mark>==는 타입을 바꿔서 비교, ===는 타입까지 비교</mark>. NaN 확인은 Number.isNaN().'),
 A('fe-js-typeof','JS','typeof 함정',
   ['<code>typeof null</code> → <b>object</b> (JS 초기 설계 버그가 그대로 남음)','<code>typeof []</code> → 배열도 <b>object</b>','<code>typeof undefined</code> → <b>undefined</b>','<code>typeof function(){}</code> → <b>function</b>'],
   '<mark>null과 배열은 typeof로 구별이 안 된다</mark>. 배열은 Array.isArray(), null은 === null.'),
 A('fe-js-shallow','JS','spread 얕은 복사',
   ['<code>{ ...a }</code>는 바깥 객체만 새로 만든다','<code>b.x = 2</code> → b만 바뀜 → a.x는 <b>1</b>','<code>b.inner</code>는 a.inner와 <b>같은 객체</b> → a.inner.y도 <b>2</b>'],
   '<mark>spread는 얕은 복사</mark>. 안쪽 객체까지 복사하려면 structuredClone().'),
 A('fe-js-truthy','JS','truthy · falsy',
   ['<code>\'\'</code> 빈 문자열 → <b>false</b>','<code>\'0\'</code> 글자가 있는 문자열 → <b>true</b>','<code>[]</code> 빈 배열도 객체라 → <b>true</b>','<code>0</code> → <b>false</b>'],
   'falsy는 <mark>false, 0, \'\', null, undefined, NaN</mark> 여섯 개뿐. 나머지는 빈 배열·빈 객체까지 전부 truthy.'),
 A('fe-js-nullish','JS','|| 와 ?? 와 ?.',
   ['<code>u.n || 5</code> → 0은 falsy라 <b>5</b>','<code>u.n ?? 5</code> → ??는 null·undefined일 때만 뒤를 씀 → <b>0</b>','<code>u.x?.y</code> → u.x가 없으니 에러 대신 <b>undefined</b>'],
   '<mark>||는 falsy면 대체, ??는 null·undefined일 때만 대체</mark>. 0이나 빈 문자열을 살리고 싶으면 ??.'),
 T('JavaScript 용어', ['용어','뜻','예시 · 외우는 법'], [
   ('fe-js-t-hoist','호이스팅','Hoisting','선언이 스코프 맨 위로 끌어올려진 것처럼 동작하는 것. var는 undefined로 시작하고, let·const는 선언 전에 접근하면 에러.','var로 선언한 변수를 선언 줄보다 위에서 읽으면 undefined'),
   ('fe-js-t-closure','클로저','Closure','함수가 만들어질 때의 바깥 변수를 기억해서, 바깥 함수가 끝난 뒤에도 그 변수를 쓰는 것.','카운터, 디바운스, React 훅이 모두 클로저로 동작'),
   ('fe-js-t-tdz','TDZ','Temporal Dead Zone','let·const가 선언되기 전까지의 구간. 여기서 변수를 읽으면 ReferenceError가 난다.','"아직 태어나지 않은 변수" 구간'),
   ('fe-js-t-copy','얕은 복사 / 깊은 복사','','<b>얕은 복사</b>: 바깥 객체만 새로 만들고 안쪽 객체는 원본과 같은 것을 가리킴. <b>깊은 복사</b>: 안쪽 객체까지 전부 새로 만듦.','얕은 복사: spread, Object.assign. 깊은 복사: structuredClone'),
   ('fe-js-t-scope','함수 스코프 / 블록 스코프','','<b>함수 스코프</b>: 함수 안 어디서든 같은 변수 (var). <b>블록 스코프</b>: 중괄호 { } 안에서만 사는 변수 (let, const).','반복문의 var가 하나만 생기는 이유'),
 ]),
 Q('fe-js-q-tdz','JS','let 선언 전에 읽기',[
   ('이 코드의 출력은?','ReferenceError','undefined','2','TypeError')],
   '<p>let은 선언 전 구간(TDZ)에서 읽으면 <b>ReferenceError</b>를 던진다. var였다면 undefined.</p>',
   code="try {\n  console.log(b);\n} catch (e) {\n  console.log(e.name);\n}\nlet b = 2;"),
 Q('fe-js-q-reduce','JS','filter · map · reduce',[
   ('이 코드의 출력은?','60','100','6','[20, 40]')],
   '<p>filter로 짝수 [2, 4] → map으로 [20, 40] → reduce로 더해서 <b>60</b>. filter를 빼먹으면 100, map을 빼먹으면 6.</p>',
   code="console.log(\n  [1, 2, 3, 4]\n    .filter((n) => n % 2 === 0)\n    .map((n) => n * 10)\n    .reduce((s, n) => s + n, 0)\n);"),
]),
# =====================================================================
('fe-async', '비동기 · 이벤트 루프', 'console.log 출력 순서 문제는 면접 단골입니다. 동기 코드 → 마이크로태스크 → 매크로태스크 순서만 확실히 잡으면 됩니다.', [
 A('fe-as-order','이벤트루프','setTimeout vs Promise',
   ['동기 코드 먼저: <b>1</b>, <b>4</b>','동기 코드가 끝나면 마이크로태스크(Promise.then) 전부: <b>3</b>','그다음 매크로태스크(setTimeout): <b>2</b>'],
   '<mark>동기 → 마이크로태스크 → 매크로태스크</mark>. setTimeout 0초여도 Promise.then보다 늦다.'),
 A('fe-as-micro','이벤트루프','queueMicrotask',
   ['동기 코드: <b>s</b>','queueMicrotask는 마이크로태스크 → <b>m</b>','setTimeout은 매크로태스크 → <b>t</b>'],
   'queueMicrotask는 <mark>Promise.then과 같은 줄</mark>(마이크로태스크 큐)에 선다.'),
 A('fe-as-await','async','await 뒤의 코드',
   ['<code>f()</code> 안의 <code>console.log(\'a\')</code>는 바로 실행 → <b>a</b>','<code>await</code>를 만나면 f의 나머지는 마이크로태스크로 미뤄짐','바깥 동기 코드 → <b>c</b>','마이크로태스크로 f 재개 → <b>b</b>'],
   '<mark>await 앞은 동기, await 뒤는 마이크로태스크</mark>. async 함수도 처음 await 전까지는 그냥 동기 코드.'),
 A('fe-as-nested','이벤트루프','then 안에서 setTimeout',
   ['처음에 등록: 첫 then(마이크로), setTimeout 4(매크로)','마이크로태스크: 첫 then → <b>1</b>, 이때 setTimeout 2를 등록 (4 뒤에 줄 섬)','이어서 두 번째 then → <b>3</b>','매크로태스크는 줄 선 순서대로: <b>4</b>, <b>2</b>'],
   '<mark>마이크로태스크는 큐가 빌 때까지 이어서</mark> 실행되고, 매크로태스크는 등록된 순서대로 하나씩.'),
 A('fe-as-executor','Promise','Promise 생성자 안의 코드',
   ['<code>new Promise(콜백)</code>의 콜백은 <b>즉시 동기로</b> 실행 → <b>p</b>','then은 마이크로태스크로 미뤄짐','동기 코드 → <b>end</b>','마이크로태스크 → <b>then</b>'],
   '<mark>Promise 생성자 콜백(executor)은 동기</mark>, then·catch·finally만 비동기.'),
 B('fe-as-b-loop','order',' → ','순서','이벤트 루프 한 바퀴','이벤트 루프가 한 바퀴 도는 순서대로 놓으세요.',
   ['콜 스택의 동기 코드','마이크로태스크 전부','화면 렌더링 (필요할 때)','매크로태스크 하나'],[],
   '<p class="why">지금 실행 중인 코드(콜 스택)가 끝나면 <mark>마이크로태스크를 큐가 빌 때까지 전부</mark> 실행하고, 필요하면 화면을 그린 뒤, 매크로태스크를 <b>하나</b> 꺼낸다. 이것을 반복한다.</p>'),
 T('비동기 용어', ['용어','뜻','예시 · 외우는 법'], [
   ('fe-as-t-queue','마이크로태스크 / 매크로태스크','','<b>마이크로태스크</b>: 지금 작업이 끝나면 큐가 빌 때까지 전부 먼저 실행하는 작업. <b>매크로태스크</b>: 이벤트 루프가 한 바퀴에 하나씩 꺼내는 작업.','마이크로: Promise.then, await 뒤, queueMicrotask. 매크로: setTimeout, setInterval, 클릭 이벤트'),
   ('fe-as-t-stack','콜 스택','Call Stack','지금 실행 중인 함수들이 쌓이는 곳. 콜 스택이 비어야 큐에서 다음 작업을 꺼낸다.','무거운 동기 코드가 콜 스택을 오래 붙잡으면 화면이 멈춘다'),
   ('fe-as-t-state','pending / fulfilled / rejected','Promise 상태','<b>pending</b>: 아직 결과가 없는 대기 상태. <b>fulfilled</b>: 성공해서 값이 정해진 상태 (then 실행). <b>rejected</b>: 실패한 상태 (catch 실행).','한 번 fulfilled나 rejected가 되면 다시 바뀌지 않는다'),
   ('fe-as-t-async','async / await','','<b>async</b>: 항상 Promise를 돌려주는 함수로 만든다. <b>await</b>: Promise가 끝날 때까지 그 함수의 나머지를 멈추고 기다린다.','await는 async 함수 안에서만 (모듈 최상단은 예외)'),
 ]),
]),
# =====================================================================
('fe-browser', '브라우저 · DOM', '렌더링 과정, 스크립트 로딩, 이벤트 전파, 저장소, CORS처럼 브라우저가 실제로 하는 일을 다룹니다.', [
 B('fe-br-b-crp','order',' → ','순서','브라우저 렌더링 순서','HTML을 받아 화면에 그리기까지의 순서대로 놓으세요.',
   ['HTML 파싱 → DOM','CSS 파싱 → CSSOM','렌더 트리','레이아웃','페인트','합성'],[],
   '<p class="why">DOM과 CSSOM을 합쳐 <b>렌더 트리</b>를 만들고 → 위치·크기 계산(<b>레이아웃</b>, 리플로우) → 픽셀 칠하기(<b>페인트</b>) → 레이어 합치기(<b>합성</b>). transform·opacity는 합성 단계만 다시 해서 가장 싸다.</p>'),
 B('fe-br-b-event','order',' → ','순서','이벤트 전파 순서','버튼을 클릭했을 때 이벤트가 전파되는 순서대로 놓으세요.',
   ['캡처링 (위 → 아래)','타깃','버블링 (아래 → 위)'],[],
   '<p class="why">window에서 버튼까지 내려가며 <b>캡처링</b> → 버튼에서 <b>타깃</b> 단계 → 다시 window까지 올라가며 <b>버블링</b>. addEventListener는 기본으로 버블링 단계에서 실행되고, <code>{ capture: true }</code>를 주면 캡처링 단계.</p>'),
 T('브라우저 용어', ['용어','뜻','예시 · 외우는 법'], [
   ('fe-br-t-reflow','리플로우 / 리페인트','','<b>리플로우</b>: 크기나 위치가 바뀌어 레이아웃을 다시 계산하는 것. <b>리페인트</b>: 색이나 그림자처럼 모양만 다시 칠하는 것.','리플로우: width, top, margin 변경. 리페인트: color, background 변경. 리플로우가 더 비싸다'),
   ('fe-br-t-script','async / defer','script 속성','<b>async</b>: 다운로드가 끝나는 즉시 HTML 파싱을 멈추고 실행하며, 실행 순서는 보장되지 않는다. <b>defer</b>: HTML 파싱이 끝난 뒤 문서에 적힌 순서대로 실행한다.','서로 의존하는 스크립트는 defer, 분석 스크립트처럼 독립된 건 async'),
   ('fe-br-t-deleg','이벤트 위임','Event Delegation','자식마다 리스너를 달지 않고 부모 하나에 달아서 event.target으로 누가 눌렸는지 구분하는 방식.','버블링 덕분에 가능. 목록 항목이 늘어나도 리스너는 하나'),
   ('fe-br-t-storage','localStorage / sessionStorage / 쿠키','','<b>localStorage</b>: 직접 지우기 전까지 남고, 서버로 보내지 않는다. <b>sessionStorage</b>: 탭을 닫으면 사라진다. <b>쿠키</b>: 요청할 때마다 서버로 같이 전송되고, 만료일을 정할 수 있다.','용량: 로컬·세션 스토리지 약 5MB, 쿠키 약 4KB'),
   ('fe-br-t-origin','동일 출처','Same-Origin','프로토콜, 호스트, 포트가 모두 같은 것. 하나라도 다르면 다른 출처로 본다.','https://a.com 과 http://a.com 은 프로토콜이 달라서 다른 출처'),
   ('fe-br-t-cors','CORS','Cross-Origin Resource Sharing','다른 출처의 리소스를 요청할 때, 서버가 응답 헤더로 허락해야 브라우저가 결과를 넘겨주는 규칙.','서버가 Access-Control-Allow-Origin 헤더를 보내야 함. 막는 건 서버가 아니라 브라우저'),
   ('fe-br-t-prevent','preventDefault','','링크 이동, 폼 제출 같은 브라우저 기본 동작을 막는다.','폼 제출 막기는 preventDefault'),
   ('fe-br-t-stop','stopPropagation','','이벤트가 부모로 더 전파되지 않게 막는다.','부모 클릭 핸들러까지 가는 걸 막기는 stopPropagation'),
 ]),
 Q('fe-br-q-origin','출처','동일 출처 판단',[
   ('https://a.com 페이지에서 다음 중 같은 출처(Same-Origin)인 것은?','https://a.com/other/page','http://a.com','https://api.a.com','https://a.com:8080')],
   '<p>경로(/other/page)는 출처에 들어가지 않는다. <b>프로토콜</b>(http), <b>호스트</b>(api.a.com), <b>포트</b>(8080) 중 하나라도 다르면 다른 출처.</p>'),
 Q('fe-br-q-anim','성능','애니메이션 속성',[
   ('다음 중 리플로우 없이 처리돼 애니메이션에 가장 좋은 속성은?','transform','width','top','margin')],
   '<p>transform과 opacity는 레이아웃·페인트를 건너뛰고 <b>합성</b> 단계만 다시 해서 부드럽다. width·top·margin은 바꿀 때마다 리플로우가 일어난다.</p>'),
 Q('fe-br-q-load','이벤트','페이지 로딩 이벤트',[
   ('이미지가 다 뜨기 전이라도 DOM이 준비되면 바로 버튼에 이벤트를 달고 싶다. 어떤 이벤트를 기다릴까?','DOMContentLoaded','load','pageshow','readystatechange의 complete')],
   '<p><b>DOMContentLoaded</b>: HTML을 다 읽어 DOM이 만들어진 시점 (defer 스크립트 실행 뒤). <b>load</b>: 이미지, 스타일시트 같은 리소스까지 모두 받은 시점이라 더 늦다. readyState가 complete가 되는 것도 load와 같은 때다.</p>'),
]),
# =====================================================================
('fe-css', 'CSS', '박스 모델, 명시도, position, 단위처럼 레이아웃이 깨질 때 원인이 되는 것들입니다.', [
 T('CSS 용어', ['용어','뜻','예시 · 외우는 법'], [
   ('fe-css-t-box','content-box / border-box','box-sizing','<b>content-box</b>: width가 내용 영역만 뜻하고, padding과 border는 바깥에 더해진다 (기본값). <b>border-box</b>: width 안에 padding과 border까지 포함된다.','width: 100px, padding: 10px이면 content-box는 실제 120px, border-box는 100px'),
   ('fe-css-t-pos','static / relative / absolute / fixed / sticky','position','<b>static</b>: 기본값, 문서 흐름대로 놓이고 top 같은 값은 무시한다. <b>relative</b>: 원래 자리를 기준으로 옮기고, 원래 자리는 그대로 차지한다. <b>absolute</b>: position이 있는 가장 가까운 조상을 기준으로 놓이고, 흐름에서 빠진다. <b>fixed</b>: 화면(뷰포트)을 기준으로 고정된다. <b>sticky</b>: 스크롤하다 정한 위치에 닿으면 그 자리에 붙는다.','absolute의 기준을 잡으려고 부모에 position: relative를 준다'),
   ('fe-css-t-unit','em / rem','단위','<b>em</b>: font-size에 쓰면 부모 글자 크기, 다른 속성에 쓰면 자기 글자 크기를 기준으로 한다. <b>rem</b>: 루트(html) 글자 크기를 기준으로 한다.','중첩될수록 em은 곱해져서 커지고, rem은 항상 같다'),
   ('fe-css-t-justify','justify-content','Flexbox','주축(flex-direction 방향)을 따라 정렬한다.','flex-direction: row면 가로 정렬'),
   ('fe-css-t-align','align-items','Flexbox','주축과 직각인 교차축을 따라 정렬한다.','flex-direction: row면 세로 정렬. column이면 반대'),
   ('fe-css-t-z','쌓임 맥락','Stacking Context','안에 든 요소끼리만 z-index를 비교하는 독립된 층. z-index는 같은 쌓임 맥락 안에서만 비교되고, opacity가 1보다 작거나 transform이 있으면 새 쌓임 맥락이 생긴다.','z-index를 9999로 줘도 안 올라오면 부모의 쌓임 맥락을 의심'),
   ('fe-css-t-spec','명시도','Specificity','같은 요소에 규칙이 겹칠 때 어느 것이 이길지 정하는 점수. (ID 개수, 클래스·속성·가상 클래스 개수, 태그 개수) 순서로 비교한다.','인라인 스타일이 더 세고, !important는 그보다도 세다'),
 ]),
 Q('fe-css-q-spec','명시도','명시도 계산',[
   ('#main .card p 의 명시도(ID, 클래스, 태그)는?','(1, 1, 1)','(1, 0, 2)','(0, 2, 1)','(1, 1, 0)'),
   ('다음 중 명시도가 가장 높은 선택자는?','#nav .item','.nav .item a','div.item.active','nav ul li a')],
   '<p>#main(ID 1) + .card(클래스 1) + p(태그 1) = <b>(1, 1, 1)</b>. 비교는 앞자리부터: ID가 하나라도 있으면 클래스가 몇 개든 이긴다. #nav .item = (1, 1, 0)이 가장 높다.</p>'),
 Q('fe-css-q-unit','단위','em과 rem 계산',[
   ('html은 16px, 부모는 20px일 때 자식의 font-size: 1.5em은 몇 px일까?','30px','24px','20px','36px'),
   ('html은 16px, 부모는 20px일 때 자식의 font-size: 1.5rem은 몇 px일까?','24px','30px','20px','16px')],
   '<p>font-size의 em은 <b>부모 글자 크기</b> 기준: 20 × 1.5 = <b>30px</b>. rem은 <b>html 글자 크기</b> 기준: 16 × 1.5 = <b>24px</b>.</p>'),
]),
# =====================================================================
('fe-react', 'React', '상태 업데이트, 렌더링, useEffect, key처럼 React에서 실수가 가장 잦은 부분입니다. React 18 기준입니다.', [
 T('React 용어', ['용어','뜻','예시 · 외우는 법'], [
   ('fe-re-t-vdom','가상 DOM / 재조정','','<b>가상 DOM</b>: 실제 DOM을 흉내 낸 가벼운 JS 객체 트리. <b>재조정</b>: 새 렌더링 결과를 이전 결과와 비교(diff)해서 바뀐 부분만 실제 DOM에 반영하는 과정.','재조정은 Reconciliation. 같은 자리의 같은 타입이면 재사용, 타입이 다르면 새로 만든다'),
   ('fe-re-t-key','key','','목록에서 각 항목을 구별하는 값. 바뀌지 않는 고유한 값(id)을 써야 React가 항목을 제대로 재사용한다.','index를 key로 쓰면 순서가 바뀔 때 입력값 같은 상태가 엉뚱한 항목에 붙는다'),
   ('fe-re-t-props','props / state','','<b>props</b>: 부모가 내려주는 값으로, 자식은 바꿀 수 없다. <b>state</b>: 컴포넌트가 스스로 가지는 값으로, 바꾸면 다시 렌더링된다.','props가 바뀌거나 state가 바뀌면 다시 렌더링'),
   ('fe-re-t-memo','useMemo / useCallback','','<b>useMemo</b>: 계산한 결과 값을 기억해 두고, 의존성이 바뀔 때만 다시 계산한다. <b>useCallback</b>: 함수 자체를 기억해 두고, 의존성이 바뀔 때만 새로 만든다.','React.memo로 감싼 자식에 함수를 넘길 때 useCallback이 쓸모 있다'),
   ('fe-re-t-control','제어 컴포넌트 / 비제어 컴포넌트','','<b>제어 컴포넌트</b>: input 값을 state로 관리한다 (value + onChange). <b>비제어 컴포넌트</b>: 값은 DOM이 가지고 있고, 필요할 때 ref로 읽는다.','입력할 때마다 검사해야 하면 제어, 제출할 때만 읽으면 비제어'),
   ('fe-re-t-ref','useRef','','렌더링과 상관없이 값을 계속 들고 있는 상자. 값을 바꿔도 다시 렌더링되지 않고, DOM 요소를 잡을 때도 쓴다.','타이머 id, 이전 값 저장, input 포커스 주기'),
 ]),
 Q('fe-re-q-batch','상태','state 업데이트',[
   ('n이 0일 때 버튼을 한 번 누르면 n은 몇이 될까?','1','3','0','2')],
   '<p>세 줄 모두 <b>렌더링 당시의 n(0)</b>을 보고 0 + 1을 넣는다. React 18은 한 이벤트 안의 업데이트를 묶어서(batching) 한 번만 다시 렌더링하므로 결과는 <b>1</b>.</p>',
   code="const [n, setN] = useState(0);\n\nfunction onClick() {\n  setN(n + 1);\n  setN(n + 1);\n  setN(n + 1);\n}"),
 Q('fe-re-q-updater','상태','함수형 업데이트',[
   ('n이 0일 때 버튼을 한 번 누르면 n은 몇이 될까?','3','1','0','6')],
   '<p><code>setN(p =&gt; p + 1)</code>은 <b>바로 앞 업데이트 결과(p)</b>를 받아서 계산한다. 0 → 1 → 2 → 3. 이전 값에 기대는 업데이트는 함수형으로 쓴다.</p>',
   code="const [n, setN] = useState(0);\n\nfunction onClick() {\n  setN((p) => p + 1);\n  setN((p) => p + 1);\n  setN((p) => p + 1);\n}"),
 Q('fe-re-q-effect','useEffect','useEffect 실행 시점',[
   ('useEffect(fn, [])의 fn은 언제 실행될까?','처음 화면에 그려진 뒤 한 번','렌더링할 때마다','처음 렌더링 직전에 한 번','state가 바뀔 때마다'),
   ('useEffect(fn, [id])에서 fn이 돌려준 cleanup은 언제 실행될까?','id가 바뀌어 fn이 다시 실행되기 직전과 언마운트될 때','언마운트될 때만','fn이 실행된 직후','렌더링할 때마다 fn보다 먼저')],
   '<p>effect는 <b>화면에 반영(커밋)된 뒤</b> 실행된다. 의존성 배열이 []면 마운트 뒤 한 번. cleanup은 <b>의존성이 바뀌어 effect가 다시 실행되기 직전</b>과 <b>언마운트될 때</b> 실행된다.</p>'),
 Q('fe-re-q-key','key','key로 index 쓰기',[
   ('할 일 목록(각 항목에 체크박스 입력 상태가 있음)의 key로 배열 index를 쓰고, 맨 앞에 새 항목을 추가하면?','체크 상태가 한 칸씩 밀려 엉뚱한 항목에 붙는다','문제없이 잘 동작하고 조금 느려질 뿐이다','콘솔 경고만 뜨고 동작은 같다','key가 겹쳐서 새 항목이 안 보인다')],
   '<p>index는 순서가 바뀌면 같은 항목이 다른 key를 받는다. React는 key로 항목을 짝지어서 <b>상태를 엉뚱한 항목에 붙인다</b>. 추가·삭제·정렬이 있는 목록은 고유 id를 쓴다.</p>'),
 Q('fe-re-q-immut','상태','배열 state 바꾸기',[
   ('state 배열 list에 item을 추가하는 올바른 방법은?','setList([...list, item])','list.push(item)','list.push(item); setList(list)','list = [...list, item]')],
   '<p>React는 <b>이전 값과 새 값이 같은 객체인지</b>로 바뀌었는지 판단한다. push로 원본을 바꾸고 같은 배열을 넘기면 바뀐 걸 모른다. 항상 <b>새 배열</b>을 만들어 넘긴다.</p>'),
 B('fe-re-b-render','order',' → ','순서','state가 바뀐 뒤 화면까지','state를 바꾼 뒤 일어나는 일을 순서대로 놓으세요.',
   ['state 변경','컴포넌트 함수 다시 실행','가상 DOM 비교','실제 DOM 반영','useEffect 실행'],[],
   '<p class="why">state가 바뀌면 컴포넌트를 다시 불러 새 가상 DOM을 만들고(<b>렌더</b>), 이전 것과 비교해서 바뀐 부분만 실제 DOM에 반영(<b>커밋</b>)한 뒤, 마지막에 <b>useEffect</b>가 실행된다.</p>'),
]),
# =====================================================================
('fe-web', '웹 · 성능 · 보안', 'HTTP 상태 코드와 메서드, Core Web Vitals, 캐시처럼 프론트엔드 개발자가 매일 보는 웹 기본기입니다.', [
 T('HTTP 상태 코드', ['코드','뜻','예시 · 외우는 법'], [
   ('fe-web-200','200 OK','','요청이 성공했고, 결과를 응답 본문에 담아 돌려준다.','가장 흔한 성공. GET으로 목록 조회'),
   ('fe-web-201','201 Created','','요청이 성공해서 새 리소스가 만들어졌다.','POST로 회원가입 성공'),
   ('fe-web-204','204 No Content','','요청은 성공했지만 돌려줄 본문이 없다.','DELETE 성공 뒤 자주 씀'),
   ('fe-web-301','301 Moved Permanently','','요청한 주소가 영구히 다른 주소로 바뀌었다.','검색 엔진도 새 주소로 바꿔 기억'),
   ('fe-web-302','302 Found','','잠시 다른 주소로 가라는 뜻이다.','로그인 후 원래 페이지로 보내기'),
   ('fe-web-304','304 Not Modified','','바뀐 게 없으니 캐시해 둔 것을 그대로 쓰면 된다.','ETag·Last-Modified로 확인한 결과'),
   ('fe-web-400','400 Bad Request','','요청 형식이 잘못됐다.','필수 값 누락, JSON 형식 오류'),
   ('fe-web-401','401 Unauthorized','','인증이 안 됐다. 누군지 모르니 로그인이 필요하다.','토큰이 없거나 만료'),
   ('fe-web-403','403 Forbidden','','누군지는 알지만 이 리소스에 접근할 권한이 없다.','로그인했지만 관리자 페이지'),
   ('fe-web-404','404 Not Found','','요청한 리소스를 찾을 수 없다.','없는 주소'),
   ('fe-web-500','500 Internal Server Error','','서버 안에서 예상하지 못한 오류가 났다.','서버 코드의 버그'),
   ('fe-web-503','503 Service Unavailable','','서버가 과부하나 점검으로 잠시 요청을 처리할 수 없다.','배포 중, 트래픽 폭주'),
 ]),
 T('성능 · 캐시 · 메서드', ['용어','뜻','예시 · 외우는 법'], [
   ('fe-web-vitals','LCP / INP / CLS / TTFB','웹 성능 지표','<b>LCP</b>: 화면에서 가장 큰 콘텐츠가 그려지기까지의 시간(로딩 속도). <b>INP</b>: 클릭이나 입력에 화면이 반응하기까지의 시간(반응 속도). <b>CLS</b>: 로딩 중에 화면 요소가 갑자기 밀리는 정도(시각 안정성). <b>TTFB</b>: 요청을 보낸 뒤 서버에서 첫 바이트가 도착하기까지의 시간(서버 응답 속도).','Core Web Vitals는 LCP·INP·CLS 세 개. 좋음 기준: LCP 2.5초 이하, INP 200ms 이하, CLS 0.1 이하'),
   ('fe-web-cache','no-cache / no-store / max-age','Cache-Control','<b>no-cache</b>: 저장은 해 두되, 쓰기 전에 서버에 바뀌었는지 매번 확인한다. <b>no-store</b>: 아예 저장하지 않는다. <b>max-age</b>: 정한 초 동안은 서버에 묻지 않고 저장해 둔 것을 그대로 쓴다.','이름과 반대로 no-cache도 저장은 한다. 민감한 정보는 no-store. 파일 이름에 해시가 붙은 JS·CSS는 max-age를 길게'),
   ('fe-web-method','GET / POST / PUT / PATCH / DELETE','HTTP 메서드','<b>GET</b>: 리소스를 조회한다. <b>POST</b>: 새 리소스를 만든다. <b>PUT</b>: 리소스 전체를 새 값으로 바꾼다. <b>PATCH</b>: 리소스의 일부만 고친다. <b>DELETE</b>: 리소스를 지운다.','PUT은 통째로 교체, PATCH는 일부 수정'),
 ]),
 Q('fe-web-q-idem','HTTP','멱등성',[
   ('같은 요청을 여러 번 보내면 결과가 달라질 수 있는(멱등하지 않은) 메서드는?','POST','GET','PUT','DELETE')],
   '<p><b>멱등</b>: 여러 번 보내도 결과가 한 번 보낸 것과 같음. GET·PUT·DELETE는 멱등하고, <b>POST</b>는 보낼 때마다 새 리소스가 생길 수 있어 멱등하지 않다. 결제 버튼 중복 클릭을 조심하는 이유.</p>'),
]),
]
