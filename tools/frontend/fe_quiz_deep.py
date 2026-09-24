# 프론트엔드 코스 심화 문제 (3차): Next.js 유닛 신설, React·브라우저 심화.
# 근거
# - React 동작: react@19.3.0 + react-dom을 jsdom에서 실제 실행한 로그
# - 브라우저 동작: Playwright로 실제 Chrome에서 실행한 결과
# - Next.js: next@16.3.6에 들어 있는 공식 문서(next/dist/docs)와 실제 next build · next start 결과
# 원칙: .claude/skills/quiz-quality/SKILL.md
from fe_content import Q

UNIT_NEXT = ('fe-next', 'Next.js', 'Next.js 16 App Router 기준입니다. 서버·클라이언트 컴포넌트 경계, 정적·동적 렌더링, 캐시, Server Action처럼 실무에서 사고가 나는 지점을 코드로 확인합니다. 캐시 문제는 설정(cacheComponents)에 따라 답이 달라서 질문에 조건을 적었습니다.', [
 Q('fe-nx-q-usestate','서버 컴포넌트','page에서 state 쓰기',[
   ("app/page.tsx가 이렇게 생겼다. next build를 하면?",'빌드 에러: 서버 컴포넌트에서는 useState를 못 쓴다','잘 빌드되고, state는 브라우저에서만 동작한다','경고만 뜨고 서버에서는 useState를 무시한다','자동으로 클라이언트 컴포넌트로 바뀐다')],
   '<p>App Router의 page와 layout은 기본이 <b>서버 컴포넌트</b>다. useState·useEffect·onClick처럼 브라우저에서 돌아야 하는 것은 파일 맨 위에 <code>\'use client\'</code>가 있어야 한다. 없으면 Next가 빌드할 때 "This API is only available in Client Components" 에러를 낸다. 자동으로 바꿔 주지 않는다.</p>',
   code="import { useState } from 'react';\n\nexport default function Page() {\n  const [n, setN] = useState(0);\n  return <p>{n}</p>;\n}"),
 Q('fe-nx-q-children','경계','클라이언트 안의 서버 컴포넌트',[
   ('ServerList는 어디서 렌더링될까?','서버에서. children으로 받은 건 서버 컴포넌트 그대로다','브라우저에서. Shell 안에 있으니 클라이언트 컴포넌트가 된다','에러가 난다. 클라이언트 안에 서버 컴포넌트를 둘 수 없다','서버와 브라우저에서 한 번씩 렌더링된다')],
   '<p>서버 컴포넌트를 클라이언트 컴포넌트의 <b>props(children)로 넘기면</b> 서버에서 렌더링된 결과가 그 자리에 끼워질 뿐, 클라이언트 번들에 들어가지 않는다. 반대로 Shell 파일이 ServerList를 <b>직접 import</b>하면 그때는 클라이언트 번들에 들어간다. 경계는 "어디서 import했는가"로 정해진다.</p>',
   code="// Shell.tsx\n'use client';\nexport function Shell({ children }) {\n  const [open, setOpen] = useState(true);\n  return open ? <div>{children}</div> : null;\n}\n\n// page.tsx (서버 컴포넌트)\n<Shell>\n  <ServerList />\n</Shell>"),
 Q('fe-nx-q-import','경계','클라이언트 파일이 import하면',[
   ("'use client' 파일인 Chart.tsx가 import한 formatPrice.ts는?",'클라이언트 번들에 들어간다','서버 번들에만 들어간다','양쪽에 따로 복사돼 서버 것이 먼저 실행된다',"formatPrice.ts에도 'use client'를 따로 붙여야 번들에 들어간다")],
   '<p><code>\'use client\'</code>는 파일 하나가 아니라 <b>경계</b>를 선언한다. 그 파일이 import하는 모듈과 직접 렌더링하는 컴포넌트는 모두 클라이언트 번들에 들어가므로, 거기서 import한 파일에 따로 표시할 필요가 없다. 그래서 무거운 라이브러리를 쓰는 부분만 작은 클라이언트 컴포넌트로 떼어 내는 것이 좋다.</p>'),
 Q('fe-nx-q-fnprop','경계','서버에서 함수 넘기기',[
   ('이 page를 next build하면?','에러: 함수는 클라이언트 컴포넌트 props로 못 넘긴다','잘 동작하고, 클릭하면 서버 터미널에 x가 찍힌다','잘 동작하고, 클릭하면 브라우저 콘솔에 x가 찍힌다','함수가 문자열로 바뀌어 전달된다')],
   '<p>서버 컴포넌트에서 클라이언트 컴포넌트로 넘기는 props는 <b>직렬화할 수 있어야</b> 한다(문자열, 숫자, 객체, 배열, JSX 등). 일반 함수는 안 되어서 "Event handlers cannot be passed to Client Component props" 에러가 난다. 예외는 <code>\'use server\'</code>로 만든 <b>Server Action</b>이다. 클릭 처리는 Btn 안(클라이언트)에서 정의한다.</p>',
   code="// Btn.tsx\n'use client';\nexport default function Btn({ onPick }) {\n  return <button onClick={onPick}>b</button>;\n}\n\n// page.tsx (서버 컴포넌트)\nexport default function Page() {\n  return <Btn onPick={() => console.log('x')} />;\n}"),
 Q('fe-nx-q-params','라우팅','params 읽기',[
   ('Next 16의 app/post/[id]/page.tsx에서 id를 읽는 올바른 코드는?','const { id } = await params','const { id } = params','const id = params.get(\'id\')','const { id } = useParams()')],
   '<p>Next 15부터 <code>params</code>와 <code>searchParams</code>는 <b>Promise</b>가 됐고, Next 16에서는 동기로 읽는 방식이 완전히 사라졌다. <code>useParams()</code>는 클라이언트 컴포넌트용 훅이라 서버 컴포넌트인 page에서는 쓸 수 없다. cookies(), headers()도 똑같이 await해야 한다.</p>',
   code="export default async function Page({ params }: {\n  params: Promise<{ id: string }>;\n}) {\n  // ?\n}"),
 Q('fe-nx-q-dynamic','렌더링','정적과 동적 렌더링',[
   ('기본 설정(cacheComponents 끔)에서 next build를 하면 /dashboard가 ƒ(Dynamic)로 표시된다. 이유는?','요청마다 달라지는 쿠키를 읽어서','page가 async 함수라서','서버 컴포넌트라서','use client가 없어서')],
   '<p>빌드 결과의 <b>○</b>는 빌드할 때 미리 만든 정적 페이지, <b>ƒ</b>는 요청이 올 때마다 서버에서 렌더링하는 동적 페이지다. <code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>처럼 <b>요청마다 달라지는 값</b>을 읽으면 동적이 된다. async 함수인 것만으로는 동적이 되지 않는다(빌드 때 기다렸다가 정적으로 만든다).</p>',
   code="// app/dashboard/page.tsx\nimport { cookies } from 'next/headers';\n\nexport default async function Page() {\n  const theme = (await cookies()).get('theme');\n  return <p>{theme?.value}</p>;\n}"),
 Q('fe-nx-q-ssg','렌더링','미리 만들지 않은 경로',[
   ('기본 설정에서 /post/3으로 들어가면?','404','요청할 때 새로 렌더링해서 보여 준다','/post/1로 리다이렉트된다','빈 페이지가 200으로 온다')],
   '<p><code>generateStaticParams</code>가 돌려준 1, 2만 빌드 때 만들어지고(●), <code>dynamicParams = false</code>면 목록에 없는 경로는 <b>404</b>다. true(기본값)면 요청할 때 렌더링한다. cacheComponents를 켜면 dynamicParams 설정 자체를 쓸 수 없고 notFound()로 처리한다.</p>',
   code="// app/post/[id]/page.tsx\nexport const dynamicParams = false;\n\nexport function generateStaticParams() {\n  return [{ id: '1' }, { id: '2' }];\n}"),
 Q('fe-nx-q-redirect','내비게이션','try 안의 redirect',[
   ('이 페이지에 들어가면?','이동하지 않고 "caught NEXT_REDIRECT"가 보인다','/로 이동한다','빌드 에러가 난다','/로 이동한 뒤 catch 안의 화면이 잠깐 보인다')],
   '<p><code>redirect()</code>는 내부적으로 <b>특별한 에러를 던져서</b> 동작한다. try 안에서 부르면 catch가 그 에러를 잡아 버려 이동이 일어나지 않는다. 공식 문서도 redirect는 try 블록 <b>밖에서</b> 부르라고 한다. notFound()도 같은 방식이다.</p>',
   code="import { redirect } from 'next/navigation';\n\nexport default async function Page() {\n  try {\n    redirect('/');\n  } catch (e) {\n    return <p>caught {e.message}</p>;\n  }\n}"),
 Q('fe-nx-q-error','에러 처리','error.tsx',[
   ('app/dashboard/error.tsx 맨 위에 꼭 있어야 하는 것은?',"'use client'","'use server'","export const dynamic = 'force-dynamic'",'아무것도 필요 없다')],
   '<p>error.tsx는 React 에러 바운더리로 동작하고, 에러 바운더리는 <b>클라이언트 컴포넌트</b>여야 한다. 그래서 <code>\'use client\'</code>가 필요하다. 다시 시도 버튼(reset)을 누르는 것처럼 브라우저에서 동작해야 하는 기능도 여기에 있다.</p>'),
 Q('fe-nx-q-loading','스트리밍','loading.tsx',[
   ('app/dashboard/loading.tsx를 두면?','dashboard의 page를 Suspense로 감싸 로딩 UI를 바로 보여 준다','page의 데이터가 다 올 때까지 기다렸다가 한꺼번에 보여 준다','서버 렌더링을 끄고 브라우저에서 로딩 화면을 그린다','같은 폴더의 layout.tsx까지 로딩 화면으로 바뀐다')],
   '<p>loading.tsx는 같은 폴더의 page(와 그 아래)를 <b>Suspense 경계</b>로 감싼다. 서버가 page를 준비하는 동안 로딩 UI를 먼저 보내고, 준비되면 스트리밍으로 채운다. <b>같은 폴더의 layout은 감싸지 않아서</b> 사이드바 같은 레이아웃은 그대로 보이고 조작도 된다.</p>'),
 Q('fe-nx-q-stream','스트리밍','느린 컴포넌트',[
   ('Reviews가 3초 걸린다. 사용자에게는 어떻게 보일까?','헤더가 먼저 보이고, 리뷰 자리는 3초 뒤 채워진다','3초 동안 흰 화면이다가 한꺼번에 보인다','리뷰만 브라우저에서 따로 fetch해서 채운다','헤더도 리뷰도 3초 뒤에 스켈레톤 없이 보인다'),
   ('Suspense를 빼면(loading.tsx도 없음) 이 페이지는 어떻게 보일까?','3초 뒤에 한꺼번에 보인다','헤더가 먼저 보이고 리뷰만 늦게 보인다','Reviews가 자동으로 스트리밍된다','빌드 에러가 난다')],
   '<p><b>Suspense 밖</b>의 내용은 바로 보내고, 안쪽은 준비되는 대로 <b>스트리밍</b>으로 끼워 넣는다. Suspense도 loading.tsx도 없으면 페이지 전체가 가장 느린 부분을 기다린다. 서버에서 렌더링한 뒤 HTML을 흘려보내는 것이지 브라우저가 따로 fetch하는 것이 아니다.</p>',
   code="export default function Page() {\n  return (\n    <>\n      <Header />\n      <Suspense fallback={<Skeleton />}>\n        <Reviews /> {/* 3초 걸림 */}\n      </Suspense>\n    </>\n  );\n}"),
 Q('fe-nx-q-layout','레이아웃','페이지를 옮겨도 남는 것',[
   ('/settings/profile에서 /settings/account로 이동하면 settings/layout.tsx 안 검색창의 입력값은?','그대로 남는다. layout은 다시 마운트되지 않는다','지워진다. 페이지를 옮기면 layout도 새로 만든다','새로고침되며 지워진다','layout이 서버 컴포넌트라 원래 입력값을 가질 수 없다'),
   ('settings 아래에서 페이지를 옮길 때마다 입력값을 초기화하고 싶다. 무엇을 쓸까?','layout.tsx 대신 template.tsx','layout.tsx에 loading.tsx를 추가한다',"layout.tsx의 'use client'를 뺀다","export const dynamic = 'force-dynamic'")],
   '<p>layout은 같은 layout을 쓰는 페이지끼리 이동할 때 <b>상태를 유지하고 다시 렌더링되지 않는다</b>. 검색창 같은 클라이언트 컴포넌트의 state도 남는다. <b>template.tsx</b>는 이동할 때마다 새 key를 받아 안의 클라이언트 컴포넌트 state가 초기화된다.</p>'),
 Q('fe-nx-q-action','Server Action','Server Action과 권한',[
   ('이 액션은 관리자 페이지 버튼에서만 부른다. 문제는?','누구나 POST로 직접 부를 수 있어 액션 안에서 권한을 확인해야 한다','문제없다. 관리자 페이지에서만 import하므로 다른 곳에서 못 부른다','Server Action은 GET이라 결과가 캐시된다','DB 코드가 브라우저 번들에 노출된다')],
   '<p>Server Action은 화면 버튼뿐 아니라 <b>직접 보낸 POST 요청으로도 호출</b>된다. 공식 문서도 "모든 Server Function 안에서 인증과 권한을 확인하라"고 한다. 코드 자체는 서버에만 있어서 번들에 노출되지는 않는다. 페이지 접근 제한(proxy, layout)만 믿으면 안 된다.</p>',
   code="'use server';\n\nexport async function deletePost(id: string) {\n  await db.post.delete({ where: { id } });\n}"),
 Q('fe-nx-q-env','환경 변수','NEXT_PUBLIC_ 값',[
   ('NEXT_PUBLIC_API=hello로 next build를 하고, NEXT_PUBLIC_API=changed로 next start를 했다. 클라이언트 컴포넌트의 process.env.NEXT_PUBLIC_API는?','hello','changed','undefined','빌드 에러가 난다'),
   ("접두사 없는 SECRET_KEY를 클라이언트 컴포넌트에서 process.env.SECRET_KEY로 읽으면, 브라우저 번들에는?",'들어가지 않는다 (undefined)','값이 그대로 들어간다','암호화된 값이 들어간다','빌드 에러가 난다')],
   '<p><code>NEXT_PUBLIC_</code> 값은 <b>빌드할 때 코드에 문자열로 박힌다</b>. 빌드 뒤에 바꿔도 번들은 그대로 hello다. 접두사가 없는 값은 번들에 들어가지 않는다. 단, 클라이언트 컴포넌트도 서버에서 먼저 렌더링되므로 그때 찍힌 값이 HTML에 들어가고 브라우저와 값이 달라 hydration 에러가 날 수 있다. 비밀 값은 서버 컴포넌트나 Server Action에서만 읽는다.</p>'),
 Q('fe-nx-q-serveronly','경계','서버 전용 모듈 지키기',[
   ('DB 비밀번호를 쓰는 lib/db.ts가 실수로 클라이언트 컴포넌트에 import되는 걸 빌드에서 막으려면?',"lib/db.ts에 import 'server-only'","lib/db.ts 맨 위에 'use server'",'lib/db.ts를 app 폴더 밖으로 옮긴다','환경 변수 이름에서 NEXT_PUBLIC_을 뺀다')],
   '<p><code>import \'server-only\'</code>를 넣은 모듈을 클라이언트 컴포넌트가 import하면 <b>빌드 에러</b>가 난다. <code>\'use server\'</code>는 파일의 함수들을 브라우저에서 부를 수 있는 Server Action으로 만드는 것이라, 오히려 엉뚱하게 외부에 공개될 수 있다.</p>'),
 Q('fe-nx-q-fetch','캐시','fetch 결과 캐시하기',[
   ('기본 설정(cacheComponents 끔)의 Next 16에서, 서버 컴포넌트의 fetch 결과를 1시간 동안 캐시하려면?',"fetch(url, { next: { revalidate: 3600 } })",'아무것도 안 해도 기본으로 캐시된다',"fetch(url, { cache: 'no-store' })","export const runtime = 'edge'")],
   '<p>Next 14까지는 fetch가 기본으로 캐시됐지만, <b>Next 15부터는 기본이 캐시하지 않음</b>이다. 캐시하려면 <code>cache: \'force-cache\'</code>나 <code>next: { revalidate: 초 }</code>로 직접 켠다. cacheComponents를 켠 프로젝트에서는 <code>\'use cache\'</code>와 <code>cacheLife</code>를 쓴다.</p>'),
 Q('fe-nx-q-cachecomp','캐시','cacheComponents와 Suspense',[
   ('cacheComponents를 켠 프로젝트에서 page가 Suspense 없이 await cookies()를 하면 next build는?','빌드 에러: Suspense로 감싸거나 캐시하라고 한다','조용히 페이지 전체가 동적 렌더링이 된다','쿠키 없이 정적 페이지로 만든다','경고만 뜨고 빌드된다')],
   '<p>cacheComponents에서는 요청마다 달라지는 데이터(cookies, headers, 캐시하지 않은 fetch)를 <b>Suspense 밖에서</b> 읽으면 빌드가 실패한다("uncached or runtime data during prerendering"). 나머지는 정적으로 미리 만들고 그 부분만 스트리밍하기 위해서다. 해결: Suspense로 감싸거나, <code>\'use cache\'</code>로 캐시한다. 조용히 전체를 동적으로 바꾸는 건 예전(끈 상태) 동작이다.</p>'),
 Q('fe-nx-q-updatetag','캐시','저장 직후 내 화면',[
   ('Next 16의 Server Action에서 글을 저장한 직후, 저장한 사람의 다음 화면에 새 글이 바로 보여야 한다.',"updateTag('posts')","revalidateTag('posts', 'max')","cacheLife('seconds')","connection()")],
   '<p><b>updateTag</b>는 태그를 즉시 만료시켜 다음 요청이 새 데이터를 기다리게 한다(내가 쓴 걸 바로 보기, Server Action 안에서만). <b>revalidateTag(tag, \'max\')</b>는 stale-while-revalidate라 다음 방문자에게 옛 데이터를 한 번 보여 주고 뒤에서 새로 만든다. Next 16에서 인자 하나짜리 revalidateTag는 deprecated.</p>'),
 Q('fe-nx-q-searchparams','렌더링','useSearchParams와 Suspense',[
   ('정적 페이지의 클라이언트 컴포넌트가 Suspense 없이 useSearchParams()를 쓰면 next build는?','실패한다. Suspense로 감싸라는 에러가 난다','성공하고, 페이지 전체가 동적이 된다','성공하고, searchParams는 늘 비어 있다','성공하고, 경고도 없다')],
   '<p>정적 페이지는 빌드할 때 쿼리 문자열을 알 수 없다. 그래서 useSearchParams를 쓰는 부분은 <b>가장 가까운 Suspense까지 브라우저에서 렌더링</b>되고, 프로덕션 빌드에서는 Suspense가 없으면 "Missing Suspense boundary with useSearchParams" 에러가 난다. 개발 서버에서는 문제없어 보여서 배포할 때 처음 알게 된다.</p>'),
 Q('fe-nx-q-prefetch','내비게이션','Link 미리 받기',[
   ('<Link>가 화면(뷰포트)에 들어오면 링크된 페이지를 미리 받아 둔다. 이 동작은 언제 일어날까?','프로덕션에서만. 개발 서버에서는 하지 않는다','개발 서버와 프로덕션 모두','마우스를 올렸을 때만','prefetch prop을 직접 줄 때만')],
   '<p>Link의 prefetch는 <b>프로덕션에서만</b> 동작한다. 개발 서버에서 "페이지 이동이 느리다"고 느껴도 배포하면 다를 수 있다. 기본값(auto)에서 정적 경로는 통째로, 동적 경로는 가장 가까운 loading.tsx까지만 미리 받는다.</p>'),
 Q('fe-nx-q-hydration','hydration','서버와 브라우저의 값',[
   ("'use client' 컴포넌트가 <p>{new Date().toLocaleTimeString()}</p>를 그린다. 페이지를 열면?",'서버와 브라우저가 그린 시간이 달라 hydration 에러가 난다','서버에서 찍은 시간이 그대로 보이고 아무 일 없다','클라이언트 컴포넌트라 서버에서는 렌더링되지 않는다','빌드 에러가 난다')],
   '<p>클라이언트 컴포넌트도 <b>처음에는 서버에서 HTML로 렌더링</b>되고, 브라우저가 같은 결과를 다시 그려 연결한다(hydration). 시간, 난수, <code>typeof window</code> 분기처럼 양쪽 결과가 다르면 hydration 에러가 난다. 브라우저 값은 useEffect 안에서 넣거나, 시간처럼 달라도 되는 곳은 suppressHydrationWarning을 쓴다.</p>'),
 Q('fe-nx-q-proxy','Next 16','요청 가로채기 파일',[
   ('Next 16에서 모든 요청 앞에서 로그인 여부를 보고 리다이렉트하는 파일(예전 middleware.ts)의 새 이름은?','proxy.ts','interceptor.ts','edge.ts','route.ts')],
   '<p>Next 16에서 middleware 파일 규칙은 deprecated되고 <b>proxy</b>로 이름이 바뀌었다(함수 이름도 proxy). 기본 런타임은 Node.js다. 다만 proxy에서의 인증 확인은 빠른 1차 차단일 뿐이고, 데이터를 읽는 곳과 Server Action 안에서 다시 확인해야 한다.</p>'),
 Q('fe-nx-q-image','이미지','next/image 크기',[
   ('next/image로 크기를 모르는 원격 이미지를 넣을 때 반드시 줘야 하는 것은?','width와 height (또는 fill)','priority','loading="lazy"','placeholder="blur"')],
   '<p>next/image는 이미지가 오기 전에 <b>자리를 먼저 잡아 레이아웃이 밀리지 않게(CLS)</b> 하려고 크기를 요구한다. 정적으로 import한 이미지는 크기를 알아서 채운다. Next 16에서 priority는 deprecated됐고, 첫 화면 큰 이미지에는 보통 loading="eager"나 fetchPriority="high"를 쓴다.</p>'),
])

NEXT_ORDER = ['fe-nx-q-usestate','fe-nx-q-children','fe-nx-q-import','fe-nx-q-fnprop','fe-nx-q-params','fe-nx-q-serveronly',
              'fe-nx-q-dynamic','fe-nx-q-ssg','fe-nx-q-redirect','fe-nx-q-error','fe-nx-q-loading','fe-nx-q-stream',
              'fe-nx-q-layout','fe-nx-q-action','fe-nx-q-env','fe-nx-q-hydration','fe-nx-q-searchparams','fe-nx-q-prefetch',
              'fe-nx-q-fetch','fe-nx-q-cachecomp','fe-nx-q-updatetag','fe-nx-q-proxy','fe-nx-q-image']

# ---------------------------------------------------------------------
# React 심화: react@19.3.0을 jsdom에서 실제로 실행해 확인한 동작
REACT_DEEP = [
 Q('fe-re-q-order','렌더링','부모와 자식의 effect 순서',[
   ('처음 화면에 그려질 때 로그 순서는?','P render → C render → C effect → P effect','P render → P effect → C render → C effect','P render → C render → P effect → C effect','C render → P render → C effect → P effect')],
   '<p>렌더링(컴포넌트 함수 실행)은 <b>위에서 아래로</b>, effect는 자식이 먼저 끝나야 부모가 끝나므로 <b>아래에서 위로</b> 실행된다. 그래서 부모 effect에서는 자식 DOM이 이미 준비돼 있다.</p>',
   code="function Child() {\n  log('C render');\n  useEffect(() => log('C effect'));\n  return null;\n}\n\nfunction Parent() {\n  log('P render');\n  useEffect(() => log('P effect'));\n  return <Child />;\n}"),
 Q('fe-re-q-layoutfx','useLayoutEffect','n이 바뀔 때 cleanup 순서',[
   ('n이 0에서 1로 바뀔 때 로그 순서는?','layout cleanup 0 → layout 1 → effect cleanup 0 → effect 1','layout cleanup 0 → effect cleanup 0 → layout 1 → effect 1','effect cleanup 0 → layout cleanup 0 → layout 1 → effect 1','layout 1 → effect 1 → layout cleanup 0 → effect cleanup 0')],
   '<p><b>useLayoutEffect</b>는 DOM을 바꾼 직후, 화면에 그리기 <b>전에</b> 동기로 실행된다(이전 cleanup → 새 effect). <b>useEffect</b>는 그 뒤, 보통 화면을 그린 다음에 실행된다(역시 이전 cleanup → 새 effect). 그래서 layout 쪽 한 쌍이 먼저, effect 쪽 한 쌍이 나중이다. 깜빡임 없이 크기를 재야 할 때 useLayoutEffect를 쓴다.</p>',
   code="useLayoutEffect(() => {\n  log('layout ' + n);\n  return () => log('layout cleanup ' + n);\n}, [n]);\n\nuseEffect(() => {\n  log('effect ' + n);\n  return () => log('effect cleanup ' + n);\n}, [n]);"),
 Q('fe-re-q-position','state 보존','같은 자리의 같은 컴포넌트',[
   ('A 버튼을 두 번 눌러 A2가 된 뒤 isA를 false로 바꾸면 화면은?','B2','B0','A2','A0')],
   '<p>React는 state를 컴포넌트가 아니라 <b>트리의 자리</b>에 붙인다. 삼항의 두 쪽이 <b>같은 자리의 같은 타입(Counter)</b>이라 React는 "props만 바뀐 같은 Counter"로 보고 count 2를 유지한다. 서로 다른 Counter로 다루려면 <code>key="A"</code>, <code>key="B"</code>를 준다.</p>',
   code="function Counter({ label }) {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      {label}{n}\n    </button>\n  );\n}\n\n// App\n{isA\n  ? <Counter label=\"A\" />\n  : <Counter label=\"B\" />}"),
 Q('fe-re-q-position2','state 보존','감싸는 태그가 바뀌면',[
   ('A2가 된 뒤 isA를 false로 바꾸면 화면은?','B0','B2','A2','A0')],
   '<p>이번에는 Counter를 감싼 부모 태그가 <b>div → section으로 타입이 바뀐다</b>. 타입이 다르면 React는 그 아래를 통째로 버리고 새로 만들어서 state가 0으로 돌아간다. 같은 자리·같은 타입일 때만 state가 유지된다.</p>',
   code="{isA ? (\n  <div><Counter label=\"A\" /></div>\n) : (\n  <section><Counter label=\"B\" /></section>\n)}"),
 Q('fe-re-q-inner','state 보존','컴포넌트 안에서 컴포넌트 정의',[
   ('Input에 글자를 입력한 뒤 App의 t가 바뀌면?','Input에 입력한 글자가 사라진다','입력한 글자는 그대로 남는다','Input은 다시 렌더링되지 않는다','에러가 난다')],
   '<p>App이 렌더링될 때마다 <code>function Input</code>이 <b>새 함수</b>로 만들어진다. React 입장에서는 매번 타입이 다른 컴포넌트라 이전 Input을 버리고 새로 만들어서 state가 사라진다(포커스도 잃는다). 컴포넌트는 항상 다른 컴포넌트 밖(파일 최상단)에서 정의한다.</p>',
   code="function App() {\n  const [t, setT] = useState(0);\n\n  function Input() {\n    const [v, setV] = useState('');\n    return (\n      <input\n        value={v}\n        onChange={(e) => setV(e.target.value)}\n      />\n    );\n  }\n\n  return <><Input /><Clock onTick={setT} /></>;\n}"),
 Q('fe-re-q-init','useState','초기값 계산 횟수',[
   ('버튼을 두 번 누르면 createTodos()는 모두 몇 번 호출될까?','3번','1번','2번','0번'),
   ('createTodos를 처음 한 번만 부르려면?','useState(createTodos)처럼 함수 자체를 넘긴다','useRef(createTodos())로 바꾼다','createTodos를 async 함수로 바꾼다','useEffect 안에서 useState를 부른다')],
   '<p><code>useState(createTodos())</code>는 초기값을 처음에만 쓰지만, <b>함수 호출은 렌더링마다</b> 일어난다(처음 1 + 클릭 2 = 3번). <b>함수 자체</b>를 넘기면(<code>useState(createTodos)</code>) React가 처음 한 번만 부른다. useRef(createTodos())도 매번 호출된다.</p>',
   code="function TodoList() {\n  const [todos, setTodos] =\n    useState(createTodos());\n\n  return (\n    <button onClick={() => setTodos([...todos])}>\n      +\n    </button>\n  );\n}"),
 Q('fe-re-q-children2','렌더링','children으로 받은 요소',[
   ('Wrapper의 버튼을 두 번 누르면 Expensive는 모두 몇 번 렌더링될까?','1번 (처음에만)','3번 (처음 + 클릭마다)','memo로 감싸지 않았으니 3번','0번')],
   '<p>Expensive 요소는 <b>App이 만들어서</b> children으로 넘긴 것이다. Wrapper의 state가 바뀌어 Wrapper가 다시 렌더링돼도 children은 App이 만든 <b>같은 요소</b>라 React가 건너뛴다. Wrapper 안에서 <code>&lt;Expensive /&gt;</code>를 직접 쓰면 클릭마다 다시 렌더링된다. memo 없이 렌더링을 줄이는 방법이다.</p>',
   code="function Wrapper({ children }) {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      {children}\n    </button>\n  );\n}\n\nfunction App() {\n  return <Wrapper><Expensive /></Wrapper>;\n}"),
 Q('fe-re-q-context','Context','Provider의 value',[
   ('App의 버튼을 누를 때마다 memo로 감싼 Child는?','매번 다시 렌더링된다','memo라서 다시 렌더링되지 않는다',"theme 값이 'dark' 그대로라 건너뛴다",'처음 한 번만 렌더링된다'),
   ('Child가 불필요하게 다시 렌더링되지 않게 하려면?','value 객체를 useMemo로 고정한다','Child를 memo로 한 번 더 감싼다','Provider에 key를 준다','createContext의 기본값을 객체로 바꾼다')],
   '<p>Provider의 value가 <code>{ theme: \'dark\' }</code>처럼 <b>렌더링마다 새 객체</b>면, 내용이 같아도 React는 바뀐 것으로 보고(Object.is 비교) 그 context를 쓰는 컴포넌트를 모두 다시 렌더링한다. <b>memo도 context 변경은 막지 못한다</b>. value를 useMemo로 고정하거나 컴포넌트 밖 상수로 둔다.</p>',
   code="const Ctx = createContext(null);\nconst Child = memo(() => {\n  useContext(Ctx);\n  return null;\n});\n\nfunction App() {\n  const [n, setN] = useState(0);\n  return (\n    <Ctx.Provider value={{ theme: 'dark' }}>\n      <button onClick={() => setN(n + 1)} />\n      <Child />\n    </Ctx.Provider>\n  );\n}"),
 Q('fe-re-q-timeoutbatch','배치','setTimeout 안의 두 업데이트',[
   ('React 18 이상에서 버튼을 누르면, setTimeout 안의 두 set 때문에 다시 렌더링되는 횟수는?','1번','2번','0번','3번')],
   '<p>React 18부터는 이벤트 핸들러뿐 아니라 <b>setTimeout, Promise, 네이티브 이벤트 안의 업데이트도 자동으로 묶어서</b>(automatic batching) 한 번만 렌더링한다. React 17에서는 setTimeout 안이면 2번이었다.</p>',
   code="function onClick() {\n  setTimeout(() => {\n    setA(1);\n    setB(1);\n  }, 0);\n}"),
 Q('fe-re-q-flushsync','배치','flushSync 직후의 DOM',[
   ('a가 0일 때 버튼을 누르면 로그에 찍히는 값은?','1','0','undefined','에러가 난다')],
   '<p>보통 set은 다음 렌더링을 예약할 뿐이라 바로 뒤에서 DOM을 읽으면 옛 값이다. <b>flushSync</b>로 감싸면 그 자리에서 <b>렌더링과 DOM 반영을 동기로</b> 끝낸다. 새로 추가한 항목으로 바로 스크롤해야 할 때처럼 드물게 쓴다(성능에 나쁘다).</p>',
   code="const ref = useRef(null);\n\nfunction onClick() {\n  flushSync(() => setA(1));\n  console.log(ref.current.textContent);\n}\n\nreturn (\n  <button ref={ref} onClick={onClick}>\n    {a}\n  </button>\n);"),
 Q('fe-re-q-eb','에러 바운더리','에러 바운더리 안의 버튼',[
   ('ErrorBoundary 안의 버튼을 누르면?','fallback으로 바뀌지 않고 화면은 그대로다','fallback 화면으로 바뀐다','앱 전체가 흰 화면이 된다','버튼만 사라지고 나머지는 그대로다')],
   '<p>에러 바운더리는 <b>렌더링 중·생명주기·effect</b>에서 난 에러만 잡는다. <b>이벤트 핸들러, setTimeout, Promise</b> 안의 에러는 React 렌더링 밖에서 일어나서 잡지 못한다(전역 에러로 간다). 이벤트 핸들러에서는 try/catch로 잡고, 필요하면 state로 에러 화면을 보여 준다.</p>',
   code="<ErrorBoundary fallback={<p>문제가 생겼어요</p>}>\n  <button onClick={() => { throw new Error('boom'); }}>\n    저장\n  </button>\n</ErrorBoundary>"),
 Q('fe-re-q-ref19','React 19','ref를 prop으로 받기',[
   ('React 19에서 App의 effect가 찍는 값은?','INPUT','undefined','에러: forwardRef로 감싸야 한다','MyInput 컴포넌트 객체')],
   '<p>React 19부터 함수 컴포넌트는 <b>ref를 일반 prop처럼</b> 받을 수 있다. 그래서 forwardRef 없이 input까지 ref를 이어 줄 수 있다. React 18에서는 ref prop이 전달되지 않아 undefined였다.</p>',
   code="function MyInput({ ref }) {\n  return <input ref={ref} />;\n}\n\nfunction App() {\n  const r = useRef(null);\n  useEffect(() => console.log(r.current?.tagName));\n  return <MyInput ref={r} />;\n}"),
 Q('fe-re-q-race','useEffect','늦게 온 응답',[
   ('id를 1에서 2로 빠르게 바꿨는데, 1번 응답이 2번보다 늦게 왔다. 화면에는?','1번 사용자가 보인다','2번 사용자가 보인다','두 사용자가 번갈아 보인다','에러가 난다'),
   ('이 문제를 막는 방법은?','cleanup에서 이전 요청을 무시하거나 abort한다','의존성 배열을 []로 바꾼다','setUser를 useCallback으로 감싼다','fetch 앞에 await를 붙인다')],
   '<p>두 요청이 동시에 날아가고 <b>늦게 도착한 응답이 마지막으로 setUser</b>한다. id가 바뀌면 이전 effect의 cleanup이 먼저 실행되므로, 거기서 <code>ignore = true</code>로 표시하거나 <code>AbortController</code>로 요청을 취소한다. 데이터 요청 라이브러리(TanStack Query 등)는 이 처리를 대신 해 준다.</p>',
   code="useEffect(() => {\n  fetch(`/api/users/${id}`)\n    .then((r) => r.json())\n    .then(setUser);\n}, [id]);"),
 Q('fe-re-q-derived','상태 설계','effect로 파생 값 만들기',[
   ('이 코드의 가장 큰 문제는?','렌더링이 한 번 더 일어나고 잠깐 옛 값이 보인다','effect 안에서 set해서 무한 루프에 빠진다','first가 바뀌어도 fullName은 그대로다','의존성 배열에 fullName이 빠져서 경고가 난다')],
   '<p>first가 바뀌면 옛 fullName으로 한 번 그리고, effect가 setFullName을 해서 <b>한 번 더</b> 그린다. 다른 state로 계산할 수 있는 값은 state로 두지 말고 <b>렌더링 중에 바로 계산</b>한다: <code>const fullName = first + \' \' + last</code>. 계산이 무거우면 useMemo.</p>',
   code="const [first, setFirst] = useState('');\nconst [last, setLast] = useState('');\nconst [fullName, setFullName] = useState('');\n\nuseEffect(() => {\n  setFullName(first + ' ' + last);\n}, [first, last]);"),
 Q('fe-re-q-deferred','동시성','입력은 빠르게, 목록은 나중에',[
   ('검색어 입력은 바로 반영하고, 느린 결과 목록 렌더링은 뒤로 미뤄 타이핑이 끊기지 않게 하고 싶다. React 기능만 쓴다면?','useDeferredValue(query)로 목록에 넘긴다','useMemo로 목록을 감싼다','useLayoutEffect에서 목록을 그린다','query를 useRef에 담는다')],
   '<p><b>useDeferredValue</b>는 급한 업데이트(입력)를 먼저 그리고, 미룬 값으로 그리는 무거운 부분은 여유가 있을 때 다시 그린다. 새 입력이 오면 하던 목록 렌더링을 중단할 수도 있다. setState 쪽을 미루고 싶으면 useTransition을 쓴다. useMemo는 같은 입력의 재계산만 줄일 뿐 입력이 바뀔 때마다의 렌더링은 막지 못한다.</p>'),
 Q('fe-re-q-strictrender','StrictMode','개발 모드의 렌더링 횟수',[
   ('개발 모드 StrictMode에서 첫 화면을 그릴 때 컴포넌트 함수는 몇 번 호출될까?','2번','1번','3번','0번')],
   '<p>StrictMode는 개발 모드에서 컴포넌트 함수를 <b>두 번</b> 불러, 렌더링 중에 바깥 값을 바꾸는 등 순수하지 않은 코드를 드러낸다. effect도 마운트 → cleanup → 마운트를 한 번 더 한다. 프로덕션에서는 한 번씩이다.</p>'),
]
REACT_ORDER_ADD = ['fe-re-q-order','fe-re-q-layoutfx','fe-re-q-strictrender','fe-re-q-position','fe-re-q-position2','fe-re-q-inner',
                   'fe-re-q-init','fe-re-q-children2','fe-re-q-context','fe-re-q-timeoutbatch','fe-re-q-flushsync','fe-re-q-derived',
                   'fe-re-q-race','fe-re-q-eb','fe-re-q-ref19','fe-re-q-deferred']

# ---------------------------------------------------------------------
# 브라우저 심화: Playwright로 실제 Chrome에서 실행해 확인한 동작
BROWSER_DEEP = [
 Q('fe-br-q-deferorder','script','defer 두 개와 인라인',[
   ('a.js는 늦게, b.js는 먼저 도착한다. 로그 순서는?','inline → a → b → DOMContentLoaded','inline → b → a → DOMContentLoaded','a → b → inline → DOMContentLoaded','inline → DOMContentLoaded → a → b')],
   '<p>defer 스크립트는 받는 동안 파싱을 막지 않고, <b>파싱이 끝난 뒤 문서에 적힌 순서대로</b> 실행된다. 먼저 도착한 b.js도 a.js를 기다린다. 그리고 defer 스크립트가 모두 끝나야 <b>DOMContentLoaded</b>가 발생한다. 인라인 스크립트는 파서가 만나는 즉시 실행된다.</p>',
   code="<!-- a.js는 log('a'), b.js는 log('b')만 한다 -->\n<script defer src=\"a.js\"></script>\n<script defer src=\"b.js\"></script>\n<script>log('inline')</script>\n<script>\n  document.addEventListener('DOMContentLoaded',\n    () => log('DOMContentLoaded'));\n</script>"),
 Q('fe-br-q-module','script','type="module"의 실행 시점',[
   ('로그 순서는?','classic → module','module → classic','module은 실행되지 않는다','매번 순서가 다르다')],
   '<p><code>type="module"</code> 스크립트는 인라인이어도 <b>기본으로 defer처럼</b> 동작해서, 파싱이 끝난 뒤(DOMContentLoaded 전에) 실행된다. 그래서 뒤에 있는 일반 스크립트가 먼저다. module에 async를 주면 준비되는 대로 실행된다.</p>',
   code="<script type=\"module\">log('module')</script>\n<script>log('classic')</script>"),
 Q('fe-br-q-dynscript','script','JS로 넣은 script',[
   ('one.js는 늦게, two.js는 먼저 도착한다. 실행 순서는?','two → one','one → two','one만 실행된다','two만 실행된다'),
   ('JS로 넣은 두 스크립트를 넣은 순서대로 실행하려면?','s.async = false','s.defer = true',"s.type = 'module'",'document.head 대신 body에 넣는다')],
   '<p>createElement로 넣은 script는 <b>기본이 async</b>라 도착하는 대로 실행된다. <code>s.async = false</code>를 주면 넣은 순서가 지켜진다. 동적으로 넣은 script에는 <b>defer가 효과가 없다</b>(실제 Chrome에서도 two → one 그대로).</p>',
   code="for (const name of ['one', 'two']) {\n  const s = document.createElement('script');\n  s.src = `/${name}.js`;\n  document.head.append(s);\n}"),
 Q('fe-br-q-innerscript','보안','innerHTML로 넣은 script',[
   ('이 코드를 실행하면?','script는 안 돌고, img의 onerror는 돈다','script와 img의 onerror가 모두 돈다','script만 돌고, onerror는 무시된다','둘 다 안 돌고 글자로만 보인다')],
   '<p>HTML 표준상 <b>innerHTML로 넣은 &lt;script&gt;는 실행되지 않는다</b>. 그렇다고 안전한 것은 아니다. <code>onerror</code> 같은 이벤트 속성은 실행되므로 innerHTML에 사용자 입력을 넣으면 XSS가 된다. 사용자 입력은 textContent로 넣는다.</p>',
   code="box.innerHTML =\n  '<script>log(\"script\")<\\/script>' +\n  '<img src=\"x\" onerror=\"log(\\'onerror\\')\">';"),
 Q('fe-br-q-clickseq','이벤트','클릭 한 번의 이벤트 순서',[
   ('사용자가 마우스로 버튼을 한 번 클릭하면, 버튼에서 일어나는 이벤트 순서는?','pointerdown → mousedown → focus → pointerup → mouseup → click','mousedown → mouseup → click → focus','click → mousedown → mouseup → focus','focus → pointerdown → mousedown → pointerup → mouseup → click')],
   '<p>누르는 순간 <b>pointerdown → mousedown</b>, 그 기본 동작으로 <b>focus</b>가 옮겨지고, 떼면 <b>pointerup → mouseup</b>, 마지막에 <b>click</b>. 그래서 mousedown에서 preventDefault하면 포커스가 옮겨지지 않는다(드롭다운 항목을 누를 때 입력창 포커스를 지키는 요령).</p>'),
 Q('fe-br-q-phases','이벤트','캡처와 버블 순서',[
   ('button을 클릭하면 로그 순서는?','D캡처 → O캡처 → B캡처 → B버블 → O버블','D캡처 → O버블 → O캡처 → B버블 → B캡처','O버블 → O캡처 → B버블 → B캡처 → D캡처','B캡처 → B버블 → O캡처 → O버블 → D캡처')],
   '<p>이벤트는 위에서 아래로 내려가며 <b>캡처</b> 리스너를 부르고, 타깃에 도착한 뒤 아래에서 위로 올라가며 <b>버블</b> 리스너를 부른다. <b>등록한 순서는 상관없다</b>(outer에 버블을 먼저 달았어도 캡처가 먼저). 타깃 자신에서도 캡처가 버블보다 먼저다.</p>',
   code="// <div id=\"outer\"><button id=\"btn\"></button></div>\nconst on = (el, name, capture) =>\n  el.addEventListener('click', () => log(name), capture);\n\non(outer, 'O버블');\non(outer, 'O캡처', true);\non(btn, 'B버블');\non(btn, 'B캡처', true);\non(document, 'D캡처', true);"),
 Q('fe-br-q-stopprop2','이벤트','stopPropagation 뒤의 리스너',[
   ('버튼을 클릭하면 로그 순서는?','btn 1 → btn 2','btn 1','btn 1 → btn 2 → outer','btn 1 → outer'),
   ('btn 1에서 같은 버튼의 btn 2까지 막으려면?','e.stopImmediatePropagation()','e.stopPropagation()을 두 번 부른다','e.preventDefault()','return false')],
   '<p><b>stopPropagation</b>은 이벤트가 <b>다른 요소로</b> 전파되는 것만 막는다. 같은 요소에 달린 나머지 리스너(btn 2)는 그대로 실행된다. 같은 요소의 나머지 리스너까지 막는 것이 <b>stopImmediatePropagation</b>이다.</p>',
   code="btn.addEventListener('click', (e) => {\n  log('btn 1');\n  e.stopPropagation();\n});\nbtn.addEventListener('click', () => log('btn 2'));\nouter.addEventListener('click', () => log('outer'));"),
 Q('fe-br-q-samefn','이벤트','같은 함수를 두 번 등록',[
   ('버튼을 한 번 클릭하면 n은?','1','2','0','에러가 난다')],
   '<p>같은 요소, 같은 이벤트, <b>같은 함수</b>, 같은 capture 설정으로 두 번 등록하면 <b>한 번만 등록</b>된다. 반대로 매번 새 화살표 함수를 넘기면 서로 다른 함수라 여러 번 등록된다.</p>',
   code="let n = 0;\nconst onClick = () => n++;\nbtn.addEventListener('click', onClick);\nbtn.addEventListener('click', onClick);"),
 Q('fe-br-q-removeanon','이벤트','익명 함수 제거하기',[
   ('버튼을 한 번 클릭하면 n은?','1','0','2','에러가 난다')],
   '<p>removeEventListener는 등록할 때와 <b>같은 함수 참조</b>를 넘겨야 지운다. 모양이 같아도 새로 만든 화살표 함수는 다른 함수라 아무것도 지워지지 않는다. 지울 계획이면 함수를 변수에 담아 두거나, <code>{ once: true }</code>나 <code>AbortController</code>의 signal을 쓴다.</p>',
   code="let n = 0;\nbtn.addEventListener('click', () => n++);\nbtn.removeEventListener('click', () => n++);"),
 Q('fe-br-q-focusin','이벤트','form에서 포커스 감지',[
   ('input을 클릭해 포커스하면 로그에 찍히는 것은?','focusin만','focus와 focusin','focus만','아무것도 안 찍힌다')],
   '<p><b>focus와 blur는 버블링하지 않는다</b>. 그래서 부모(form)에 단 focus 리스너는 자식 input의 포커스를 받지 못한다. 버블링하는 <b>focusin / focusout</b>을 쓰거나, focus를 캡처 단계(<code>true</code>)로 단다.</p>',
   code="form.addEventListener('focus', () => log('focus'));\nform.addEventListener('focusin', () => log('focusin'));\n\n// <form id=\"form\"><input></form>"),
 Q('fe-br-q-passive','이벤트','passive 리스너',[
   ('passive: true로 단 wheel 리스너에서 e.preventDefault()를 부르면?','무시되고 스크롤은 그대로 된다','스크롤이 막힌다','에러가 던져진다','리스너가 자동으로 제거된다')],
   '<p><code>passive: true</code>는 "이 리스너는 기본 동작을 막지 않는다"는 약속이다. 그래서 브라우저가 리스너를 기다리지 않고 바로 스크롤해 부드럽다. 그 안의 preventDefault는 <b>무시</b>되고(defaultPrevented도 false) 콘솔 경고만 뜬다. 스크롤을 막아야 하면 passive: false로 단다.</p>'),
 Q('fe-br-q-mo','이벤트 루프','MutationObserver의 실행 시점',[
   ('로그 순서는?','sync → mo → then → timeout','sync → then → mo → timeout','sync → timeout → mo → then','mo → sync → then → timeout')],
   '<p>MutationObserver 콜백은 <b>마이크로태스크</b>로 실행된다. DOM을 바꾼 순간(textContent 대입) 마이크로태스크가 줄을 서고, then은 그 뒤에 줄을 서서 mo가 먼저다. 동기 코드가 끝나면 마이크로태스크를 모두 실행한 뒤 setTimeout(매크로태스크)이 실행된다.</p>',
   code="new MutationObserver(() => log('mo'))\n  .observe(el, { childList: true });\nsetTimeout(() => log('timeout'));\nel.textContent = 'x';\nPromise.resolve().then(() => log('then'));\nlog('sync');"),
 Q('fe-br-q-raf','렌더링','requestAnimationFrame의 시점',[
   ('requestAnimationFrame(fn)의 fn은 언제 실행될까?','다음 화면을 그리기 직전','지금 코드가 끝난 직후, then보다 먼저','정확히 16ms 뒤 setTimeout처럼','화면을 그린 직후')],
   '<p>rAF 콜백은 브라우저가 <b>다음 프레임을 그리기 직전</b>(스타일·레이아웃 계산 전)에 실행된다. 그래서 애니메이션에 setTimeout 대신 쓴다. 마이크로태스크(then)보다는 늦다(실제 Chrome: sync → then → raf). 백그라운드 탭에서는 멈춘다.</p>'),
 Q('fe-br-q-storageevent','저장소','storage 이벤트',[
   ('탭 A에서 localStorage.setItem(\'theme\', \'dark\')를 하면, storage 이벤트는 어디서 발생할까?','같은 사이트를 연 다른 탭(B)에서만','값을 바꾼 탭 A에서만','A와 B 모두','발생하지 않는다')],
   '<p>storage 이벤트는 <b>다른 탭(같은 출처)</b>에 "저장소가 바뀌었다"고 알려 주는 용도라, 값을 바꾼 탭 자신에서는 발생하지 않는다. 그래서 탭 사이 로그아웃·테마 동기화에 쓴다. 같은 탭 안에서 알리려면 직접 이벤트를 만들거나 BroadcastChannel을 쓴다.</p>'),
 Q('fe-br-q-thrash','렌더링','반복문 안에서 읽고 쓰기',[
   ('항목이 1000개면 이 코드가 느린 이유는?','offsetWidth를 읽을 때마다 레이아웃을 다시 계산해서','style.width를 바꿀 때마다 화면을 새로 그려서','box를 찾는 querySelector가 반복마다 실행돼서','+ \'px\' 문자열 더하기가 반복마다 느려서'),
   ('어떻게 고치면 될까?','offsetWidth를 반복문 밖에서 한 번만 읽는다','style.width 대신 setAttribute로 바꾼다','반복문을 forEach로 바꾼다','requestIdleCallback 안에서 같은 반복문을 돌린다')],
   '<p>스타일을 바꾼 뒤 <b>offsetWidth 같은 레이아웃 값을 읽으면</b> 브라우저는 정확한 값을 주려고 그 자리에서 레이아웃을 다시 계산한다(강제 동기 레이아웃). 반복마다 쓰기 → 읽기가 번갈아 1000번 계산된다(layout thrashing). <b>읽기를 먼저 몰아서, 쓰기는 나중에 몰아서</b> 하면 한 번이면 된다.</p>',
   code="for (const el of items) {\n  el.style.width = box.offsetWidth + 'px';\n}"),
 Q('fe-br-q-cred','CORS','쿠키를 실은 요청',[
   ("fetch(url, { credentials: 'include' })에 서버가 Access-Control-Allow-Origin: *로 답하면?",'브라우저가 응답을 막는다','쿠키 없이 성공한다','쿠키와 함께 성공한다','preflight만 실패하고 본 요청은 성공한다'),
   ('다음 중 preflight(OPTIONS) 없이 바로 가는 요청은?','헤더를 따로 붙이지 않은 GET','Authorization 헤더를 붙인 GET','Content-Type이 application/json인 POST','PUT 요청')],
   '<p>쿠키를 실은(credentials) 요청은 서버가 <b>와일드카드(*) 대신 정확한 출처</b>를 적고 <code>Access-Control-Allow-Credentials: true</code>를 보내야 브라우저가 응답을 넘겨준다. <b>단순 요청</b>(GET·HEAD·POST, 기본 헤더만, form 계열 Content-Type)만 preflight 없이 간다. Authorization 헤더나 JSON Content-Type을 붙이면 OPTIONS로 먼저 묻는다.</p>'),
 Q('fe-br-q-samesite','쿠키','SameSite=Lax',[
   ('SameSite=Lax 쿠키는 다른 사이트에서 시작된 어떤 요청에 붙을까?','링크를 눌러 이동하는 GET 요청','다른 사이트 form의 POST 제출','다른 사이트 페이지가 보낸 fetch','다른 사이트에 넣은 iframe 안의 요청')],
   '<p><b>Lax</b>(현재 브라우저 기본값)는 다른 사이트에서 온 요청에는 쿠키를 붙이지 않되, <b>링크를 눌러 주소창이 바뀌는 최상위 GET 이동</b>에는 붙인다. 그래서 외부 링크로 들어와도 로그인이 유지되면서 다른 사이트의 POST를 이용한 CSRF는 막힌다. Strict는 이동에도 안 붙이고, None은 다 붙인다(Secure 필수).</p>'),
 Q('fe-br-q-hints','성능','미리 연결하기와 미리 받기',[
   ('다른 도메인(CDN)에서 곧 파일을 받을 테니 연결(DNS·TCP·TLS)만 먼저 맺어 두고 싶다.','<link rel="preconnect">','<link rel="preload">','<link rel="prefetch">','<link rel="modulepreload">'),
   ('지금 페이지가 곧 쓸 폰트 파일을 높은 우선순위로 먼저 받고 싶다.','<link rel="preload">','<link rel="prefetch">','<link rel="preconnect">','<link rel="dns-prefetch">'),
   ('사용자가 다음에 갈 페이지의 JS를 한가할 때 미리 받아 두고 싶다.','<link rel="prefetch">','<link rel="preload">','<link rel="preconnect">','<link rel="modulepreload">')],
   '<p><b>preconnect</b>: 연결만 미리 (파일은 아직). <b>preload</b>: <b>지금 페이지</b>가 곧 쓸 파일을 높은 우선순위로. <b>prefetch</b>: <b>다음 탐색</b>에 쓸 파일을 낮은 우선순위로. dns-prefetch는 DNS 조회만, modulepreload는 JS 모듈을 preload하는 것.</p>'),
 Q('fe-br-q-bfcache','성능','뒤로 가기 캐시(bfcache)',[
   ('뒤로 가기를 눌렀을 때 페이지를 메모리에서 바로 복원하는 bfcache를 막는 대표적인 코드는?',"window.addEventListener('unload', ...)","document.addEventListener('DOMContentLoaded', ...)","localStorage.setItem(...)",'<script defer>')],
   '<p><b>unload 리스너</b>가 있으면 브라우저가 페이지를 bfcache에 넣지 못해 뒤로 가기 때 새로 불러온다. 페이지를 떠날 때 할 일은 <code>pagehide</code>나 <code>visibilitychange</code>에서 한다. 복원됐는지는 <code>pageshow</code> 이벤트의 <code>persisted</code>로 알 수 있다.</p>'),
 Q('fe-br-q-swupdate','서비스 워커','새 서비스 워커가 안 켜질 때',[
   ('새 서비스 워커를 배포했는데 새로고침해도 예전 버전이 계속 동작한다. 가장 흔한 이유는?','새 워커가 설치된 뒤 waiting 상태로 기다려서','브라우저가 워커 파일을 영원히 캐시해서','워커는 하루에 한 번만 업데이트를 확인해서','사이트가 HTTPS가 아니라 워커가 안 켜져서')],
   '<p>새 서비스 워커는 설치된 뒤 <b>waiting</b> 상태로 기다린다. 예전 워커가 관리하는 탭이 하나라도 열려 있으면 새로고침만으로는 교체되지 않는다(새로고침하는 동안에도 탭이 유지되기 때문). 바로 교체하려면 install에서 <code>skipWaiting()</code>, activate에서 <code>clients.claim()</code>을 쓴다.</p>'),
]
BROWSER_ORDER_ADD = ['fe-br-q-deferorder','fe-br-q-module','fe-br-q-dynscript','fe-br-q-innerscript','fe-br-q-hints','fe-br-q-bfcache',
                     'fe-br-q-clickseq','fe-br-q-phases','fe-br-q-stopprop2','fe-br-q-samefn','fe-br-q-removeanon','fe-br-q-focusin',
                     'fe-br-q-passive','fe-br-q-mo','fe-br-q-raf','fe-br-q-thrash','fe-br-q-storageevent','fe-br-q-swupdate',
                     'fe-br-q-cred','fe-br-q-samesite']
