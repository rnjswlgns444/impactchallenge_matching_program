# 나에게 맞는 안산 프로그램 찾기 (앱 뼈대)

설문 → 유형 판정(규칙) → 세부 희망 입력 → AI가 정보표 안에서 프로그램 매칭 → 결과 카드(소개 · 진행 방식 · 앱 안 맛보기 · 연락).

지금 들어 있는 문항, 유형, 규칙, 프로그램은 모두 **예시**다. 실제 기관이나 전화번호가 아니다.

## 실행

프로젝트 루트(이 폴더의 위 폴더)에서 실행한다.

```
.venv\Scripts\python -m pip install -r app\requirements.txt
.venv\Scripts\python -m streamlit run app\main.py
```

- PC: http://localhost:8501
- 휴대폰: PC와 같은 와이파이에 연결한 뒤, 실행 창에 나오는 Network URL로 접속한다.
- 테스트: `.venv\Scripts\python -m pytest app\tests`

## AI 매칭 켜기

지금은 구글 Gemini API의 무료 구간을 쓴다(`data/settings.yaml`의 `llm.provider: gemini`).
키는 https://aistudio.google.com/apikey 에서 발급받는다.

- PC에서 실행할 때: `.streamlit/secrets.toml` 파일을 만들고 아래 한 줄을 넣는다. 이 파일은 git에 올라가지 않는다.
- 배포된 앱: Streamlit Cloud의 앱 Settings → Secrets에 같은 한 줄을 넣는다.

```
GEMINI_API_KEY = "여기에 키"
```

키가 없으면 결과 화면에 "맞춤 찾기를 하지 못했어요" 안내가 나오고, 유형만으로 찾은 프로그램을 보여준다.

무료 구간에서는 보낸 내용을 구글이 서비스 개선에 쓸 수 있다. 그래서 주관식 입력칸 위 안내 문구에 이 사실을 적었고, 전화번호·이메일 형태는 보내기 전에 지운다.
Claude로 바꾸려면 `llm.provider: anthropic`, `llm.model: claude-opus-5-5`로 고치고 `ANTHROPIC_API_KEY`를 넣는다.

## 내용을 고치는 법 (코드 수정 없음)

파일을 저장하고 브라우저를 새로고침하면 반영된다. 형식이 틀리면 화면에 어느 파일 어디가 틀렸는지 나온다.

| 고치고 싶은 것 | 파일 |
|---|---|
| 설문 문항과 선택지 | `data/questions.yaml` |
| 유형 이름·설명, 세부 희망 질문과 예시 버튼 | `data/types.yaml` |
| 어떤 답이 어느 유형이 되는지 | `data/rules.yaml` |
| 프로그램·센터 정보 | `data/programs.csv` (엑셀로 열고 'CSV UTF-8'로 저장) |
| 화면 문구, 추천 개수, AI 모델 | `data/settings.yaml` |
| AI에게 주는 지시문 | `prompts/matching.md` |

### 규칙(rules.yaml) 양식

1. `axes`: 유형을 나누는 축. 축마다 양쪽(pole) 두 개. 축 순서대로 pole 코드를 이어 붙인 것이 유형 코드다. 축을 늘리거나 줄이면 `types.yaml`에 축 조합만큼 유형을 적는다.
2. `scores`: 선택지를 고르면 어느 축 어느 쪽에 점수를 줄지. `q1_a: {purpose: M}`은 1점, `{purpose: {M: 2}}`는 2점.
3. `tie_break`: 동점일 때. `ask`면 `questions.yaml`에서 `show_when: {tie: 축}`인 추가 문항을 묻고, pole 코드를 적으면 그쪽으로 정한다.
4. `overrides`: 조건이 맞으면 점수와 상관없이 정하는 예외 규칙.

### 프로그램 정보표(programs.csv)에서 꼭 알아둘 열

- `매칭가능`이 `Y`이고 `55~64세참여`가 `불가`가 아닌 행만 추천된다. 끝난 프로그램은 지우지 말고 `N`으로 둔다.
- `유형태그`: `types.yaml`의 `tags`와 같은 단어를 `|`로 구분해 적는다. 이 태그가 겹치는 프로그램이 그 유형의 후보가 된다.
- `상세설명`, `키워드`: AI가 사용자가 적은 희망과 비교하는 내용이다. 구체적으로 적을수록 잘 맞는다.
- `첫상담`: `Y`면 "잘 모르겠어요"를 고른 사람과, 맞는 프로그램을 못 찾은 사람에게 보여준다.
- `체험유형`: `앱체험`(체험내용에 단계를 `|`로 구분), `영상`·`공개강좌`(체험URL). 유튜브나 영상 파일 주소면 앱 안에서 재생된다.

## 익명 기록

`app/logs/`에 쌓인다(git에 올라가지 않음).

- `responses.csv`: 무작위 번호, 날짜와 시간(시 단위), 고른 선택지, 유형, 고른 예시 버튼, 주관식을 썼는지(Y/N), 결과 상태, 추천된 프로그램
- `events.csv`: 맛보기를 시작했는지(`taste_start`), 끝까지 봤는지(`taste_done`)
- 이름, 연락처, 주관식 원문은 저장하지 않는다. 주관식은 전화번호·이메일 형태를 지운 뒤 AI에게만 보낸다.

결과 상태: `ok` 맞춤 찾기 성공 / `A` AI 호출 실패 / `B` 일부 희망에 맞는 것이 없음 / `C` 후보 없음 / `unsure` 잘 모르겠어요

## 코드를 고쳤을 때

`app/` 안의 파이썬 파일을 고치면 앱을 껐다가 다시 켠다. 데이터 파일은 새로고침만 하면 된다.
