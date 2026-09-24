# 프론트엔드 코스: 렌더링 방식 · 성능 최적화 유닛 (4차). 원칙은 .claude/skills/quiz-quality/SKILL.md
# 근거
# - ETag·304, loading="lazy": 실제 Chrome + 로컬 HTTP 서버 (tools/frontend/verify/perf-lab.mjs)
# - 트리 셰이킹, 코드 스플리팅: esbuild로 실제 번들 (tools/frontend/verify/bundle-lab.sh)
# - ISR: next@16.3.6 번들 문서 02-guides/incremental-static-regeneration.md
from fe_content import Q, B

UNIT_RENDER = ('fe-render', '렌더링 방식', 'CSR, SSR, SSG, ISR, 스트리밍, hydration, 서버 컴포넌트까지. 페이지마다 어떤 방식을 고를지, 그 선택이 첫 화면과 SEO에 무엇을 바꾸는지 상황으로 익힙니다.', [
 Q('fe-rd-q-csrhtml','CSR','서버가 준 첫 HTML',[
   ('Create React App·Vite로 만든 SPA(CSR)에서 "페이지 소스 보기"로 서버가 준 첫 HTML을 보면?','빈 <div id="root">와 script뿐이다','글 내용까지 모두 그려진 완성된 HTML','컴포넌트별로 나뉜 HTML 조각 여러 개','화면 대신 JSON 데이터만 들어 있다')],
   '<p>CSR은 서버가 <b>빈 껍데기 HTML</b>과 JS만 주고, 브라우저가 JS를 받아 실행한 뒤에야 화면을 그린다. 그래서 JS가 느리거나 실행되지 않으면 빈 화면이고, JS를 실행하지 않는 크롤러에는 내용이 안 보인다. 개발자 도구의 Elements 탭은 JS가 그린 뒤의 DOM이라 "페이지 소스"와 다르다.</p>'),
 B('fe-rd-b-csr','order',' → ','CSR','CSR 페이지가 내용을 보여 주기까지','CSR(SPA) 페이지에서 사용자가 내용을 보기까지 일어나는 순서대로 놓으세요.',
   ['빈 HTML 도착','JS 다운로드·실행','API로 데이터 요청','데이터로 화면 그리기'],[],
   '<p class="why">내용이 보이려면 HTML → JS → API가 <b>차례로</b> 끝나야 한다(워터폴). 그래서 CSR은 첫 화면(LCP)이 늦어지기 쉽다. SSR·SSG는 서버에서 이 과정을 끝내고 내용이 든 HTML을 보낸다.</p>'),
 B('fe-rd-b-ssr','order',' → ','SSR','SSR 페이지가 동작하기까지','SSR 페이지가 화면에 보이고 클릭까지 되기까지의 순서대로 놓으세요.',
   ['서버가 데이터를 받아 HTML 생성','HTML 도착, 내용이 바로 보임','JS 다운로드','hydration (이벤트 연결)','클릭에 반응'],[],
   '<p class="why">SSR은 내용이 <b>먼저 보이고</b>, JS가 도착해 hydration이 끝나야 <b>동작한다</b>. 보이는 시점과 반응하는 시점 사이에 틈이 있다.</p>'),
 Q('fe-rd-q-seo','SEO','검색 결과에 글 내용 보이기',[
   ('검색 결과에 글 내용이 잘 나와야 하는 블로그다. JS를 실행하지 않아도 HTML에 글이 들어 있게 하려면?','SSR이나 SSG로 서버에서 HTML을 만든다','CSR로 만들고 로딩 스피너를 보여 준다','useEffect에서 글을 fetch해 그린다','서비스 워커로 글을 캐시해 둔다')],
   '<p>SSR·SSG는 <b>내용이 든 HTML</b>을 보내므로 크롤러와 링크 미리보기(Open Graph)가 바로 읽는다. CSR에서 useEffect로 가져온 내용은 JS를 실행해야 생긴다. 서비스 워커 캐시는 재방문 속도를 올릴 뿐 첫 HTML에 내용을 넣지 않는다.</p>'),
 Q('fe-rd-q-choose','렌더링 고르기','페이지마다 방식 고르기',[
   ('배포할 때만 내용이 바뀌는 회사 소개 페이지에 가장 알맞은 방식은?','SSG (빌드할 때 HTML 생성)','SSR (요청마다 서버에서 생성)','CSR (브라우저에서 생성)','ISR (정해진 시간마다 다시 생성)'),
   ('로그인한 사용자별 장바구니 내용을 첫 HTML에 담아야 한다. 가장 알맞은 방식은?','SSR (요청마다 서버에서 생성)','SSG (빌드할 때 HTML 생성)','ISR (정해진 시간마다 다시 생성)','CSR (브라우저에서 생성)'),
   ('상품 상세 페이지가 10만 개이고, 가격이 몇 분 늦게 반영돼도 괜찮다. 빌드를 매번 다시 하지 않으려면?','ISR (정해진 시간마다 다시 생성)','SSG (빌드할 때 HTML 생성)','SSR (요청마다 서버에서 생성)','CSR (브라우저에서 생성)')],
   '<p><b>SSG</b>: 빌드 때 한 번 만들어 CDN에서 바로 준다(가장 빠르고 싸다). <b>SSR</b>: 요청마다 만들어 사용자별 내용을 담을 수 있다(서버 비용, TTFB 증가). <b>ISR</b>: 정적 페이지를 두되 정한 시간이 지나면 다시 만든다(많은 페이지 + 약간의 지연 허용). <b>CSR</b>: 서버는 껍데기만, 로그인 뒤 대시보드처럼 SEO가 필요 없는 화면에 알맞다.</p>'),
 Q('fe-rd-q-isr','ISR','시간이 지난 뒤 첫 요청',[
   ('Next.js에서 revalidate = 60인 페이지다. 60초가 지난 뒤 들어온 첫 요청은 무엇을 받을까?','옛 페이지를 바로 받고, 새 페이지는 뒤에서 만들어진다','새 페이지가 다 만들어질 때까지 기다렸다가 받는다','404를 받고, 다음 요청부터 새 페이지를 받는다','매번 요청마다 새로 만든 페이지를 받는다')],
   '<p>ISR은 <b>stale-while-revalidate</b>다. 시간이 지나도 첫 요청에는 캐시된(옛) 페이지를 바로 주고, 뒤에서 새 페이지를 만든다. 다 만들어지면 그다음 요청부터 새 페이지가 간다. 그래서 "60초마다 갱신"이지만 실제 반영은 그보다 한 번의 요청만큼 늦다. (Next.js 공식 문서 기준)</p>'),
 Q('fe-rd-q-ttfb','SSR','SSR로 바꿨더니 느려진 것',[
   ('CSR 페이지를 SSR로 바꿨더니 첫 화면은 빨라졌는데 TTFB(첫 바이트까지 시간)는 늘었다. 이유는?','서버가 데이터를 받아 HTML을 다 만든 뒤에 보내서','JS 번들이 커져서','브라우저가 HTML을 두 번 파싱해서','hydration이 서버에서 한 번 더 돌아서')],
   '<p>SSR은 서버가 데이터를 가져와 HTML을 만드는 동안 응답을 시작하지 못해 <b>TTFB가 늘 수 있다</b>. 대신 도착한 HTML에 내용이 있어 첫 화면(FCP·LCP)은 빨라진다. 느린 데이터는 스트리밍(Suspense)으로 분리하면 TTFB도 줄일 수 있다.</p>'),
 Q('fe-rd-q-hydration','hydration','보이는데 안 눌리는 버튼',[
   ('SSR 페이지에서 버튼이 보이는데, 처음 몇 초 동안은 눌러도 반응이 없다. 이유는?','JS가 도착해 hydration이 끝나기 전이라서','서버가 버튼 클릭을 막아 두어서','CSS가 아직 도착하지 않아서','SSR 버튼은 새로고침해야 동작해서')],
   '<p>SSR HTML은 <b>모양만</b> 있고 이벤트 핸들러는 없다. JS를 받아 React가 같은 트리를 다시 만들며 핸들러를 붙이는 <b>hydration</b>이 끝나야 동작한다. JS가 크거나 메인 스레드가 바쁘면 이 틈이 길어진다. 그래서 JS를 줄이거나 필요한 부분만 hydration하는 방법(서버 컴포넌트, 아일랜드)이 나왔다.</p>'),
 Q('fe-rd-q-stream','스트리밍','느린 부분 기다리지 않기',[
   ('SSR 페이지에서 추천 목록 API만 3초 걸린다. 나머지 내용을 먼저 보여 주려면?','추천 목록을 Suspense로 감싸 HTML을 스트리밍한다','추천 목록 API를 await로 기다린 뒤 한꺼번에 보낸다','페이지 전체를 CSR로 바꾼다','추천 목록 API 결과를 localStorage에 저장한다')],
   '<p><b>스트리밍 SSR</b>은 준비된 HTML부터 먼저 보내고, Suspense로 감싼 느린 부분은 준비되면 이어서 흘려보낸다. 사용자는 나머지를 먼저 보고, 느린 부분 자리에는 fallback(스켈레톤)이 보인다. 전체를 CSR로 바꾸면 SEO와 첫 화면을 잃는다.</p>'),
 Q('fe-rd-q-rsc','서버 컴포넌트','서버 컴포넌트와 SSR의 차이',[
   ('React 서버 컴포넌트(RSC)에 대한 설명으로 맞는 것은?','서버 컴포넌트의 코드는 브라우저 번들에 들어가지 않는다','서버 컴포넌트도 브라우저에서 hydration된다','SSR과 같은 말이라 차이가 없다','서버 컴포넌트에서는 useState를 쓸 수 있다')],
   '<p><b>SSR</b>은 컴포넌트를 서버에서 HTML로 <b>한 번 더</b> 그리는 것이라, 그 컴포넌트의 JS는 여전히 브라우저로 가서 hydration된다. <b>서버 컴포넌트</b>는 서버에서만 실행되고 결과만 보내므로 <b>코드가 번들에 들어가지 않고</b> hydration도 없다. 대신 state·이벤트는 못 쓰고, 그런 부분만 클라이언트 컴포넌트로 뗀다.</p>'),
 Q('fe-rd-q-island','아일랜드','정적인 페이지 속 인터랙티브 한 부분',[
   ('페이지 대부분은 정적인 글이고, 이미지 캐러셀 하나만 움직인다. JS를 캐러셀에만 보내는 구조는?','아일랜드 아키텍처 (필요한 부분만 hydration)','SPA (페이지 전체를 JS로 렌더링)','SSR + 페이지 전체 hydration','ISR (정해진 시간마다 다시 생성)')],
   '<p><b>아일랜드</b>는 정적 HTML 바다 위에 인터랙티브한 섬(컴포넌트)만 따로 hydration한다(Astro가 대표적). 전체 hydration은 움직이지 않는 글까지 JS로 다시 만들어 낭비가 크다. 서버 컴포넌트도 "필요한 부분만 클라이언트로"라는 같은 생각이다.</p>'),
 Q('fe-rd-q-personal','SSG','정적 페이지에 사용자 이름',[
   ('SSG로 만든 페이지 상단에 "안녕하세요, ○○님"처럼 로그인한 사용자 이름을 보여 주고 싶다. 가장 알맞은 방법은?','페이지는 정적으로 두고, 이름만 브라우저에서 가져와 채운다','빌드할 때 사용자마다 페이지를 하나씩 만든다','SSG 페이지 안에서 쿠키를 읽어 HTML에 넣는다','ISR을 1초로 해서 사용자마다 다시 만든다')],
   '<p>SSG HTML은 <b>모든 사람에게 같은 파일</b>이라 사용자별 값을 담을 수 없다(빌드 때는 요청도 쿠키도 없다). 공통 부분은 정적으로 빠르게 주고, 이름처럼 사람마다 다른 작은 부분만 브라우저에서 가져오거나(CSR), 그 부분만 서버에서 스트리밍한다. 페이지 전체를 SSR로 바꾸는 것보다 싸다.</p>'),
])

UNIT_RENDER_ORDER = ['fe-rd-q-csrhtml','fe-rd-b-csr','fe-rd-q-seo','fe-rd-q-choose','fe-rd-b-ssr','fe-rd-q-hydration',
                     'fe-rd-q-ttfb','fe-rd-q-stream','fe-rd-q-isr','fe-rd-q-rsc','fe-rd-q-island','fe-rd-q-personal']

UNIT_PERF = ('fe-perf', '성능 최적화', '번들을 줄이고, 필요한 것만 먼저 받고, 받은 것은 다시 받지 않고, 메인 스레드를 비워 두는 방법입니다. ETag와 304, 코드 스플리팅, 트리 셰이킹, 이미지·폰트, 긴 목록, 긴 작업을 다룹니다.', [
 Q('fe-pf-q-etag','HTTP 캐시','캐시가 최신인지 확인하기',[
   ('서버가 파일과 함께 ETag: "v1"을 보냈다. 다음에 같은 파일을 요청할 때 브라우저가 붙이는 헤더는?','If-None-Match: "v1"','If-Modified-Since: "v1"','ETag: "v1"','Cache-Control: "v1"'),
   ('서버가 비교해 보니 파일이 그대로라 304 Not Modified(본문 없음)를 보냈다. 브라우저는 무엇을 쓸까?','캐시에 저장해 둔 파일','본문이 없으니 빈 화면을 그린다','서버가 다시 보낸 파일','캐시를 지우고 다시 요청한 파일')],
   '<p><b>ETag</b>는 서버가 파일 버전마다 붙이는 꼬리표다. 브라우저는 다음 요청에 <code>If-None-Match: "v1"</code>으로 "이 버전 가지고 있어"라고 묻고, 서버는 같으면 <b>본문 없는 304</b>, 다르면 새 파일과 새 ETag를 준다. 304를 받은 브라우저는 저장해 둔 파일을 쓴다. 실제 Chrome에서도 두 번째 요청에 If-None-Match가 붙고 304 뒤에 캐시된 스크립트가 실행됐다.</p>'),
 Q('fe-pf-q-lastmod','HTTP 캐시','수정 시각으로만 비교하면',[
   ('Last-Modified(수정 시각)만으로 캐시를 확인한다. 파일이 1초 안에 두 번 바뀌면?','두 번째 변경을 놓칠 수 있다 (시각이 초 단위라서)','항상 두 번 다 알아챈다','브라우저가 자동으로 ETag를 만들어 비교한다','304 대신 항상 200이 온다')],
   '<p>HTTP 날짜는 <b>초 단위</b>라, 같은 초 안의 변경은 같은 시각으로 보인다. 또 내용은 그대로인데 시각만 바뀌어도(다시 배포) 새로 받게 된다. 그래서 내용으로 만든 <b>ETag</b>가 더 정확하다. 브라우저는 If-Modified-Since로 묻고, 둘 다 있으면 서버는 보통 ETag를 우선한다.</p>'),
 Q('fe-pf-q-split','코드 스플리팅','무거운 라이브러리 첫 번들에서 빼기',[
   ('관리자 화면에서만 쓰는 무거운 차트 라이브러리가 모든 사용자의 첫 번들에 들어간다. 어떻게 뺄까?',"import('./chart')로 필요할 때 불러온다",'번들을 minify해 전체 크기를 줄인다','script 태그에 defer를 붙여 늦게 받는다','차트 라이브러리를 CDN 주소에서 받는다'),
   ("React에서 const Chart = React.lazy(() => import('./Chart'))로 만든 컴포넌트를 쓸 때 함께 있어야 하는 것은?",'Suspense로 감싸 로딩 화면을 정한다','useEffect 안에서만 렌더링한다','useMemo로 Chart를 감싼다','ErrorBoundary만 있으면 된다')],
   '<p><b>동적 import()</b>는 번들러가 그 모듈을 <b>따로 파일(청크)</b>로 떼어 내고, 호출할 때 받는다(esbuild로 확인: 차트 코드는 main.js에 없고 별도 청크로 나뉨). React.lazy 컴포넌트는 받는 동안 보여 줄 화면이 필요해서 <b>Suspense</b> 안에 둔다. minify는 크기를 줄일 뿐 첫 번들에서 빼지 못한다.</p>'),
 Q('fe-pf-q-treeshake','트리 셰이킹','라이브러리 함수 하나만 쓸 때',[
   ('lodash의 debounce 하나만 쓴다. 번들이 가장 크게 나오는 import는?',"import _ from 'lodash' 후 _.debounce","import { debounce } from 'lodash-es'","import debounce from 'lodash/debounce'",'셋 다 크기가 같다')],
   '<p><b>트리 셰이킹</b>은 ESM의 정적 import를 보고 안 쓰는 코드를 뺀다. CommonJS인 <code>lodash</code>를 통째로 가져오면 뺄 수 없어 전부 들어간다. esbuild로 번들한 실제 크기(minify): <code>lodash</code> 전체 <b>약 74KB</b>, <code>lodash-es</code>에서 이름 import <b>약 2.9KB</b>, <code>lodash/debounce</code> 약 3.5KB.</p>'),
 Q('fe-pf-q-lazyimg','이미지','첫 화면 아래 이미지들',[
   ('첫 화면 아래에 있는 이미지 30장에 loading="lazy"를 주면, 페이지를 처음 열 때 받는 이미지는?','거의 없다. 화면 가까이 스크롤하면 그때 받는다','30장 모두 받되 낮은 우선순위로 받는다','30장 모두 받고, 표시만 나중에 한다','첫 장만 받고 나머지는 클릭해야 받는다')],
   '<p>lazy 이미지는 <b>화면(뷰포트) 근처에 올 때</b> 요청한다. 실제 Chrome 실험: 첫 화면 아래 30장 중 처음에 받은 것은 <b>0장</b>, 그 위치로 스크롤하자 근처의 14장을 받았다. 첫 화면 안의 이미지(특히 LCP 이미지)에 lazy를 주면 오히려 늦어진다.</p>'),
 Q('fe-pf-q-lcpimg','이미지','첫 화면 큰 이미지 빨리 받기',[
   ('첫 화면의 가장 큰 히어로 이미지(LCP)를 다른 리소스보다 먼저 받게 하려면 img에 무엇을 줄까?','fetchpriority="high"','loading="lazy"','decoding="async"','crossorigin="anonymous"')],
   '<p><b>fetchpriority="high"</b>는 브라우저에 이 이미지를 높은 우선순위로 받으라고 알려 LCP를 앞당긴다. loading="lazy"는 반대로 늦춘다. decoding="async"는 이미지 해독을 메인 작업과 분리할 뿐 다운로드 순서와는 관계없다. CSS 배경 이미지처럼 HTML에서 늦게 발견되는 LCP 이미지는 preload로 먼저 알린다.</p>'),
 Q('fe-pf-q-imgsize','이미지','사진 용량 줄이기',[
   ('폰에서 3000px짜리 사진이 그대로 내려온다. 용량을 줄이는 가장 효과적인 방법은?','WebP·AVIF + srcset으로 화면에 맞는 크기','PNG로 바꿔 화질을 그대로 지킨다','base64로 바꿔 HTML에 직접 넣는다','서버에서 gzip으로 한 번 더 압축한다')],
   '<p>사진은 <b>화면에 필요한 크기</b>로 주는 것(srcset·sizes)과 <b>최신 포맷</b>(WebP·AVIF)이 가장 크게 효과가 있다. PNG는 사진에 오히려 크다. base64는 33% 커지고 캐시도 따로 안 된다. JPEG·WebP는 이미 압축된 형식이라 gzip을 해도 거의 줄지 않는다.</p>'),
 Q('fe-pf-q-font','폰트','웹폰트를 받는 동안',[
   ('웹폰트를 받는 동안 글자가 아예 안 보이는 시간(FOIT)을 없애고, 기본 글꼴로 먼저 보여 주려면?','@font-face에 font-display: swap','@font-face에 font-display: block','font-weight를 400으로 고정한다','폰트를 CSS @import로 불러온다')],
   '<p><b>font-display: swap</b>은 폰트를 받는 동안 시스템 글꼴로 먼저 그리고, 도착하면 바꾼다(글자는 바로 보이지만 바뀔 때 살짝 흔들릴 수 있음). block은 받는 동안 글자를 숨겨 FOIT가 생긴다. @import는 CSS를 받은 뒤에야 폰트 CSS를 발견해 더 늦다. 중요한 폰트는 preload와 함께 쓴다.</p>'),
 Q('fe-pf-q-virtual','긴 목록','1만 줄 목록이 버벅일 때',[
   ('1만 줄짜리 목록을 한 번에 렌더링했더니 처음 뜰 때 느리고 스크롤도 버벅인다. 가장 효과적인 방법은?','화면에 보이는 줄만 렌더링한다 (가상화)','각 줄을 React.memo로 감싼다','key를 index로 바꾼다','목록 전체에 will-change: transform을 준다')],
   '<p><b>가상화(virtualization)</b>는 스크롤 위치를 보고 보이는 수십 줄만 DOM에 두고 나머지는 빈 공간으로 둔다(react-window, TanStack Virtual). DOM 노드 1만 개를 만들고 레이아웃하는 비용 자체를 없앤다. memo는 다시 렌더링할 때만 도움이 되고 처음 1만 개를 만드는 비용은 그대로다.</p>'),
 Q('fe-pf-q-longtask','메인 스레드','긴 작업의 기준',[
   ('브라우저 성능 도구에서 "긴 작업(Long Task)"으로 표시되는 기준은 메인 스레드를 얼마나 넘게 붙잡는 작업일까?','50ms','16ms','100ms','1초')],
   '<p>메인 스레드를 <b>50ms 넘게</b> 붙잡는 작업을 긴 작업이라 한다. 그동안 클릭·입력에 반응하지 못해 INP가 나빠진다. 16ms는 60fps에서 한 프레임의 시간이라 헷갈리기 쉽다.</p>'),
 Q('fe-pf-q-inp','메인 스레드','클릭 뒤 무거운 계산',[
   ('필터 버튼을 누르면 300ms 걸리는 계산을 한 뒤 목록을 바꾼다. 클릭 반응(INP)을 좋게 하려면?','계산을 잘게 나눠 양보하거나 Worker로 옮긴다','계산 결과를 useMemo로 감싸 둔다','버튼에 transition CSS를 걸어 둔다','결과를 localStorage에 저장해 둔다')],
   '<p>INP는 클릭부터 <b>다음 화면이 그려질 때</b>까지의 시간이다. 한 덩어리 계산이 메인 스레드를 붙잡으면 그동안 그릴 수 없다. 계산을 쪼개 사이사이 <code>await</code>로 양보하거나(setTimeout, scheduler.yield), 계산 자체를 <b>Web Worker</b>로 옮긴다. 버튼 눌림 표시 같은 가벼운 업데이트를 먼저 그리는 것도 방법이다. useMemo는 같은 입력을 다시 계산할 때만 줄여 준다.</p>'),
 Q('fe-pf-q-compress','전송','텍스트 파일 전송 크기',[
   ('JS·CSS·HTML의 전송 크기를 코드 수정 없이 크게 줄이는 서버·CDN 설정은?','Brotli 또는 gzip 압축을 켠다','Cache-Control: no-store를 준다','HTTP/1.1로 바꾼다','파일마다 ETag를 끈다')],
   '<p>텍스트는 반복이 많아서 <b>Brotli·gzip</b>으로 보통 크게 줄어든다(브라우저가 Accept-Encoding으로 알리면 서버가 Content-Encoding으로 답한다). no-store는 캐시만 끈다. 이미 압축된 이미지·동영상은 다시 압축해도 거의 줄지 않는다.</p>'),
 Q('fe-pf-q-cls','레이아웃 이동','늦게 들어오는 광고',[
   ('글 중간의 광고가 1초 뒤에 들어오면서 아래 글이 밀려 내려간다. 가장 알맞은 해결은?','광고 자리에 min-height로 공간을 미리 잡는다','광고 스크립트에 async를 붙여 늦게 받는다','광고 영역을 loading=lazy로 늦게 받는다','광고가 올 때까지 글 전체를 숨겨 둔다')],
   '<p>CLS는 <b>자리를 미리 잡지 않은 채 늦게 들어오는 요소</b> 때문에 생긴다. 광고·임베드·이미지 자리에 크기(min-height, aspect-ratio, width·height)를 먼저 잡아 두면 들어와도 밀리지 않는다. async·lazy는 받는 시점을 바꿀 뿐 들어올 때 미는 것은 그대로다.</p>'),
 Q('fe-pf-q-cvis','렌더링 비용','화면 밖 긴 섹션 건너뛰기',[
   ('아주 긴 문서에서 화면 밖에 있는 섹션의 레이아웃·페인트를 필요할 때까지 건너뛰게 하는 CSS는?','content-visibility: auto','visibility: hidden','display: none','will-change: contents')],
   '<p><b>content-visibility: auto</b>는 화면 밖 요소의 렌더링 작업을 건너뛰었다가 가까워지면 그린다. 크기를 모르면 스크롤바가 튈 수 있어 <code>contain-intrinsic-size</code>로 예상 크기를 함께 준다. display: none은 아예 없애 검색·접근성에서도 빠지고, visibility: hidden은 레이아웃은 그대로 계산한다.</p>'),
 Q('fe-pf-q-memoall','React 성능','모든 컴포넌트에 memo',[
   ('성능을 위해 프로젝트의 모든 컴포넌트를 React.memo로 감쌌다. 어떻게 될까?','비교 비용만 늘고 효과가 없는 곳이 많다','모든 리렌더링이 사라져 항상 빨라진다','memo가 겹쳐서 에러가 난다','Context를 쓰는 컴포넌트만 더 빨라진다')],
   '<p>memo는 렌더링 전에 <b>props를 비교</b>한다. props가 매번 바뀌는 컴포넌트(새 객체·함수를 받는 곳)는 비교만 하고 결국 다시 렌더링하니 손해다. 먼저 프로파일러로 느린 곳을 찾고, 비싼 컴포넌트에만 memo와 useCallback·useMemo를 짝지어 쓴다.</p>'),
])

UNIT_PERF_ORDER = ['fe-pf-q-etag','fe-pf-q-lastmod','fe-pf-q-compress','fe-pf-q-split','fe-pf-q-treeshake','fe-pf-q-lazyimg',
                   'fe-pf-q-lcpimg','fe-pf-q-imgsize','fe-pf-q-font','fe-pf-q-cls','fe-pf-q-virtual','fe-pf-q-cvis',
                   'fe-pf-q-longtask','fe-pf-q-inp','fe-pf-q-memoall']
