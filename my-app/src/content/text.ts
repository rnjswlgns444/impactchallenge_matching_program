import type { Simulation } from "@/core/simulation";

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
  tasteHoursTitle: "일주일에 필요한 돌봄 시간",
  tasteHoursBody: "하루에 같은 분량을 이용할 때의 합계예요. 예약이나 요금 계산은 공식 서비스에서 해요.",
  tasteDaysLabel: "일주일에 며칠인가요?",
  tasteHoursLabel: "하루에 몇 시간인가요?",
  tasteDaysUnit: "{n}일",
  tasteHoursUnit: "{n}시간",
  tasteHoursTotal: "일주일에 총 {n}시간",
  tasteButton: "체험해 보기",
  relatedSimulation: "동네 활동도 해보기 · {name}",
  officialDigitalTitle: "키오스크·교통 앱 직접 연습하기",
  officialDigitalBody: "AI디지털배움터 공식 화면에서 ‘학습하기’를 누르세요. 주문과 예매를 직접 연습할 수 있어요.",
  officialDigitalButton: "디지털배움터 시뮬레이션 열기",
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

// 기관 자료를 참고해 ANTI가 만든 연습 장면과 활동 문구.
export const tasteSimulations = {
  JOB01: {
    id: "JOB01", kind: "desk", title: "일자리센터에 보여 줄 구직 카드",
    intro: "어떻게 일을 구하고 싶은지 카드 한 장에 담아 보세요. 안산시가 구인정보를 올린 직종을 예로 들었어요.",
    artifact: "나의 구직 상담 카드", sourceLabel: "안산시 공식 구인정보 보기",
    sourceUrl: "https://www.ansan.go.kr/www/common/bbs/selectPageListBbs.do?bbs_code=B0261",
    steps: [
      { mode: "pick", title: "어떤 일자리를 찾고 있나요?", instruction: "상담할 때 맨 먼저 전하고 싶은 말을 고르세요.", caption: "찾는 일자리",
        options: [
          { label: "짧은 기간 일하고 싶어요", note: "계약이 언제 끝나는지 물어볼 수 있어요." },
          { label: "공공 일자리를 알아보고 싶어요", note: "관심 있는 사업의 모집 시기와 조건을 물어볼 수 있어요." },
          { label: "오래 일할 곳에 다시 취업하고 싶어요", note: "오래 이어 가고 싶은 일을 다음 칸에 담아 보세요." },
          { label: "어떤 일이 맞을지 함께 찾고 싶어요", note: "아직 직종을 정하지 않아도 해 본 일부터 정리할 수 있어요." },
        ] },
      { mode: "pack", title: "해 본 일을 카드에 담으세요", instruction: "일터나 집, 모임에서 해 본 일을 한두 가지 골라 보세요.", caption: "내가 해 본 일", min: 1, limit: 2,
        options: [
          { label: "물건 수량을 확인하고 정리했어요", note: "무엇을 확인했는지 떠올려 보세요." },
          { label: "손님이나 이용자에게 안내했어요", note: "어려워하는 내용을 쉽게 알려 준 경험도 좋아요." },
          { label: "신청서나 장부에 내용을 기록했어요", note: "종이에 적은 경험도 담을 수 있어요." },
          { label: "도구를 써서 물건을 만들거나 수리했어요", note: "손에 익은 도구를 떠올려 보세요." },
          { label: "식사나 행사 준비를 맡았어요", note: "함께할 사람들과 일을 나눈 경험도 좋아요." },
        ] },
      { mode: "pick", title: "구인 게시판에서 한 칸 열어 보세요", instruction: "아래는 안산시가 게시한 직종 구분이에요. 먼저 살펴볼 분야를 고르세요.", caption: "먼저 살펴볼 분야",
        options: [
          { label: "제조직", note: "공고에서 실제로 맡을 공정과 필요한 경험을 확인하세요." },
          { label: "사무직", note: "공고에 적힌 문서 업무와 사용하는 도구를 확인하세요." },
          { label: "서비스직", note: "누구를 응대하고 어떤 일을 하는지 공고를 확인하세요." },
          { label: "여러 분야를 상담한 뒤 정하기", note: "카드에 담은 경험을 보여 주며 관련된 일부터 물어보세요." },
        ] },
      { mode: "pick", title: "상담에서 먼저 물을 것", instruction: "전화를 걸거나 상담할 때 잊지 않도록 질문 하나를 붙여 보세요.", caption: "첫 문의",
        options: [
          { label: "제가 해 본 일을 살릴 만한 공고가 있나요?", note: "앞에서 고른 경험을 함께 이야기할 수 있어요." },
          { label: "원하는 기간에 맞는 일을 어떻게 찾나요?", note: "기간이 중요한 경우에 어울려요." },
          { label: "지원 전에 어떤 서류를 준비할까요?", note: "희망 분야를 말하고 필요한 서류를 확인하세요." },
        ] },
    ],
  },
  JOB02: {
    id: "JOB02", kind: "field", title: "기업을 살펴볼 때 쓸 면접 수첩",
    intro: "안산 중장년내일센터는 기업의 생산부서를 둘러보고 면접을 보는 행사를 진행했어요. 내 경험과 현장에서 확인할 점을 한 장에 담아 보세요.",
    artifact: "기업 탐방·면접 수첩", sourceLabel: "안산상공회의소의 동행면접 사례 보기",
    sourceUrl: "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=20187&contId=90171&menuId=9946",
    steps: [
      { mode: "sort", title: "눈으로 볼 것과 물어볼 것", instruction: "각 항목을 어디에서 확인할 수 있을지 나눠 보세요.", caption: "확인할 방법",
        groups: ["현장에서 살펴보기", "담당자에게 묻기"],
        items: [
          { label: "작업대 주변의 공간", group: 0, hint: "작업대가 어떻게 놓였는지는 눈으로 살펴볼 수 있어요." },
          { label: "처음 맡을 구체적인 일", group: 1, hint: "보이는 작업이 모두 내 일이 되는 것은 아니에요. 담당자에게 확인해요." },
          { label: "현장에 놓인 도구의 생김새", group: 0, hint: "모양은 눈으로 보고, 사용법은 담당자에게 물어볼 수 있어요." },
          { label: "신입에게 일을 가르치는 방식", group: 1, hint: "누가 어떻게 알려 주는지는 질문으로 확인해요." },
        ] },
      { mode: "pick", title: "면접 때 들려줄 경험 꺼내기", instruction: "실제로 해 본 일과 가장 가까운 예를 하나 고르세요.", caption: "소개하고 싶은 경험",
        options: [
          { label: "정해진 기준에 따라 빠진 것을 찾아냈어요", note: "무엇을 확인했는지 한 가지 떠올려 보세요." },
          { label: "낯선 일을 배워서 혼자 마무리했어요", note: "처음 배울 때 도움이 된 방법을 떠올려 보세요." },
          { label: "여럿이 맡은 일의 순서를 조율했어요", note: "내가 직접 정리한 부분을 떠올려 보세요." },
          { label: "내 경험을 더 생각해 볼래요", note: "직장 밖에서 해 본 일도 나중에 떠올려 볼 수 있어요." },
        ] },
      { mode: "pack", title: "내 수첩에 질문 두기", instruction: "일을 시작하기 전에 답을 듣고 싶은 질문을 한두 개 고르세요.", caption: "기업에 물을 질문", min: 1, limit: 2,
        options: [
          { label: "처음 맡는 업무는 무엇인가요?", note: "공고의 직종 이름만으로 알기 어려운 부분이에요." },
          { label: "처음 쓰는 도구는 어떻게 익히나요?", note: "현장에서 본 도구와 연결해 물어볼 수 있어요." },
          { label: "제가 해 본 일은 어떤 업무에 도움이 될까요?", note: "앞에서 골라 놓은 경험을 함께 떠올리세요." },
          { label: "혼자 하는 일과 함께 하는 일은 어떻게 나뉘나요?", note: "어떤 방식으로 협력하는지 알아볼 수 있어요." },
        ] },
    ],
  },
  JOB03: {
    id: "JOB03", kind: "workshop", title: "손님이 읽기 쉬운 메뉴판 만들기",
    intro: "지역 상인 특강에서는 대표 메뉴 개발과 손님 응대를 다뤘어요. 연습용 메뉴인 들깨버섯죽으로 한 줄 메뉴판을 만들어 보세요.",
    artifact: "들깨버섯죽 메뉴판 초안", sourceLabel: "안산 상인 아카데미의 실제 강의 내용 보기",
    sourceUrl: "https://amrf.or.kr/재단소식/보도자료/?mod=document&pageid=1&uid=411",
    steps: [
      { mode: "sort", title: "메뉴 정보를 두 칸에 놓기", instruction: "들깨버섯죽에 관한 예시 카드를 알맞은 칸에 놓으세요.", caption: "메뉴판 재료",
        groups: ["음식 설명", "주문 안내"],
        items: [
          { label: "표고버섯과 들깨를 넣은 죽", group: 0, hint: "들어간 재료를 설명하는 말이에요." },
          { label: "한 그릇씩 주문", group: 1, hint: "손님이 주문할 수 있는 단위를 알려 줘요." },
          { label: "고소한 맛", group: 0, hint: "먹기 전에 맛을 떠올릴 수 있는 말이에요." },
          { label: "포장 가능", group: 1, hint: "어떻게 받아 갈 수 있는지 알려 줘요." },
        ] },
      { mode: "pick", title: "메뉴 이름 아래 한 줄 넣기", instruction: "지나가는 손님에게 먼저 보여 줄 설명을 고르세요.", caption: "첫 줄",
        options: [
          { label: "들깨의 고소한 맛을 담은 버섯죽", note: "어떤 맛인지 궁금한 손님에게 보여 줄 문구예요." },
          { label: "표고버섯과 들깨로 끓인 죽", note: "어떤 재료를 쓰는지 먼저 알리는 문구예요." },
        ] },
      { mode: "pack", title: "주문할 때 필요한 표시 붙이기", instruction: "메뉴 설명 옆에 붙일 안내를 한두 개 골라 보세요.", caption: "주문 표시", min: 1, limit: 2,
        options: [
          { label: "한 그릇씩 주문", note: "주문 단위를 바로 읽을 수 있어요." },
          { label: "포장 가능", note: "가지고 갈 수 있는 메뉴임을 알려 줘요." },
        ] },
    ],
  },
  JOB07: {
    id: "JOB07", kind: "planner", title: "내가 바라는 일주일 짜 보기",
    intro: "인생이모작지원센터의 상담 주제에는 일, 여가, 사회공헌이 있어요. 다음 주에 해 볼 일을 골라 상담에 가져갈 계획표를 만들어 보세요.",
    artifact: "나의 일주일 활동 계획표", sourceLabel: "안산시 인생이모작 상담 안내 보기",
    sourceUrl: "https://www.ansan.go.kr/www/common/cntnts/selectContents.do?cntnts_id=www01617",
    steps: [
      { mode: "pick", title: "이번 주제 정하기", instruction: "다음 주에 조금이라도 시간을 내고 싶은 주제 하나를 고르세요.", caption: "이번 주의 중심",
        options: [
          { label: "다시 할 일 찾기", note: "경험을 정리하거나 관심 있는 공고부터 볼 수 있어요." },
          { label: "배움과 여가 시작하기", note: "배워 보고 싶은 활동을 한 가지 찾아볼 수 있어요." },
          { label: "경험을 나눌 곳 찾기", note: "도울 수 있는 일이나 함께할 모임을 떠올려 보세요." },
        ] },
      { mode: "quantity", title: "한 주에 몇 번 해 볼까요?", instruction: "부담 없이 낼 수 있는 횟수로 조절해 보세요. 쉬어 갈 활동은 0회로 두세요.", caption: "일주일에 해 볼 횟수",
        items: [
          { label: "혼자 자료 살펴보기", unit: "회", min: 0, max: 5, initial: 1, step: 1 },
          { label: "사람과 만나거나 이야기하기", unit: "회", min: 0, max: 5, initial: 1, step: 1 },
          { label: "배우거나 손으로 해 보기", unit: "회", min: 0, max: 5, initial: 0, step: 1 },
        ] },
      { mode: "pack", title: "계획을 실행할 조건 담기", instruction: "계획이 부담스러워지지 않도록 지키고 싶은 조건을 한두 개 붙이세요.", caption: "상담에서 함께 맞출 조건", min: 1, limit: 2,
        options: [
          { label: "한 번만 해 보고 계속할지 정하기", note: "처음부터 오래 약속하기 어려울 때 쓸 수 있어요." },
          { label: "집에서도 할 수 있는 일 찾기", note: "외출이 힘든 날에도 계획을 이어 갈 수 있어요." },
          { label: "비용을 확인하고 정하기", note: "참여 비용이 궁금하다는 점을 남길 수 있어요." },
          { label: "다른 사람과 함께 시작하기", note: "함께 참여할 기회가 있는지 물어보세요." },
        ] },
    ],
  },
  JOB08: {
    id: "JOB08", kind: "field", title: "김장 나눔 포장대 맡아 보기",
    intro: "안산시자원봉사센터의 김장 나눔에서는 포장과 배부도 봉사예요. 연습용 포장대에서 무엇을 챙기고 몇 통을 나눌지 정해 보세요.",
    artifact: "김장 나눔 작업 메모", sourceLabel: "안산센터의 김장 나눔 활동 사례 보기",
    sourceUrl: "https://www.ansan1365.or.kr/sub.php?id=notice&idx=2255&menukey=24&mode=view&page=1",
    steps: [
      { mode: "sort", title: "현장에서 주는 물품 나누기", instruction: "지난 행사 공지를 읽는 연습이에요. 아래 항목을 알맞은 칸에 놓으세요.", caption: "지난 행사 준비 안내",
        groups: ["센터에서 제공", "참여자가 준비"],
        items: [
          { label: "앞치마", group: 0, hint: "지난 공고에서 현장 제공 물품으로 안내했어요." },
          { label: "움직이기 편한 옷차림", group: 1, hint: "참여자가 간편한 복장을 준비하도록 안내했어요." },
          { label: "장갑", group: 0, hint: "지난 공고에서 앞치마와 함께 제공한다고 안내했어요." },
        ] },
      { mode: "quantity", title: "받을 곳마다 김치 통 놓기", instruction: "연습용 배부표예요. 두 곳에 나눌 김치 통 수를 조절하고 합계를 확인하세요.", caption: "연습용 배부 수량",
        items: [
          { label: "첫 번째 배부처", unit: "통", min: 1, max: 6, initial: 1, step: 1 },
          { label: "두 번째 배부처", unit: "통", min: 1, max: 6, initial: 1, step: 1 },
        ] },
      { mode: "pick", title: "해 보고 싶은 역할 표시하기", instruction: "포장대에서 해 본 일을 떠올리며 실제 활동에서 맡아 보고 싶은 역할을 고르세요.", caption: "관심 있는 역할",
        options: [
          { label: "김치를 통에 담아 포장하기", note: "포장하는 일을 해 보고 싶다고 말할 수 있어요." },
          { label: "버무릴 재료를 옮기기", note: "어떤 물품을 옮기는지 담당자에게 물어보세요." },
          { label: "포장한 김치를 나누어 주기", note: "받을 곳별 수량을 확인하는 일에 관심 있다고 말할 수 있어요." },
        ] },
    ],
  },
  JOB11: {
    id: "JOB11", kind: "kiosk", title: "소상공인24에서 필요한 창구 찾기",
    intro: "소상공인24의 실제 메뉴 이름을 이용해 연습해요. 가게에 필요한 공고를 찾고 신청 전에 볼 부분을 표시해 보세요.",
    artifact: "가게 지원사업 확인 메모", sourceLabel: "공식 소상공인24 열기",
    sourceUrl: "https://www.sbiz24.kr/",
    steps: [
      { mode: "sort", title: "공고를 어디에서 찾을까요?", instruction: "공고를 낸 곳을 보고 알맞은 메뉴에 넣으세요.", caption: "공고를 찾을 메뉴",
        groups: ["소진공 지원사업", "지방정부 지원사업"],
        items: [
          { label: "소상공인시장진흥공단이 낸 공고", group: 0, hint: "‘소진공’은 소상공인시장진흥공단을 줄인 말이에요." },
          { label: "안산시가 낸 공고", group: 1, hint: "시는 지방정부에 속해요." },
          { label: "경기도가 낸 공고", group: 1, hint: "도에서 낸 공고는 지방정부 메뉴에서 찾아요." },
        ] },
      { mode: "pack", title: "공고에 책갈피 붙이기", instruction: "공고를 열었을 때 다시 찾아볼 부분을 두 개 고르세요.", caption: "먼저 읽을 항목", min: 2, limit: 2,
        options: [
          { label: "신청할 수 있는 대상", note: "내 업종과 지역도 포함되는지 살펴볼 부분이에요." },
          { label: "접수 기간", note: "지금 신청을 받는지 판단할 수 있어요." },
          { label: "제출할 자료", note: "미리 준비할 자료와 나중에 보낼 자료를 확인할 수 있어요." },
          { label: "접수 방법과 문의처", note: "신청할 곳과 궁금한 점을 물을 곳을 확인할 수 있어요." },
        ] },
      { mode: "pick", title: "내가 이어서 할 일", instruction: "공고를 한 번 읽고 나서 할 일을 메모에 남기세요.", caption: "다음에 할 일",
        options: [
          { label: "조건이 맞는 공고를 더 찾아보기", note: "공단 사업과 지방정부 사업을 나누어 비교할 수 있어요." },
          { label: "공고가 요구한 자료부터 챙기기", note: "실제 제출 목록은 선택한 사업의 공고에서 확인하세요." },
          { label: "모호한 조건을 문의처에 물어보기", note: "공고 이름과 책갈피로 표시한 부분을 함께 보면 물어보기 쉬워요." },
        ] },
    ],
  },
  L06_PIUM_DIRECTORY: {
    id: "L06_PIUM_DIRECTORY",
    title: "찻잔에 붙일 짧은 시",
    intro: "피움과정의 디카시 수업에서는 사물을 바라보고 짧은 시를 씁니다. 찻잔 하나를 떠올리며 나만의 시 한 편을 엮어 보세요.",
    kind: "workshop",
    artifact: "내 찻잔에 붙일 시",
    sourceLabel: "평생학습관 디카시 강좌 살펴보기",
    sourceUrl: "https://lll.ansan.go.kr/web/cop/regEduDetail.do?mId=EDUMNG_0000000001578",
    steps: [
      { mode: "pick", title: "첫 줄에 무엇을 담을까요?", instruction: "찻잔을 가까이 들여다보듯, 눈이 머무는 부분을 한 줄 골라 보세요.", caption: "첫 줄", options: [
        { label: "둥근 손잡이 안에", note: "손잡이 사이의 빈 곳에서 시작해요." },
        { label: "낡은 찻잔 바닥에", note: "오랫동안 곁에 둔 물건을 떠올려요." },
        { label: "흰 잔의 가장자리에", note: "잔의 가느다란 테두리를 따라가 봐요." },
      ] },
      { mode: "pack", title: "그 자리에 무엇이 남았나요?", instruction: "가운데에 놓을 한 줄을 담으세요. 다른 말을 담아 읽어본 뒤 바꿔도 좋아요.", caption: "가운데 줄", min: 1, limit: 1, options: [
        { label: "한 모금의 온기가 남았다", note: "따뜻한 느낌을 더해요." },
        { label: "오래된 약속 하나가 걸렸다", note: "물건에 기억을 담아요." },
        { label: "바깥의 빛이 잠시 쉬어 간다", note: "빛의 움직임을 따라가요." },
      ] },
      { mode: "pick", title: "작품에 이름을 붙여 보세요", instruction: "고른 두 줄을 소리 내어 읽어 보세요. 그 말과 어울리는 제목을 붙이세요.", caption: "작품 제목", options: [
        { label: "남겨 둔 자리", note: "비어 있는 공간을 제목에 담아요." },
        { label: "잠깐의 온도", note: "잠시 머무는 느낌을 제목에 담아요." },
        { label: "손끝에 닿는 것", note: "잔을 들 때의 감각을 제목에 담아요." },
      ] },
    ],
  },
  L15: {
    id: "L15",
    title: "독서모임에서 꺼낼 첫 질문",
    intro: "작은도서관의 북세통에서는 같은 책을 읽고 의견을 나눕니다. ANTI가 쓴 짧은 글로 작은 토론을 준비해 보세요.",
    kind: "desk",
    artifact: "내 독서모임 질문지",
    sourceLabel: "작은도서관 독서모임 소개",
    sourceUrl: "https://lll.ansan.go.kr/web/content.do?proFn=9314000",
    steps: [
      { mode: "pick", title: "밑줄 하나를 그어 보세요", instruction: "“같은 책을 읽어도 밑줄은 저마다 다르다. 모임의 재미는 그 이유를 듣는 데 있다.” 함께 읽고 싶은 대목을 고르세요.", caption: "함께 읽을 대목", options: [
        { label: "같은 책을 읽어도", note: "같은 것을 함께 읽는 경험에 밑줄을 그었어요." },
        { label: "밑줄은 저마다 다르다", note: "읽는 사람마다 마음이 가는 곳이 다르다는 말이에요." },
        { label: "그 이유를 듣는 데 있다", note: "다른 사람이 왜 골랐는지 듣는 일에 주목했어요." },
      ] },
      { mode: "sort", title: "글에 있는 말과 떠오른 생각", instruction: "글에서 직접 읽은 내용과, 읽고 나서 덧붙인 생각을 나눠 놓으세요.", caption: "토론 메모", groups: ["글에 있는 말", "덧붙인 생각"], items: [
        { label: "사람마다 밑줄이 다르다", group: 0, hint: "글에 ‘밑줄은 저마다 다르다’고 쓰여 있어요." },
        { label: "밑줄 없이 읽은 사람에게도 묻고 싶다", group: 1, hint: "밑줄이 없는 사람에 관한 이야기는 새로 덧붙인 생각이에요." },
        { label: "다른 사람이 고른 이유를 들으면 재미있다", group: 0, hint: "글의 마지막 문장을 다른 말로 옮긴 내용이에요." },
      ] },
      { mode: "pack", title: "답이 여러 개인 질문을 담으세요", instruction: "실제 모임에서 꺼내 보고 싶은 질문을 두 개까지 담으세요.", caption: "내가 건넬 질문", min: 1, limit: 2, options: [
        { label: "어디에서 읽는 속도가 느려졌나요?", note: "기억에 남은 장면을 떠올리기 좋은 질문이에요." },
        { label: "다시 읽고 싶은 문장은 무엇인가요?", note: "서로 다른 밑줄을 나란히 놓을 수 있어요." },
        { label: "같은 문장이 다르게 느껴진 적 있나요?", note: "각자 겪은 일을 나눌 여지를 둬요." },
      ] },
    ],
  },
  L16: {
    id: "L16",
    title: "네 박짜리 합주 악보 맞추기",
    intro: "평생비전센터 동아리 목록에는 사물놀이 장비통이 있어요. ANTI가 만든 네 박 손장단으로 함께 소리를 맞추는 감각을 익혀 보세요.",
    kind: "workshop",
    artifact: "내 손장단 연습 악보",
    sourceLabel: "평생비전센터 동아리 활동 보기",
    sourceUrl: "https://wm.ansan.go.kr/operation/eduClub/selectEduClubPageList.do",
    steps: [
      { mode: "sort", title: "무엇이 울리는 악기일까요?", instruction: "사물놀이 악기 네 가지를 소리가 나는 재료에 맞춰 놓으세요.", caption: "악기 묶음", groups: ["가죽이 울려요", "쇠가 울려요"], items: [
        { label: "북", group: 0, hint: "북은 팽팽하게 댄 가죽을 두드려요." },
        { label: "징", group: 1, hint: "징은 둥근 금속판을 쳐요." },
        { label: "장구", group: 0, hint: "장구는 양쪽에 댄 가죽을 두드려요." },
        { label: "꽹과리", group: 1, hint: "꽹과리는 손에 들고 치는 작은 쇠악기예요." },
      ] },
      { mode: "order", title: "손장단 악보를 맞춰 보세요", instruction: "오늘의 악보는 ‘무릎 한 번 → 손뼉 한 번 → 무릎 두 번 → 한 박 쉬기’예요. 카드를 순서대로 누르세요.", caption: "네 박 악보", items: ["무릎 한 번", "손뼉 한 번", "무릎 두 번", "한 박 쉬기"], hint: "무릎에서 시작해 손뼉으로 옮겨요. 다시 무릎을 두드리고 마지막 박에 쉬어요." },
      { mode: "pick", title: "내가 맡을 소리를 정하세요", instruction: "손장단을 한 번 더 해 보세요. 여럿이 할 때 직접 맡고 싶은 부분을 고르세요.", caption: "합주에서 맡을 부분", options: [
        { label: "무릎 장단 맡기", note: "무릎을 치는 박에만 소리를 내 보세요." },
        { label: "손뼉 장단 맡기", note: "다른 박에는 기다렸다가 손뼉이 나올 때 맞춰요." },
        { label: "박자 세기", note: "하나부터 넷까지 세면서 쉬는 박도 같은 길이로 맞춰요." },
      ] },
    ],
  },
  C_BOOK: {
    id: "C_BOOK",
    title: "동네책방에 내 작은 서가 꾸미기",
    intro: "마을상점생활관이 소개한 ‘생활책’으로 꾸미는 가상 책장이에요. 모임에서 함께 펼쳐 보고 싶은 두 권을 골라 서가 이름표를 만들어 보세요.",
    kind: "workshop",
    artifact: "내 두 권짜리 서가",
    sourceLabel: "마을상점생활관 생활책 둘러보기",
    sourceUrl: "https://www.insidethevillage.com/index",
    steps: [
      { mode: "pack", title: "함께 펼쳐 볼 두 권을 꽂으세요", instruction: "실제 책방 목록에 실린 제목이에요. 마음에 걸리는 두 권을 골라 한 칸에 나란히 꽂으세요.", caption: "서가에 꽂은 두 권", min: 2, limit: 2, options: [
        { label: "단정한 반복이 나를 살릴 거야", note: "‘반복’이라는 단어에서 무엇이 떠오르나요?" },
        { label: "우리가 서로를", note: "‘서로’ 뒤에 어떤 말이 올지 상상해 보세요." },
        { label: "천 개의 파랑", note: "제목을 색으로 그려 볼 수 있어요." },
        { label: "슬픈 세상의 기쁜 말", note: "‘슬픈’과 ‘기쁜’이 한 제목에 있어요." },
      ] },
      { mode: "pick", title: "두 책 사이에 이름표를 붙이세요", instruction: "두 제목을 보고 떠오른 느낌에 맞게 내 서가의 이름을 정하세요.", caption: "서가 이름표", options: [
        { label: "일상을 다르게 보는 책장", note: "평소와 다른 시선으로 읽자는 이름표예요." },
        { label: "말 한마디가 남는 책장", note: "곱씹고 싶은 말을 찾아보자는 이름표예요." },
        { label: "뜻밖의 이웃이 된 두 권", note: "닮지 않은 두 책도 나란히 놓고 읽을 수 있어요." },
      ] },
      { mode: "pick", title: "책장 앞에 권하는 말을 남기세요", instruction: "누군가 두 권 앞에 멈추면 어떤 방식으로 읽어 보라고 권하고 싶으세요?", caption: "책장 앞에 붙일 쪽지", options: [
        { label: "두 제목에서 마음에 걸리는 낱말을 골라 보세요.", note: "표지만 보고도 대화를 시작할 수 있어요." },
        { label: "첫 문장을 나란히 읽어 보세요.", note: "글의 첫인상을 서로 들려줄 수 있어요." },
        { label: "한 권씩 골라 읽고 바꿔 보세요.", note: "다음에 만나 서로 다르게 읽은 대목을 나눠요." },
      ] },
    ],
  },
  C_ECO: {
    id: "C_ECO",
    title: "수달 흔적을 관찰 노트에 옮기기",
    intro: "안산환경운동연합은 물가에 남은 수달 흔적을 사진으로 기록했어요. 공개 기록의 사진 제목을 살펴보고, 확인한 것과 더 알아볼 것을 나눠 보세요.",
    kind: "field",
    artifact: "내 하천 생태 관찰 노트",
    sourceLabel: "안산환경운동연합의 실제 관찰 사진 보기",
    sourceUrl: "https://ansan.ekfem.or.kr/posts/0ktMwK7",
    steps: [
      { mode: "pack", title: "공개 기록에서 단서를 담으세요", instruction: "단체가 사진에 붙인 두 제목이에요. 관찰 노트에 옮길 단서를 하나 이상 담으세요.", caption: "기록에서 가져온 사진 제목", min: 1, limit: 2, options: [
        { label: "수달 배설물", note: "사진에 붙은 이름을 기록해요." },
        { label: "수달 휴식흔", note: "‘휴식흔’은 쉬어 간 흔적이라는 뜻이에요." },
      ] },
      { mode: "sort", title: "어디까지 알 수 있을까요?", instruction: "두 사진 제목으로 확인할 수 있는 말과 더 살펴봐야 할 말을 나누세요.", caption: "확인한 내용과 남은 질문", groups: ["제목으로 확인했어요", "더 확인해야 해요"], items: [
        { label: "배설물을 담은 사진이 있다", group: 0, hint: "공개 기록의 사진 제목에 배설물이 나와요." },
        { label: "같은 수달이 두 흔적을 남겼다", group: 1, hint: "두 사진의 제목에는 같은 개체인지 나와 있지 않아요." },
        { label: "수달이 쉬어 간 흔적 사진이 있다", group: 0, hint: "‘수달 휴식흔’이라는 제목이 있어요." },
        { label: "이곳에 사는 수달의 수를 알았다", group: 1, hint: "흔적 사진만으로 개체 수를 셀 수 없어요." },
      ] },
      { mode: "pick", title: "다음 관찰에 남길 질문을 고르세요", instruction: "다른 날의 기록과 비교할 때 다시 살펴보고 싶은 것을 하나 남기세요.", caption: "다음 기록에서 확인할 점", options: [
        { label: "같은 종류의 흔적이 또 기록됐을까?", note: "다음 공개 기록의 사진 설명과 대조할 수 있어요." },
        { label: "다른 종류의 흔적도 관찰됐을까?", note: "이번 기록과 다른 점을 찾아볼 수 있어요." },
      ] },
    ],
  },
  L08_MIND_COUNSELING: {
    id: "L08_MIND_COUNSELING",
    title: "첫 상담 문의 메모 만들기",
    intro: "상담을 어떻게 신청하는지 궁금할 때 쓸 메모를 만들어요. 속사정을 쓰지 않고 준비된 낱말로 연습해요.",
    kind: "desk",
    artifact: "첫 상담 문의 메모",
    sourceLabel: "안산시정신건강복지센터 이용 안내",
    sourceUrl: "https://wmind.org/sub.php?menukey=12",
    steps: [
      {
        mode: "sort", title: "메모에 남길 내용 가리기",
        instruction: "예약 방법만 묻는 짧은 메모예요. 각 쪽지를 어디에 둘지 골라 보세요.",
        caption: "문의 메모 정리", groups: ["문의할 내용", "메모에서 빼기"],
        items: [
          { label: "예약을 신청하는 방법", group: 0, hint: "이번 문의에서 알아내려는 내용이에요." },
          { label: "지인과 나눈 메시지 원문", group: 1, hint: "다른 사람의 사적인 대화를 적지 않아도 예약 방법을 물을 수 있어요." },
          { label: "일정을 바꾸는 방법", group: 0, hint: "예약에 대해 센터에 물어볼 수 있는 내용이에요." },
          { label: "지인의 이름과 연락처", group: 1, hint: "이 메모에는 다른 사람의 신상 정보를 담을 필요가 없어요." },
        ],
      },
      {
        mode: "pack", title: "묻고 싶은 질문 담기",
        instruction: "메모를 보며 금방 찾을 수 있도록 질문을 한두 개만 남겨 보세요.",
        caption: "먼저 물을 질문", min: 1, limit: 2,
        options: [
          { label: "예약 후 연락은 어떻게 받나요?", note: "신청 뒤의 절차를 물어요." },
          { label: "상담 전에 준비할 것이 있나요?", note: "미리 챙길 것을 물어요." },
          { label: "상담에서 나눈 내용은 어떻게 다루나요?", note: "개인정보가 궁금할 때 쓸 질문이에요." },
        ],
      },
      {
        mode: "pick", title: "메모를 쓸 곳 정하기",
        instruction: "센터가 안내하는 두 가지 예약 방법 중 메모와 함께 살펴볼 쪽을 골라요.",
        caption: "문의할 방법",
        options: [
          { label: "전화로 예약 문의", note: "메모에 남긴 질문을 통화할 때 참고할 수 있어요." },
          { label: "홈페이지 상담 예약", note: "센터 공식 홈페이지에서 신청 항목을 직접 살펴볼 수 있어요." },
        ],
      },
    ],
  },
  L08_FAMILY_COUNSELING: {
    id: "L08_FAMILY_COUNSELING",
    title: "가족과 꺼낼 이야기 한 장",
    intro: "집안일 분담을 예로 들어, 있었던 일과 바라는 변화를 두 칸에 정리해요. 가족상담에서 다뤄 보고 싶은 주제를 고르는 연습이에요.",
    kind: "workshop",
    artifact: "가족 대화 준비 카드",
    sourceLabel: "안산시건강가정지원센터 가족상담 문의",
    sourceUrl: "https://ansan.familynet.or.kr/center/lay1/program/S295T315C321/center_info/view.do",
    steps: [
      {
        mode: "sort", title: "있었던 일과 바람 나누기",
        instruction: "집안일 쪽지를 읽고, 이미 일어난 일인지 앞으로 바라는 일인지 골라요.",
        caption: "두 칸으로 나눈 이야기", groups: ["있었던 일", "바라는 변화"],
        items: [
          { label: "설거지 담당을 따로 정하지 않았다", group: 0, hint: "그동안 어떻게 해 왔는지 적은 내용이에요." },
          { label: "장보기 목록을 함께 적으면 좋겠다", group: 1, hint: "앞으로 해 보고 싶은 행동이에요." },
          { label: "분리수거 날짜를 서로 다르게 기억했다", group: 0, hint: "이미 있었던 일을 설명해요." },
          { label: "집안일을 각자 하나씩 맡으면 좋겠다", group: 1, hint: "다음번에 바뀌었으면 하는 점이에요." },
        ],
      },
      {
        mode: "pick", title: "함께 정할 일 하나 꺼내기",
        instruction: "세 가지 집안일 중 다음 대화에서 함께 정할 주제 하나를 고르세요.",
        caption: "함께 정할 주제",
        options: [
          { label: "설거지를 서로 나누는 방법", note: "누가 어떤 날 맡을지 의논할 수 있어요." },
          { label: "분리수거를 잊지 않는 방법", note: "함께 확인할 표시를 정할 수 있어요." },
          { label: "장보기 목록을 함께 쓰는 방법", note: "누가 어디에 적을지 정할 수 있어요." },
        ],
      },
      {
        mode: "pack", title: "대화를 도울 약속 붙이기",
        instruction: "고른 주제를 한 사람이 다 말하지 않도록, 함께 지켜 보고 싶은 약속을 한두 개 붙여요.",
        caption: "대화 중 지켜 볼 약속", min: 1, limit: 2,
        options: [
          { label: "각자 바라는 점 하나씩 말하기", note: "서로 무엇을 원하는지 듣는 데 쓸 약속이에요." },
          { label: "들은 내용을 내 말로 확인하기", note: "어떻게 이해했는지 두 사람이 확인하는 약속이에요." },
          { label: "마지막에 함께 해볼 일 하나 정하기", note: "대화를 마칠 때 작은 행동 하나를 남겨요." },
        ],
      },
    ],
  },
  H10: {
    id: "H10",
    title: "아이돌봄 부탁 목록 꾸리기",
    intro: "아이를 돌볼 때 부탁할 일을 나눈 뒤, 예시 하루에 필요한 돌봄 시간과 일을 한 장에 담아요.",
    kind: "planner",
    artifact: "하루 돌봄 요청 메모",
    sourceLabel: "아이돌봄서비스 시간제 돌봄 범위와 이용 시간",
    sourceUrl: "https://www.idolbom.go.kr/front/srvcGuide/prttm",
    steps: [
      {
        mode: "sort", title: "어느 서비스에서 부탁할 수 있을까요?",
        instruction: "기본형에서 할 수 있는 일, 종합형에 더해지는 일, 두 유형 모두에서 맡기기 어려운 일을 나눠요.",
        caption: "돌봄 업무 구분", groups: ["기본형부터 가능", "종합형에 추가", "두 유형 밖의 일"],
        items: [
          { label: "준비해 둔 아이 밥 데우기", group: 0, hint: "만들어 둔 아이 식사를 데우는 일은 기본형에서 가능해요." },
          { label: "돌보는 아이의 옷 세탁하기", group: 1, hint: "아이의 옷과 관련된 가사는 종합형에 더해져요." },
          { label: "어른들 저녁상 차리기", group: 2, hint: "종합형에서 추가할 수 있는 식사 준비는 돌보는 아이를 위한 일이에요." },
          { label: "아이와 그림책 읽기", group: 0, hint: "아이와 함께하는 놀이는 기본형에 들어가요." },
        ],
      },
      {
        mode: "quantity", title: "한 번에 부탁할 시간 맞추기",
        instruction: "시간제는 한 번에 두 시간부터 이용하고 반 시간씩 더할 수 있어요. 단추를 눌러 이번 예시의 시간을 맞춰 보세요.",
        caption: "한 번에 이용할 시간",
        items: [{ label: "돌봄 한 번", unit: "시간", min: 2, max: 6, initial: 2, step: 0.5 }],
      },
      {
        mode: "pack", title: "전달할 일 두 가지까지 담기",
        instruction: "예시 하루에 꼭 필요한 일을 골라요. 일 옆에서 해당하는 유형도 확인할 수 있어요.",
        caption: "부탁할 일", min: 1, limit: 2,
        options: [
          { label: "기본형부터 · 하원 동행", note: "등·하원 보조는 기본형과 종합형에 들어가요." },
          { label: "기본형부터 · 준비된 간식 챙기기", note: "준비한 간식을 아이에게 챙겨 주는 일이에요." },
          { label: "종합형 · 아이 식사 조리", note: "아이 먹을 음식을 직접 조리하는 일은 종합형에 추가돼요." },
          { label: "종합형 · 아이 옷 세탁", note: "아이 옷을 세탁기에 넣고 정리하는 일은 종합형에 추가돼요." },
        ],
      },
    ],
  },
  H13: {
    id: "H13",
    title: "식판으로 만드는 영양상담 메모",
    intro: "안산서부건강생활지원센터에는 영양상담을 맡은 상담실이 있어요. 예시 식판을 채우고 어떤 점을 물어볼지 정해 보세요.",
    kind: "workshop",
    artifact: "한 끼 영양상담 메모",
    sourceLabel: "단원보건소 서부건강생활지원센터 안내",
    sourceUrl: "https://ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=health05",
    steps: [
      {
        mode: "pack", title: "예시 식판 채우기",
        instruction: "상담에서 예로 들 한 끼예요. 먹거리 카드를 세 가지까지 식판에 담아요.",
        caption: "예시 한 끼", min: 1, limit: 3,
        options: [
          { label: "밥", note: "밥 한 그릇을 식사 메모에 올려요." },
          { label: "국", note: "국 한 그릇을 식사 메모에 올려요." },
          { label: "두부 반찬", note: "두부 반찬을 식사 메모에 올려요." },
          { label: "채소 반찬", note: "채소 반찬을 식사 메모에 올려요." },
          { label: "과일", note: "과일을 식사 메모에 올려요." },
        ],
      },
      {
        mode: "sort", title: "메모의 두 칸에 쪽지 놓기",
        instruction: "무엇을 먹었는지 기록한 쪽지와 상담에서 답을 듣고 싶은 쪽지를 구분해요.",
        caption: "식사 메모 정리", groups: ["먹은 내용", "물어볼 내용"],
        items: [
          { label: "간식으로 과일을 먹음", group: 0, hint: "먹은 것을 적은 기록이에요." },
          { label: "반찬은 어떻게 골라 볼까?", group: 1, hint: "상담에서 의견을 들으려는 질문이에요." },
          { label: "밥과 국을 함께 먹음", group: 0, hint: "식탁에 올린 음식을 적은 기록이에요." },
          { label: "한 끼를 어떻게 기록해 둘까?", group: 1, hint: "기록 방법에 대해 설명을 듣고 싶은 질문이에요." },
        ],
      },
      {
        mode: "pick", title: "식판 옆에 질문 붙이기",
        instruction: "완성한 식판을 가리키며 물어볼 질문 하나를 붙이세요.",
        caption: "상담에서 꺼낼 질문",
        options: [
          { label: "이 식판에서 어떤 점부터 살펴볼까요?", note: "준비한 한 끼를 가지고 이야기를 시작할 수 있어요." },
          { label: "다른 반찬으로 바꾸려면 어떤 점을 볼까요?", note: "다음번 식사에 적용할 점을 물을 수 있어요." },
          { label: "다음에 식사 기록을 어떻게 준비할까요?", note: "기록 분량과 방법에 대해 함께 상의할 수 있어요." },
        ],
      },
    ],
  },
  H20_INFO: {
    id: "H20_INFO", title: "식탁에 필요한 도움 나누기", kind: "planner",
    intro: "끼니는 같아도 필요한 손길은 달라요. 예시 집안일을 나누고 동에 문의할 식사 도움 메모를 만들어 보세요.",
    artifact: "식사 도움 문의 메모",
    sourceLabel: "경기도 누구나돌봄 지원 내용 보기",
    sourceUrl: "https://www.gg.go.kr/ggcare/hmpg/srap/appl/srapInfoForm.do",
    steps: [
      {
        mode: "sort", title: "도움 카드를 알맞은 칸에 놓으세요", caption: "두 지원의 차이",
        instruction: "집 안에서 함께 할 일과 조리된 음식을 받아 먹는 일을 나눠 보세요.",
        groups: ["생활돌봄", "식사지원"],
        items: [
          { label: "집에서 식사 준비 돕기", group: 0, hint: "집 안에서 가사 일을 돕는 생활돌봄이에요." },
          { label: "준비된 도시락 받기", group: 1, hint: "먹을 수 있게 조리한 끼니를 제공하는 식사지원이에요." },
          { label: "식사 뒤 설거지 돕기", group: 0, hint: "그릇을 씻는 일은 가사활동에 들어가요." },
          { label: "조리된 죽 제공받기", group: 1, hint: "식사지원은 일반식과 죽식을 안내해요." },
        ],
      },
      {
        mode: "pick", title: "먼저 부탁할 일을 정하세요", caption: "먼저 문의할 일",
        instruction: "앞에서 두 칸으로 나눈 일 중 하나를 메모 맨 위에 놓아 보세요.",
        options: [
          { label: "집에서 식사 차리기", note: "생활돌봄 중 가사활동 지원을 문의해요." },
          { label: "식사 후 설거지하기", note: "생활돌봄에서 맡을 수 있는 일을 확인해요." },
          { label: "조리된 식사 받기", note: "식사지원의 제공 방식과 가능한 식사를 확인해요." },
        ],
      },
      {
        mode: "pack", title: "동에 물어볼 질문을 담으세요", caption: "함께 확인할 내용",
        instruction: "꼭 확인하고 싶은 내용을 두 가지까지 골라요. 지원 여부와 비용은 담당자가 안내해요.",
        min: 1, limit: 2, options: [
          { label: "언제부터 이용할 수 있나요?", note: "시작 가능한 때를 묻는 질문이에요." },
          { label: "제가 부담할 비용이 있나요?", note: "각 상황에 맞는 본인 부담을 확인해요." },
          { label: "몇 번까지 이용할 수 있나요?", note: "필요한 지원의 이용 한도를 확인해요." },
          { label: "신청할 때 무엇이 필요한가요?", note: "미리 마련할 자료를 확인해요." },
        ],
      },
    ],
  },
  H22: {
    id: "H22", title: "쉼터 원예 체험, 작은 화단 꾸미기", kind: "workshop",
    intro: "단원치매안심센터 쉼터에는 원예 활동이 있어요. 종이꽃으로 탁상 화단을 꾸미는 ANTI의 예시 활동을 해 보세요.",
    artifact: "탁상 화단 작품표",
    sourceLabel: "단원치매안심센터 쉼터·가족지원 안내",
    sourceUrl: "https://www.ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=C0001702",
    steps: [
      {
        mode: "pick", title: "화단 바탕을 고르세요", caption: "화단 바탕",
        instruction: "작품을 만들 종이 받침을 한 장 고르세요.",
        options: [
          { label: "길쭉한 창가 화단", note: "긴 받침 위에 꽃이 나란히 놓여요." },
          { label: "둥근 탁자 화단", note: "둥근 받침 가운데로 꽃을 모을 수 있어요." },
        ],
      },
      {
        mode: "quantity", title: "종이꽃과 잎을 배치하세요", caption: "작품에 담은 재료",
        instruction: "더하기와 빼기를 눌러 꽃송이와 초록 잎의 수를 정하세요.",
        items: [
          { label: "노란 종이꽃", unit: "송이", min: 1, max: 5, initial: 1, step: 1 },
          { label: "분홍 종이꽃", unit: "송이", min: 0, max: 5, initial: 1, step: 1 },
          { label: "초록 종이 잎", unit: "장", min: 0, max: 5, initial: 1, step: 1 },
        ],
      },
      {
        mode: "pick", title: "화단에 이름표를 꽂으세요", caption: "작품 이름",
        instruction: "완성한 화단에 어울리는 이름을 하나 붙여 주세요.",
        options: [
          { label: "창가에 온 봄", note: "계절을 떠올리는 이름표예요." },
          { label: "햇살 한 줌", note: "빛을 떠올리는 이름표예요." },
          { label: "내 책상 작은 정원", note: "작품을 둘 자리를 담은 이름표예요." },
        ],
      },
    ],
  },
  H23: {
    id: "H23", title: "식품 포장지 두 장 비교하기", kind: "workshop",
    intro: "안산 등록교육센터는 식습관 상담과 영양실습을 운영해요. 연습용 영양표시를 같은 양으로 맞춰 읽어 보세요.",
    artifact: "영양표시 비교 메모",
    sourceLabel: "안산 등록교육센터 영양교육·실습 안내",
    sourceUrl: "https://www.ansan.ac.kr/www/content/135",
    steps: [
      {
        mode: "sort", title: "표시가 어느 양에 해당할까요?", caption: "포장지의 표시 기준",
        instruction: "포장지에 적힌 기준을 읽고 표시 카드를 나눠 주세요. 숫자는 체험용 예시예요.",
        groups: ["한 봉지 기준", "반 봉지 기준"],
        items: [
          { label: "가 제품 · 한 봉지당 나트륨 400mg", group: 0, hint: "‘한 봉지당’은 포장 전체에 든 양이에요." },
          { label: "나 제품 · 반 봉지당 나트륨 250mg", group: 1, hint: "이 숫자는 반 봉지에 들어 있는 양이에요." },
          { label: "다 제품 · 한 봉지당 나트륨 300mg", group: 0, hint: "한 봉지 전체라고 표시되어 있어요." },
        ],
      },
      {
        mode: "order", title: "한 봉지 기준으로 비교해 보세요", caption: "한 봉지당 나트륨이 적은 순서",
        instruction: "나 제품 한 봉지는 반 봉지 두 개분이에요. 한 봉지에 든 나트륨이 적은 제품부터 누르세요.",
        items: ["다 제품 · 한 봉지 300mg", "가 제품 · 한 봉지 400mg", "나 제품 · 반 봉지 250mg"],
        hint: "나 제품은 250mg을 두 번 더한 500mg이에요. 세 제품을 300mg, 400mg, 500mg 순으로 놓아요.",
      },
      {
        mode: "pack", title: "영양상담 때 볼 질문을 남기세요", caption: "다음에 펼쳐 볼 질문",
        instruction: "다른 포장지를 읽을 때 헷갈릴 것 같은 부분을 두 가지까지 담아 보세요.",
        min: 1, limit: 2, options: [
          { label: "한 봉지에 몇 회분이 있나요?", note: "포장 전체와 1회분이 다른 제품을 비교할 때 써요." },
          { label: "먹은 양에 맞춰 어떻게 계산하나요?", note: "포장에 적힌 기준과 실제 먹은 양을 맞출 때 써요." },
          { label: "크기가 다른 두 제품을 어떻게 비교하나요?", note: "같은 무게로 맞춰 볼 때 가져갈 질문이에요." },
        ],
      },
    ],
  },
  H24: {
    id: "H24", title: "담배가 떠오를 때 꺼내는 행동 카드", kind: "planner",
    intro: "금연 상담에서 이야기할 예시 상황을 하나 고르고, 그때 대신 해 볼 행동과 도움받을 방법을 묶어 보세요.",
    artifact: "상황별 금연 행동 카드",
    sourceLabel: "상록수보건소 금연 상담 이용 안내",
    sourceUrl: "https://www.ansan.go.kr/snshealth/common/cntnts/selectContents.do?cntnts_id=C0001775",
    steps: [
      {
        mode: "pick", title: "카드에 넣을 상황을 고르세요", caption: "이런 순간에",
        instruction: "연습할 장면 하나를 골라 문장의 앞부분을 완성해요.",
        options: [
          { label: "식탁에서 일어났을 때", note: "식사를 마친 장면을 카드에 놓아요." },
          { label: "커피를 마시며 쉴 때", note: "잠시 쉬는 장면을 카드에 놓아요." },
          { label: "주변 사람이 담배를 꺼낼 때", note: "다른 사람과 함께 있는 장면을 카드에 놓아요." },
        ],
      },
      {
        mode: "pack", title: "대신 해 볼 행동을 담으세요", caption: "바로 해 볼 행동",
        instruction: "앞에서 고른 장면을 떠올리며 손쉽게 할 수 있는 행동을 두 가지까지 담아요.",
        min: 1, limit: 2, options: [
          { label: "물을 천천히 마시기", note: "물을 마시는 동안 잠시 다른 일에 집중해요." },
          { label: "담배 연기 없는 자리로 옮기기", note: "공간을 바꾸는 행동을 카드에 넣어요." },
          { label: "가까운 사람에게 안부 전화하기", note: "대화로 관심을 돌리는 행동이에요." },
        ],
      },
      {
        mode: "pick", title: "도움이 필요할 때 쓸 방법을 붙이세요", caption: "혼자 하기 어려운 날에는",
        instruction: "마지막 칸에 상록수 금연클리닉과 연결할 방법을 하나 붙이세요.",
        options: [
          { label: "전화로 상담 가능 여부 묻기", note: "공식 안내에서 금연클리닉 전화번호를 확인할 수 있어요." },
          { label: "카카오톡으로 이용 방법 묻기", note: "공식 안내의 채널 연결 방법을 이용해요." },
          { label: "방문 상담 방법 확인하기", note: "공식 안내에서 상담 장소와 운영 내용을 볼 수 있어요." },
        ],
      },
    ],
  },
  H25: {
    id: "H25", title: "조건에 맞는 검진기관 찾기", kind: "kiosk",
    intro: "연습용 기관 카드를 보고 지역과 검진 종류가 모두 맞는 곳을 찾아보세요. 실제로 검색할 조건도 한 장에 남겨요.",
    artifact: "검진기관 검색 조건표",
    sourceLabel: "공단에서 실제 검진기관 찾기",
    sourceUrl: "https://www.nhis.or.kr/nhis/healthin/retrieveExmdAdminSearch.do",
    steps: [
      {
        mode: "sort", title: "상록구에서 일반검진을 받을 곳을 찾아보세요", caption: "예시 검색 결과",
        instruction: "카드에 적힌 지역과 항목이 두 조건에 모두 맞으면 ‘찾던 곳’에 놓아요. 모두 연습용 결과예요.",
        groups: ["찾던 곳", "조건이 달라요"],
        items: [
          { label: "상록구 · 일반검진", group: 0, hint: "상록구에 있고 일반검진을 제공하는 카드예요." },
          { label: "단원구 · 일반검진", group: 1, hint: "검진 종류는 맞지만 연습에서 정한 지역은 상록구예요." },
          { label: "상록구 · 구강검진만", group: 1, hint: "지역은 맞지만 찾는 항목은 일반검진이에요." },
          { label: "상록구 · 일반검진과 구강검진", group: 0, hint: "이 카드에는 찾는 일반검진도 들어 있어요." },
        ],
      },
      {
        mode: "pick", title: "다음 검색에 쓸 지역을 고르세요", caption: "검색할 지역",
        instruction: "공단 화면에서 찾아볼 지역을 하나 고르세요. 주소를 입력할 필요는 없어요.",
        options: [
          { label: "경기도 안산시 상록구", note: "상록구에 있는 지정 기관을 찾을 때 쓰는 조건이에요." },
          { label: "경기도 안산시 단원구", note: "단원구에 있는 지정 기관을 찾을 때 쓰는 조건이에요." },
        ],
      },
      {
        mode: "pick", title: "볼 검진 항목을 붙이세요", caption: "검색할 항목",
        instruction: "찾고 싶은 항목을 하나 더해 검색 조건표를 완성해요. 조건표로 예약이 접수되지는 않아요.",
        options: [
          { label: "일반검진", note: "공단에서 이 항목을 제공하는 지정 기관을 찾아요." },
          { label: "구강검진", note: "공단에서 구강검진 항목을 선택해 지정 기관을 찾아요." },
        ],
      },
    ],
  },
} as const satisfies Record<string, Simulation>;

export const simUi = {
  practice: "연습 화면",
  start: "직접 해보기",
  progress: "{now} / {total}",
  count: "{now} / {total}개",
  selected: "고른 항목",
  packed: "담은 항목",
  range: "{min}개에서 {max}개까지 담으세요.",
  exact: "{max}개를 담으세요.",
  full: "다른 항목을 담으려면 먼저 하나를 빼 주세요.",
  empty: "여기에 고른 항목이 놓여요.",
  groupEmpty: "빈 칸",
  sortCard: "옮길 카드",
  placeCard: "카드를 끌어 놓거나 넣을 칸을 누르세요.",
  answer: "도움 보기",
  sortHint: "이 카드는 ‘{group}’ 칸에 넣어요.",
  orderHint: "다음에 놓을 카드는 ‘{item}’예요.",
  orderStart: "먼저 할 일을 골라 주세요.",
  nextSlot: "다음에 놓을 자리",
  undo: "마지막 카드 되돌리기",
  matched: "‘{item}’ 카드를 ‘{group}’ 칸에 넣었어요.",
  arranged: "‘{item}’ 카드를 놓았어요.",
  wrong: "다시 해볼 수 있어요. {hint}",
  less: "{label} 줄이기",
  more: "{label} 늘리기",
  keepValues: "이 수치로 정하기",
  kept: "수치를 정했어요.",
  total: "합계",
  pair: "{label} · {value}",
  quantity: "{n}{unit}",
  next: "다음",
  finish: "결과물 보기",
  previous: "이전 단계",
  restart: "다시 해보기",
  edit: "선택 수정하기",
  complete: "완성했어요",
  preview: "완성할 결과물",
  workSummary: "작업 중인 카드",
  blankOrder: "선택하면 여기에 표시돼요.",
  missions: "오늘의 미션",
  completedCount: "{n}개 완료",
  currentMission: "하고 있어요",
  foodTray: "내가 채운 식판",
  soundTitle: "두 소리로 리듬 쳐보기",
  soundInfo: "동그라미를 번갈아 눌러 보세요. 소리를 켜면 박자도 들려요.",
  low: "무릎 박자",
  high: "손뼉 박자",
  strokes: "{n}번 두드렸어요.",
  kind: {
    desk: "자료 정리대",
    kiosk: "터치 화면",
    workshop: "작업대",
    planner: "계획표",
    field: "관찰 기록판",
  },
} as const;

// 기관·운영기관·정부 채널의 공식 영상.
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
