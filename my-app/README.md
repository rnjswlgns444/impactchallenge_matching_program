# ANTI (안산 다음걸음 유형 찾기) - 새 앱

안산의 50~60대가 27개 문항에 답하면 12가지 유형 중 하나를 보여 주고, 그 유형에 맞는 안산의 기관을 안내하는 모바일 웹 앱이다.
Next.js(App Router) · TypeScript · TailwindCSS · shadcn/ui로 만들었다.

## 실행

모든 명령은 이 폴더(`my-app/`)에서 실행한다.

```
npm install
npm run dev          # http://localhost:3000
npm run dev:phone    # 같은 와이파이의 휴대폰에서 http://PC주소:3000
```

## 자료

문항·유형·설정·프로그램 정보표는 저장소 맨 위의 `app/` 폴더에 한 벌만 있다(`app/data/`, `app/prompts/`, `app/anti_map/`).
`npm run data`가 그 파일을 읽어 검사한 뒤 `src/generated/`에 쓴다. `npm run dev`와 `npm run build` 앞에 저절로 돈다.

- `app/`의 자료를 고치면 `npm run data`를 돌리고 `src/generated/`도 함께 커밋한다.
- 판단 규칙(채점, 후보 거르기 등)은 파이썬(`app/core`)이 기준이다. 자료나 규칙을 고치면 저장소 맨 위에서
  `.venv\Scripts\python app\tests\make_parity_cases.py`로 대조용 정답을 다시 만든다.

## 환경 변수

| 이름 | 쓰임 |
| --- | --- |
| `GEMINI_API_KEY` | 직접 적은 글에 맞는 기관을 고를 때 서버가 쓰는 AI 키 |

- 내 컴퓨터: `.env.example`을 `.env.local`로 복사하고 값을 채운다. `.env.local`은 git에 올리지 않는다.
- 배포(Vercel): 프로젝트 설정의 Environment Variables에 넣는다.
- 키가 없어도 앱은 돌아간다. AI 추천만 실패 안내가 뜬다.

## 검사

```
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run test:e2e
```

- `npm test`: 판단 코드 테스트(금방 끝난다).
- `npm run test:e2e`: 화면 흐름 테스트(Playwright, 1분쯤). 휴대폰 크기의 크롬으로 설문부터 결과·기관·사진 저장까지 눌러 본다.
  - 개발 서버가 켜져 있으면 그것을 쓰고, 없으면 켠다.
  - 실제 AI는 부르지 않는다(`e2e/fixtures.ts`가 가짜 답으로 막는다).
  - 처음 한 번은 `npx playwright install chromium`으로 브라우저를 받는다.
- `npm run eval:ai`: 정답표(`app/tests/matching_cases.yaml`)로 **실제 AI**의 추천을 잰다(4분쯤, AI를 16번쯤 부른다).
  - 평소 검사에는 넣지 않는다. 정보표·AI 지시문·모델을 바꿨을 때만 돌린다.
  - `npm run eval:ai -- --check`는 AI를 부르지 않고 정답표가 지금 정보표와 맞는지만 본다.
  - 키는 `.env.local`의 `GEMINI_API_KEY`를 읽는다.

## 배포

Vercel에서 Root Directory를 `my-app`으로 두고 `main` 브랜치를 배포한다.

## 개인정보

성별·태어난 해·일 여부·사는 동과 설문 답은 기기 안에서만 쓰고 서버로 보내지 않는다.
AI에는 유형, 고른 세부 항목, 개인정보 형태를 지운 글, 후보 기관의 id만 보낸다.
