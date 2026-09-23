# 정처기 실기 퀴즈

정보처리기사 실기 대비 듀오링고식 레슨 앱. https://ckdwns9121.github.io/jeongcheogi-quiz/

React 없이 TypeScript로 만든 SPA입니다. 항해플러스 1주차 과제([chapter1-2](https://github.com/ckdwns9121/front_6th_chapter1-2))에서 직접 만든 가상 DOM, 스토어, 라우터를 TypeScript로 옮겨 썼습니다.

## 구조

```
src/
  lib/        가상 DOM(createVNode · normalizeVNode · createElement · updateElement), 이벤트 위임,
              createStore · createStorage · Router · afterRender · withBatch
  domain/     카드 타입, 레슨 나누기, 문제 만들기·채점, 스트릭·XP 계산 (전부 순수 함수)
  stores/     progressStore(XP·스트릭·푼 기록, localStorage 저장), lessonStore(진행 중인 레슨)
  services/   레슨 시작·채점·완료 흐름, 효과음
  components/ JSX 컴포넌트 (캐릭터, 레슨 지도, 문제, 해설 시트)
  pages/      Intro · Home(레슨 지도) · Lesson · Result · NotFound
  data/       cards.json (public/notes.html에서 추출)
public/       notes.html(학습 노트), PWA manifest, service worker, 아이콘
```

## 명령어

```bash
pnpm dev        # 개발 서버
pnpm test       # 단위 테스트 (vitest)
pnpm build      # 타입 체크 + 빌드, 404.html 복사(SPA 새로고침 대응)
pnpm extract    # public/notes.html을 고친 뒤 카드 데이터 다시 뽑기
```

main 브랜치에 push하면 GitHub Actions가 테스트, 빌드 후 GitHub Pages에 배포합니다.
