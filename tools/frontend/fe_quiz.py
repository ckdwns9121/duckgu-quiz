# 프론트엔드 코스 퀴즈 문제 (2차). 원칙은 .claude/skills/quiz-quality/SKILL.md
# - 용어 → 뜻 짝 맞추기 대신 "코드·상황을 보고 결과나 해결책 고르기"
# - 오답 보기는 사람들이 실제로 하는 착각으로만
# - 출력값 정답은 cases.mjs를 실제 실행한 answers.json
from fe_content import A, Q, B

NEW = {
# =====================================================================
'fe-js': [
 A('fe-js-this2','JS','메서드와 화살표 함수의 this',
   ['<code>user.hi()</code> → 일반 메서드라 점 앞의 user가 this → <b>kim</b>',
    '<code>bye</code>는 화살표 함수라 자기 this가 없고, 객체 리터럴을 감싼 바깥(최상위)의 this를 씀',
    '최상위 this에는 nick이 없음 → <b>undefined</b>'],
   '<mark>객체 메서드를 화살표 함수로 쓰면 this가 객체가 아니다</mark>. 객체 리터럴의 중괄호는 스코프가 아니다.'),
 A('fe-js-sort','JS','sort() 기본 정렬',
   ['인자 없는 <code>sort()</code>는 값을 <b>문자열로 바꿔서</b> 사전 순으로 비교',
    '"10", "1", "2" → 사전 순으로 "1" &lt; "10" &lt; "2"',
    '결과 <b>1 10 2</b>'],
   '<mark>숫자 정렬은 sort((a, b) =&gt; a - b)</mark>. 그리고 sort는 원본 배열을 바꾼다.'),
 Q('fe-js-q-const','JS','const 객체 바꾸기',[
   ('이 코드를 실행하면?','true가 출력된다','TypeError가 난다','false가 출력된다','SyntaxError가 난다')],
   '<p>const가 막는 건 <b>변수에 다시 대입하는 것</b>(<code>cfg = {}</code>)뿐이다. 변수가 가리키는 객체의 속성은 바꿀 수 있다. 속성까지 막으려면 <code>Object.freeze(cfg)</code>.</p>',
   code="const cfg = { dark: false };\ncfg.dark = true;\nconsole.log(cfg.dark);"),
 Q('fe-js-q-timer','JS','콜백 안의 this',[
   ('start() 뒤 100ms가 지나도 count가 늘지 않는다. 가장 간단한 해결은?','function을 화살표 함수로 바꾼다','setTimeout 시간을 0으로 바꾼다','this.count 대신 count++로 쓴다','count를 let으로 선언한다')],
   '<p>setTimeout에 넘긴 <b>일반 함수</b>는 나중에 그냥 호출되므로 this가 인스턴스가 아니다. 화살표 함수는 자기 this가 없어서 <b>start()의 this(인스턴스)</b>를 그대로 쓴다. <code>count++</code>만 쓰면 없는 변수를 찾다가 ReferenceError.</p>',
   code="class Timer {\n  count = 0;\n  start() {\n    setTimeout(function () {\n      this.count++;\n    }, 100);\n  }\n}"),
 Q('fe-js-q-debounce','JS','이벤트 호출 줄이기',[
   ('검색창에서 입력이 멈추고 300ms가 지나면 API를 한 번만 부르고 싶다. 무엇을 쓸까?','디바운스','스로틀','setInterval 폴링','메모이제이션'),
   ('스크롤하는 동안 위치 계산을 최대 100ms에 한 번만 하고 싶다. 무엇을 쓸까?','스로틀','디바운스','setInterval 폴링','메모이제이션')],
   '<p><b>디바운스</b>: 이벤트가 멈추고 일정 시간이 지나면 <b>마지막 한 번</b>만 실행 (검색어 자동완성, 창 크기 조절 끝). <b>스로틀</b>: 이벤트가 계속 와도 <b>정해진 간격마다 한 번</b>씩 실행 (스크롤, 드래그). 메모이제이션은 같은 입력의 계산 결과를 재사용하는 것이라 호출 횟수와는 상관없다.</p>'),
 Q('fe-js-q-redeclare','JS','다시 선언하기',[
   ('같은 스코프에서 같은 이름으로 한 번 더 선언해도 에러가 나지 않는 것은?','var','let','const','let과 const 둘 다')],
   '<p><code>var a = 1; var a = 2;</code>는 조용히 넘어가서 실수를 숨긴다. let·const는 같은 스코프에서 다시 선언하면 <b>SyntaxError</b>. var 대신 let·const를 쓰는 이유 중 하나.</p>'),
 Q('fe-js-q-clone','JS','깊은 복사',[
   ('안쪽 객체까지 원본과 완전히 끊어진 복사본을 만드는 것은?','structuredClone(obj)','{ ...obj }','Object.assign({}, obj)','const copy = obj')],
   '<p>spread와 Object.assign은 <b>얕은 복사</b>라 안쪽 객체는 원본과 같은 것을 가리킨다. <code>const copy = obj</code>는 복사가 아니라 같은 객체를 하나 더 가리키는 것. 안쪽까지 복사하려면 <b>structuredClone</b>.</p>'),
],
# =====================================================================
'fe-async': [
 A('fe-as-mix','이벤트루프','async 함수와 Promise 섞기',
   ['동기 코드: <b>A</b> → async 함수 안의 await 앞까지 <b>C</b> → <b>F</b>',
    '마이크로태스크는 등록된 순서대로: await 뒤의 <b>D</b>가 먼저 줄 섬, 그다음 then의 <b>E</b>',
    '마지막으로 매크로태스크 setTimeout: <b>B</b>'],
   '<mark>async 함수는 await를 만나기 전까지 동기</mark>로 돈다. 마이크로태스크끼리는 줄 선 순서대로.'),
 A('fe-as-return','async','async 함수의 반환값',
   ['async 함수는 값을 return해도 <b>Promise로 감싸서</b> 돌려줌',
    'then 콜백은 마이크로태스크 → 동기 코드 <b>2</b>가 먼저',
    '그다음 <b>1</b>'],
   '<mark>async 함수의 결과는 항상 Promise</mark>. 값을 바로 쓰려면 await나 then.'),
 A('fe-as-foreach','async','forEach 안의 await',
   ['forEach는 콜백이 돌려준 Promise를 <b>기다리지 않음</b> → 곧바로 <b>done</b>',
    '두 콜백의 wait는 동시에 시작 → 10ms짜리가 먼저 끝나 <b>10</b>',
    '그다음 <b>30</b>'],
   '<mark>forEach는 await를 기다려 주지 않는다</mark>. 차례로 하려면 for...of + await, 동시에 하려면 Promise.all(arr.map(...)).'),
 A('fe-as-catch','Promise','catch 뒤의 then',
   ['reject된 Promise라 첫 then은 <b>건너뜀</b> → 1은 안 찍힘',
    '<code>.catch</code>가 에러를 받아 <b>2</b>',
    'catch가 에러 없이 끝나면 체인은 <b>다시 성공 상태</b> → 다음 then이 실행되어 <b>3</b>'],
   '<mark>catch 뒤의 then은 실행된다</mark>. catch가 에러를 "처리"한 것으로 보기 때문. 계속 실패로 두려면 catch 안에서 다시 throw.'),
 Q('fe-as-q-combo','Promise','Promise 조합 고르기',[
   ('상품·리뷰·추천 API를 동시에 부르고, 하나라도 실패하면 바로 에러 화면을 띄우고 싶다.','Promise.all','Promise.allSettled','Promise.race','Promise.any'),
   ('상품·리뷰·추천 API 중 실패한 게 있어도, 성공한 것만이라도 보여 주고 싶다.','Promise.allSettled','Promise.all','Promise.race','Promise.any'),
   ('같은 데이터를 주는 서버 세 곳 중 가장 먼저 성공한 응답만 쓰고 싶다.','Promise.any','Promise.race','Promise.all','Promise.allSettled'),
   ('fetch가 3초 안에 안 끝나면 실패로 처리하고 싶다 (3초 뒤 reject되는 Promise와 겨루기).','Promise.race','Promise.any','Promise.all','Promise.allSettled')],
   '<p><b>all</b>: 전부 성공해야 성공, 하나라도 실패하면 바로 실패. <b>allSettled</b>: 성공·실패를 가리지 않고 결과를 모두 모아 줌. <b>any</b>: 가장 먼저 <b>성공</b>한 것 (실패는 건너뜀). <b>race</b>: 가장 먼저 <b>끝난</b> 것 (실패여도 그걸로 끝) → 타임아웃에 쓴다.</p>'),
 Q('fe-as-q-serial','async','await를 차례로 쓰면',[
   ('a()와 b()는 서로 상관없고 각각 1초 걸린다. 이 코드는 약 몇 초 걸릴까?','약 2초','약 1초','0초 (await가 바로 끝남)','약 3초'),
   ('이 코드를 약 1초로 줄이려면?','await Promise.all([a(), b()])로 받는다','await를 지우고 then으로 바꾼다','a와 b를 async 함수로 바꾼다','for await...of로 돌린다')],
   '<p>await는 앞 요청이 끝날 때까지 다음 줄로 가지 않으므로 <b>1초 + 1초</b>. 서로 기다릴 필요가 없으면 두 요청을 <b>먼저 동시에 시작</b>하고 한꺼번에 기다린다: <code>const [x, y] = await Promise.all([a(), b()])</code>.</p>',
   code="// a(), b()는 각각 1초 걸리는 요청\nconst x = await a();\nconst y = await b();"),
 Q('fe-as-q-trycatch','Promise','then 안의 에러와 try/catch',[
   ("'잡힘'은 출력될까?",'안 된다. 처리 안 된 Promise 에러가 된다','된다. try/catch가 잡는다','fetch가 끝나기 전에 바로 출력된다','SyntaxError가 나서 실행이 안 된다')],
   '<p>try 블록은 fetch를 <b>시작만</b> 하고 바로 끝난다. then 콜백은 나중에 마이크로태스크로 실행되므로 그때는 이미 try 밖이다. 잡으려면 <code>.catch()</code>를 붙이거나, async 함수 안에서 <code>await fetch(...)</code>로 기다린다.</p>',
   code="try {\n  fetch('/api').then(() => {\n    throw new Error('bad');\n  });\n} catch (e) {\n  console.log('잡힘');\n}"),
 Q('fe-as-q-first','이벤트루프','setTimeout 0과 then',[
   ('fn과 g 중 먼저 실행되는 것은?','g','fn','둘이 동시에 실행된다','브라우저마다 다르다')],
   '<p>setTimeout은 0ms여도 <b>매크로태스크</b>, then은 <b>마이크로태스크</b>. 지금 코드가 끝나면 마이크로태스크를 전부 먼저 실행하므로 <b>g</b>가 먼저다. 이 순서는 표준으로 정해져 있다.</p>',
   code="setTimeout(fn, 0);\nPromise.resolve().then(g);"),
 Q('fe-as-q-block','이벤트루프','무거운 동기 코드',[
   ('클릭 핸들러에서 3초 걸리는 동기 반복문을 돌리면 어떻게 될까?','3초 동안 화면이 멈추고 다른 클릭도 처리되지 않는다','반복문은 뒤에서 돌고 화면은 계속 반응한다','브라우저가 알아서 잘게 나눠 실행한다','setTimeout 콜백이 반복문 중간에 끼어든다')],
   '<p>JS는 메인 스레드 하나에서 돈다. 콜 스택이 비지 않으면 이벤트 루프가 다음 작업(클릭, 렌더링, 타이머)을 꺼내지 못해 <b>화면 전체가 멈춘다</b>. 오래 걸리는 계산은 Web Worker로 보내거나 잘게 나눠 실행한다.</p>'),
],
# =====================================================================
'fe-browser': [
 Q('fe-br-q-script','script','스크립트 불러오기',[
   ('lib.js와 그걸 쓰는 app.js를 순서대로 실행하면서, HTML 파싱은 막지 않으려면?','둘 다 defer','둘 다 async','속성 없이 head에 둔다','app.js에만 async'),
   ('다른 코드와 상관없는 분석 스크립트를 다운로드되는 대로 바로 실행해도 된다. 가장 알맞은 것은?','async','defer','속성 없이 head에 둔다','body 맨 위에 둔다')],
   '<p><b>defer</b>: 파싱을 막지 않고 받아 두었다가 <b>파싱이 끝난 뒤 적힌 순서대로</b> 실행. <b>async</b>: 파싱을 막지 않고 받지만 <b>다 받는 즉시</b> 실행하므로 순서가 보장되지 않는다. 속성 없는 script는 받고 실행하는 동안 파싱을 멈춘다.</p>'),
 Q('fe-br-q-target','이벤트','target과 currentTarget',[
   ('span을 클릭하면 출력은?','SPAN UL','UL SPAN','LI UL','SPAN LI')],
   '<p><b>target</b>은 실제로 클릭된 가장 안쪽 요소(span), <b>currentTarget</b>은 지금 실행 중인 리스너가 달린 요소(ul). 이벤트 위임에서 누가 눌렸는지는 target으로, 보통 <code>e.target.closest(\'li\')</code>로 항목을 찾는다.</p>',
   code="<ul id=\"list\">\n  <li><span>사과</span></li>\n</ul>\n\nlist.addEventListener('click', (e) => {\n  console.log(\n    e.target.tagName,\n    e.currentTarget.tagName\n  );\n});"),
 Q('fe-br-q-prevent','이벤트','폼 제출과 새로고침',[
   ('addEventListener로 단 폼 submit 핸들러에서 페이지 새로고침을 막으려면?','e.preventDefault()','e.stopPropagation()','return false','e.stopImmediatePropagation()')],
   '<p><b>preventDefault</b>는 브라우저 기본 동작(폼 제출, 링크 이동)을 막는다. stopPropagation 계열은 <b>전파</b>만 막고 기본 동작은 그대로 일어난다. <code>return false</code>는 onsubmit 같은 속성 핸들러에서만 통하고 addEventListener에서는 아무 효과가 없다.</p>'),
 Q('fe-br-q-stop','이벤트','모달 바깥 클릭',[
   ('모달 안을 클릭해도 바깥 배경에 달린 "닫기" 클릭 핸들러가 실행되지 않게 하려면?','모달 안 클릭에서 e.stopPropagation()','모달 안 클릭에서 e.preventDefault()','배경 리스너를 capture: true로 단다','모달에 pointer-events: none을 준다')],
   '<p>모달은 배경 안에 있어서 클릭이 <b>버블링</b>으로 배경까지 올라간다. 모달에서 <b>stopPropagation</b>하면 배경 핸들러까지 가지 않는다. capture로 달면 배경 핸들러가 오히려 먼저 실행되고, pointer-events: none이면 모달 안을 아예 클릭할 수 없다. (배경 핸들러에서 <code>e.target === e.currentTarget</code>일 때만 닫는 방법도 있다.)</p>'),
 Q('fe-br-q-storage','저장소','어디에 저장할까',[
   ('로그인 세션 id처럼 서버가 요청마다 받아야 하는 값은?','쿠키','localStorage','sessionStorage','자바스크립트 변수'),
   ('작성 중인 글을 임시로 저장하되, 탭을 닫으면 버려도 된다.','sessionStorage','localStorage','쿠키','자바스크립트 변수'),
   ('다크 모드 설정처럼 브라우저를 껐다 켜도 남아야 하고, 서버는 몰라도 되는 값은?','localStorage','sessionStorage','쿠키','자바스크립트 변수')],
   '<p><b>쿠키</b>: 요청마다 서버로 자동 전송 (약 4KB). <b>localStorage</b>: 지우기 전까지 남고 서버로 안 감. <b>sessionStorage</b>: 탭을 닫으면 사라짐. 자바스크립트 변수는 새로고침만 해도 사라진다.</p>'),
 Q('fe-br-q-cors','CORS','CORS 에러 고치기',[
   ('localhost:3000에서 api.shop.com으로 fetch했더니 CORS 에러가 났다. 고쳐야 할 곳은?','API 서버의 응답 헤더 (Access-Control-Allow-Origin)','fetch 옵션에 mode: "no-cors"를 넣는다','요청 헤더에 Origin을 직접 넣는다','브라우저의 보안 설정'),
   ('fetch로 Content-Type: application/json인 POST를 보내면, 본 요청 전에 브라우저가 먼저 보내는 요청은?','OPTIONS','HEAD','GET','없다. 바로 POST를 보낸다')],
   '<p>CORS는 <b>서버가 허락한 출처인지 브라우저가 확인</b>하는 규칙이라, 서버가 <code>Access-Control-Allow-Origin</code>으로 허락해야 풀린다. no-cors는 에러만 숨기고 응답 내용을 읽을 수 없게 만든다. JSON POST처럼 "단순 요청"이 아니면 브라우저가 <b>OPTIONS</b>로 먼저 물어보는 <b>preflight</b>를 보낸다.</p>'),
 Q('fe-br-q-reflow','렌더링','리플로우가 안 일어나는 변경',[
   ('다음 중 리플로우(레이아웃 다시 계산) 없이 다시 칠하기만 하는 변경은?','color를 바꾼다','width를 바꾼다','padding을 바꾼다','font-size를 바꾼다')],
   '<p>크기나 위치에 영향을 주는 속성(width, padding, font-size, margin, top…)은 <b>리플로우</b>를 일으킨다. color, background-color처럼 모양만 바꾸는 속성은 <b>리페인트</b>만 한다. transform·opacity는 합성 단계만 다시 해서 더 싸다.</p>'),
],
# =====================================================================
'fe-css': [
 Q('fe-css-q-box','박스 모델','박스 너비 계산',[
   ('box-sizing이 기본값(content-box)일 때, 이 요소가 차지하는 가로 너비는?','250px','200px','240px','210px'),
   ('이 요소에 box-sizing: border-box를 더하면 차지하는 가로 너비는?','200px','250px','150px','240px')],
   '<p><b>content-box</b>: width는 내용 영역만 → 200 + 패딩 20×2 + 테두리 5×2 = <b>250px</b>. <b>border-box</b>: width 안에 패딩과 테두리가 들어가서 차지하는 너비는 <b>200px</b> (내용 영역이 150px로 줄어든다).</p>',
   code=".box {\n  width: 200px;\n  padding: 20px;\n  border: 5px solid;\n}"),
 Q('fe-css-q-collapse','마진','블록 사이 간격',[
   ('위아래로 붙은 두 블록 사이의 간격은?','30px','50px','20px','10px')],
   '<p>세로로 맞닿은 블록의 위아래 마진은 더해지지 않고 <b>큰 쪽 하나만 남는다</b>(마진 상쇄). 그래서 30px. flex나 grid 안의 자식끼리는 상쇄가 일어나지 않는다.</p>',
   code=".a { margin-bottom: 20px; }\n.b { margin-top: 30px; }\n\n<div class=\"a\"></div>\n<div class=\"b\"></div>"),
 Q('fe-css-q-absolute','position','absolute의 기준',[
   ('.badge는 어느 요소의 오른쪽 위에 붙을까?','.page','.card','화면(뷰포트)','원래 자리 그대로')],
   '<p>absolute는 <b>position이 static이 아닌 가장 가까운 조상</b>을 기준으로 놓인다. .card는 position이 없어서(static) 건너뛰고 .page가 기준. .card에 붙이려면 .card에 <code>position: relative</code>를 준다.</p>',
   code=".page  { position: relative; }\n.badge { position: absolute;\n         top: 0; right: 0; }\n\n<div class=\"page\">\n  <div class=\"card\">\n    <span class=\"badge\"></span>\n  </div>\n</div>"),
 Q('fe-css-q-flexcol','Flexbox','column일 때 가운데 정렬',[
   ('flex-direction: column인 컨테이너에서 자식들을 가로 가운데로 모으려면?','align-items: center','justify-content: center','text-align: center','align-content: center')],
   '<p>justify-content는 <b>주축</b>, align-items는 <b>교차축</b>을 정렬한다. column이면 주축이 세로라서 가로 정렬은 교차축, 즉 <b>align-items</b>. justify-content: center는 세로 가운데가 된다.</p>'),
 Q('fe-css-q-important','명시도','!important와 ID',[
   ('두 규칙이 같은 h1에 걸리면 글자색은?','blue','red','나중에 적힌 규칙의 색','기본 글자색 (둘 다 무시)')],
   '<p><b>!important</b>가 붙은 선언은 명시도와 상관없이 일반 선언보다 먼저 이긴다. ID 선택자(1,0,0)가 클래스(0,1,0)보다 세도 !important 앞에서는 진다. 그래서 !important는 되도록 쓰지 않는다.</p>',
   code="#title { color: red; }\n.title { color: blue !important; }\n\n<h1 id=\"title\" class=\"title\">안녕</h1>"),
 Q('fe-css-q-stack','쌓임 맥락','z-index 9999가 안 먹을 때',[
   ('모달(z-index 9999)이 헤더(z-index 10) 밑에 깔린다. 원인은?','.wrap이 z-index 1로 쌓임 맥락을 만들어서','fixed 요소에는 z-index가 적용되지 않아서','z-index는 999까지만 적용돼서','sticky 요소는 항상 맨 위에 그려져서')],
   '<p>.wrap이 <code>position + z-index</code>로 <b>새 쌓임 맥락</b>을 만들었다. 모달의 9999는 .wrap <b>안에서만</b> 비교되고, 바깥에서는 .wrap 전체가 z-index 1로 헤더(10)와 비교된다. 모달을 .wrap 밖(body 끝, React의 portal)으로 빼면 해결된다.</p>',
   code="/* .modal은 .wrap 안, .header는 밖 */\n.wrap {\n  position: relative; z-index: 1;\n}\n.modal {\n  position: fixed; z-index: 9999;\n}\n.header {\n  position: sticky; z-index: 10;\n}"),
 Q('fe-css-q-sticky','position','sticky가 안 붙을 때',[
   ('position: sticky를 줬는데 스크롤해도 붙지 않는다. 가장 흔한 원인은?','top 같은 붙을 위치 값을 안 줬다','z-index를 안 줬다','display: block이 아니다','width를 안 줬다')],
   '<p>sticky는 <code>top: 0</code>처럼 <b>어디에 붙을지</b>를 줘야 동작한다. 그다음으로 흔한 원인은 조상에 <code>overflow: hidden</code>이 있거나, 부모 높이가 sticky 요소만큼밖에 안 돼서 움직일 공간이 없는 경우다.</p>'),
 Q('fe-css-q-hide2','CSS','숨기기 방법',[
   ('요소를 안 보이게 하되 자리는 그대로 차지하고, 클릭도 받지 않게 하려면?','visibility: hidden','opacity: 0','display: none','height: 0')],
   '<p><b>visibility: hidden</b>: 자리를 차지하고 클릭도 안 받는다. <b>opacity: 0</b>: 자리를 차지하지만 <b>클릭은 받는다</b>(보이지 않는 버튼이 눌리는 버그의 원인). <b>display: none</b>: 자리까지 사라진다.</p>'),
],
# =====================================================================
'fe-react': [
 Q('fe-re-q-stale','useEffect','interval 안의 state',[
   ('시간이 지나면 화면의 count는 어떻게 될까?','1이 된 뒤 더 오르지 않는다','1초마다 1씩 계속 오른다','0에서 바뀌지 않는다','1초마다 2씩 오른다')],
   '<p>의존성이 []라 effect는 한 번만 실행되고, 그 안의 콜백은 <b>처음 렌더링의 count(0)</b>를 계속 기억한다(오래된 클로저). 매번 <code>setCount(0 + 1)</code>이라 1에서 멈춘다. <code>setCount((c) =&gt; c + 1)</code>로 바꾸면 계속 오른다.</p>',
   code="const [count, setCount] = useState(0);\n\nuseEffect(() => {\n  const id = setInterval(() => {\n    setCount(count + 1);\n  }, 1000);\n  return () => clearInterval(id);\n}, []);"),
 Q('fe-re-q-log','상태','set 직후 state 읽기',[
   ('n이 0일 때 버튼을 누르면 콘솔에 찍히는 값은?','0','1','undefined','에러가 난다')],
   '<p>setN은 state를 바로 바꾸지 않고 <b>다음 렌더링을 예약</b>한다. 지금 실행 중인 함수 안의 n은 이번 렌더링의 값(0) 그대로다. 바뀐 값은 다음 렌더링에서 보인다.</p>',
   code="const [n, setN] = useState(0);\n\nfunction onClick() {\n  setN(n + 1);\n  console.log(n);\n}"),
 Q('fe-re-q-loop','useEffect','effect 안의 fetch',[
   ('이 컴포넌트의 문제는?','렌더링마다 요청해서 끝없이 반복된다','처음 한 번만 요청해서 갱신이 안 된다','user가 null이라 바로 에러가 난다','문제없다')],
   '<p>의존성 배열이 없으면 effect는 <b>렌더링할 때마다</b> 실행된다. 요청 → setUser → 다시 렌더링 → 다시 요청… 무한 반복. 처음 한 번만 부르려면 <code>[]</code>를 준다.</p>',
   code="const [user, setUser] = useState(null);\n\nuseEffect(() => {\n  fetch('/api/me')\n    .then((r) => r.json())\n    .then(setUser);\n});"),
 Q('fe-re-q-objdep','useEffect','effect의 의존성',[
   ('이 effect는 언제 실행될까?','렌더링할 때마다','page가 바뀔 때만','처음 한 번만','실행되지 않는다')],
   '<p>query는 렌더링할 때마다 <b>새로 만든 객체</b>라 이전 것과 주소가 다르다. React는 의존성을 <code>Object.is</code>로 비교하므로 매번 바뀐 것으로 본다. 원시값 <code>[page]</code>를 의존성으로 쓰거나 useMemo로 객체를 고정한다.</p>',
   code="function List({ page }) {\n  const query = { page, size: 20 };\n\n  useEffect(() => {\n    fetchList(query);\n  }, [query]);\n  // ...\n}"),
 Q('fe-re-q-memo','성능','React.memo와 함수 props',[
   ('Child는 React.memo로 감싸져 있다. Parent가 다시 렌더링되면 Child는?','매번 같이 다시 렌더링된다','다시 렌더링되지 않는다','id가 바뀔 때만 다시 렌더링된다','처음 한 번만 렌더링된다'),
   ('Child가 불필요하게 다시 렌더링되지 않게 하려면?','onSave를 useCallback으로 감싼다','Child를 useMemo로 감싼다','save를 state에 넣는다','Child에 key를 준다')],
   '<p>화살표 함수는 렌더링할 때마다 <b>새 함수</b>라서, memo가 props를 비교하면 onSave가 매번 바뀐 것으로 보인다. <code>useCallback(() =&gt; save(id), [id])</code>로 같은 함수를 넘기면 id가 바뀔 때만 다시 렌더링된다.</p>',
   code="function Parent({ id }) {\n  return <Child onSave={() => save(id)} />;\n}\n\nconst Child = React.memo(\n  function Child({ onSave }) {\n    // ...\n  }\n);"),
 Q('fe-re-q-ref','useRef','ref를 바꾸면',[
   ('버튼을 세 번 누르면 화면에 보이는 숫자는?','0','3','1','에러가 난다')],
   '<p><b>ref.current를 바꿔도 다시 렌더링되지 않는다</b>. 값은 3으로 올라가 있지만 화면은 처음 렌더링한 0 그대로다. 화면에 보여야 하는 값은 state로, 렌더링과 상관없는 값(타이머 id, 이전 값)은 ref로.</p>',
   code="const clicks = useRef(0);\n\nreturn (\n  <button onClick={() => clicks.current++}>\n    {clicks.current}\n  </button>\n);"),
 Q('fe-re-q-strict','useEffect','effect가 두 번 실행될 때',[
   ('개발 모드에서만 useEffect(fn, [])의 fn이 두 번 실행된다. 이유는?','StrictMode가 cleanup을 확인하려고 한 번 더 마운트해서','의존성 배열이 비어 있어서','state를 두 번 바꿔서','React 18의 알려진 버그라서')],
   '<p>React 18의 <b>StrictMode</b>는 개발 모드에서 마운트 → 언마운트 → 다시 마운트를 해서 <b>cleanup을 제대로 썼는지</b> 드러낸다. 배포(프로덕션) 빌드에서는 한 번만 실행된다. 두 번 실행돼서 문제가 생기면 cleanup이 빠진 것이다.</p>'),
 Q('fe-re-q-hook','훅 규칙','조건문 안의 훅',[
   ('이 코드의 문제는?','렌더링마다 훅 호출 순서가 달라져 state가 꼬인다','name을 if 밖에서 못 쓸 뿐 동작은 괜찮다','isLoggedIn이 false면 name이 빈 문자열이 된다','문제없다')],
   '<p>React는 훅을 <b>호출 순서</b>로 구별한다. 조건에 따라 useState를 건너뛰면 그 뒤의 훅들이 엉뚱한 state를 받는다. 훅은 항상 컴포넌트 최상단에서, 조건문·반복문 밖에서 부른다.</p>',
   code="function Profile({ isLoggedIn }) {\n  if (isLoggedIn) {\n    const [name, setName] = useState('');\n  }\n  const [tab, setTab] = useState('home');\n  // ...\n}"),
],
# =====================================================================
'fe-web': [
 Q('fe-web-q-status','상태 코드','상태 코드 고르기',[
   ('로그인은 했지만 관리자 페이지에 들어갈 권한이 없다.','403 Forbidden','401 Unauthorized','404 Not Found','400 Bad Request'),
   ('토큰이 만료돼서 서버가 누군지 확인할 수 없다.','401 Unauthorized','403 Forbidden','400 Bad Request','500 Internal Server Error'),
   ('POST로 새 글을 만드는 데 성공했다.','201 Created','200 OK','204 No Content','202 Accepted'),
   ('브라우저가 캐시한 파일이 바뀌었는지 물었더니 그대로라서, 본문 없이 온 응답은?','304 Not Modified','204 No Content','200 OK','302 Found')],
   '<p><b>401</b>: 누군지 모름 → 로그인 필요. <b>403</b>: 누군지는 알지만 권한 없음. <b>201</b>: 새로 만들어짐 (200은 일반 성공, 204는 성공인데 본문 없음). <b>304</b>: If-None-Match(ETag) 같은 조건부 요청에 "안 바뀌었으니 캐시 써"라는 답.</p>'),
 Q('fe-web-q-redirect','상태 코드','주소 옮기기',[
   ('http:// 주소를 https://로 영구히 옮겼다. 검색 엔진도 새 주소를 기억하게 하려면?','301 Moved Permanently','302 Found','307 Temporary Redirect','304 Not Modified')],
   '<p><b>301</b>은 영구 이동이라 브라우저와 검색 엔진이 새 주소를 기억한다. <b>302·307</b>은 잠깐 다른 곳으로 보내는 것이라 원래 주소를 계속 쓴다 (로그인 후 원래 페이지로 보내기).</p>'),
 Q('fe-web-q-idem','HTTP','멱등성',[
   ('같은 요청을 여러 번 보내면 결과가 달라질 수 있는(멱등하지 않은) 메서드는?','POST','GET','PUT','DELETE')],
   '<p><b>멱등</b>: 여러 번 보내도 한 번 보낸 것과 결과가 같음. GET·PUT·DELETE는 멱등하고, <b>POST</b>는 보낼 때마다 새 리소스가 생길 수 있다. 결제 버튼을 두 번 누르지 못하게 막는 이유.</p>'),
 Q('fe-web-q-cache','캐시','Cache-Control 고르기',[
   ('app.3f9a2c.js처럼 파일 이름에 내용 해시가 붙은 파일에 가장 알맞은 것은?','max-age=31536000, immutable','no-store','no-cache','max-age=0'),
   ('Cache-Control: no-cache의 뜻은?','저장은 하되, 쓸 때마다 서버에 바뀌었는지 묻는다','아예 저장하지 않는다','정한 시간 동안 서버에 묻지 않고 쓴다','브라우저만 저장하고 CDN은 저장하지 않는다')],
   '<p>내용이 바뀌면 파일 이름(해시)도 바뀌므로 같은 이름의 파일은 영원히 같다 → <b>1년 캐시</b>. 반대로 index.html은 이름이 그대로라 <b>no-cache</b>로 매번 확인한다. 이름과 달리 no-cache도 저장은 한다. 아예 저장하지 않는 건 <b>no-store</b>.</p>'),
 Q('fe-web-q-vitals','성능','어느 지표가 나빠질까',[
   ('첫 화면의 가장 큰 히어로 이미지에 loading="lazy"를 주면?','LCP가 나빠진다','LCP가 좋아진다','CLS가 좋아진다','아무 영향이 없다'),
   ('버튼 클릭 핸들러가 400ms 동안 무거운 계산을 하면 가장 나빠지는 지표는?','INP','LCP','CLS','TTFB'),
   ('img에 width·height를 주지 않아 이미지가 뜰 때 아래 글이 밀려 내려간다. 나빠지는 지표는?','CLS','LCP','INP','TTFB')],
   '<p><b>LCP</b>(가장 큰 콘텐츠가 그려지는 시간): 첫 화면 이미지를 lazy로 미루면 늦게 받아서 나빠진다. 첫 화면 밖 이미지만 lazy. <b>INP</b>(입력에 반응하는 시간): 핸들러가 메인 스레드를 오래 붙잡으면 나빠진다. <b>CLS</b>(레이아웃이 밀리는 정도): 크기를 모르는 이미지·광고가 원인.</p>'),
 Q('fe-web-q-xss','보안','사용자 입력 넣기',[
   ('comment에 <img src=x onerror="alert(1)">가 들어오면?','onerror의 스크립트가 실행된다 (XSS)','태그가 글자 그대로 보인다','이미지만 깨지고 안전하다','브라우저가 알아서 막는다'),
   ('사용자가 쓴 글을 안전하게 화면에 넣으려면?','el.textContent = comment','el.innerHTML = comment.trim()','el.outerHTML = comment','el.insertAdjacentHTML(\'beforeend\', comment)')],
   '<p>innerHTML은 문자열을 <b>HTML로 해석</b>하므로 이벤트 속성의 스크립트가 실행된다(XSS). <b>textContent</b>는 글자로만 넣는다. outerHTML, insertAdjacentHTML도 HTML로 해석해서 똑같이 위험하다. React의 <code>{comment}</code>는 자동으로 글자 처리하고, dangerouslySetInnerHTML만 위험하다.</p>',
   code="const comment = getUserInput();\nel.innerHTML = comment;"),
 Q('fe-web-q-cookie','보안','쿠키 속성',[
   ('자바스크립트(document.cookie)가 쿠키를 읽지 못하게 하는 속성은?','HttpOnly','Secure','SameSite','Domain'),
   ('다른 사이트에서 보낸 요청에는 쿠키가 붙지 않게 해 CSRF를 막는 속성은?','SameSite','HttpOnly','Secure','Domain'),
   ('HTTPS 연결에서만 쿠키를 보내게 하는 속성은?','Secure','HttpOnly','SameSite','Domain')],
   '<p><b>HttpOnly</b>: JS에서 못 읽음 → XSS로 세션 쿠키를 훔치기 어려움. <b>SameSite</b>(Lax·Strict): 다른 사이트발 요청에 쿠키를 안 붙임 → CSRF 방어. <b>Secure</b>: HTTPS에서만 전송. <b>Domain</b>은 어느 도메인에 보낼지 정하는 것.</p>'),
],
}

# 유닛 안에서 문제 순서. 출력값·조각·객관식이 섞이게 늘어놓는다 (레슨은 6장씩 이 순서로 나뉜다)
ORDER = {
 'fe-js': ['fe-js-hoist','fe-js-q-const','fe-js-closure','fe-js-q-redeclare','fe-js-varloop','fe-js-letloop',
           'fe-js-call','fe-js-this2','fe-js-q-timer','fe-js-q-tdz','fe-js-equal','fe-js-typeof',
           'fe-js-truthy','fe-js-nullish','fe-js-shallow','fe-js-q-clone','fe-js-sort','fe-js-q-reduce','fe-js-q-debounce'],
 'fe-async': ['fe-as-order','fe-as-q-first','fe-as-micro','fe-as-executor','fe-as-return','fe-as-b-loop',
              'fe-as-await','fe-as-mix','fe-as-nested','fe-as-q-block','fe-as-catch','fe-as-q-trycatch',
              'fe-as-foreach','fe-as-q-serial','fe-as-q-combo'],
 'fe-browser': ['fe-br-b-crp','fe-br-q-reflow','fe-br-q-anim','fe-br-q-script','fe-br-q-load',
                'fe-br-b-event','fe-br-q-target','fe-br-q-prevent','fe-br-q-stop','fe-br-q-origin','fe-br-q-cors','fe-br-q-storage'],
 'fe-css': ['fe-css-q-box','fe-css-q-collapse','fe-css-q-spec','fe-css-q-important','fe-css-q-unit',
            'fe-css-q-absolute','fe-css-q-sticky','fe-css-q-flexcol','fe-css-q-stack','fe-css-q-hide2'],
 'fe-react': ['fe-re-q-batch','fe-re-q-updater','fe-re-q-log','fe-re-q-immut','fe-re-b-render','fe-re-q-ref',
              'fe-re-q-effect','fe-re-q-loop','fe-re-q-objdep','fe-re-q-stale','fe-re-q-strict','fe-re-q-hook',
              'fe-re-q-key','fe-re-q-memo'],
 'fe-web': ['fe-web-q-status','fe-web-q-redirect','fe-web-q-idem','fe-web-q-cache','fe-web-q-vitals','fe-web-q-xss','fe-web-q-cookie'],
}
