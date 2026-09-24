# 프론트엔드 코스 노트 만들기

`public/notes-frontend.html`은 여기 스크립트로 만듭니다.

```bash
node tools/frontend/run.mjs          # cases.mjs 코드를 실제로 실행해 answers.json(출력값 정답) 갱신
python3 tools/frontend/gen_fe.py     # fe_content.py + answers.json → public/notes-frontend.html
pnpm extract                         # 노트 → src/data/cards/frontend.json
```

- `cases.mjs`: 출력값 문제 코드. 정답은 손으로 쓰지 않고 실행 결과를 씁니다.
- `fe_content.py`: 유닛, 풀이, 용어 표, 개념 문제, 조각 문제.
- 노트의 머리(스타일·스크립트)는 `public/notes.html`에서 가져옵니다. 프로젝트 루트에서 실행하세요.
