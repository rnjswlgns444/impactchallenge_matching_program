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
    "이름·연락처는 묻지 않아요. 성별·태어난 해·일 여부·사는 동은 맞는 곳과 결과 그림을 고르는 데만 써요. 고르신 답은 지금 쓰는 기기 안에만 두고 밖으로 보내지 않아요.",
  // 새로 씀: 새로고침으로는 지워지지 않고, 창을 닫으면 지워진다
  startRefresh:
    "이 창을 닫으면 답이 지워져요. 앞 질문으로 갈 때는 화면 아래 '← 이전으로'를 눌러 주세요.",
  // 새로 씀: AI로 무엇을 언제 보내는지. 걸림돌 문항이 없어 원문의 '마음에 걸리는 점'을 뺐다
  startAiNote:
    "'맞춰 보기' 화면에서 글을 적고 '결과 보기'를 누를 때만, 그 글과 살펴보는 분야, 고르신 세부 항목을 AI 서비스로 보내요.",
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

  // ── 조금 더 맞춰 보기 (옮김) ──
  tuneBadge: "질문은 끝났어요",
  tuneHeading: "조금 더 맞춰 보기",
  tuneHelp: "고르거나 적으시면 거기에 맞춰 안내해 드려요. 안 하셔도 괜찮아요.",
  tuneSkip: "건너뛰고 결과 보기 ›",
  tuneDone: "결과 보기",
  tuneAgain: "바라는 점 다시 적기",
  freePlaceholder: "이름, 전화번호 등 개인정보는 적지 말아 주세요!",
  // 새로 씀: 원문에서 '마음에 걸리는 점'만 뺐다. 실제로 보내는 것과 같아야 한다
  freePrivacy:
    "이름, 전화번호, 주민번호, 주소는 적지 말아 주세요. 글을 적고 '결과 보기'를 누르면, 적으신 글과 지금 살펴보는 분야, 고르신 세부 항목을 맞는 곳을 고르기 위해 외부 AI 서비스(구글)로 보내요. 성별·태어난 해·일 여부·사는 동은 보내지 않아요. 이 앱에는 글을 남기지 않아요.",

  // ── 사는 동과 기관 지도 (새로 씀) ──
  dongAsk: "사는 동을 알려 주세요.",
  dongHelp: "가까운 곳을 표시해 드려요. 안 고르셔도 돼요.",
  myDong: "우리 동네: {dong}",
  dongChange: "바꾸기",
  dongPick: "우리 동네 고르기",
  nearTag: "우리 동네에서 가까워요", // 추천 3곳 중 가장 가까운 한 곳(3km 안). 핀의 집 표시와 카드에 쓴다
  mapNote: "핀은 대략적인 위치예요. 가는 길은 '자세히 보기'의 '길찾기'로 확인해 주세요.",
  mapHint: "지도의 핀이나 번호를 누르면 아래에 기관이 나와요.", // 지도 위의 안내
  mapPick: "추천 기관 고르기", // 번호 단추 묶음을 읽어 주는 말
  mapDetail: "자세히 보기", // 카드의 단추. 기관 화면으로 간다
  mapDetailOf: "{place} 자세히 보기", // 그 단추를 읽어 주는 말
  seeList: "목록으로 보기 · 모두 {count}곳", // 지도 아래의 단추. 추천 3곳과 다른 곳이 함께 나온다
  allPlacesHeading: "{type}에 맞는 기관 모두 보기", // 목록 화면의 제목
  placeOpen: "{number}번 {kind} {name}", // 추천 기관을 읽어 주는 말
  remotePlace: "전화·온라인으로", // 찾아가지 않고 쓰는 곳

  // ── AI가 고른 곳 (옮김) ──
  aiWait: "적어 주신 내용에 맞는 곳을 찾고 있어요. 길면 1분쯤 걸려요. 화면을 그대로 두고 기다려 주세요.",
  aiStarNote: "별 표시는 주관식에 적어 주신 내용에 맞춰 고른 곳이에요.",
  aiStarLabel: "적어 주신 내용에 맞춰 고른 곳", // 별 그림을 읽어 주는 말
  aiReason: "적어 주신 글을 보고 AI가 고른 이유예요. 정확한 내용은 기관에 확인해 주세요.",
  aiUnclear:
    "적어 주신 글로는 바라시는 점을 알기 어려웠어요. 아래 '더 보기'에서 '바라는 점 다시 적기'를 눌러 조금만 더 적어 주세요. 예: 오전에만 할 수 있는 것, 돈이 들지 않는 것",
  aiNone:
    "적어 주신 내용에 꼭 맞는 곳은 아직 찾지 못했어요. 아래 '더 보기'의 '무엇이 맞을지 함께 찾아 주는 곳'에 물어보시면 도와드려요.",
  aiUnmatched:
    "이 부분은 꼭 맞는 곳을 아직 찾지 못했어요: {items}. 아래 '더 보기'의 '무엇이 맞을지 함께 찾아 주는 곳'에 물어보시면 도와드려요.",
  // 새로 씀: 원문의 '아래 지도의 곳은'을 '아래의 기관은'으로 바꿨다
  aiFail:
    "지금은 적어 주신 내용으로 찾기가 잘 되지 않아요. 잘못 누르신 것은 아니에요. 아래의 기관은 그대로 보실 수 있어요. 다시 찾아보려면 '더 보기'의 '바라는 점 다시 적기'를 눌러 주세요.",

  // ── 동점일 때 고르기 (옮김) ──
  tieTwo: "두 분야를 비슷하게 답하셨어요.",
  tieMany: "비슷하게 답하신 분야가 여러 개예요.",
  priorityExample: "예: {org} · {program}",

  // ── 결과 화면, 유형 소개 화면 ──
  typeLabel: "나의 유형", // 옮김
  typeLabelBrowse: "유형 소개", // 옮김
  typeImageAlt: "{name} 캐릭터 그림", // 옮김
  featureHeading: "이 유형의 특징", // 옮김
  placesHeading: "{name}에 맞는 기관", // 11/27에 정한 제목(동료 지도의 제목). 기관 지도 구역과 결과 사진에 쓴다
  placesHint: "기관 이름을 누르면 더 자세한 정보를 볼 수 있어요.", // 옮김
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

  // ── 내 결과 저장하기 (옮김) ──
  // 사진에 들어가는 것: 앱 이름, 캐릭터 그림, 유형 이름·설명·특징, 기관 이름 최대 3곳, cardFooter.
  // 안내(saveHelp)는 실제로 사진에 들어가는 것과 같아야 한다.
  saveHeading: "내 결과 저장하기",
  saveHelp:
    "결과를 사진 한 장으로 만들었어요. 유형 이름과 그림, 안내한 곳의 이름이 들어가요. 질문마다 무엇을 골랐는지는 적히지 않아요. 보내기 전에 사진을 한 번 봐 주세요.",
  saveImageAlt: "저장되는 결과 사진",
  saveButton: "사진 저장하기",
  saveSendButton: "카카오톡·메시지로 보내기",
  saveSendFailed:
    "여기서는 바로 보낼 수 없어요. 위의 '사진 저장하기'를 눌러 저장한 뒤 보내 주세요. 안 되면 사진을 길게 눌러 저장해 주세요.",
  cardFooter: "{date}에 저장한 결과예요. 정보는 바뀔 수 있어요.", // 사진 맨 아래 한 줄. {date}는 '11월 23일'

  // ── 친구에게 공유하기 (옮김) ── 보내는 것은 shareMessage와 앱 주소뿐이다
  shareHelp: "함께 해 보고, 같이 가 볼 곳을 찾아보세요. 내가 고른 답은 전해지지 않아요.",
  shareButton: "친구에게 공유하기",
  shareMessage:
    "ANTI(안산 다음걸음 유형 찾기): 질문에 답하면 나의 유형과 안산에서 물어볼 수 있는 곳을 알려 줘요.",
  shareCopied: "주소를 복사했어요. 카카오톡 대화창에 붙여 넣어 보내 주세요.",
  shareFailed: "자동으로 복사하지 못했어요. 아래 주소를 길게 눌러 복사해 주세요.",

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

  // ── 집에서 먼저 체험하기 (새로 씀) ── 체험 내용은 core/taste.ts가 정한다
  tasteLabel: "집에서 먼저 체험하기",
  tasteTitle: "가기 전에 미리 해 보세요", // 체험에 따로 제목이 없을 때
  tasteBody: "집에서 휴대폰으로 미리 살펴볼 수 있어요.", // 체험에 따로 설명이 없을 때
  tasteButton: "체험해 보기",
  tasteVideos: "영상으로 둘러보기",
  tasteVideoBy: "{by} 영상", // 영상을 올린 곳
  tasteWaiting: "체험을 준비하고 있어요. 조금만 기다려 주세요.",
  tasteBack: "← 기관 안내로 돌아가기",

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
    taste: "집에서 먼저 체험하기",
    type: "유형 소개",
  },
} as const;

// 문장의 {자리}에 값을 넣는다. 예) fill(text.seeList, { count: 5 }) → "목록으로 보기 · 모두 5곳"
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
