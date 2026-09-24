# 정답 검증 실험

심화 문제의 정답은 손으로 쓰지 않고 여기 실험으로 실제 동작을 확인했다. 문제를 고치거나 버전이 바뀌면 다시 돌려 본다.

| 파일 | 확인하는 것 | 실행 환경 |
|---|---|---|
| `react-lab.mjs` | React 렌더링·effect 순서, state 보존, 배치, StrictMode, 에러 바운더리 등 (R1~R24) | react@19 · react-dom@19 · jsdom |
| `browser-lab.mjs` | script 로딩 순서, 이벤트 순서·전파, MutationObserver·rAF 시점, storage 이벤트 등 (B1~B28) | Playwright + 실제 Chrome |
| `dyn-defer.mjs` | JS로 넣은 script에 defer가 효과 없는지 | Playwright + 실제 Chrome |
| `perf-lab.mjs` | ETag → If-None-Match → 304 흐름, loading="lazy" 이미지 요청 수 (로컬 HTTP 서버라 브라우저 캐시가 실제로 동작) | Playwright + 실제 Chrome |
| `bundle-lab.sh` | 트리 셰이킹(lodash / lodash-es / lodash/debounce 번들 크기), 동적 import 코드 스플리팅 | esbuild |
| `nextapp/` | 빌드 결과의 ○·●·ƒ, dynamicParams=false의 404, try 안의 redirect, NEXT_PUBLIC_ 인라인 | next@16 build · start |

저장소 의존성에는 넣지 않았다. 임시 폴더에서 설치해 돌린다.

```bash
mkdir /tmp/quiz-lab && cd /tmp/quiz-lab && npm init -y
npm i react@19 react-dom@19 jsdom next@16 playwright
cp <repo>/tools/frontend/verify/*.mjs . && node react-lab.mjs && node browser-lab.mjs
cp -R <repo>/tools/frontend/verify/nextapp . && cd nextapp && npx next build && npx next start -p 4311
```

Next.js 문서는 설치한 패키지 안의 `node_modules/next/dist/docs`가 그 버전의 공식 문서다. 캐시 관련 동작은 `cacheComponents` 설정에 따라 달라서, 문제에는 설정 조건을 적는다.

2026-09-24 기준 결과: next 16.3.6, react 19.3.0, Chrome (Playwright channel chrome).
