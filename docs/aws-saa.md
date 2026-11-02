# AWS-SAA 퀴즈와 아침 알림

- 앱: https://duckgu-quiz.vercel.app/course/aws-saa
- 오늘의 레슨: https://duckgu-quiz.vercel.app/daily
- 창작 320문제, 복수 정답 62문제. 실제 기출문제가 아니다.
- 원본: 개인 study 저장소의 AWS-SAA/practice 및 practice/answers.
- 기본·심화 학습자료 28편과 SVG 74개를 함께 배포한다.
- 65문항 모의고사도 앱에서는 짧은 레슨으로 나눈다. 130분 시험 모드는 구현하지 않았다.

## 알림 켜기

앱에서 시작하기 → 아침 알림 켜기 → 브라우저 알림 허용 → 테스트 알림 보내기.
아이폰·아이패드는 Safari에서 공유 → 홈 화면에 추가한 뒤 설치한 앱에서 켠다.
다른 기기에서도 받고 싶다면 그 기기에서 따로 켠다. 알림 끄기로 해당 기기의 구독을 삭제한다.

한국 시간 매일 오전 8시쯤 알림을 보내며 알림을 누르면 날짜에 해당하는 AWS-SAA 레슨이 열린다.
Vercel Hobby 예약 실행은 08:00~08:59 사이에 실행될 수 있다. 브라우저·OS의 알림 설정이나 네트워크 상태에 따라서도 수신이 지연될 수 있다.

## 구현

- 운세좋냥의 Web Push/VAPID·서비스 워커·Vercel Cron 방식을 참고했다. 사주 데이터나 비밀키는 가져오지 않았다.
- 덕구 전용 private Vercel Blob 저장소에 기기별 구독과 관리 토큰의 해시를 보관한다. 원문 토큰은 해당 브라우저에만 저장한다.
- 구독 등록·해제·테스트는 같은 출처에서만 요청할 수 있다. 기존 구독의 토큰이 다르면 수정·발송을 거부한다.
- 푸시 서버 주소를 Google FCM·Mozilla·Apple의 HTTPS 호스트로 제한해 임의 서버로 요청하지 않는다.
- 테스트는 기기별 1분 간격. 404/410이 된 구독은 삭제한다.
- 매일 발송은 날짜·ETag 조건부 갱신으로 중복 실행을 막는다. 전송 오류는 표시를 되돌려 재실행할 수 있게 한다.
- 작은 개인 앱을 기준으로 5기기씩 보낸다. 사용자가 늘어 함수 시간 제한에 가까워지면 큐로 전환한다.
- 전송 직전에 날짜를 기록하므로 프로세스가 그 사이 종료되는 경우 해당 날짜 알림이 누락될 수 있다. 기기의 실제 표시까지 보장하는 전송 방식은 아니다.
- `CRON_SECRET`이 없거나 인증이 다르면 예약 발송 API는 열리지 않는다.
- 푸시 API는 서비스 워커의 오프라인 캐시에 저장하지 않는다.

## 콘텐츠 갱신

```sh
node scripts/import-aws-saa.mjs /path/to/study/AWS-SAA
pnpm content
pnpm typecheck
pnpm test --run
pnpm build
```

가져오기는 렌더링된 문제와 해설의 정답을 대조한다. 원본 JSON의 선택지 문자는 문서와 다를 수 있어 사용하지 않는다.
23개 선택지는 `scripts/aws-saa-option-edits.json`에서 모바일용으로 줄였다. 정답 개수·상황 조건·원본 ID를 유지한다.
보기 순서를 섞으므로 해설 표는 A/B/C 문자 대신 선택지 문장을 표시한다.
단일 정답·복수 정답 모두 정확하게 일치해야 정답이다. 오답은 기존 앱처럼 레슨 안에서 다시 출제된다.

## 배포

Vercel 프로젝트: `changjun-parks-projects/duckgu-quiz`.
`.env.example`에 있는 서버 환경변수를 Production에 설정한다. private Blob 저장소를 프로젝트에 연결하면 `BLOB_READ_WRITE_TOKEN`이 추가된다.
VAPID 키는 이 앱 전용이며 교체하면 기존 기기는 다시 구독해야 한다. 비밀값은 Git에 넣지 않는다.
Cron은 `0 23 * * *` UTC로 실행한다. 한국 시간 다음 날 08시다.
GitHub Pages 배포는 기존 하위 경로를 유지하지만 서버 API가 없어 아침 알림은 Vercel 앱에서만 켤 수 있다. 두 주소의 학습 기록은 브라우저 출처가 달라 공유되지 않는다.

## 확인

자동 테스트: 전 320문항/62개 복수 정답의 채점, 복수 선택 취소·개수 제한·버튼 활성화, 한국 날짜 경계, 구독 소유권, 외부 주소 차단, cron 인증·중복 발송·만료 구독 삭제.
배포 후에는 `/api/push`의 설정 여부, 인증 없는 cron 거부, 인증된 빈 구독 실행, 코스·채점·해설·교재 링크를 확인한다.
실제 휴대폰 수신은 해당 기기에서 알림을 허용하고 테스트 알림을 받아 확인해야 한다.

공식 자료:

- [Vercel Cron 제한](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Vercel private Blob](https://vercel.com/docs/vercel-blob/private-storage)
- [iOS Web Push](https://webkit.org/blog/13878/)
