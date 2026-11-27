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
  mapNote: "핀은 대략적인 위치예요. 가는 길은 '자세히 보기'의 '길찾기'로 확인해 주세요.", // 지도가 있을 때 화면 맨 아래 작은 글에
  mapPick: "추천 기관 고르기", // 번호 단추 묶음을 읽어 주는 말
  mapMore: "가장 추천하는 3곳을 표시했어요. 더 많은 기관은 아래 '목록으로 보기'를 눌러 주세요.", // 지도 오른쪽 아래. 후보가 3곳을 넘을 때만
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
  tasteFilmBody: "기관에서 공개한 영상을 이 화면에서 볼 수 있어요.",
  tasteChooseMany: "필요한 항목을 여러 개 고를 수 있어요.",
  tasteChecklist: "준비한 항목에 표시하세요.",
  tasteHoursTitle: "일주일에 필요한 돌봄 시간",
  tasteHoursBody: "하루에 같은 분량을 이용할 때의 합계예요. 예약이나 요금 계산은 공식 서비스에서 해요.",
  tasteDaysLabel: "일주일에 며칠인가요?",
  tasteHoursLabel: "하루에 몇 시간인가요?",
  tasteDaysUnit: "{n}일",
  tasteHoursUnit: "{n}시간",
  tasteHoursTotal: "일주일에 총 {n}시간",
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

// 운영기관이 공개한 체험 안내와 출처. 화면에는 기관 하나에 해당하는 항목만 보여 준다.
export const tasteActivities = {
  JOB01: {
    title: "상담과 채용행사 준비하기",
    body: "구직 상담과 기업 면접은 참여 방법이 달라요. 이용할 곳을 골라 준비물을 확인하세요.",
    prompt: "어떤 도움을 받고 싶으세요?",
    mode: "choose",
    options: [
      {
        label: "일자리 상담부터 받기",
        detail: "시청 일자리센터와 동 행정복지센터에 상담 창구가 있어요. 구직 등록과 일자리 소개를 받을 수 있어요.",
        linkLabel: "동별 상담창구 전화번호 보기",
        url: "https://www.ansan.go.kr/www/common/cntnts/selectContents.do?cntnts_id=C0001272"
      },
      {
        label: "안산919취업광장에서 면접 보기",
        detail: "행사 당일 참여하는 취업광장이에요. 이번 회차의 공지를 보고 챙긴 항목을 표시하세요.",
        items: [
          "이번 회차의 날짜와 장소 확인",
          "이력서 준비",
          "자기소개서 준비"
        ]
      },
      {
        label: "목요일에 희망 잡고 면접 보기",
        detail: "센터에 사전 등록한 뒤 참여하는 채용행사예요. 면접 전에 챙긴 항목을 표시하세요.",
        items: [
          "이번 회차에 사전 등록",
          "이력서 준비",
          "자기소개서 준비"
        ]
      }
    ],
    sourceLabel: "안산시 일자리센터 안내",
    sourceUrl: "https://www.ansan.go.kr/www/common/cntnts/selectContents.do?cntnts_id=C0001272"
  },
  JOB02: {
    title: "경력 상담과 동행면접 비교하기",
    body: "앞으로 할 일을 정하는 상담과 기업 현장을 보는 면접을 비교할 수 있어요.",
    prompt: "지금 알아보고 싶은 지원을 고르세요.",
    mode: "choose",
    options: [
      {
        label: "경력을 살릴 일 찾기",
        detail: "생애경력설계에서는 지금까지의 경력을 살펴보고 앞으로 어떤 일을 할지 상담해요.",
        linkLabel: "고용24 지원 내용 보기",
        url: "https://www.work24.go.kr/wk/u/a/1000/seniorCenterSvcInfo.do"
      },
      {
        label: "일을 옮길 준비하기",
        detail: "퇴직을 앞두고 전직을 준비하는 교육과 퇴직 후 구직 활동을 돕는 교육이 있어요. 고용24에서 두 과정의 내용을 비교해 보세요.",
        linkLabel: "고용24 교육 과정 보기",
        url: "https://www.work24.go.kr/wk/u/a/1000/seniorCenterSvcInfo.do"
      },
      {
        label: "면접 볼 기업 현장 알아보기",
        detail: "안산에서는 기업이 찾는 직종과 구직자를 연결해 면접과 생산부서 견학을 함께 진행한 적이 있어요. 이번 모집 여부는 센터 공지에서 확인하세요.",
        linkLabel: "안산의 동행면접 사례 보기",
        url: "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=20187&contId=90171&menuId=9946"
      }
    ],
    sourceLabel: "안산상공회의소 센터 공지 보기",
    sourceUrl: "https://ansancci.korcham.net/front/board/boardContentsListPage.do?boardId=11295&menuId=10014"
  },
  JOB03: {
    title: "내 가게에 필요한 특강 내용 고르기",
    body: "안산 점주들이 지난 특강에서 들려준 내용이에요. 배우고 싶은 내용을 골라 올해 공고와 비교해 보세요.",
    prompt: "점주에게 어떤 경험을 배우고 싶으세요?",
    mode: "check",
    options: [
      {
        label: "대표 메뉴 개발",
        detail: "지난 특강에서는 지역 점주가 메뉴를 개발한 경험을 들려줬어요. 참가자는 점포의 대표 음식을 직접 맛봤어요."
      },
      {
        label: "손님 응대",
        detail: "점주들이 매장에서 손님을 응대한 경험을 나눴어요. 관심 있는 회차에서 이 주제를 다루는지 재단에 확인하세요."
      },
      {
        label: "점포 운영 중 어려움 대처",
        detail: "강사들은 가게를 운영하며 겪은 시행착오와 위기를 넘긴 경험을 소개했어요.",
        linkLabel: "지난 상인 특강 내용 보기",
        url: "https://amrf.or.kr/재단소식/보도자료/?mod=document&pageid=1&uid=411"
      }
    ],
    sourceLabel: "재단 공고에서 회차와 접수 확인",
    sourceUrl: "https://amrf.or.kr/알림공간/공지사항/?mod=document&uid=643"
  },
  JOB07: {
    title: "이모작 상담에서 다룰 주제 정하기",
    body: "일자리와 생활을 함께 상담할 수 있어요. 상담을 신청하기 전에 다루고 싶은 주제를 골라 보세요.",
    prompt: "어떤 이야기를 상담에 가져가고 싶으세요?",
    mode: "check",
    options: [
      {
        label: "경력 정리와 재취업",
        detail: "경력개발과 재취업은 이모작 상담 주제예요. 센터의 지난 특강에서는 경력을 이력서에 담고 면접에서 강점을 설명하는 방법을 다뤘어요.",
        linkLabel: "지난 재취업 특강 내용 보기",
        url: "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1683065"
      },
      {
        label: "사회공헌과 여가 활동",
        detail: "일을 그만둔 뒤에도 경험을 나눌 수 있는 사회공헌 활동과 여가·문화 생활을 상담할 수 있어요."
      },
      {
        label: "가족과 주변 사람들과의 관계",
        detail: "가족관계와 사회적 관계도 생애설계 상담에서 함께 다루는 주제예요."
      }
    ],
    sourceLabel: "안산시 이모작 상담 안내",
    sourceUrl: "https://www.ansan.go.kr/www/common/cntnts/selectContents.do?cntnts_id=www01617"
  },
  JOB08: {
    title: "참여할 봉사활동 찾기",
    body: "개인 봉사 모집, 센터 행사, 집에서 받는 교육은 신청하는 곳이 달라요.",
    prompt: "어떤 활동을 찾으세요?",
    mode: "choose",
    options: [
      {
        label: "개인으로 참여할 봉사 찾기",
        detail: "1365에서 개인 봉사활동을 찾아보세요. 모집 기간과 활동 장소를 보고 참여할 공고를 고를 수 있어요.",
        linkLabel: "1365에서 봉사 모집 보기",
        url: "https://www.1365.go.kr/"
      },
      {
        label: "센터 교육이나 행사 찾기",
        detail: "교육·행사 공고에서 참여할 수 있는 회차인지 살펴보세요.",
        items: [
          "접수 기간과 마감 여부 확인",
          "행사 날짜와 장소 확인",
          "접수 인원과 정원 확인"
        ],
        linkLabel: "센터 교육·행사 목록 보기",
        url: "https://www.ansan1365.or.kr/sub.php?menukey=22"
      },
      {
        label: "집에서 봉사의 기본 배우기",
        detail: "센터의 온라인 교육에는 봉사의 의미와 활동할 때 주의할 점이 있어요. 봉사 시간 인정을 원하면 다음 사항도 확인하세요.",
        items: [
          "1365 자원봉사포털 가입 확인",
          "소속센터가 경기도 안산시인지 확인",
          "센터 교육의 문제풀이와 인정 조건 확인"
        ],
        linkLabel: "센터 온라인 교육 보기",
        url: "https://www.ansan1365.or.kr/sub.php?menukey=21"
      }
    ],
    sourceLabel: "안산센터의 1365 이용 안내",
    sourceUrl: "https://www.ansan1365.or.kr/sub.php?menukey=20"
  },
  JOB11: {
    title: "가게 운영에 필요한 창구 찾기",
    body: "지원사업 신청, 자금 문의, 경영 교육 가운데 필요한 일을 골라 해당 창구를 확인하세요.",
    prompt: "어떤 일을 해결하고 싶으세요?",
    mode: "choose",
    options: [
      {
        label: "지원사업 공고와 신청 방법 찾기",
        detail: "소상공인24의 ‘소진공 지원사업 공고조회 및 신청’에서 공고를 찾아보세요. 신청은 로그인한 뒤 진행해요.",
        linkLabel: "소상공인24 열기",
        url: "https://www.sbiz24.kr/"
      },
      {
        label: "사업 운영 자금 알아보기",
        detail: "소상공인24의 ‘대출상품 조회’에서 정책자금 상품을 살펴볼 수 있어요. 통합콜센터에서는 대출 상담을 받아요."
      },
      {
        label: "가게 운영 방법 배우기",
        detail: "지식배움터에서 점포 운영과 홍보 강의를 찾을 수 있어요. 온라인 강의와 현장교육을 나눠 볼 수 있어요.",
        linkLabel: "공단 지식배움터 열기",
        url: "https://edu.sbiz.or.kr/edu/main/main.do"
      }
    ],
    sourceLabel: "소상공인24 서비스 안내",
    sourceUrl: "https://www.sbiz24.kr/"
  },
  L06_PIUM_DIRECTORY: {
    title: "수업에서 내 손으로 만드는 것",
    body: "안산시평생학습관의 지난 피움과정 세 가지예요. 완성하고 싶은 것을 누르면 그 수업에서 무엇을 연습했는지 볼 수 있어요.",
    prompt: "어떤 걸 만들어 볼까요?",
    mode: "choose",
    options: [
      {
        label: "내 사진에 짧은 시 붙이기",
        detail: "디카시 수업은 주변 사물이나 풍경을 찍고, 사진만으로 전해지지 않는 생각을 짧은 시로 쓰는 과정이었어요. 마지막 수업에는 각자 다듬은 작품을 읽고 전시하는 활동이 있었어요.",
        items: [
          "스마트폰",
          "필기도구"
        ],
        linkLabel: "디카시 수업 내용 보기",
        url: "https://lll.ansan.go.kr/web/cop/regEduDetail.do?mId=EDUMNG_0000000001578"
      },
      {
        label: "‘찔레꽃’에 장구 가락 얹기",
        detail: "트롯 장구 수업은 양손에 채를 쥐는 법부터 시작했어요. ‘찔레꽃’에 맞춰 가락을 익히고 몸동작을 더하는 활동이 강의계획에 담겨 있어요.",
        linkLabel: "트롯 장구 수업 내용 보기",
        url: "https://lll.ansan.go.kr/web/cop/regEduDetail.do?mId=EDUMNG_0000000001561"
      },
      {
        label: "카푸치노에 하트 그리기",
        detail: "바리스타 과정에는 드리퍼를 바꿔 커피를 내려 보고 추출 결과를 비교하는 연습이 있어요. 후반에는 우유 거품으로 카푸치노에 하트와 나뭇잎 무늬를 만드는 내용이 담겼어요.",
        items: [
          "앞치마",
          "행주",
          "텀블러"
        ],
        linkLabel: "바리스타 수업 내용 보기",
        url: "https://lll.ansan.go.kr/web/cop/regEduDetail.do?mId=EDUMNG_0000000001616"
      }
    ],
    sourceLabel: "평생학습관 정규강좌와 접수 상태 보기",
    sourceUrl: "https://lll.ansan.go.kr/web/cop/regEduList.do"
  },
  L13: {
    title: "커피 주문부터 기차표 예매까지",
    body: "AI디지털배움터의 공개 연습 화면에서는 휴대전화로 메뉴와 버튼을 직접 눌러 볼 수 있어요. 실제 주문이나 결제는 이루어지지 않아요.",
    prompt: "어떤 화면을 연습할까요?",
    mode: "choose",
    options: [
      {
        label: "카페에서 커피 주문하기",
        detail: "아래 공식 과정에서 ‘학습하기’를 누르고 ‘연습하기’를 선택하세요. 카페에서 커피를 주문하며 화면을 터치하는 법을 익힐 수 있어요.",
        linkLabel: "디지털배움터 주문 연습 열기",
        url: "https://www.xn--2z1bw8k1pjz5ccumkb.kr/cnt/vid/webgl/1/dtl.do"
      },
      {
        label: "영화관에서 표 예매하기",
        detail: "공식 과정의 ‘학습하기’에서 ‘키오스크’를 선택하세요. 영화 예매 연습을 고르면 영화관 기기의 버튼을 직접 눌러 볼 수 있어요.",
        linkLabel: "디지털배움터 영화 예매 연습 열기",
        url: "https://www.xn--2z1bw8k1pjz5ccumkb.kr/cnt/vid/webgl/1/dtl.do"
      },
      {
        label: "휴대전화로 기차표 예매하기",
        detail: "공식 과정의 ‘학습하기’에서 ‘대중교통 앱’을 선택하세요. KTX 예매 연습을 고르면 휴대전화로 기차표를 예매하는 화면을 익힐 수 있어요.",
        linkLabel: "디지털배움터 기차표 연습 열기",
        url: "https://www.xn--2z1bw8k1pjz5ccumkb.kr/cnt/vid/webgl/1/dtl.do"
      }
    ],
    sourceLabel: "단원구의 무료 디지털 교육 안내",
    sourceUrl: "https://www.ansan.go.kr/danwongu/common/cntnts/selectContents.do?cntnts_id=C0002056"
  },
  L15: {
    title: "책 한 권에서 시작하는 세 모임",
    body: "안산시평생학습관 작은도서관은 북세통·한뉘·옹달샘의 활동과 사진을 공개했어요. 새 회원 모집 여부는 따로 확인해야 해요.",
    prompt: "읽은 책으로 무엇을 해 볼까요?",
    mode: "choose",
    options: [
      {
        label: "같은 책을 다르게 읽은 사람들과 토론하기",
        detail: "북세통은 선정한 책을 함께 읽고 각자의 생각을 나누는 모임이에요. 문학뿐 아니라 사회과학, 역사, 과학, 그림책까지 다뤄요."
      },
      {
        label: "역사책의 무대를 찾아가 보기",
        detail: "한뉘에서는 역사책을 읽고 토론한 뒤 책에 등장하는 지역을 답사하기도 해요. 읽으며 떠올린 장소를 실제 풍경과 맞춰 볼 수 있어요."
      },
      {
        label: "내가 쓴 시 읽기와 동화 구연",
        detail: "옹달샘은 시니어 회원들이 직접 쓴 시를 발표하고 추억의 노래도 부르는 모임이에요. 어린이에게 손동작이나 짧은 연극으로 동화를 들려주는 회원도 있어요."
      }
    ],
    sourceLabel: "작은도서관 모임 소개와 활동 사진 보기",
    sourceUrl: "https://lll.ansan.go.kr/web/content.do?proFn=9314000"
  },
  L16: {
    title: "안산 동아리 활동 세 가지 비교하기",
    body: "평생비전센터 등록부에서 동아리들이 직접 적은 활동을 골랐어요. 비교할 활동을 눌러 보세요. 가입 가능 여부는 모임마다 달라요.",
    prompt: "어떤 활동을 함께 살펴볼까요?",
    mode: "check",
    options: [
      {
        label: "은빛날개 · 지역 축제 패션쇼",
        detail: "은빛날개는 평생학습관 ‘영그는 마당’과 호수동 별빛문화축제 등에서 회원들이 패션쇼 무대에 섰다고 기록했어요."
      },
      {
        label: "사물놀이 장비통 · 악기 배우고 공연하기",
        detail: "사물놀이 장비통은 매주 모여 사물놀이 악기를 배우고, 연습한 곡으로 해마다 한 번 이상 공연한다고 소개했어요."
      },
      {
        label: "스마일파크클럽 · 파크골프 현장 실습",
        detail: "스마일파크클럽은 규칙과 안전 수칙을 익혀 현장에서 연습해요. 강사를 준비하는 회원은 직접 수업을 진행하는 연습도 해요."
      }
    ],
    sourceLabel: "평생비전센터 학습동아리 등록현황 보기",
    sourceUrl: "https://wm.ansan.go.kr/operation/eduClub/selectEduClubPageList.do"
  },
  L08_MIND_COUNSELING: {
    title: "마음건강 상담, 편한 방법으로 예약하기",
    body: "전화로 일정을 조율하거나 센터 누리집에서 상담을 요청할 수 있어요.",
    prompt: "어떤 방식이 편하세요?",
    mode: "choose",
    options: [
      {
        label: "전화로 예약 문의",
        detail: "상담 사유를 어디까지 설명해야 할지, 방문 전에 무엇을 준비할지 담당자에게 먼저 물어볼 수 있어요. 전화예약은 안산시정신건강복지센터 031-411-7573이에요.",
        linkLabel: "이용 방법과 연락처 보기",
        url: "https://wmind.org/sub.php?menukey=12"
      },
      {
        label: "온라인 접수 항목 살펴보기",
        detail: "공식 신청서에서 연락처 등 필수 항목과 개인정보 수집 안내를 확인해요. 작성하고 동의할지는 센터 화면에서 결정할 수 있어요.",
        linkLabel: "센터 상담 신청서 열기",
        url: "https://wmind.org/sub.php?menukey=33"
      }
    ],
    sourceLabel: "안산시정신건강복지센터 이용 안내",
    sourceUrl: "https://wmind.org/sub.php?menukey=12"
  },
  L08_FAMILY_COUNSELING: {
    title: "가족상담 예약 전에 맞춰볼 것",
    body: "안산센터의 2026년 안내는 매주 같은 요일에 만나는 여섯 차례 상담을 기준으로 해요.",
    prompt: "접수 전에 무엇을 정리할까요?",
    mode: "choose",
    options: [
      {
        label: "여섯 차례 참석 일정 맞추기",
        detail: "회당 50~60분이에요. 누구와 함께할지, 여섯 주 연속 가능한 요일과 시간대가 있는지 살펴본 뒤 신청할 수 있어요.",
        linkLabel: "2026년 가족상담 접수 안내",
        url: "https://ansan.familynet.or.kr/center/lay1/program/S295T322C449/receipt/view.do?seq=188977",
        items: [
          "함께 참석할 사람과 일정 상의",
          "여섯 주 연속 가능한 요일 확인",
          "한 회 50~60분 낼 수 있는 시간 확인"
        ]
      },
      {
        label: "전화 접수와 대기 절차 확인",
        detail: "안산센터 031-501-0033으로 전화해 상담 1번을 선택해요. 접수 뒤 차례가 되면 센터에서 전화해 일정을 조율해요.",
        linkLabel: "접수 안내와 연락처 보기",
        url: "https://ansan.familynet.or.kr/center/lay1/program/S295T322C449/receipt/view.do?seq=188977"
      }
    ],
    sourceLabel: "안산시건강가정지원센터 2026 가족상담 안내",
    sourceUrl: "https://ansan.familynet.or.kr/center/lay1/program/S295T322C449/receipt/view.do?seq=188977"
  },
  H10: {
    title: "아이돌봄에서 부탁할 수 있는 일",
    body: "등·하원과 간식 챙기기, 아이 식사 조리와 옷 세탁은 신청할 서비스가 달라요.",
    prompt: "맡기려는 일을 골라보세요.",
    mode: "choose",
    options: [
      {
        label: "등·하원 동행과 간식 챙기기",
        detail: "시간제 기본형에 등·하원 보조와 놀이, 이미 준비한 식사와 간식 챙기기가 포함돼요. 만들어 둔 식사를 데워 주는 일도 기본형에 해당해요.",
        linkLabel: "시간제 기본형 범위 보기",
        url: "https://www.idolbom.go.kr/front/srvcGuide/prttm"
      },
      {
        label: "아이 식사 조리와 놀이공간 정리",
        detail: "시간제 종합형은 기본형 돌봄에 아이 식사·간식 조리와 그에 따른 설거지, 아이 옷 세탁 및 놀이공간 정리를 더해요.",
        linkLabel: "시간제 종합형 범위 보기",
        url: "https://www.idolbom.go.kr/front/srvcGuide/prttm"
      },
      {
        label: "이용요금 비교와 신청 준비",
        detail: "아이돌봄 공식 안내의 이용요금 모의계산에서 기본형과 종합형 비용을 비교할 수 있어요. 신청에 필요한 절차는 공식 누리집에서 확인해요.",
        linkLabel: "신청 전 준비 확인",
        url: "https://www.idolbom.go.kr/front/srvcUtztnGuide/beforeApply"
      }
    ],
    sourceLabel: "아이돌봄서비스 시간제 돌봄 범위",
    sourceUrl: "https://www.idolbom.go.kr/front/srvcGuide/prttm"
  },
  H13: {
    title: "원스톱 상담에서 물어볼 내용 고르기",
    body: "안산서부건강생활지원센터 2층에서 대사증후군 검진 결과를 상담하고, 평소 식습관도 상의할 수 있어요.",
    prompt: "상담 때 확인하고 싶은 내용을 선택하세요.",
    mode: "check",
    options: [
      {
        label: "검진 결과 설명",
        detail: "측정한 항목이 무엇을 뜻하는지 설명을 요청할 수 있어요. 전에 받은 결과표와 함께 봐 주는지도 예약할 때 확인해 보세요."
      },
      {
        label: "평소 먹는 한 끼 상담",
        detail: "평소 자주 먹는 한 끼를 떠올려 두세요. 센터에서 영양 상담을 받을 때 일상 식사에서 어떤 부분을 살펴보면 좋을지 구체적으로 물을 수 있어요."
      },
      {
        label: "방문 전 준비",
        detail: "안산서부건강생활지원센터 031-369-1590~1591에서 방문 가능 여부와 필요한 준비사항을 확인할 수 있어요.",
        linkLabel: "상담실 이용 안내",
        url: "https://ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=health05"
      }
    ],
    sourceLabel: "안산시 단원보건소 서부건강생활지원센터",
    sourceUrl: "https://ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=health05"
  },
  H20_INFO: {
    title: "도시락 배달과 집안일 도움 구별하기",
    body: "같은 식사 문제라도 필요한 도움에 따라 문의할 돌봄 분야가 달라져요.",
    prompt: "동 행정복지센터에 어떤 도움을 문의할까요?",
    mode: "choose",
    options: [
      {
        label: "조리된 식사를 배달받기",
        detail: "식사지원은 먹을 수 있게 준비한 식사를 제공하는 분야예요. 주소지 동에 지원 가능 기간과 비용, 식사 제공 방법을 확인해요.",
        linkLabel: "경기도 식사지원 내용 보기",
        url: "https://www.gg.go.kr/ggcare/hmpg/srap/appl/srapInfoForm.do"
      },
      {
        label: "집에서 밥을 차리고 설거지하기",
        detail: "생활돌봄의 가사활동 지원으로 식사 준비와 설거지를 문의할 수 있어요. 가능한 지원 범위는 동 담당자와 상의해요.",
        linkLabel: "경기도 생활돌봄 범위 보기",
        url: "https://www.gg.go.kr/ggcare/hmpg/srap/appl/srapInfoForm.do"
      },
      {
        label: "지원 대상과 본인 부담 확인",
        detail: "공식 신청 안내에서 돌봄 공백 기준과 비용 구분을 볼 수 있어요. 주소지 동에서 이용 상황을 확인한 뒤 지원 내용이 정해져요.",
        linkLabel: "누구나돌봄 공식 신청 안내",
        url: "https://www.gg.go.kr/ggcare/hmpg/srap/appl/srapInfoForm.do"
      }
    ],
    sourceLabel: "경기도 누구나돌봄 지원 내용",
    sourceUrl: "https://www.gg.go.kr/ggcare/hmpg/srap/appl/srapInfoForm.do"
  },
  H22: {
    title: "치매안심센터에서 받을 도움 찾기",
    body: "본인이 이용하는 조기검진, 낮 활동을 하는 쉼터, 가족을 위한 교육은 참여 대상이 달라요.",
    prompt: "찾으시는 서비스를 고르세요.",
    mode: "choose",
    options: [
      {
        label: "본인의 조기검진 문의",
        detail: "거주지 관할 치매안심센터에 이용 대상과 방문 준비물을 확인해요. 단원보건소 안내에서 검진 절차와 담당 연락처를 볼 수 있어요.",
        linkLabel: "단원 조기검진 안내",
        url: "https://ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=C0001699"
      },
      {
        label: "낮에 참여할 쉼터 활동",
        detail: "상록수센터는 2026년 음악·운동·작업 활동을 포함한 쉼터 운영을 발표했어요. 해당 회차 운영 내용과 대상을 보고 다음 모집 여부를 센터에 문의할 수 있어요.",
        linkLabel: "상록수센터 쉼터 운영 사례",
        url: "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1664608"
      },
      {
        label: "돌보는 가족을 위한 교육",
        detail: "단원센터 가족교실에는 돌봄 방법을 배우고 경험을 나누는 과정이 있어요. 가족이 직접 참여할 수 있는 회차와 접수 방법을 확인해요.",
        linkLabel: "단원 가족지원 안내",
        url: "https://www.ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=C0001702"
      }
    ],
    sourceLabel: "안산시 단원보건소 가족지원 안내",
    sourceUrl: "https://www.ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=C0001702"
  },
  H23: {
    title: "식사 상담·실습·집에서 공부하기",
    body: "평소 식사를 상담할지, 교육에 참여할지에 따라 이용할 창구를 고를 수 있어요.",
    prompt: "어떤 방식으로 배울까요?",
    mode: "choose",
    options: [
      {
        label: "평소 식습관을 개별 상담",
        detail: "안산 등록교육센터는 식습관 영양상담을 운영해요. 대표번호 031-416-9088로 개별 상담을 받을 수 있는지 문의해요.",
        linkLabel: "영양상담 안내 보기",
        url: "https://www.ansan.ac.kr/www/content/135"
      },
      {
        label: "당뇨 식사를 직접 체험",
        detail: "영양실습교실에서는 당뇨 식사를 체험해요. 공식 운영표를 보고 다음 회차의 참여 대상과 남은 자리를 센터에 확인해요.",
        linkLabel: "영양실습교실 운영 안내",
        url: "https://www.ansan.ac.kr/www/content/135"
      },
      {
        label: "집에서 워크북으로 시작",
        detail: "고당e공부방에서 고혈압·당뇨병 워크북 무료 교육을 따로 신청할 수 있어요. 강좌명을 보고 원하는 과정을 선택해요.",
        linkLabel: "공식 워크북 과정 열기",
        url: "https://www.godang-e.kr/web/42"
      }
    ],
    sourceLabel: "안산대학교 등록교육센터 교육 안내",
    sourceUrl: "https://www.ansan.ac.kr/www/content/135"
  },
  H24: {
    title: "생활에 맞는 금연 상담 고르기",
    body: "상록수·단원보건소에는 방문 상담 창구가 있어요. 상록수보건소는 전화 상담과 정해진 날의 야간 운영도 안내해요.",
    prompt: "이용하기 편한 방법은 무엇인가요?",
    mode: "choose",
    options: [
      {
        label: "보건소 방문 전에 전화 상담",
        detail: "상록수 금연클리닉 031-481-5899에서는 방문 전에도 상담할 수 있어요. 첫 방문에서 무엇을 하고 이후 지원이 어떻게 이어지는지 물어볼 수 있어요.",
        linkLabel: "상록수 상담 방법 보기",
        url: "https://ansan.go.kr/snshealth/common/cntnts/selectContents.do?cntnts_id=C0001775"
      },
      {
        label: "퇴근 후 상록수보건소 방문",
        detail: "상록수보건소는 매월 넷째 주 화요일 야간 운영을 안내해요. 방문하려는 달에 실제로 운영하는지 금연클리닉에 확인해요.",
        linkLabel: "상록수 야간 운영 확인",
        url: "https://ansan.go.kr/snshealth/common/cntnts/selectContents.do?cntnts_id=C0001775"
      },
      {
        label: "단원보건소 방문",
        detail: "단원보건소 2층 금연클리닉에서 상담사와 시작 시기를 정할 수 있어요. 방문 전 공식 페이지에서 이용 방법을 확인해요.",
        linkLabel: "단원 금연클리닉 이용 안내",
        url: "https://ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=C0001644"
      }
    ],
    sourceLabel: "상록수보건소 금연클리닉",
    sourceUrl: "https://ansan.go.kr/snshealth/common/cntnts/selectContents.do?cntnts_id=C0001775"
  },
  H25: {
    title: "국가건강검진에 필요한 업무 바로 열기",
    body: "공단에서 본인 대상을 조회하고, 검진은 지정 병·의원에서 받아요. 끝난 뒤에는 결과표도 다시 열 수 있어요.",
    prompt: "지금 처리할 일은 무엇인가요?",
    mode: "choose",
    options: [
      {
        label: "올해 검진 대상 확인",
        detail: "공단 로그인 뒤 내 검진 대상과 항목을 조회해요. 본인 확인은 공식 누리집에서 진행해요.",
        linkLabel: "공단 검진대상 조회",
        url: "https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetPerson.do"
      },
      {
        label: "안산의 지정 검진기관 찾기",
        detail: "공단 검색 화면에서 경기도와 안산 지역, 일반검진을 선택해요. 방문 전에 해당 병·의원에 예약 가능일과 준비물을 확인해요.",
        linkLabel: "공단 검진기관 찾기",
        url: "https://www.nhis.or.kr/nhis/healthin/retrieveExmdAdminSearch.do",
        items: [
          "경기도에서 안산 지역 선택",
          "검진유형에서 일반 선택",
          "희망 기관에 예약과 준비물 확인"
        ]
      },
      {
        label: "받았던 검진 결과표 확인",
        detail: "공단 로그인 뒤 검진 연도와 기관을 확인하고 결과를 열람할 수 있어요. 종이 결과표가 필요하면 출력 메뉴를 이용해요.",
        linkLabel: "공단 건강검진 결과조회",
        url: "https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetResultPerson.do"
      }
    ],
    sourceLabel: "국민건강보험공단 일반건강검진 안내",
    sourceUrl: "https://www.nhis.or.kr/nhis/healthin/wbhaca04500m01.do"
  }
} as const;

// 공식 유튜브 채널에서 올리고 내장 플레이어로 재생이 확인된 영상.
export const tasteFilms = {
  JOB12: {
    id: "PUKIzp4S0WY",
    title: "국민내일배움카드 안내",
    by: "한국고용정보원"
  },
  JOB13: {
    id: "8iueW55vZp4",
    title: "새일센터의 취업 지원 안내",
    by: "성평등가족부"
  },
  L09: {
    id: "KhUG65dyeD8",
    title: "경기도미술관 관람 안내",
    by: "경기문화재단"
  },
  L10: {
    id: "Jrd_NVP8e7U",
    title: "수영 강습 이용 안내",
    by: "안산도시공사"
  },
  L12: {
    id: "gaCX5MeK60M",
    title: "평생학교에서 공부하는 일상",
    by: "안산시평생학습관"
  },
  F01: {
    id: "fzxzcd2p4MQ",
    title: "국민연금공단의 노후준비 상담",
    by: "국민연금TV"
  },
  F20: {
    id: "lU3zRUk4WiA",
    title: "혜택알리미 이용 안내",
    by: "행정안전부"
  },
  H19: {
    id: "npUkukEEtHM",
    title: "지역사회 통합돌봄 안내",
    by: "보건복지부TV"
  },
  F02: {
    id: "2Zfn0gs5JAo",
    title: "금융감독원의 무료 금융자문 안내",
    by: "금융감독원"
  },
  F21: {
    id: "4ggyIntmx-0",
    title: "보건복지상담센터 상담 안내",
    by: "보건복지부TV"
  },
  F22: {
    id: "s3QFbjhQXB4",
    title: "복지멤버십 이용 안내",
    by: "KTV 국민방송"
  },
  H21: {
    id: "C4rra31STNk",
    title: "노인장기요양보험 신청 안내",
    by: "국민건강보험"
  },
  G01: {
    id: "Va7WYisxmlo",
    title: "안산시 민원콜센터에서 하는 일",
    by: "안산시"
  }
} as const;
