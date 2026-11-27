// 화면 문구. 컴포넌트 안에 글자로 적지 않고 여기서 가져다 쓴다.
// '옮김'은 app/data/settings.yaml의 문장을 그대로 가져온 것이고,
// '새로 씀'은 새 앱에서 처음 쓰는 문장이다(사용자 확인이 필요하다).
// {name}처럼 중괄호로 싼 자리는 fill()로 채운다.

export const text = {
  // ── 맨 위 띠 (옮김) ──
  appName: "ANTI",
  appSub: "안산 다음걸음 유형 찾기",
  toStart: "처음 화면으로", // 띠의 ANTI를 읽어 주는 설명

  // ── 처음으로 갈 때 되묻는 창 (옮김) ──
  restartAskTitle: "처음으로 갈까요?",
  restartAskBody:
    "처음으로 가면 답이 지워져요. 결과를 남기려면 먼저 '내 결과 저장하기'를 눌러 주세요.",
  // 새로 씀: 아직 '내 결과 저장하기'가 없어서, 저장 안내를 뺀 문장을 쓴다(사진 저장을 넣으면 위 문장으로 바꾼다)
  restartAskBodyPlain: "처음으로 가면 답이 지워져요.",
  restartKeep: "계속 보기",
  restartGo: "처음으로 가기",

  // ── 시작 화면 ──
  startHeading: "나는 어떤 유형일까요?", // 옮김
  startIntro: "질문에 답하면 내 유형과, 안산에서 가 볼 곳을 알려 드려요.", // 옮김
  startButton: "유형 찾기 시작하기", // 옮김
  startBrowse: "질문 없이 먼저 둘러보기", // 옮김
  // 새로 씀: 제목 아래 알약 세 개. 무엇을 하는지 한눈에 보여 준다
  startPills: ["27문항", "12가지 유형", "안산 기관 안내"],
  startNotesTitle: "유의사항", // 옮김
  // 새로 씀: 새 앱은 답을 기기 안(sessionStorage)에 두므로 '저장하지 않아요'를 실제에 맞게 고쳤다
  startPrivacy:
    "이름·연락처는 묻지 않아요. 성별·태어난 해·일 여부는 맞는 곳과 결과 그림을 고르는 데만 써요. 고르신 답은 지금 쓰는 기기 안에만 두고 밖으로 보내지 않아요.",
  // 새로 씀: 새로고침으로는 지워지지 않고, 창을 닫으면 지워진다
  startRefresh:
    "이 창을 닫으면 답이 지워져요. 앞 질문으로 갈 때는 화면 아래 '← 이전으로'를 눌러 주세요.",
  disclaimer: "지금 관심 있는 분야를 찾는 설문이에요. 신청 자격은 프로그램마다 달라요.", // 옮김

  // ── 설문 화면 (옮김) ──
  scaleHelp: "요즘 내 마음과 얼마나 비슷한지 골라주세요. 정답은 없어요.",
  progress: "질문 {number} / {total}",
  cheerHalf: "절반 왔어요",
  cheerLast: "거의 다 왔어요",
  numberPlaceholder: "예) 1966",
  numberRequired: "태어난 해를 숫자 네 자리로 적어 주세요. 예) 1966",
  next: "다음",
  back: "← 이전으로",
  editNotice: "이 답만 고치면 바로 결과로 돌아가요.",
  editCancel: "수정하지 않고 결과로 돌아가기",

  // ── 동점일 때 고르기 (옮김) ──
  tieTwo: "두 분야를 비슷하게 답하셨어요.",
  tieMany: "비슷하게 답하신 분야가 여러 개예요.",
  priorityExample: "예: {org} · {program}",

  // ── 결과 화면, 유형 소개 화면 ──
  typeLabel: "나의 유형", // 옮김
  typeLabelBrowse: "유형 소개", // 옮김
  typeImageAlt: "{name} 캐릭터 그림", // 옮김
  featureHeading: "이 유형의 특징", // 옮김
  placesHeading: "{name}에 맞는 기관", // 11/27에 정한 제목(동료 지도의 제목)을 카드 목록에 쓴다
  placesHint: "기관 이름을 누르면 더 자세한 정보를 볼 수 있어요.", // 옮김
  moreCount: "다른 곳 {count}곳", // 옮김
  morePlacesHeading: "{type}의 다른 곳", // 옮김
  detailFirst:
    "먼저 위에서 하나를 골라 주세요. 고르신 내용에 맞는 곳을 보여 드려요. 맞는 것이 없으면 아래 '무엇이 맞을지 함께 찾아 주는 곳'에 물어보세요.", // 옮김
  // 유형 소개 화면에는 '함께 찾아 주는 곳'이 없어서 앞의 두 문장만 쓴다
  detailFirstBrowse: "먼저 위에서 하나를 골라 주세요. 고르신 내용에 맞는 곳을 보여 드려요.",
  widenedNote: "고른 주제에 딱 맞는 곳은 아직 없어요. 대신 이런 곳이 있어요.", // 옮김
  noProgram:
    "이 도움은 지금 안내할 곳을 아직 확인하지 못했어요. 대신 무엇이 맞을지 함께 찾아 주는 곳을 안내해 드려요.", // 옮김
  noProgramAtAll: "지금 안내할 수 있는 곳을 찾지 못했어요. 아래 창구에 물어보시면 도와드려요.", // 옮김
  consultHeading: "무엇이 맞을지 함께 찾아 주는 곳", // 옮김
  moreToggle: "더 보기", // 옮김
  editHeading: "설문 답변 확인·수정", // 옮김
  editSelect: "바꿀 답을 눌러 주세요.", // 옮김
  editOption: "{number}. {question} → {answer}", // 옮김
  repickButton: "먼저 볼 분야 다시 고르기", // 옮김
  restartButton: "처음부터 다시 하기", // 옮김
  placesChecked: "곳의 정보는 {date}에 확인했어요. 신청 전에 기관에 꼭 확인해 주세요.", // 옮김

  // 기관 카드의 딱지 (옮김)
  kindAlways: "언제든 문의할 수 있어요",
  kindPeriod: "기간이 정해져 있어요",
  kindList: "목록이에요",
  nationwide: "전국 어디서나 전화·온라인으로",

  // ── 기관 세부 화면, 다른 곳 목록 (옮김) ──
  backLabel: "뒤로", // 화살표 단추를 읽어 주는 이름
  backBottom: "← 뒤로 돌아가기",
  placeForType: "{name}에 추천!",
  guideButton: "기관 공식 안내",
  listButton: "목록 열기",
  applyButton: "신청 페이지 열기",
  phoneButton: "전화 문의",
  routeButton: "길찾기",
  listNote: "지금 신청할 수 있는 강좌가 있는지는 목록에서 직접 확인해 주세요.",
  worryUnknown: "이 내용은 아직 확인하지 못했어요. 전화로 물어보시면 알려 줘요.",
  firstTimeHeading: "지원을 처음 경험할 때",
  factWhere: "어디로 가나요?",
  factWhereRemote: "어디서 이용하나요?",
  factWho: "누가 이용할 수 있나요?",
  factHow: "이용 방법",
  factContact: "기관 문의",
  checkedNote: "{date} 기준 정보예요. 신청 전에 기관에 꼭 확인해 주세요.",
  unconfirmed: "{column}: 아직 확인하지 못했어요. 기관에 물어봐 주세요.",
  ageUnconfirmed: "55~64세도 이용할 수 있는지 기관에 물어봐 주세요.",
  detailButton: "공식 사이트 보기", // 안내할 곳이 하나도 없을 때의 기본 창구 카드

  // ── 둘러보기 (옮김) ──
  browseHeading: "어떤 도움이 있는지 둘러보기",
  browseHelp: "궁금한 유형을 누르면 그 유형에 맞는 기관을 볼 수 있어요.",
  browseToSurvey: "질문에 답하고 나에게 맞는 곳 보기",
  browseToStart: "처음 화면으로",
  viewBack: "다른 유형 보기",

  // ── 기다림·오류·없는 주소 (새로 씀) ──
  loading: "불러오는 중이에요",
  errorTitle: "화면을 불러오지 못했어요",
  errorBody: "잠시 뒤에 다시 눌러 주세요.",
  errorRetry: "다시 시도하기",
  notFoundTitle: "찾는 화면이 없어요",
  notFoundBody: "주소가 바뀌었거나 없는 화면이에요.",
  goStart: "처음 화면으로",

  // ── 브라우저 탭에 보이는 화면 이름 ──
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

// 문장의 {자리}에 값을 넣는다. 예) fill(text.moreCount, { count: 2 }) → "다른 곳 2곳"
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole
  );
}

// "2026-11-18" → "2026년 11월 18일"
export function koreanDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}
