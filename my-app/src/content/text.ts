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

  // ── 집에서 먼저 체험하기 (새로 씀) ── 무엇을 보여 줄지는 core/taste.ts가 정하고, 내용은 이 파일 아래의 tasteTools·tasteFilms에 있다
  tasteLabel: "집에서 먼저 체험하기",
  tasteFilmBody: "기관에서 공개한 영상을 이 화면에서 볼 수 있어요.",
  tasteButton: "체험해 보기",
  tasteVideos: "영상으로 둘러보기",
  tasteVideoButton: "영상 보기",
  tasteVideoBy: "{by} 영상", // 영상을 올린 곳
  tasteToolBy: "{by}에서 만든 화면이에요. 새 창으로 열려요.", // 해 볼 것을 만든 곳
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

// 집에서 직접 해 보는 공식 자료. 기관·운영기관·정부가 만든 것만 넣는다(확인 기록: results/programs/체험자료_*_20261128.json).
// 같은 사이트·같은 체험으로 가는 것은 하나로 합친다. "설명 글 + 사이트 주소"뿐인 것은 넣지 않는다.
// 한 항목: title(제목), body(눌러서 무엇을 해 볼 수 있는지), linkLabel(여는 단추), url, by(만든 곳)
export const tasteTools = {
  L13: [
    {
      title: "키오스크와 예매 화면 눌러 보기",
      body: "커피 주문, 영화 예매, 기차표 예매 같은 화면을 직접 눌러 보며 연습해요. 열린 화면에서 '학습하기'를 누르세요.",
      linkLabel: "연습 화면 열기",
      url: "https://www.xn--2z1bw8k1pjz5ccumkb.kr/cnt/vid/webgl/1/dtl.do",
      by: "AI디지털배움터(한국지능정보사회진흥원)",
    },
    {
      title: "현금인출기 화면 눌러 보기",
      body: "입금, 출금, 계좌이체 같은 현금인출기(ATM) 화면과 무인계산기 사용법을 눌러 보며 연습해요. 열린 화면에서 '학습하기'를 누르세요.",
      linkLabel: "현금인출기 연습 열기",
      url: "https://www.xn--2z1bw8k1pjz5ccumkb.kr/cnt/vid/webgl/4/dtl.do",
      by: "AI디지털배움터(한국지능정보사회진흥원)",
    },
  ],
  JOB08: [
    {
      title: "자원봉사 기본 교육 영상 보기",
      body: "봉사의 뜻과 활동할 때 주의할 점을 다루는 교육 영상 여섯 편을 집에서 볼 수 있어요.",
      linkLabel: "온라인 교육 열기",
      url: "https://www.ansan1365.or.kr/sub.php?menukey=21",
      by: "안산시자원봉사센터",
    },
  ],
  JOB11: [
    {
      title: "가게 운영 온라인 강의 들어 보기",
      body: "홍보, 사업장 운영, 세무 같은 주제의 온라인 강의를 골라 볼 수 있어요.",
      linkLabel: "온라인 강의 목록 열기",
      url: "https://edu.sbiz.or.kr/edu/online/onlineEduList.do",
      by: "소상공인시장진흥공단 지식배움터",
    },
  ],
  H22: [
    {
      title: "기억력 스스로 점검해 보기",
      body: "기억력에 관한 14가지 질문에 '예', '아니오'로 답하면 점수가 나와요. 진단이 아니라 스스로 살펴보는 점검이에요.",
      linkLabel: "점검 화면 열기",
      url: "https://www.nid.or.kr/support/hi_list.aspx",
      by: "중앙치매센터",
    },
  ],
  H24: [
    {
      title: "나에게 맞는 금연 지원 찾아보기",
      body: "하루 흡연량 같은 여섯 가지 질문에 답하면 니코틴 의존도와 나에게 맞는 금연 지원을 알려 줘요.",
      linkLabel: "금연 지원 추천받기",
      url: "https://www.nosmokeguide.go.kr/helpness/recommend/home",
      by: "금연길라잡이(보건복지부·한국건강증진개발원)",
    },
  ],
  H25: [
    {
      title: "가까운 검진기관 찾아보기",
      body: "경기도, 안산시 상록구나 단원구, 검진 종류를 고르면 건강검진을 받을 수 있는 병·의원을 찾아볼 수 있어요.",
      linkLabel: "검진기관 찾기 열기",
      url: "https://www.nhis.or.kr/nhis/healthin/retrieveExmdAdminSearch.do",
      by: "국민건강보험공단",
    },
  ],
} as const;

// 공식 채널(그 기관·운영기관·정부)이 올렸고 바깥 재생이 허용된 영상(11/28 채널·제목 확인. 기록: results/programs/).
// title은 영상의 실제 제목이 아니라 무엇을 보여 주는지 짧게 적은 것이다.
export const tasteFilms = {
  JOB01: {
    id: "x1Oti-O_EPw",
    title: "안산 919 취업광장 소개",
    by: "안산시"
  },
  JOB11: {
    id: "0SItGHE11tI",
    title: "소상공인시장진흥공단이 하는 일",
    by: "소상공인시장진흥공단"
  },
  L08_MIND_COUNSELING: {
    id: "lzYA0HH0gOQ",
    title: "안산시정신건강복지센터 소개",
    by: "안산시정신건강복지센터"
  },
  L08_FAMILY_COUNSELING: {
    id: "Gl9fTSGpxio",
    title: "가족상담 소개",
    by: "한국건강가정진흥원"
  },
  H10: {
    id: "h6tQCZShh6Q",
    title: "아이돌봄서비스 안내",
    by: "성평등가족부"
  },
  H20_INFO: {
    id: "eMyji-sIVQo",
    title: "'누구나 돌봄' 이용 사례",
    by: "경기도"
  },
  H22: {
    id: "CWCwj3O21Ak",
    title: "치매안심센터에서 할 수 있는 일",
    by: "중앙치매센터"
  },
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
