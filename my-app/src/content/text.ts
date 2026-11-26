// 화면 문구. 컴포넌트 안에 글자로 적지 않고 여기서 가져다 쓴다.
// '옮김'은 app/data/settings.yaml의 문장을 그대로 가져온 것이고,
// '새로 씀'은 새 앱에서 처음 쓰는 문장이다(사용자 확인이 필요하다).

export const text = {
  // 맨 위 띠 (옮김)
  appName: "ANTI",
  appSub: "안산 다음걸음 유형 찾기",
  toStart: "처음 화면으로", // 띠의 ANTI를 읽어 주는 설명

  // 처음으로 갈 때 되묻는 창 (옮김)
  restartAskTitle: "처음으로 갈까요?",
  restartAskBody:
    "처음으로 가면 답이 지워져요. 결과를 남기려면 먼저 '내 결과 저장하기'를 눌러 주세요.",
  restartKeep: "계속 보기",
  restartGo: "처음으로 가기",

  // 시작 화면 (옮김)
  startHeading: "나는 어떤 유형일까요?",
  startIntro: "질문에 답하면 내 유형과, 안산에서 가 볼 곳을 알려 드려요.",
  startButton: "유형 찾기 시작하기",
  startBrowse: "질문 없이 먼저 둘러보기",

  // 기다림·오류·없는 주소 (새로 씀)
  loading: "불러오는 중이에요",
  errorTitle: "화면을 불러오지 못했어요",
  errorBody: "잠시 뒤에 다시 눌러 주세요.",
  errorRetry: "다시 시도하기",
  notFoundTitle: "찾는 화면이 없어요",
  notFoundBody: "주소가 바뀌었거나 없는 화면이에요.",
  goStart: "처음 화면으로",

  // 아직 내용을 넣지 않은 화면의 이름 (임시. 화면을 만들 때 바꾼다)
  screens: {
    survey: "설문",
    pick: "먼저 볼 분야 고르기",
    tune: "조금 더 맞춰 보기",
    result: "결과",
    places: "다른 곳",
    browse: "둘러보기",
    place: "기관 안내",
    type: "유형 소개",
  },
} as const;
