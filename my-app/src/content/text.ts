import type { FieldEntry } from "@/core/field-lab";
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

export const fieldUi = {
  practice: "현장 자료 실습",
  original: "기관 자료를 바탕으로 ANTI가 구성한 연습이에요.",
  step: "실습 {now} / {total}",
  goal: "이번 작업 조건",
  inspect: "자료 펼치기",
  reviewed: "자료 {n}개 중 {read}개 살펴봤어요.",
  mark: "내 자료철에 담기",
  unmark: "자료철에서 빼기",
  folio: "내 자료철",
  emptyFolio: "조건에 맞는 자료를 펼쳐서 담아 주세요.",
  inspectAll: "자료를 모두 열어 표시된 조건을 비교해 주세요.",
  included: "담음",
  excluded: "제외",
  remaining: "남은 재료",
  arrange: "재료를 누른 뒤 넣을 칸을 누르세요. 다른 칸으로 옮길 수도 있어요.",
  selected: "고른 재료 · {name}",
  place: "여기에 놓기",
  empty: "빈 칸",
  aside: "이번에는 쓰지 않을 재료",
  putBack: "재료대로 돌려놓기",
  moved: "{piece} → {slot}",
  notPlaced: "모든 재료를 알맞은 칸에 놓아 주세요.",
  adjust: "수량 조절",
  more: "{name} 늘리기",
  less: "{name} 줄이기",
  rate: "{n}{unit}당 {v}{out}",
  part: "{n}{unit} 반영",
  tally: "현재 합계",
  short: "{n}{unit} 더 필요해요.",
  over: "{n}{unit} 줄이면 맞아요.",
  equal: "목표에 맞췄어요.",
  retry: "다시 살펴볼 부분이 있어요",
  pass: "작업 조건을 충족했어요",
  check: "작업물 확인하기",
  next: "다음 작업",
  back: "이전으로",
  finish: "완성된 결과물 보기",
  correct: "조건에 맞아요",
  revise: "다시 살펴보세요",
  sources: "이 작업에 참고한 자료",
  readSource: "원자료 열기",
  allSources: "체험에 참고한 전체 자료 {n}건",
  made: "내가 완성한 현장 실습",
  used: "화면에 반영한 내용",
  number: "{n}{unit}",
  of: "{now} / {target}{unit}",
} as const;

export const fieldNavigation = {
  open: "현장 자료로 바로 실습하기",
  next: "현장 자료 실습으로",
  edit: "현장 실습 다시 보기",
  instruments: {
    JOB01: "내 경력으로 전화 문의 카드 만들기",
    L06_PIUM_DIRECTORY: "찻잔을 찍고 내 디카시 쓰기",
    L16: "네 박을 짜고 직접 연주하기",
    C_ECO: "하천의 흔적에 자를 대고 기록하기",
    JOB11: "내가 정한 분량으로 한 접시 원가 계산하기",
    H23: "포장지를 돌려 보고 내가 먹을 양 맞추기",
    H22: "누른 꽃으로 내 팻말 꾸미기",
  },
} as const;
export const artUi = {
  photoTitle: "찻잔 한 장, 두 줄의 시",
  photoIntro: "ANTI가 그린 탁자예요. 카메라가 볼 곳을 고르고, 같은 그림에 글을 바꿔 붙여 보세요.",
  crop: "무엇을 담을까요?",
  frames: ["잔과 자국", "잔 안의 빛", "남은 물자국"],
  scenes: [
    "햇빛이 비치는 탁자 위에 빈 찻잔이 있고, 잔 옆에는 반쯤 마른 둥근 물자국이 있어요.",
    "화면을 잔 쪽으로 옮겼어요. 둥근 물자국은 사라지고, 빈 잔 안의 빛과 손잡이가 크게 보여요.",
    "화면을 물자국 쪽으로 옮겼어요. 잔은 가장자리에 조금 남고, 마른 부분과 젖은 부분이 크게 보여요.",
  ],
  guides: "구도선",
  artTitle: "제목",
  lineOne: "첫 줄 · 눈에 보이는 것",
  lineTwo: "끝줄 · 장면에서 떠오른 생각",
  originals: [
    ["떠난 자리", "탁자에 반만 마른 동그라미", "비어도 자리는 천천히 마른다"],
    ["작은 창", "잔 안쪽에 빛 한 조각", "해는 빈 곳에도 머문다"],
    ["한 바퀴", "한쪽부터 흐려지는 테두리", "사라지는 데도 시간이 든다"],
  ],
  useSample: "이 구도의 예시 글 쓰기",
  edit: "작품 글 고치기",
  editHint: "예시 문장을 그대로 두거나 내 말로 고쳐 보세요. 이 화면을 나가면 쓴 글은 지워져요.",
  proof: "내 작품 펼치기",
  returnEdit: "다시 편집하기",
  attribution: "ANTI 연습 그림",
  drumTitle: "손으로 만드는 장구 반주",
  drumIntro: "소리를 하나 고른 뒤 악보의 칸을 눌러 바꾸세요. 큰박 하나에 작은칸이 셋씩 들어가요.",
  drumHint: "처음에는 소리 없이 빛으로 박을 보여 줘요. 휴대폰을 내려놓고 따라 치려면 소리를 켜세요.",
  sounds: ["덩", "쿵", "덕", "쉼"],
  hands: ["양손으로 양 무릎", "왼손으로 왼 무릎", "오른손으로 오른 무릎", "손은 쉬고 박은 세기"],
  chooseSound: "넣을 소리",
  soundToggle: "장구 연습음",
  on: "켜짐",
  off: "꺼짐",
  board: "내 반주 악보",
  beat: "{n}박",
  cell: "{beat}박 {part}번째 칸, {sound}",
  play: "내 장단 한 번 연주하기",
  stop: "연주 멈추기",
  reset: "예시 악보 다시 놓기",
  finish: "네 박을 모두 연주했어요.",
  quiet: "이 기기에서는 빛나는 박을 보며 연주해요.",
  tap: "칸에 놓을 소리",
} as const;

export const healthUi = {
  labelTitle: "포장을 뒤집어 같은 양을 비교해요",
  labelIntro: "앞면이 비슷한 두 과자예요. 포장에 인쇄된 기준이 달라요. 뒷면에서 같은 양의 숫자를 맞춰 보세요.",
  foodA: "보리 크래커",
  foodB: "쌀 크래커",
  originA: "포장에 적힌 기준은 25g당",
  originB: "포장에 적힌 기준은 100g당",
  printed: "열량 {e}kcal · 나트륨 {s}mg",
  nutrition: "영양정보",
  weight: "한 봉지 100g",
  energy: "열량",
  salt: "나트륨",
  sugars: "당류",
  grams: "{n}g",
  kcal: "{n}kcal",
  mg: "{n}mg",
  serving: "1회분",
  whole: "한 봉지",
  measured: "덜어낸 양",
  basis: "두 포장의 표시 기준",
  amount: "이만큼 덜었어요",
  portionCount: "{n}조각 · {g}g",
  onePiece: "한 조각은 25g이에요.",
  less: "한 조각 덜기",
  more: "한 조각 더하기",
  onLabel: "{g}g 기준으로 환산",
  compare: "같은 양일 때 나트륨이 더 적은 쪽은 어느 과자일까요?",
  right: "{g}g으로 맞추면 쌀 크래커가 {a}mg, 보리 크래커가 {b}mg이에요. 쌀 크래커 쪽이 {gap}mg 적어요.",
  wrong: "포장에 인쇄된 숫자만 보면 기준이 달라요. 같은 {g}g에서 두 나트륨 줄을 다시 비교해 보세요.",
  example: "ANTI가 만든 연습용 포장이에요. 수치는 예시예요.",
  tagTitle: "눌러 말린 꽃으로 바질 팻말을 꾸며요",
  tagIntro: "농촌진흥청의 압화 이름표처럼 꽃을 고르고 놓을 자리를 눌러 보세요. 자리를 다시 눌러 모양을 바꿀 수 있어요.",
  plant: "바질",
  flowerTypes: ["둥근 꽃", "별꽃", "작은 잎"] as const,
  positions: ["왼쪽 위", "오른쪽 위", "왼쪽 아래", "오른쪽 아래"] as const,
  clearOne: "꽃 떼기",
  chooseTool: "놓을 재료",
  empty: "빈 자리",
  mark: "{place} · {material}",
  board: "네 모서리를 눌러 꾸미는 바질 팻말",
  placed: "{n}곳에 장식했어요.",
  seal: "투명 시트로 마감하기",
  finished: "바질 이름이 보이도록 압화 팻말을 완성했어요.",
  editTag: "시트를 걷고 다시 꾸미기",
  tagNote: "실제 활동에서는 눌러 말린 꽃을 소량의 풀로 고정한 뒤 투명 시트로 덮어요.",
} as const;

export const jobPracticeText = {
  title: "내 일자리 문의 카드",
  intro: "찾는 일과 해 본 일을 고르면 전화할 때 볼 문장을 만들 수 있어요.",
  step: "{now} / 3",
  goalLabel: "어떤 일자리를 먼저 알아볼까요?",
  goals: [
    { key: "short", name: "단기 일자리", detail: "기간을 정해 일하고 싶어요.", sentence: "기간을 정해 일하는 자리를 알아보고 있습니다." },
    { key: "public", name: "공공 일자리", detail: "공공기관이 모집하는 일을 알고 싶어요.", sentence: "공공 일자리의 모집 정보를 알아보고 있습니다." },
    { key: "long", name: "장기 재취업", detail: "오래 일할 직장을 찾고 있어요.", sentence: "오랫동안 일할 수 있는 직장을 알아보고 있습니다." },
  ],
  next: "다음",
  details: "희망하는 업무와 해 본 일",
  roleLabel: "어떤 업무를 하고 싶으세요?",
  pickRole: "희망 업무 선택",
  roles: [
    { key: "vehicles", name: "차량 이동·입출고 관리", source: "안산 일자리센터 행사 참여기업의 지난 고용24 공고", url: "https://www.work24.go.kr/wk/a/b/1500/empDetailAuthView.do?infoTypeCd=VALIDATION&infoTypeGroup=tb_workinfoworknet&wantedAuthNo=KJKP002609300010" },
    { key: "pack", name: "식품 용기 포장", source: "안산 채용박람회 참여업체의 방송 인터뷰", url: "https://news.sbs.co.kr/news/endPage.do?news_id=N1008804163" },
    { key: "forklift", name: "지게차 물류 작업", source: "안산시의 지난 지게차 실무교육과 취업 연계 결과", url: "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1678485" },
  ],
  roleNote: "안산의 지난 채용·취업 연계 사례예요. 현재 모집 여부와 공공·단기 일자리 운영 여부는 센터에서 확인해요.",
  other: "기타 · 직접 쓰기",
  customRole: "원하는 업무",
  customRolePlaceholder: "예) 물건 분류, 매장 정리",
  pastLabel: "어떤 일을 해 보셨나요? (선택)",
  noHistory: "적지 않고 계속하기",
  past: [
    { key: "stock", name: "재고 확인·상품 정리", sentence: "재고를 확인하고 상품을 정리해 본 경험이 있습니다." },
    { key: "service", name: "손님 안내·응대", sentence: "손님을 안내하고 응대해 본 경험이 있습니다." },
    { key: "records", name: "문서 정리·기록", sentence: "문서를 정리하고 기록을 관리해 본 경험이 있습니다." },
  ],
  pastCustom: "해 본 업무를 짧게 쓰기",
  pastPlaceholder: "예) 출고 물품 수량 확인",
  pastSentence: "제가 해 본 일은 ‘{work}’입니다.",
  privacy: "업무만 적어 주세요. 이름, 연락처, 회사명은 필요 없어요. 카드 내용은 이 화면에서만 사용해요.",
  inquiryLabel: "가장 먼저 물어보고 싶은 점",
  inquiries: [
    { key: "open", name: "현재 모집 중인 곳", question: "제가 원하는 조건에 맞는 모집 공고가 있을까요? 공고를 어디서 확인하면 될까요?" },
    { key: "skills", name: "필요한 경력과 자격", question: "제가 원하는 일에 꼭 필요한 자격이나 경력이 있을까요? 처음 지원할 때 무엇을 준비하면 될까요?" },
    { key: "register", name: "구직 등록과 알선 방법", question: "구직 등록과 일자리 연결은 어떻게 신청하면 될까요? 준비할 서류가 궁금합니다." },
  ],
  make: "문의 카드 만들기",
  complete: "전화할 때 이렇게 말해 보세요",
  goalSummary: "찾는 일자리",
  roleSummary: "희망 업무",
  pastSummary: "해 본 일",
  firstSummary: "먼저 물을 내용",
  greeting: "안녕하세요. 안산시 일자리센터에 일자리 상담을 받고 싶어 전화했습니다.",
  roleSentence: "희망하는 업무는 ‘{role}’입니다.",
  reset: "입력 내용 지우기",
  edit: "내용 수정",
  back: "이전",
  call: "일자리센터 전화하기",
  phone: "031-481-2919",
  phoneHref: "tel:0314812919",
  reference: "지난 활동 자료 보기",
} as const;

export const fieldLocalUi = {
  "eco": {
    "title": "물가 흔적 측정대",
    "intro": "수달 모니터링 사진에서 흔적 옆에 눈금을 놓은 모습을 참고했어요. 아래는 직접 만든 연습 그림이에요.",
    "wide": "물가 전경",
    "detail": "선택한 곳 확대",
    "locate": "어디를 자세히 볼까요? 그림의 표시를 누르거나 아래에서 골라요.",
    "spot": [
      "갈대 밑",
      "편평한 돌 위",
      "물결 가장자리"
    ],
    "hint": [
      "갈대 줄기와 잎이 겹쳐 보여요. 길이를 잴 흔적은 돌 위에 있어요.",
      "돌 위에 길쭉한 흔적이 있어요. 종류는 아직 알 수 없어요.",
      "물이 반짝이는 자국이에요. 고정된 흔적을 재려면 돌 위를 살펴보세요."
    ],
    "choose": "전경에서 살펴볼 곳을 먼저 골라 주세요.",
    "ruler": "자의 0 눈금을 흔적의 왼쪽 끝에 맞춰요. 오른쪽 끝은 그림을 누르거나 끝 표시를 옮겨 맞춰요.",
    "zero": "자의 0 눈금",
    "end": "끝 표시",
    "left": "왼쪽",
    "right": "오른쪽",
    "difference": "두 표시 사이 {n}cm",
    "reverse": "끝 표시가 0 눈금보다 왼쪽에 있어요.",
    "mark": "측정 기록 만들기",
    "wrongStart": "0 눈금이 흔적의 왼쪽 끝과 어긋나 있어요. 자 전체를 옮겨 보세요.",
    "wrongEnd": "오른쪽 끝이 표시선과 어긋나 있어요. 흔적이 끝나는 곳에 표시를 옮겨요.",
    "record": "물가 관찰표",
    "recordBody": "편평한 돌 위에서 길쭉한 흔적 하나를 보았어요. 눈금으로 잰 길이는 4cm예요. 이 그림만으로 동물의 종류나 마릿수는 알기 어려워요.",
    "wideAlt": "연습 하천의 전경. 왼쪽은 갈대, 가운데는 편평한 돌, 오른쪽은 물결이에요.",
    "sampleAlt": "확대 그림의 왼쪽 기준에서 둘째 칸에 흔적이 시작하고 여섯째 칸에 끝나요. 한 칸은 1cm예요.",
    "near": "그림에서 끝 표시 옮기기",
    "pos": "바닥 기준 {n}칸",
    "cm": "cm",
    "source": "참고한 현장 사진 열기"
  },
  "menu": {
    "title": "우리 가게 한 개 원가표",
    "intro": "공개 원가 수업처럼 한 묶음의 가격을 나눠 한 개에 드는 돈을 계산해요. 메뉴·금액은 가상의 연습 예시예요.",
    "recipeTitle": "만들 메뉴",
    "names": [
      "샌드위치",
      "요구르트 주스"
    ],
    "ingredients": [
      "치즈",
      "요구르트"
    ],
    "parts": [
      "빵과 기본 속재료",
      "과일 원액"
    ],
    "extras": [
      "채소",
      "얼음과 시럽"
    ],
    "pack": [
      "포장지",
      "컵과 뚜껑"
    ],
    "units": "판매 수량",
    "products": [
      "개",
      "잔"
    ],
    "packPrice": "{ingredient} 한 묶음은 {count}{unit}, {price}원이에요. 한 단위에 {unitPrice}원이에요.",
    "portion": "한 개에 넣을 {ingredient}",
    "batch": "준비할 수량",
    "quantity": "{n}{unit}",
    "less": "줄이기",
    "more": "늘리기",
    "each": "한 개의 원가 내역",
    "sold": "한 개 판매가",
    "cost": "재료와 포장 합계",
    "remains": "한 개 판매 뒤 남는 돈",
    "limit": "아래 금액에서 임대료·인건비 등 다른 비용을 더 빼야 해요.",
    "sum": "이번 묶음의 계산",
    "paper": "판매·원가 전표",
    "costs": "재료·포장비",
    "gross": "예상 판매액",
    "contribution": "다른 비용을 내기 전 남는 금액",
    "write": "지금 분량으로 전표 만들기",
    "saved": "전표를 만들었어요. 분량을 바꾸면 다시 계산할 수 있어요.",
    "price": "{n}원",
    "qtyLabel": "{label} {direction}",
    "eq": "{price}원 × {n}{unit}"
  }
} as const;

export const fieldContent = {
  "JOB01": {
    "sources": [
      {
        "title": "‘5070’ 채용한 경기도 기업들…박람회 현장 가보니",
        "publisher": "SBS 뉴스",
        "url": "https://news.sbs.co.kr/news/endPage.do?news_id=N1008804163",
        "kind": "현장 영상의 방송사 공개 대본",
        "observation": "안산 현장 취재에서 업체가 두부 용기 포장 업무와 장기 근무 희망을 설명했다. 별도로 구직자가 물류 분야 경험을 말했다.",
        "use": "채용 담당자의 희망과 계약 형태를 구분하는 실제 비교 자료로 썼다."
      },
      {
        "title": "목요일에 희망 잡고, 새해 첫 채용행사",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1659900",
        "kind": "채용행사 운영 결과",
        "observation": "센터가 기업과 구직자를 미리 연결한 뒤 개별 면접을 진행한 사례다.",
        "use": "취업 행사와 단순한 공고 열람의 차이를 설명하는 자료로 썼다."
      },
      {
        "title": "안산시일자리센터, 중장년 지게차 실무인력 양성과정 2기 성료",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1678485",
        "kind": "직무교육 운영 결과",
        "observation": "장비별 주행·하역·점검을 실습하고 수료 뒤 공개면접을 진행했다.",
        "use": "수료 후 면접이 있는 교육과 곧바로 지원하는 일자리 공고를 비교한다."
      },
      {
        "title": "안산시, 스마트허브 2040·경기도 5070 통합 일자리박람회 성료",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1682786",
        "kind": "현장 운영 결과",
        "observation": "현장 면접과 취업 지원 부스를 운영했고 기업, 면접, 현장 채용 성과를 따로 집계했다.",
        "use": "행사 참여와 채용 확정을 분리해 설명한다."
      },
      {
        "title": "자동차 야드 입/출하 담당 모집 · 목요일에 희망 잡고 참여업체",
        "publisher": "대경티엘에스㈜ · 고용24",
        "url": "https://www.work24.go.kr/wk/a/b/1500/empDetailAuthView.do?infoTypeCd=VALIDATION&infoTypeGroup=tb_workinfoworknet&wantedAuthNo=KJKP002609300010",
        "kind": "실제 지난 채용공고",
        "observation": "출고 전 차량 이동과 입출고 관리, 2종 보통 이상 필수, 기간의 정함이 없는 근로계약을 명시했다.",
        "use": "원문에서 업무·면허·계약을 꺼내 읽는 핵심 자료다."
      },
      {
        "title": "2026년 3월 안산 919취업광장 행사 안내 · 참여기업 명단",
        "publisher": "안산시 일자리센터",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0261&bbs_seq=1664866&currentPage=1&key=383&sch_text=&sch_type=sj",
        "kind": "참여 안내·기업 명단",
        "observation": "행사 공고에 참여기업 자료와 입사 지원 안내를 별도로 실었다.",
        "use": "행사 소개만 읽고 필수 자격을 짐작하지 않도록 공고 자료를 구분한다."
      },
      {
        "title": "2025년 경력보유여성층 취업지원 교육프로그램 치과보조사 양성과정 참여안내",
        "publisher": "안산시 일자리센터",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0261&bbs_seq=1644221&key=383&sch_text=&sch_type=sj",
        "kind": "직무교육 모집 안내",
        "observation": "기구 소독과 위생 관리, 현장실습을 교육 내용으로 명시했다.",
        "use": "직무 훈련 안내를 채용 공고와 구별하는 비교 자료로 썼다."
      },
      {
        "title": "안산시, 2025 스마트허브·경기도 5070 통합 일자리박람회 개최",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1644655",
        "kind": "채용박람회 공식 운영 안내",
        "observation": "기업과 면접하는 곳과 기관별 상담을 받는 곳이 구분됐다.",
        "use": "문의할 내용을 채용 조건과 센터 상담으로 나눴다."
      },
      {
        "title": "안산시 소식지 · 일자리센터가 ‘내 일(JOB)’을 찾아드립니다",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/UPDIR/newsletter/3547469391_TBcCwyNo_c53451fe1e6e52193db71ddda7cb569fb46c08b1.pdf",
        "kind": "시 소식지 세부 운영표",
        "observation": "행사표에 찾아가는 채용, 상설면접, 취업광장 등 서로 다른 방식이 적혀 있다.",
        "use": "상담 메모에서 과거 행사와 현재 진행 중인 채용을 구분한다."
      },
      {
        "title": "안산시, 올해 마지막 채용의 장 연다…안산919취업광장 개최",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1687324",
        "kind": "채용행사 참가 안내",
        "observation": "참여 기업 정보 확인과 이력서 지참 후 희망 기업 면접을 따로 안내했다.",
        "use": "실제 문의에서는 우선 현재 유사 공고가 있는지 확인하도록 했다."
      }
    ],
    "lab": {
      "title": "공고에서 내가 맡을 일 찾기",
      "brief": "안산 채용행사에 나온 자료를 펼쳐 보세요. 하는 일, 필요한 면허, 계약 조건을 살펴보고 센터에 물을 내용을 챙겨요.",
      "artifact": "차량 입출고 일자리 문의 메모",
      "rounds": [
        {
          "mode": "inspect",
          "title": "포장, 차량 이동, 지게차. 무엇을 모집했을까요?",
          "instruction": "자료를 펼쳐 보고, 예시 조건을 모두 확인할 수 있는 것만 담아 보세요. 모두 지난 자료예요.",
          "why": "업체가 ‘오래 일할 분’을 원해도 실제 계약 기간은 공고를 봐야 알 수 있어요.",
          "sourceRefs": [
            1,
            3,
            4,
            5,
            6,
            7
          ],
          "target": "차량을 직접 옮기는 일로, 필요한 자동차 면허와 계약 형태가 적혀 있어야 해요.",
          "cases": [
            {
              "label": "자동차 야드 입출고 담당",
              "fields": [
                {
                  "label": "맡는 일",
                  "value": "세차 공정에 맞춰 자동차를 옮기고 들어오고 나간 차량을 관리해요."
                },
                {
                  "label": "필수 면허",
                  "value": "자동차운전면허 2종 보통 이상"
                },
                {
                  "label": "계약",
                  "value": "기간의 정함이 없는 근로계약"
                }
              ],
              "fit": true,
              "feedback": "차량 이동, 필수 면허, 계약 형태가 모두 지난 고용24 공고에 적혀 있어요."
            },
            {
              "label": "포장업체 박람회 인터뷰",
              "fields": [
                {
                  "label": "맡는 일",
                  "value": "두부를 담는 플라스틱 용기를 포장해요."
                },
                {
                  "label": "업체 설명",
                  "value": "오래 함께 일할 분을 희망했어요."
                },
                {
                  "label": "면허와 계약",
                  "value": "방송 대본에는 적혀 있지 않아요."
                }
              ],
              "fit": false,
              "feedback": "여기서 포장하는 것은 두부 용기예요. 장기 근무를 희망한다는 말로 실제 계약 기간까지 알 수는 없어요."
            },
            {
              "label": "지게차 실무인력 양성과정",
              "fields": [
                {
                  "label": "내용",
                  "value": "지게차로 물건을 싣고 내리는 실습과 장비 점검을 해요."
                },
                {
                  "label": "참여 방식",
                  "value": "직무교육 뒤 공개면접을 진행했어요."
                },
                {
                  "label": "계약",
                  "value": "수료 결과를 알리는 자료예요. 개별 근로계약은 적혀 있지 않아요."
                }
              ],
              "fit": false,
              "feedback": "차량이나 장비가 등장해도 이 자료는 교육 결과예요. 입출고 업무에 채용하는 공고는 따로 봐야 해요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "센터에 연락할 때 볼 메모 만들기",
          "instruction": "지난 차량 입출고 공고를 보며 문장을 알맞은 칸에 놓으세요. 확정할 수 없는 문장은 남겨 두세요.",
          "why": "업무명을 정확히 말하고 현재 모집 여부를 따로 물으면 오래된 공고를 들고도 문의를 시작할 수 있어요.",
          "sourceRefs": [
            2,
            5,
            6,
            8,
            9,
            10
          ],
          "slots": [
            {
              "label": "찾는 일",
              "hint": "회사에서 맡게 되는 일을 한 줄로 적어요."
            },
            {
              "label": "지난 공고에서 확인",
              "hint": "지원 전에 확인할 면허와 계약 내용을 적어요."
            },
            {
              "label": "지금 센터에 물을 것",
              "hint": "새 공고에서 다시 확인해야 하는 내용을 담아요."
            }
          ],
          "pieces": [
            {
              "label": "차량을 옮기고 입출고를 관리하는 일",
              "slot": 0,
              "feedback": "직종명에 실제로 할 일을 붙인 메모예요."
            },
            {
              "label": "2종 보통 이상 필수 · 기간을 정하지 않은 계약",
              "slot": 1,
              "feedback": "두 조건 모두 해당 회차 공고에 명시돼 있었어요."
            },
            {
              "label": "비슷한 일을 지금 모집하는 회사와 그 공고를 확인할 방법",
              "slot": 2,
              "feedback": "과거 자료를 보고 지금의 근무 조건과 모집을 확인할 수 있어요."
            },
            {
              "label": "이번 주에도 같은 회사에 바로 지원할 수 있음",
              "slot": -1,
              "feedback": "지난 행사 자료로는 지금 모집 중인지 알 수 없어요."
            }
          ]
        }
      ]
    }
  },
  "JOB02": {
    "sources": [
      {
        "title": "중장년내일센터, 구인구직 One-Stop 서비스",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=20187&contId=90171&menuId=9946",
        "kind": "동행면접 현장 결과·사진",
        "observation": "기업 요청에 맞춰 구직자를 연결했다. 참가자는 개별 면접을 보고 배치 예정인 생산 부서를 둘러봤다.",
        "use": "직접 본 내용과 별도로 물어볼 근로조건을 구분한다."
      },
      {
        "title": "안산상공회의소 중장년내일센터 사업안내",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=11295&contId=116024&menuId=10014",
        "kind": "기관 서비스 상세",
        "observation": "생애경력설계, 재도약, 전직스쿨, 기업탐방, 동행면접의 대상과 방식이 다르다.",
        "use": "기업탐방과 온라인 경력설계를 비교하는 근거다."
      },
      {
        "title": "2024년도 전직지원프로그램 온라인 교육 안내",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=11295&contId=103109&menuId=10014",
        "kind": "교육과정 안내",
        "observation": "이전 경험에서 핵심 역량을 찾아 목표를 정하고 이력서와 면접을 준비하는 내용이다.",
        "use": "이력서에는 희망 직무에 연결되는 경험을 붙이도록 했다."
      },
      {
        "title": "2026년 6월 안산 스마트허브 채용박람회 참여 안내",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=11295&contId=128691&menuId=10014",
        "kind": "참가 안내",
        "observation": "기업에 맞는 구직자를 연결하고 행사장에서 면접과 상담을 제공한다고 안내했다.",
        "use": "박람회 면접과 기업 생산부서 견학을 구별한다."
      },
      {
        "title": "중장년내일이음 패키지 사업 안내",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=11295&contId=126292&menuId=10014",
        "kind": "경력전환 일 경험 사업 안내",
        "observation": "자격을 취득하거나 직업훈련을 이수한 구직자를 대상으로 조리, 시설, 전산회계 등 여러 분야의 기업 일 경험을 안내했다.",
        "use": "훈련을 끝낸 뒤 현장에서 직무를 해보는 경로의 조건을 비교한다."
      },
      {
        "title": "2022년도 구인·구직 만남의 날, 상설면접 참여기업 모집",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=11295&contId=80508&menuId=10014",
        "kind": "기업 참여 절차",
        "observation": "기업의 인력 수요를 받아 재취업 희망자와 만나는 상설면접을 운영했다.",
        "use": "실무와 모집 조건을 기업에 확인할 항목으로 남긴다."
      },
      {
        "title": "2025년 생애경력설계 재직자 과정 참여자 모집",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=11295&contId=119679&menuId=10014",
        "kind": "재직자 화상교육 안내",
        "observation": "재직자가 온라인으로 귀농·귀촌·귀산 및 인생 후반부의 일거리를 살펴보는 과정이다.",
        "use": "채용 면접 및 기업 일 경험과 구별하는 비교 자료다."
      },
      {
        "title": "생애경력설계서비스 참여기업 모집",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/file/dext5uploaddata/2023/%EC%95%88%EC%82%B0%EC%83%81%EA%B3%B5%ED%9A%8C%EC%9D%98%EC%86%8C%E3%80%8E%EC%83%9D%EC%95%A0%EA%B2%BD%EB%A0%A5%EC%84%A4%EA%B3%84%EC%84%9C%EB%B9%84%EC%8A%A4%E3%80%8F%EC%B0%B8%EC%97%AC%EA%B8%B0%EC%97%85%20%EB%AA%A8%EC%A7%91.pdf",
        "kind": "재직자 교육 공문·교과표",
        "observation": "기업의 재직자를 위해 소통, 귀농·귀촌, 재무설계 등 여러 주제의 교육을 구성했다.",
        "use": "생애경력설계 과정의 대상과 결과를 밝혀 둔다."
      },
      {
        "title": "안산상공회의소 중장년내일센터 기간제 채용 공고 · 직업상담사 담당 업무",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/file/dext5uploaddata/2026/%EC%95%88%EC%82%B0%EC%83%81%EA%B3%B5%ED%9A%8C%EC%9D%98%EC%86%8C%5B%EC%A4%91%EC%9E%A5%EB%85%84%EB%82%B4%EC%9D%BC%EC%84%BC%ED%84%B0%20%EA%B8%B0%EA%B0%84%EC%A0%9C%5D%20%EC%B1%84%EC%9A%A9%20%EA%B3%B5%EA%B3%A0%28%EC%88%98%EC%A0%95%29.pdf",
        "kind": "센터 운영자의 실제 직무 명세",
        "observation": "상담사 업무에 고용24 알선, 전직 교육 지원, 기업 발굴과 동행면접 지원이 구분돼 있다.",
        "use": "센터가 연결해 주는 것과 기업이 정하는 업무를 구분한다."
      },
      {
        "title": "2024년 안산 스마트허브 채용박람회 참여기업 모집",
        "publisher": "안산상공회의소",
        "url": "https://ansancci.korcham.net/front/board/boardContentsView.do?boardId=11295&contId=90807&menuId=10014",
        "kind": "채용행사 안내",
        "observation": "구직자 알선과 현장 면접을 함께 안내했다. 게시물 제목과 본문의 연도가 달라 운영 방식만 참고했다.",
        "use": "채용 공고를 찾아 면접을 받고 싶은 경우의 예를 만들었다."
      }
    ],
    "lab": {
      "title": "중장년 경력 전환 자료실",
      "brief": "안산상공회의소에서 실제 운영한 일 경험, 재직자 교육, 기업탐방을 비교해요. 단계에 맞는 지원을 찾고 일 경험 준비표를 완성해 보세요.",
      "artifact": "훈련 뒤 일 경험 준비표",
      "rounds": [
        {
          "mode": "inspect",
          "title": "자격을 배운 다음 실제 업무를 해보고 싶다면",
          "instruction": "예시 조건은 ‘조리 교육을 마친 50대 구직자’예요. 지난 사업들의 대상과 활동을 읽어 보세요.",
          "why": "비슷한 이름으로 소개돼도 일 경험, 기업면접, 앞으로의 경력을 생각해 보는 수업은 얻는 것이 달라요.",
          "sourceRefs": [
            1,
            2,
            4,
            5,
            7,
            8,
            10
          ],
          "target": "조리 분야가 명시돼 있고, 기업에서 실제로 일을 경험하는 사업을 담으세요.",
          "cases": [
            {
              "label": "중장년내일이음 경력지원",
              "fields": [
                {
                  "label": "대상",
                  "value": "해당 공고는 자격을 취득하거나 직업훈련을 이수한 50~65세 구직자를 안내했어요."
                },
                {
                  "label": "분야",
                  "value": "조리, 시설, 전기, 전산회계 등"
                },
                {
                  "label": "무엇을 하나요?",
                  "value": "경력 전환을 위해 기업에서 일정 기간 업무를 경험해요."
                }
              ],
              "fit": true,
              "feedback": "조리 분야와 기업 일 경험이 모두 적혀 있어요. 지금 가능한 기업과 담당 업무는 새 공고에서 확인해요."
            },
            {
              "label": "중소기업탐방과 동행면접",
              "fields": [
                {
                  "label": "대상",
                  "value": "센터가 기업 수요에 맞춰 연결한 구직자"
                },
                {
                  "label": "현장 사례",
                  "value": "배치 예정인 생산 부서를 둘러봤어요."
                },
                {
                  "label": "무엇을 하나요?",
                  "value": "참가자가 개별 면접을 봤어요."
                }
              ],
              "fit": false,
              "feedback": "직장을 살펴볼 수 있었지만 이 기록의 내용은 생산 부서 견학과 채용 면접이에요."
            },
            {
              "label": "재직자 생애경력설계 과정",
              "fields": [
                {
                  "label": "대상",
                  "value": "직장에 다니는 중장년"
                },
                {
                  "label": "내용",
                  "value": "귀농·귀촌·귀산과 앞으로의 일거리"
                },
                {
                  "label": "무엇을 하나요?",
                  "value": "실시간 화상 교육에 참여해요."
                }
              ],
              "fit": false,
              "feedback": "경력 방향을 알아보는 재직자 수업이에요. 기업의 조리 업무를 맡는 과정은 아니에요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "조리 일 경험 준비표 채우기",
          "instruction": "예시 교육 기록은 ‘조리 교육 수료, 재료 소분 실습’이에요. 모집 안내에 확인된 내용과 배우고 싶은 내용을 구분해 보세요.",
          "why": "실습해 본 일을 경력처럼 부풀리지 않으면서, 기업에서 무엇을 더 해보고 싶은지 구체적으로 전할 수 있어요.",
          "sourceRefs": [
            1,
            2,
            3,
            5,
            6,
            9
          ],
          "slots": [
            {
              "label": "해 본 일",
              "hint": "예시 교육 기록에서 확인된 경험을 담아요."
            },
            {
              "label": "지원할 분야",
              "hint": "모집 안내에 실제로 나온 분야예요."
            },
            {
              "label": "배치 전에 물을 것",
              "hint": "공고만으로 알 수 없는 현장 업무를 담아요."
            }
          ],
          "pieces": [
            {
              "label": "교육 중 재료를 나눠 담는 작업을 실습했음",
              "slot": 0,
              "feedback": "유급 경력을 쓰지 않아도 직접 해본 일을 말할 수 있어요."
            },
            {
              "label": "기업 일 경험의 조리 분야",
              "slot": 1,
              "feedback": "지난 모집 안내에 적힌 분야예요."
            },
            {
              "label": "배치될 기업에서 손질·조리·배식 중 어떤 업무를 맡는지",
              "slot": 2,
              "feedback": "조리 분야라는 이름만으로 실제 배치를 단정할 수 없어요."
            },
            {
              "label": "수료했으므로 급식 조리사로 정식 채용됨",
              "slot": -1,
              "feedback": "훈련 수료, 일 경험 참여, 채용은 각각 따로 확인해야 해요."
            }
          ]
        }
      ]
    }
  },
  "JOB03": {
    "sources": [
      {
        "title": "지역 고수에게 듣는 상인 아카데미 성황리 종료",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%9E%AC%EB%8B%A8%EC%86%8C%EC%8B%9D/%EB%B3%B4%EB%8F%84%EC%9E%90%EB%A3%8C/?mod=document&pageid=1&uid=411",
        "kind": "현장 교육 운영 결과",
        "observation": "지역 상인이 강사로 참여해 메뉴 개발, 고객 응대, 점포 운영을 소개했고 참가자가 대표 메뉴를 맛봤다.",
        "use": "실물 구성과 손님이 읽는 메뉴 설명을 대조하는 실습을 만들었다."
      },
      {
        "title": "찾아가는 현장학습 ‘지역고수에게 듣는 상인 아카데미’",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%9E%AC%EB%8B%A8%EC%86%8C%EC%8B%9D/%ED%8F%AC%ED%86%A0%EA%B0%A4%EB%9F%AC%EB%A6%AC/?mod=document&uid=187",
        "kind": "현장 사진 및 회차별 설명",
        "observation": "청년몰·다문화특구·대부도·문화광장 점포를 찾아 점주에게 현장 경험을 들었다.",
        "use": "다른 점포의 정보와 우리 점포의 확인된 사실을 구별한다."
      },
      {
        "title": "2026 소상공인 희망아카데미 지역 우수 점포 성공사례 특강 참여자 모집",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%95%8C%EB%A6%BC%EA%B3%B5%EA%B0%84/%EA%B3%B5%EC%A7%80%EC%82%AC%ED%95%AD/?mod=document&uid=643",
        "kind": "현장 특강 안내",
        "observation": "지역 우수 점포의 상인이 운영 경험을 소개하고 참가자는 점포별 사례를 접한다.",
        "use": "한 점포에서 배운 문구를 다른 점포에 그대로 쓰지 않도록 구성했다."
      },
      {
        "title": "2026 소상공인 희망아카데미 디지털 마케팅 역량강화교육",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%82%AC%EC%97%85%EC%95%88%EB%82%B4/%EC%A7%80%EC%9B%90%EC%82%AC%EC%97%85%EA%B3%B5%EA%B3%A0/?mod=document&uid=616",
        "kind": "실습 교과표",
        "observation": "스마트플레이스 정보 정리, 상품 사진 촬영, 게시물 작성, 리뷰 답글 작성이 각각 실습으로 명시돼 있다.",
        "use": "메뉴 시안 교정과 스마트플레이스 초안 편집의 직접 근거다."
      },
      {
        "title": "2025년도 소상공인과 함께하는 워크숍",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%9E%AC%EB%8B%A8%EC%86%8C%EC%8B%9D/%ED%8F%AC%ED%86%A0%EA%B0%A4%EB%9F%AC%EB%A6%AC/?mod=document&uid=369",
        "kind": "시장 견학 사진·현장 설명",
        "observation": "단양·강릉·속초 시장에서 상인회 설명을 듣고 시장과 점포 사례를 살폈다.",
        "use": "견학에서 얻은 아이디어와 자기 점포의 조건을 분리한다."
      },
      {
        "title": "제15기 안산시 소상공인 상인대학 졸업식 개최",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%9E%AC%EB%8B%A8%EC%86%8C%EC%8B%9D/%ED%8F%AC%ED%86%A0%EA%B0%A4%EB%9F%AC%EB%A6%AC/?mod=document&uid=297",
        "kind": "교육 결과·사진",
        "observation": "재단은 고객 맞춤 서비스와 디지털 마케팅을 실제 교육 주제로 소개했다.",
        "use": "주문 전에 손님이 알고 싶어 하는 포장·상품 정보를 편집 대상으로 골랐다."
      },
      {
        "title": "2026 소상공인 희망아카데미 지역 우수 시장 견학 참여자 모집",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%82%AC%EC%97%85%EC%95%88%EB%82%B4/%EC%A7%80%EC%9B%90%EC%82%AC%EC%97%85%EA%B3%B5%EA%B3%A0/?mod=document&uid=636",
        "kind": "시장 견학 공고",
        "observation": "시장·점포 탐방과 상인의 경영 노하우 특강을 함께 안내했다.",
        "use": "다른 점포에서 들은 내용을 확인 전 문구로 분류하는 예에 썼다."
      },
      {
        "title": "2026년도 제5호 기획행정위원회 행정사무감사 · 지역고수 상인 아카데미",
        "publisher": "안산시의회",
        "url": "https://council-record.ansan.go.kr/minutes/svc/web/cms/mnts/SvcMntsViewer.php?schSn=6184",
        "kind": "운영 책임자 현장 설명 회의록",
        "observation": "재단 대표가 점주가 겪은 문제와 해결 방식, 매장 분위기와 음식을 살피는 체험의 취지를 설명했다.",
        "use": "제품 관찰과 확인되지 않은 평판을 분리했다."
      },
      {
        "title": "안산시 소상공인 경영안정화를 위한 상인대학 특강",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%9E%AC%EB%8B%A8%EC%86%8C%EC%8B%9D/%ED%8F%AC%ED%86%A0%EA%B0%A4%EB%9F%AC%EB%A6%AC/?mod=document&uid=95",
        "kind": "특강 현장 사진·설명",
        "observation": "재단 대표가 평생학습관에서 국내외 성공 사례를 소개한 수업이다.",
        "use": "성공 사례에서 가져올 아이디어와 손님에게 약속할 실제 조건을 나눴다."
      },
      {
        "title": "2026년 안산시 소상공인 상인대학 교육 및 개강 특강",
        "publisher": "안산시상권활성화재단",
        "url": "https://amrf.or.kr/%EC%9E%AC%EB%8B%A8%EC%86%8C%EC%8B%9D/%ED%8F%AC%ED%86%A0%EA%B0%A4%EB%9F%AC%EB%A6%AC/?mod=document&uid=612",
        "kind": "개강 현장 사진·교과 안내",
        "observation": "현장 견학과 함께 홍보 전략과 온라인 마케팅을 교육 내용으로 소개했다.",
        "use": "앱에서 매장 안내용 글과 온라인용 원고를 함께 준비하도록 했다."
      }
    ],
    "lab": {
      "title": "우리 가게 메뉴판 편집실",
      "brief": "우수 점포에서 대표 메뉴를 살피고 온라인 홍보물을 만드는 수업을 바탕으로 만들었어요. 예시 점포의 실제 구성표와 손님에게 보이는 문구를 맞춰 보세요.",
      "artifact": "게시 전 점검한 메뉴 소개안",
      "rounds": [
        {
          "mode": "inspect",
          "title": "메뉴판 교정쇄 고르기",
          "instruction": "연습용 주방 메모는 ‘감자전 두 장, 간장 포함, 묶음 6,000원, 포장 가능’이에요. 점포 이름이나 실제 판매 가격을 사용하지 않았어요.",
          "why": "손님이 주문 전에 수량·구성·가격·포장을 알면 같은 내용을 다시 묻거나 주문을 고치는 일을 줄일 수 있어요.",
          "sourceRefs": [
            1,
            2,
            3,
            6,
            8
          ],
          "target": "주방 메모에 나온 수량·구성·가격·포장이 모두 맞는 원고를 담으세요.",
          "cases": [
            {
              "label": "탁상 메뉴판 시안",
              "fields": [
                {
                  "label": "상품",
                  "value": "감자전 두 장과 간장"
                },
                {
                  "label": "표시 가격",
                  "value": "두 장 한 묶음 6,000원"
                },
                {
                  "label": "이용 방법",
                  "value": "포장 가능"
                }
              ],
              "fit": true,
              "feedback": "주방 메모에 적힌 네 가지를 모두 손님이 확인할 수 있어요."
            },
            {
              "label": "온라인 주문 안내 시안",
              "fields": [
                {
                  "label": "상품",
                  "value": "간장을 곁들인 감자전 두 장"
                },
                {
                  "label": "표시 가격",
                  "value": "한 장 6,000원"
                },
                {
                  "label": "이용 방법",
                  "value": "포장 가능"
                }
              ],
              "fit": false,
              "feedback": "주방 메모는 두 장 묶음 가격이에요. 한 장 가격이라고 쓰면 같은 주문의 금액이 달라져요."
            },
            {
              "label": "상품 카드 시안",
              "fields": [
                {
                  "label": "상품",
                  "value": "감자전 두 장, 간장 포함"
                },
                {
                  "label": "표시 가격",
                  "value": "한 묶음 6,000원"
                },
                {
                  "label": "이용 방법",
                  "value": "매장 식사만 가능"
                }
              ],
              "fit": false,
              "feedback": "포장이 가능한 메뉴예요. 그대로 올리면 포장하려던 손님이 주문을 포기할 수 있어요."
            },
            {
              "label": "포장대 안내문 시안",
              "fields": [
                {
                  "label": "상품",
                  "value": "간장 포함 · 감자전 2장 한 묶음"
                },
                {
                  "label": "표시 가격",
                  "value": "한 묶음 6,000원"
                },
                {
                  "label": "이용 방법",
                  "value": "포장해서 가져가실 수 있어요."
                }
              ],
              "fit": true,
              "feedback": "다른 표현이어도 메뉴 구성과 손님이 지불할 금액은 같아요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "온라인 가게 정보 편집하기",
          "instruction": "예시 촬영 메모에는 ‘감자전 두 장과 간장이 보임’이라고 적혀 있어요. 메뉴판을 온라인 가게 소개로 옮겨 보세요.",
          "why": "사진은 구성을 보여주고 가격과 포장 가능 여부는 글로 알려줘야, 휴대폰으로 읽는 손님도 주문을 결정할 수 있어요.",
          "sourceRefs": [
            1,
            4,
            5,
            7,
            9,
            10
          ],
          "slots": [
            {
              "label": "상품 사진 설명",
              "hint": "사진에 실제로 보이는 것을 써요."
            },
            {
              "label": "상품 정보",
              "hint": "확인한 묶음 가격과 이용 방법을 적어요."
            },
            {
              "label": "게시 전 확인",
              "hint": "현재 자료만으로 확인되지 않은 조건을 남겨요."
            }
          ],
          "pieces": [
            {
              "label": "접시에 놓인 감자전 두 장과 작은 간장 종지",
              "slot": 0,
              "feedback": "보이는 구성을 짧게 적은 사진 설명이에요."
            },
            {
              "label": "감자전 두 장 한 묶음 6,000원 · 포장 가능",
              "slot": 1,
              "feedback": "메뉴판과 온라인 판매 글의 조건이 일치해요."
            },
            {
              "label": "배달도 가능한지, 가능하다면 주문 채널은 어디인지",
              "slot": 2,
              "feedback": "포장 가능과 배달 가능은 다른 조건이에요."
            },
            {
              "label": "안산에서 가장 많이 팔린 감자전",
              "slot": -1,
              "feedback": "판매량 비교 자료가 없어요. 삭제하면 확인된 정보만 남아요."
            }
          ]
        },
        {
          "mode": "allocate",
          "title": "촬영과 소액 광고 예산 맞추기",
          "instruction": "이미 만든 메뉴 원고는 그대로 써요. 연습용 비용표로 촬영 준비와 게시물 홍보에 쓸 예산을 나눠 보세요.",
          "why": "콘텐츠를 만드는 비용과 알리는 비용을 따로 적어 두면 어느 작업부터 직접 할지 판단할 수 있어요.",
          "sourceRefs": [
            4,
            6,
            10
          ],
          "tokens": [
            {
              "label": "촬영용 배경지",
              "unit": "장",
              "min": 1,
              "max": 2,
              "initial": 1,
              "step": 1,
              "coefficient": 3000
            },
            {
              "label": "게시물 홍보",
              "unit": "회",
              "min": 1,
              "max": 4,
              "initial": 1,
              "step": 1,
              "coefficient": 2000
            }
          ],
          "target": 10000,
          "targetLabel": "이번 연습 예산",
          "rule": "배경지 한 장은 3,000원, 게시물 홍보 한 번은 2,000원으로 가정해요. 두 항목을 모두 쓰고 예산을 정확히 맞추세요.",
          "unit": "원",
          "solutionHint": "배경지 두 장에 6,000원을 두면 홍보에 4,000원을 쓸 수 있어요."
        }
      ]
    }
  },
  "JOB07": {
    "sources": [
      {
        "title": "안산시 인생이모작지원센터 운영",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/cntnts/selectContents.do?cntnts_id=www01617",
        "kind": "사업별 지원 안내",
        "observation": "이모작상담, 재취업 교육, 사회공헌 동아리 활동을 각각 지원한다.",
        "use": "개인 교육과 지역에 재능을 나누는 동아리 활동을 구분한다."
      },
      {
        "title": "2026년 상반기 시간제 일자리 교육 및 채용 · 청소 분야",
        "publisher": "안산시 인생이모작지원센터",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0214&bbs_seq=1664799",
        "kind": "과정 안내",
        "observation": "청소 실습, 서비스 이용 앱 사용법, 일할 때 지킬 사항을 배우는 교육이다.",
        "use": "청소를 배우는 일자리 교육을 동아리 지원과 구분한다."
      },
      {
        "title": "안산시인생이모작지원센터, 신중년 대상 재취업 전략 특강 진행",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1643780",
        "kind": "특강 운영 결과",
        "observation": "자기소개서·이력서 작성과 면접 기술 등을 다룬 재취업 교육을 열었다.",
        "use": "일자리를 위한 개인 역량 교육 사례로 비교했다."
      },
      {
        "title": "안산시, 신중년 재취업 준비 지원…이력서·면접 전략 공유",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1683065",
        "kind": "참여 교육 결과",
        "observation": "참석자가 자신의 경험과 전문성을 이력서와 면접에서 표현하는 방법을 배웠다.",
        "use": "관련 경험을 활동의 역할로 옮기는 메모에 반영했다."
      },
      {
        "title": "안산시 인생이모작지원센터, 해상재난안전SAR협회와 업무협약 체결",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1627986",
        "kind": "안전요원 자격과정 실시 결과",
        "observation": "협약에 따라 중장년이 별도 안전요원 과정을 이수했다.",
        "use": "개인이 자격을 배우는 과정과 모임이 활동비를 신청하는 사업을 구별한다."
      },
      {
        "title": "2024년 사회공헌 동아리 활동지원 공모",
        "publisher": "안산시노사민정협의회 · 안산시인생이모작지원센터",
        "url": "https://asnsmj.or.kr/bbs/board.php?bo_table=notice2&wr_id=21",
        "kind": "운영기관 공고 본문",
        "observation": "재능을 익혀 지역사회에 나누는 모임이 대상이다. 출석 인원과 정기 활동 조건을 공고했다.",
        "use": "연도별 공고 조건이 달라 당시 공고 원문을 기준으로 읽도록 했다."
      },
      {
        "title": "2024년 하반기 청소매니저 양성과정 · 시간제 일자리 안내",
        "publisher": "안산시 인생이모작지원센터",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0214&bbs_seq=1607246",
        "kind": "현장 실습 과정 안내",
        "observation": "실습과 앱 사용법 교육을 포함하는 시간제 일자리 과정으로 소개했다.",
        "use": "직무 교육에 참여하는 것과 활동일지를 작성하는 동아리를 구별한다."
      },
      {
        "title": "2025 사회공헌 동아리 활동 지원 공모",
        "publisher": "안산시노사민정협의회 · 안산시인생이모작지원센터",
        "url": "https://asnsmj.or.kr/bbs/board.php?bo_table=notice2&page=1&wr_id=32",
        "kind": "운영기관 공고 본문",
        "observation": "일반 동아리는 회원 6명 이상, 출석 5명 이상, 50~60대 80% 이상, 월 2회 이상 활동 및 월말 활동일지가 조건이었다. 일부 활동비와 장소 대관을 안내했다.",
        "use": "이주민 동아리 예외는 별도임을 밝히고 일반 동아리 조건으로 참가안과 활동일지를 만들어 본다."
      },
      {
        "title": "신중년을 위한 ‘5060 인생2막 설계 특강’ 참가자 모집",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0214&bbs_seq=1526812",
        "kind": "센터 프로그램 참가 안내",
        "observation": "중장년을 대상으로 상담, 동아리 활동 지원, 교육, 지역 기관 연계를 안내했다.",
        "use": "모임 준비와 별개로 개인이 이용할 수 있는 센터 프로그램도 구별한다."
      },
      {
        "title": "안산시 소식지 · 안산시 인생이모작지원센터",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/UPDIR/newsletter/3547469391_w9AqSJaQ_31028dcdf9941bf1fef508fcf828fafe2867fe3e.pdf",
        "kind": "시 소식지 상담 안내",
        "observation": "생애 영역별 개인 상담 및 전화상담 방법을 소개했다.",
        "use": "자격 요건이 맞지 않아도 개인 상담으로 다른 선택지를 확인할 수 있다는 배경 자료다."
      }
    ],
    "lab": {
      "title": "동네 모임 활동계획 편집실",
      "brief": "인생이모작지원센터의 지난 사회공헌 동아리 공모를 놓고 활동안을 검토해요. 함께 배우려는 모임이 지역에 무엇을 나눌 수 있을지 한 장으로 정리해요.",
      "artifact": "사회공헌 동아리 활동 준비표",
      "rounds": [
        {
          "mode": "inspect",
          "title": "동아리 모집 공고와 활동안 맞춰 보기",
          "instruction": "2025년 공고의 일반 동아리 기준을 써요. 아래 모임은 모두 안산시민인 50~60대로 구성한 연습 자료예요. 이주민 동아리는 별도 조건이 있었어요.",
          "why": "회원 수와 실제 출석 인원은 달라요. 모임의 취지와 운영 조건을 함께 보면 준비할 것을 일찍 알아볼 수 있어요.",
          "sourceRefs": [
            1,
            5,
            6,
            8,
            9
          ],
          "target": "일반 동아리 기준은 회원 6명 이상, 출석 5명 이상, 월 2회 이상, 월말 활동일지예요. 지역 주민에게 재능을 나누는 모임을 고르세요.",
          "cases": [
            {
              "label": "수선 나눔 모임안",
              "fields": [
                {
                  "label": "활동과 대상",
                  "value": "주민이 가져온 생활소품의 단추를 함께 달고 기본 수선을 알려줘요."
                },
                {
                  "label": "인원",
                  "value": "회원 7명 · 회차당 출석 5명"
                },
                {
                  "label": "운영 기록",
                  "value": "월 2회 · 월말 활동일지 작성"
                }
              ],
              "fit": true,
              "feedback": "주민에게 재능을 나누면서 회원 수, 출석, 활동과 기록 조건을 모두 갖췄어요."
            },
            {
              "label": "정리수납 배우기 모임안",
              "fields": [
                {
                  "label": "활동과 대상",
                  "value": "회원끼리 집안 물건 정리법을 배우고 복습해요."
                },
                {
                  "label": "인원",
                  "value": "회원 8명 · 회차당 출석 6명"
                },
                {
                  "label": "운영 기록",
                  "value": "월 2회 · 월말 활동일지 작성"
                }
              ],
              "fit": false,
              "feedback": "인원은 맞지만 주민과 재능을 나누는 활동이 빠졌어요. 개인 교육과 동아리 지원을 나누는 기준이에요."
            },
            {
              "label": "생활 손글씨 나눔 모임안",
              "fields": [
                {
                  "label": "활동과 대상",
                  "value": "주민 모임의 안내판 글씨를 함께 써요."
                },
                {
                  "label": "인원",
                  "value": "회원 6명 · 회차당 출석 4명"
                },
                {
                  "label": "운영 기록",
                  "value": "월 2회 · 월말 활동일지 작성"
                }
              ],
              "fit": false,
              "feedback": "회원은 6명이지만 회차에 참석하는 인원이 당시 공고의 5명에 못 미쳐요. 두 숫자를 따로 봐야 해요."
            },
            {
              "label": "생활 글쓰기 나눔 모임안",
              "fields": [
                {
                  "label": "활동과 대상",
                  "value": "이웃과 일상 글을 함께 쓰고 글 모음을 나눠요."
                },
                {
                  "label": "인원",
                  "value": "회원 6명 · 회차당 출석 5명"
                },
                {
                  "label": "운영 기록",
                  "value": "월 3회 · 월말 활동일지 작성"
                }
              ],
              "fit": true,
              "feedback": "주민 참여, 인원, 활동 횟수, 활동일지 조건이 맞아요. 선정 여부는 운영기관 심사를 거쳐요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "모임이 실제로 쓸 활동 준비표 만들기",
          "instruction": "예시 활동은 ‘동네 주민과 생활소품 단추 달기’예요. 활동계획과 지원받을 항목, 활동 뒤 남길 기록을 채워 보세요.",
          "why": "어떤 재능을 누구와 나눌지와 지원이 필요한 이유를 구분해 두면 개인 수업과 동아리 활동을 설명하기 쉬워져요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            6,
            7,
            8,
            10
          ],
          "slots": [
            {
              "label": "함께할 활동",
              "hint": "주민이 실제로 해볼 일을 써요."
            },
            {
              "label": "필요한 지원",
              "hint": "공고에서 확인한 지원 종류와 쓸 곳을 이어 보세요."
            },
            {
              "label": "활동 뒤 남길 기록",
              "hint": "운영 기준을 확인할 기록을 골라요."
            }
          ],
          "pieces": [
            {
              "label": "주민이 가져온 소품에 맞는 단추를 골라 함께 달기",
              "slot": 0,
              "feedback": "누구와 무엇을 할지가 들어간 연습용 활동안이에요."
            },
            {
              "label": "실과 단추에 쓸 재료비 일부, 작업할 프로그램실 대관",
              "slot": 1,
              "feedback": "지난 공모는 활동비 일부와 장소를 지원 항목으로 안내했어요."
            },
            {
              "label": "실시 횟수와 회차별 출석 인원, 함께한 활동을 월말에 정리",
              "slot": 2,
              "feedback": "월말 활동일지를 준비할 수 있어요. 앱에는 실제 회원 정보를 입력하지 않아요."
            },
            {
              "label": "참여한 모든 회원의 월급 확정",
              "slot": -1,
              "feedback": "공고에 나온 지원은 동아리의 활동비 일부와 장소예요. 개인 월급을 약속하지 않아요."
            }
          ]
        }
      ]
    }
  },
  "JOB08": {
    "sources": [
      {
        "title": "안산시, 김장 나눔 대축제 열어…온기 담아 소외계층에 김치 전달",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=19595&opt=&page=628&pg=vv&sword=",
        "kind": "시 행사 기록",
        "observation": "센터가 주관해 나눔 행사를 합치고 같은 대상에게 중복 지원하는 일을 줄였다.",
        "use": "이미 처리한 묶음을 다시 집계하지 않는다."
      },
      {
        "title": "안산시새마을회, 이동밥차 조리·설거지 봉사",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=14675&opt=&page=969&pg=vv&sword=",
        "kind": "시 현장 기록",
        "observation": "행복나눔터에서 급식을 준비하고 식사 뒤 돌아온 식기를 설거지했다.",
        "use": "음식 준비와 식기 정리의 역할을 구분한다."
      },
      {
        "title": "안산도시공사, 연말에 임직원이 만든 수제 목도리 전달",
        "publisher": "브릿지경제",
        "url": "https://www.viva100.com/article/20251202500455",
        "kind": "현장 취재·보도",
        "observation": "김장 행사에서 절임배추 물 빼기, 채소 손질, 버무리기와 포장에 참여했다.",
        "use": "완성품을 포장·인계하는 작업을 구현한다."
      },
      {
        "title": "안산시 백운동, 꿈이있는세상으로부터 김장김치 140박스 기탁받아",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=23215&opt=&page=265&pg=vv&sword=",
        "kind": "시 현장 기록",
        "observation": "김장 나눔 행사에 참여한 단체가 포장된 김치를 동에 기탁했다.",
        "use": "완성한 상자와 인계할 상자를 맞춘다."
      },
      {
        "title": "안산시자원봉사센터, 스마일봉사단 후원으로 선부광장서 이동밥차 무료급식 운영",
        "publisher": "경기매일",
        "url": "https://www.kgmail.kr/news/articleView.html?idxno=653576",
        "kind": "현장 보도",
        "observation": "식재료 후원과 회원의 직접 배식 활동을 구분해 소개한다.",
        "use": "기부 물품과 봉사자가 맡는 일을 구분한다."
      },
      {
        "title": "안산시, 안산지역로타리협의회로부터 자동식기세척기 기탁받아",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=24710&opt=&page=125&pg=vv&sword=",
        "kind": "시 현장 기록",
        "observation": "현장에서 조리·배식·안전 지도를 맡았고 설거지 장비를 기증했다.",
        "use": "배식용 국자와 반납 식기의 역할을 나눈다."
      },
      {
        "title": "안산시자원봉사센터 주요사업 소개",
        "publisher": "경기도자원봉사센터",
        "url": "https://www.ggvc.or.kr/PageContent.do?menuNo=010000&subMenuNo=010700&tempParam1=",
        "kind": "센터별 주요 사업표",
        "observation": "행복나눔 이동밥차, 기업 봉사, 응원물품 나눔 등 성격이 다른 사업을 소개한다.",
        "use": "무엇을 만들거나 나누고 싶은지 역할로 비교한다."
      },
      {
        "title": "안산보호관찰소, 무료 급식소 배식 활동 지원",
        "publisher": "법무부 보호관찰소·신아일보",
        "url": "https://www.moj.go.kr/bbs/cppb/33/481089/download.do",
        "kind": "현장 보도 원문 PDF",
        "observation": "선부역 급식소에서 천막을 세우고 급식을 나누고 설거지와 정리를 맡았다는 본문이 있다.",
        "use": "앞에서 배식하는 역할 외에 뒤에서 돕는 일을 보여 준다."
      },
      {
        "title": "2024년도 제5호 기획행정위원회행정사무감사 회의록",
        "publisher": "안산시의회",
        "url": "https://council-record.ansan.go.kr/minutes/svc/web/cms/mnts/SvcMntsViewer.php?mode=spkr1&schSn=5675&spkrCd=MBR00126",
        "kind": "시의회 현장 운영 질의",
        "observation": "이동밥차 장소 여건과 참여 주민의 요구를 논의했다.",
        "use": "현장마다 작업 위치가 달라질 수 있음을 반영한다."
      },
      {
        "title": "넷제로(NET ZERO)봉사단-환경정화 자원봉사",
        "publisher": "에코하이·안산시자원봉사센터",
        "url": "https://ecohigh.kr/front/Activity/Detail/activity/4915",
        "kind": "센터 게시 활동표",
        "observation": "같은 센터의 시화조력발전소 정화 모집은 급식 봉사와 다른 활동이었다.",
        "use": "급식과 환경정화 활동표를 구분한다."
      }
    ],
    "lab": {
      "title": "나눔 작업대에서 내 역할 찾아보기",
      "brief": "안산의 김치 나눔과 이동밥차 일을 작은 작업대로 옮겼어요. 봉사 공고를 읽고 물품을 배분한 뒤 내게 맞는 역할을 찾아요. 수량은 연습용이에요.",
      "artifact": "나에게 맞는 봉사 역할과 물품 인계표",
      "rounds": [
        {
          "mode": "inspect",
          "title": "내가 맡을 수 있는 일을 찾아요",
          "instruction": "오늘은 음식을 직접 조리하지 않고, 식품을 포장하거나 나눠 주는 일을 해보고 싶어요. 두 조건이 맞는 연습 활동표를 골라요.",
          "why": "같은 센터에도 조리, 포장, 배식, 주변 정화 등 서로 다른 역할이 있어요. 역할을 알아두면 처음 문의가 쉬워져요.",
          "sourceRefs": [
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10
          ],
          "target": "조리를 맡지 않고 식품을 포장하거나 나누는 일",
          "cases": [
            {
              "label": "김치 포장대",
              "fields": [
                {
                  "label": "맡을 일",
                  "value": "완성된 김치 통을 상자에 포장하고 인계 수량을 맞춰요."
                },
                {
                  "label": "조리",
                  "value": "다른 작업대가 담당해요."
                }
              ],
              "fit": true,
              "feedback": "음식을 새로 만들지 않고 나눌 물품을 준비하는 역할이에요."
            },
            {
              "label": "이동밥차 주방",
              "fields": [
                {
                  "label": "맡을 일",
                  "value": "재료를 손질하고 가열해 식사를 완성해요."
                },
                {
                  "label": "배식",
                  "value": "다른 팀이 담당해요."
                }
              ],
              "fit": false,
              "feedback": "여기서는 직접 음식을 조리해요."
            },
            {
              "label": "선부광장 배식대",
              "fields": [
                {
                  "label": "맡을 일",
                  "value": "조리팀이 준비한 음식을 접시에 나누어 줘요."
                },
                {
                  "label": "조리",
                  "value": "조리팀이 담당해요."
                }
              ],
              "fit": true,
              "feedback": "준비된 식사를 나누는 역할이에요."
            },
            {
              "label": "시화방조제 정화",
              "fields": [
                {
                  "label": "맡을 일",
                  "value": "구간의 쓰레기를 모아 정리해요."
                },
                {
                  "label": "물품",
                  "value": "쓰레기봉투와 집게를 사용해요."
                }
              ],
              "fit": false,
              "feedback": "센터의 실제 봉사 분야예요. 이번에 해 보고 싶은 식품 포장·배식과는 활동 내용이 달라요."
            }
          ]
        },
        {
          "mode": "allocate",
          "title": "김치 열두 상자를 인계해요",
          "instruction": "연습 포장대에 열두 상자가 있어요. 이미 묶어 둔 두 상자짜리 묶음과 낱상자를 조절해 인계표 수량을 맞춰 보세요.",
          "why": "안산의 나눔 활동에서는 김치를 상자 단위로 모아 전달했어요. 묶음 수와 실제 상자 수를 분리하면 인계할 때 다시 셀 수 있어요.",
          "sourceRefs": [
            1,
            3,
            4
          ],
          "tokens": [
            {
              "label": "두 상자가 든 묶음",
              "unit": "묶음",
              "min": 0,
              "max": 5,
              "initial": 0,
              "step": 1,
              "coefficient": 2
            },
            {
              "label": "낱상자",
              "unit": "상자",
              "min": 0,
              "max": 6,
              "initial": 0,
              "step": 1,
              "coefficient": 1
            }
          ],
          "target": 12,
          "targetLabel": "인계할 김치 상자",
          "rule": "두 상자 묶음은 최대 다섯 묶음, 낱상자는 최대 여섯 상자가 있어요. 같은 물품을 두 번 세지 않도록 전체 열두 상자를 맞춰요.",
          "unit": "상자",
          "solutionHint": "두 상자짜리 다섯 묶음은 열 상자예요. 낱상자 두 개를 더하면 인계표와 맞아요."
        },
        {
          "mode": "assemble",
          "title": "작업대에 필요한 물건을 놓아요",
          "instruction": "어떤 일을 맡았을 때 쓰는 물건인지 살펴보고 네 작업대에 나눠 보세요.",
          "why": "선부광장 현장 기록에는 식사 준비와 배식, 설거지까지 서로 다른 일이 나와요. 어느 역할을 해보고 싶은지 구체적으로 말할 수 있어요.",
          "sourceRefs": [
            2,
            3,
            5,
            6,
            7,
            8
          ],
          "slots": [
            {
              "label": "김치 포장",
              "hint": "완성된 통을 담아 인계해요."
            },
            {
              "label": "급식 준비",
              "hint": "재료를 손질해 조리팀에 건네요."
            },
            {
              "label": "배식",
              "hint": "준비한 음식을 나눠요."
            },
            {
              "label": "식기 정리",
              "hint": "식사 뒤 돌아온 그릇을 정리해요."
            }
          ],
          "pieces": [
            {
              "label": "빈 상자와 완성된 김치 통",
              "slot": 0,
              "feedback": "수량을 확인한 뒤 인계할 상자로 모아요."
            },
            {
              "label": "손질 전 채소와 재료 바구니",
              "slot": 1,
              "feedback": "조리 전에 재료를 준비하는 자리예요."
            },
            {
              "label": "완성된 국과 배식용 국자",
              "slot": 2,
              "feedback": "준비한 음식을 식판에 나눠요."
            },
            {
              "label": "반납된 식판과 식기 정리대",
              "slot": 3,
              "feedback": "반납된 식기를 정리하는 작업대예요."
            }
          ]
        }
      ]
    }
  },
  "JOB11": {
    "sources": [
      {
        "title": "소상공인을 위한 손익관리 1 - 손익관리 사례 분석",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=2478",
        "kind": "강의 장면별 공개 요약",
        "observation": "매출 범위를 가정한 뒤 비용을 붙여 두 음식점의 손익구조를 비교한다.",
        "use": "판매액과 비용을 따로 기록한다."
      },
      {
        "title": "실전 메뉴 원가 교육",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=2316",
        "kind": "강의 장면별 공개 요약",
        "observation": "메뉴마다 미리 준비하는 재료와 실제 판매 시 더하는 재료를 함께 계산한다.",
        "use": "샌드위치 재료와 포장비를 한 개 기준으로 비교한다."
      },
      {
        "title": "손익분석 이론 및 실습",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=74",
        "kind": "공식 강좌 목차",
        "observation": "이론 학습 뒤 실제 계산을 다루는 실습으로 이어진다.",
        "use": "서로 다른 판매 조합을 직접 계산한다."
      },
      {
        "title": "소상공인365를 활용한 상권분석",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=2723",
        "kind": "강의 장면별 공개 요약",
        "observation": "상권 정보를 활용해 고객과 경쟁 상황을 비교하는 방법을 소개한다.",
        "use": "우리 판매표와 주변 상권 참고자료를 분리한다."
      },
      {
        "title": "상권정보시스템 쉽게 따라하기",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=542",
        "kind": "강의 장면별 공개 요약",
        "observation": "매출·점포 수·상권 인구 등 단위가 다른 수치를 비교한다.",
        "use": "주변 가게 수를 우리 매출로 계산하지 않는다."
      },
      {
        "title": "카페 손익관리의 모든 것",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=2824",
        "kind": "강의 장면별 공개 요약",
        "observation": "재료비, 인건비, 임대료와 운영비를 나눠 설명한다.",
        "use": "매달 드는 비용을 한 잔의 재료비와 나눈다."
      },
      {
        "title": "20년 창업컨설턴트가 알려주는 -진짜 상권분석-",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=565",
        "kind": "강의 장면별 공개 요약",
        "observation": "입지와 창업 아이템이 맞는지 현장 자료로 살펴보는 내용을 다룬다.",
        "use": "상권 자료가 답할 수 있는 상담 질문을 분리한다."
      },
      {
        "title": "초소자본창업 - 첫 장사 불패의 비밀 (2)",
        "publisher": "소상공인시장진흥공단 지식배움터",
        "url": "https://edu.sbiz.or.kr/edu/online/onlineEduForm.do?cseqno=1360",
        "kind": "강의 장면별 공개 요약",
        "observation": "손익분기점 계산 부분에서 매출과 고정지출의 관계를 다룬다.",
        "use": "한 개 판매 뒤 남은 돈으로 비용 일부를 채운다."
      },
      {
        "title": "소상공인 교육·컨설팅",
        "publisher": "한국생산성본부",
        "url": "https://kpc.or.kr/kpc/PTWHP002_business_001.do",
        "kind": "사업 운영 안내",
        "observation": "한국생산성본부가 경영상 어려움을 짚는 소상공인 역량강화 사업을 안내한다.",
        "use": "매장 기록과 함께 전문가에게 물을 문제를 좁힌다."
      },
      {
        "title": "소상공인 컨설팅으로 사업 운영에 큰 도움이 됐습니다~",
        "publisher": "대한민국 정책브리핑",
        "url": "https://www.korea.kr/news/reporterView.do?newsId=148923161",
        "kind": "이용자 취재·정책 기사",
        "observation": "소상공인 현장에서 전문가가 개별 경영 문제를 함께 살피는 사례를 소개한다.",
        "use": "상담 전 쓸 수 있는 짧고 구체적인 질문을 고른다."
      }
    ],
    "lab": {
      "title": "작은 가게 손익 작업대",
      "brief": "연습 가게의 판매표와 영수증을 펼쳐 보세요. 어떤 메뉴가 비용을 얼마나 채우는지 직접 계산하고 상담에 가져갈 질문을 골라요. 금액은 연습용이에요.",
      "artifact": "판매표와 비용을 함께 읽는 가게 상담 메모",
      "rounds": [
        {
          "mode": "assemble",
          "title": "서랍 속 매장 자료를 정리해요",
          "instruction": "자료가 답해 주는 질문을 찾아 해당 칸에 놓아 보세요.",
          "why": "값을 맞게 적어도 판매액, 재료비, 주변 가게 수를 섞으면 가게 상황을 설명하기 어려워요.",
          "sourceRefs": [
            1,
            2,
            4,
            5,
            6,
            7
          ],
          "slots": [
            {
              "label": "우리 가게 판매",
              "hint": "팔린 수량과 손님이 낸 금액"
            },
            {
              "label": "판매량과 함께 드는 비용",
              "hint": "팔 때마다 더 들어가는 재료와 포장"
            },
            {
              "label": "매달 정해진 비용",
              "hint": "판매 수량과 별도로 매달 지불"
            },
            {
              "label": "상권 참고 자료",
              "hint": "주변의 가게나 고객을 비교할 때 사용"
            }
          ],
          "pieces": [
            {
              "label": "샌드위치 여섯 개를 판매한 계산대 기록",
              "slot": 0,
              "feedback": "우리 가게에서 실제 팔린 내역을 확인해요."
            },
            {
              "label": "샌드위치 한 개의 재료와 포장지 내역",
              "slot": 1,
              "feedback": "한 개를 더 팔 때 드는 비용을 모아요."
            },
            {
              "label": "매달 같은 금액으로 계약한 가게 임대료",
              "slot": 2,
              "feedback": "연습 가게에서 판매 수량과 관계없이 내는 돈이에요."
            },
            {
              "label": "주변 같은 업종의 가게 수가 담긴 보고서",
              "slot": 3,
              "feedback": "우리 가게의 장부와 나누어 보관할 지역 자료예요."
            }
          ]
        },
        {
          "mode": "allocate",
          "title": "두 메뉴로 비용 일부를 채워요",
          "instruction": "샌드위치는 5,000원에 팔고 재료·포장에 3,000원이 들어요. 주스는 4,000원에 팔고 3,000원이 들어요. 수량을 바꿔 남는 돈을 맞춰 보세요.",
          "why": "한 개 더 팔 때 남는 금액을 계산하면 판매액이 같은 두 가게도 왜 결과가 다른지 물어볼 수 있어요.",
          "sourceRefs": [
            1,
            2,
            3,
            6,
            8
          ],
          "tokens": [
            {
              "label": "샌드위치",
              "unit": "개",
              "min": 0,
              "max": 6,
              "initial": 0,
              "step": 1,
              "coefficient": 2000
            },
            {
              "label": "주스",
              "unit": "잔",
              "min": 0,
              "max": 8,
              "initial": 0,
              "step": 1,
              "coefficient": 1000
            }
          ],
          "target": 12000,
          "targetLabel": "비용에 보탤 금액",
          "rule": "판매액에서 재료·포장비만 뺀 금액이에요. 연습 목표는 12,000원이에요. 인건비 등은 이 계산에서 따로 다뤄요.",
          "unit": "원",
          "solutionHint": "샌드위치 4개로 8,000원을 채워요. 나머지 4,000원은 주스 4잔으로 채울 수 있어요."
        },
        {
          "mode": "inspect",
          "title": "상담에 가져갈 질문을 골라요",
          "instruction": "연습 가게에서 준비한 자료와 바로 맞춰 볼 수 있는 질문을 골라요.",
          "why": "한 장의 기록이 무엇을 설명해 주는지 알면 전문가와 이야기할 때 필요한 다음 자료도 찾기 쉬워요.",
          "sourceRefs": [
            4,
            5,
            7,
            8,
            9,
            10
          ],
          "target": "준비한 자료로 이야기할 수 있는 상담 질문",
          "cases": [
            {
              "label": "상권 보고서",
              "fields": [
                {
                  "label": "자료",
                  "value": "같은 동의 같은 업종 점포 수와 월별 변화"
                },
                {
                  "label": "질문",
                  "value": "우리 가게와 비교할 때 어느 업종과 기간을 보는 게 적절할까요?"
                }
              ],
              "fit": true,
              "feedback": "업종과 기간이 같은지 상담에서 함께 확인할 수 있어요."
            },
            {
              "label": "계산대의 판매 합계",
              "fields": [
                {
                  "label": "자료",
                  "value": "재료비나 임대료 없이 한 달 판매 합계만 적은 표"
                },
                {
                  "label": "질문",
                  "value": "이 판매 합계가 그대로 이번 달 이익인가요? 이 금액을 이익으로 확정하고 싶어요."
                }
              ],
              "fit": false,
              "feedback": "이익을 살피려면 비용 자료도 함께 필요해요."
            },
            {
              "label": "메뉴별 원가표",
              "fields": [
                {
                  "label": "자료",
                  "value": "메뉴별 판매가·판매 수량과 재료·포장비 기록"
                },
                {
                  "label": "질문",
                  "value": "판매 수량이 바뀔 때 매달 내는 비용을 채우는 금액은 얼마나 달라질까요?"
                }
              ],
              "fit": true,
              "feedback": "메뉴별로 남는 돈을 먼저 비교한 뒤 고정비 자료를 더해 볼 수 있어요."
            }
          ]
        }
      ]
    }
  },
  "L06_PIUM_DIRECTORY": {
    "sources": [
      {
        "title": "일상을 시로 쓰고 사진에 담는 디카시 창작",
        "publisher": "안산시평생학습관",
        "url": "https://lll.ansan.go.kr/web/cop/regEduDetail.do?mId=EDUMNG_0000000001578",
        "kind": "해당 강좌 강의계획",
        "observation": "관찰, 사진에서 문장 찾기, 설명을 걷어내는 문장, 퇴고, 완성작 낭독과 전시가 수업 내용이다.",
        "use": "초고에서 사진과 겹치는 설명을 덜어내는 작업을 넣었다."
      },
      {
        "title": "하천초 북메이킹 동아리의 디카시 지역 도서관 전시",
        "publisher": "하천초등학교·경상남도교육청",
        "url": "https://www.gne.go.kr/user/bbs/BD_selectBbs.do?q_bbsDocNo=20251113093857754&q_bbsSn=1509",
        "kind": "다른 지역 실제 전시 기록",
        "observation": "학생들이 일상을 소재로 만든 디카시를 지역 도서관에서 전시했다.",
        "use": "완성본에 독자가 처음 보는 제목을 붙이는 과제로 연결했다."
      },
      {
        "title": "창신동 골목 디카시 이야기",
        "publisher": "종로구립도서관",
        "url": "https://lib.jongno.go.kr/bbs/board.php?bo_table=ReadingPgm&wr_id=5952",
        "kind": "다른 지역 창작 모임 공고",
        "observation": "골목을 주제로 디카시를 쓰고 시집을 만드는 과정이다.",
        "use": "촬영 장소를 새로 찾아갈 필요 없이 일상 사물을 출발점으로 삼았다."
      },
      {
        "title": "황순원디카시 작품모집",
        "publisher": "한국디카시인협회",
        "url": "https://kdicapoet.com/bbs/board.php?bo_table=notice&page=1&wr_id=159",
        "kind": "공모 주최자 요강",
        "observation": "직접 찍은 사진과 자신이 지은 짧은 글을 한 작품으로 구성한다.",
        "use": "기존 시를 가져오지 않고 팀이 직접 쓴 초고만 마련했다."
      },
      {
        "title": "양산시립도서관 독서동아리 디카시집 출판기념회",
        "publisher": "뉴스로",
        "url": "https://www.newsro.kr/articles/1150731",
        "kind": "다른 지역 행사 보도",
        "observation": "회원들이 작품을 낭독하고 창작 배경을 설명한 뒤 질문을 받았다.",
        "use": "편집을 마친 뒤 제목과 마지막 줄을 이어 소리 내어 읽도록 했다."
      },
      {
        "title": "제2회 디카시 대전 전국공모전",
        "publisher": "대전시청자미디어센터",
        "url": "https://kcmf.or.kr/KCMF/contents/KCMF050507.do?id=20260917103625787880&schBcid=daejeonTTTnotice&schM=view",
        "kind": "다른 지역 공식 공모 자료",
        "observation": "디카시를 전시와 출판으로 연결하는 공모 방식과 출품 안내를 공개했다.",
        "use": "작은 화면에서도 장면과 글이 한 작품으로 읽히도록 완성 카드를 구성했다."
      },
      {
        "title": "황순원문학촌 소나기마을 디카시 수업",
        "publisher": "경기도양평교육지원청·경기도교육청",
        "url": "https://www.goe.go.kr/goe/na/ntt/selectNttInfo.do?mi=10102&nttSn=2362410&searchAt1=&searchValue1=",
        "kind": "다른 지역 현장 교육계획",
        "observation": "일상 대상을 직접 찍고 사진 한 장을 고른 뒤 짧게 쓰고 작품을 함께 읽는다.",
        "use": "같은 사물을 다르게 잡은 장면 메모에서 표현할 한 장을 고르게 했다."
      },
      {
        "title": "디카시 강좌의 첨삭과 동인지 만들기",
        "publisher": "동작50플러스센터",
        "url": "https://sdm.50plus.or.kr/djc/education-detail.do?id=75059701",
        "kind": "중장년 대상 강의계획",
        "observation": "작품을 함께 살펴보고 현장에서 주어진 사진으로 쓰며 개인 작품을 첨삭한다.",
        "use": "어떤 수정이 한 장면의 메시지를 살리는지 초고와 수정본으로 비교한다."
      },
      {
        "title": "뉴스N제주 신춘문예 디카시 부문 심사평",
        "publisher": "한국디카시연구소",
        "url": "https://dicapoem.net/bbs/board.php?bo_table=board_board&page=5&wr_id=102",
        "kind": "심사위원의 실제 작품 심사평",
        "observation": "심사위원들이 사물에 포착된 순간과 시어가 결합하는 방식을 분석했다.",
        "use": "이미지를 단순히 되풀이하는 줄과 새로운 관계를 떠올리게 하는 줄을 구분한다."
      },
      {
        "title": "정선 국가문화유산 전국 디카시 공모전",
        "publisher": "정선군청 게시판",
        "url": "https://jeongseon.go.kr/portal/openadmin/communication/residentsboard/freeboard?articleSeq=312805",
        "kind": "다른 지역 공모 공지",
        "observation": "지역의 문화유산을 주제로 사진과 글을 결합하는 작품을 모집했다.",
        "use": "장면에 남길 단서를 주제에 맞춰 고르는 방식에 참고했다."
      }
    ],
    "lab": {
      "title": "빈 찻잔으로 디카시 한 편 편집하기",
      "brief": "피움학교 디카시 강좌에서는 일상의 사물을 보고, 장면과 글을 함께 고쳐요. ANTI가 준비한 빈 찻잔 장면 메모로 작품 한 편을 편집해 보세요.",
      "artifact": "제목과 두 줄을 붙인 디카시 편집본",
      "rounds": [
        {
          "mode": "inspect",
          "title": "찻잔에서 무엇을 남길까요?",
          "instruction": "이번 작품의 주제는 ‘자리에 남은 흔적’이에요. 잔이 어디에 있었는지 보여 주는 구도 메모를 모두 골라 보세요.",
          "why": "무엇을 화면 밖에 두느냐에 따라 같은 찻잔도 다른 이야기가 돼요. 모든 사진에 맞는 정답이 아니라 이번 작품의 주제에 맞춰 골라요.",
          "sourceRefs": [
            1,
            3,
            7,
            8,
            10
          ],
          "target": "빈자리도, 그 자리에 무엇이 있었는지 알려 주는 흔적도 보여야 해요.",
          "cases": [
            {
              "label": "잔을 옆으로 옮긴 탁자",
              "fields": [
                {
                  "label": "가운데",
                  "value": "탁자 위에 동그랗게 남은 물자국"
                },
                {
                  "label": "화면 가장자리",
                  "value": "잔의 둥근 바닥 일부"
                }
              ],
              "fit": true,
              "feedback": "물자국과 잔 바닥을 함께 보면 크기와 모양을 견줄 수 있어요. 잔이 있던 자리가 드러나요."
            },
            {
              "label": "잔 안쪽을 가득 담은 구도",
              "fields": [
                {
                  "label": "가운데",
                  "value": "찻물에 비친 창문"
                },
                {
                  "label": "화면 가장자리",
                  "value": "잔의 흰 테두리"
                }
              ],
              "fit": false,
              "feedback": "잔 안에 담긴 빛은 잘 보여요. 이번 주제에 필요한 탁자와 빈자리는 화면 밖에 있어요."
            },
            {
              "label": "마른 자리와 젖은 자리",
              "fields": [
                {
                  "label": "가운데",
                  "value": "둥근 물자국이 절반만 마른 흔적"
                },
                {
                  "label": "화면 가장자리",
                  "value": "젖은 바닥을 보이는 잔"
                }
              ],
              "fit": true,
              "feedback": "마른 쪽과 젖은 쪽의 차이에서 시간이 흐른 자리를 읽을 수 있어요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "두 줄짜리 초고 만들기",
          "instruction": "첫 줄에는 눈으로 짚을 수 있는 모양을, 끝줄에는 사진에 보이지 않는 생각을 놓아 보세요. 제목은 두 줄을 다시 보게 하는 말로 붙여요.",
          "why": "‘무엇이 찍혔지?’에 답하는 줄 하나와 ‘무엇을 떠올렸지?’에 답하는 줄 하나를 붙이면 설명문에서 벗어날 수 있어요.",
          "sourceRefs": [
            1,
            4,
            7,
            9
          ],
          "slots": [
            {
              "label": "첫 줄 · 보이는 단서",
              "hint": "물자국의 한 부분을 짚어요."
            },
            {
              "label": "끝줄 · 새로 떠오른 생각",
              "hint": "빈자리에 남은 흔적에 새로운 뜻을 붙여요."
            },
            {
              "label": "제목 · 다시 보게 하는 말",
              "hint": "읽고 나서 물자국이 다르게 보이도록 짧게 붙여요."
            }
          ],
          "pieces": [
            {
              "label": "탁자에 반만 마른 동그라미",
              "slot": 0,
              "feedback": "탁자와 동그라미는 보는 사람도 찾을 수 있는 구체적인 단서예요."
            },
            {
              "label": "비어도 자리는 천천히 마른다",
              "slot": 1,
              "feedback": "눈에 보이는 마름에 ‘비어도’라는 생각이 얹혀요."
            },
            {
              "label": "떠난 자리",
              "slot": 2,
              "feedback": "짧은 제목이 물자국을 한 번 더 보게 해요."
            },
            {
              "label": "여기에는 찻잔과 탁자가 보인다",
              "slot": -1,
              "feedback": "두 사물을 열거하면 앞줄과 비슷한 안내가 한 번 더 나와요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "낭독할 판본 골라내기",
          "instruction": "서로 다른 편집본을 읽어 보세요. 제목을 본 뒤 두 줄을 소리 내어 이어 읽을 만한 판본을 골라요.",
          "why": "실제 강좌는 완성작을 낭독하고 전시해요. 편집본마다 사물의 단서 하나가 남았는지, 마지막 줄이 새 의미를 주는지 확인해 보세요.",
          "sourceRefs": [
            1,
            2,
            5,
            6,
            8,
            9
          ],
          "target": "찻잔의 물자국을 짚는 단서와 그 자리에 대한 생각을 모두 남겨요.",
          "cases": [
            {
              "label": "떠난 자리",
              "fields": [
                {
                  "label": "첫 줄",
                  "value": "탁자에 반만 마른 동그라미"
                },
                {
                  "label": "끝줄",
                  "value": "비어도 자리는 천천히 마른다"
                }
              ],
              "fit": true,
              "feedback": "앞줄은 동그라미, 끝줄은 비워진 시간을 말해요. 두 줄이 다른 일을 해요."
            },
            {
              "label": "찻잔 설명",
              "fields": [
                {
                  "label": "첫 줄",
                  "value": "탁자에 잔이 있었다"
                },
                {
                  "label": "끝줄",
                  "value": "이것은 잔 바닥에 생긴 물자국이다"
                }
              ],
              "fit": false,
              "feedback": "두 줄 모두 물자국이 생긴 까닭만 전해요. 마지막 줄에서 그 자리가 떠올리게 한 생각을 보태 보세요."
            },
            {
              "label": "남겨진 무늬",
              "fields": [
                {
                  "label": "첫 줄",
                  "value": "흰 잔은 옆으로, 둥근 자국은 제자리에"
                },
                {
                  "label": "끝줄",
                  "value": "사라지는 데도 시간이 든다"
                }
              ],
              "fit": true,
              "feedback": "옮겨 간 잔과 남은 자국의 차이가 끝줄의 생각을 받쳐 줘요."
            }
          ]
        }
      ]
    }
  },
  "L15": {
    "sources": [
      {
        "title": "작은도서관 독서동아리 북세통·한뉘·옹달샘",
        "publisher": "안산시평생학습관",
        "url": "https://lll.ansan.go.kr/web/content.do?proFn=9314000",
        "kind": "해당 기관 동아리 소개",
        "observation": "북세통은 문학, 역사, 과학 등 다양한 분야의 책을 읽고 이야기를 나눈다.",
        "use": "한 장면으로 서로 다른 해석을 열 수 있는 발제 쪽지를 만들었다."
      },
      {
        "title": "작은도서관 프로그램과 독후 활동",
        "publisher": "안산시평생학습관",
        "url": "https://lll.ansan.go.kr/web/content.do?proFn=9313000",
        "kind": "해당 기관 운영 안내",
        "observation": "주부, 청소년, 시니어 독서동아리의 정기 토론과 독후 활동을 소개한다.",
        "use": "토론 뒤에도 남길 수 있는 독서 쪽지를 결과물로 정했다."
      },
      {
        "title": "중앙도서관 독서동아리 지원과 모집",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1638030",
        "kind": "같은 지역 공식 운영 사례",
        "observation": "공통의 독서 관심사를 가진 시민을 대상으로 모임을 구성하고 작가 만남 등 활동을 지원한다.",
        "use": "같은 책에 대한 서로 다른 관심사를 대화에 남기도록 했다."
      },
      {
        "title": "중앙도서관 독서토론 아카데미",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0214&bbs_seq=1542669&currentPage=1&key=260&sch_text=%EC%95%84&sch_type=sj",
        "kind": "같은 지역 청소년 교육 공고",
        "observation": "주제 도서를 미리 읽고 필기구를 준비해 토론에 스스로 참여하도록 안내한다.",
        "use": "경험이 없어도 원문에서 한 대목만 표시하고 시작하게 했다."
      },
      {
        "title": "한 학기 한 권 읽기 연계 독서토론 발제문",
        "publisher": "전라남도교육청 독서인문교육 자료",
        "url": "https://www.jne.go.kr/upload/readingedu/na/bbs_712/ntt_5081073/doc_fca016e2-6d51-4ab4-89fc-b3db4aa845121707a2017b19324.pdf",
        "kind": "다른 기관 실물 발제 활동지",
        "observation": "읽은 책을 바탕으로 발제문을 쓰는 활동지 양식이 수록돼 있다.",
        "use": "쪽지를 본문 근거와 해석 및 질문으로 나누었다."
      },
      {
        "title": "함께 읽기, 발제로 독서 효과 높이기",
        "publisher": "내일교육",
        "url": "https://file.naeiledu.co.kr/uploadfile/20190305/114910_040_042_%ED%95%A8%EA%BB%98%EC%9D%BD%EA%B8%B0ok.pdf",
        "kind": "현장 인터뷰·지면 사진 확인",
        "observation": "참여자들이 준비한 발제문을 나누고 서로 질문했다. 지면 사진에서 책 소개와 파트별 질문을 나눈 실제 활동지를 확인했다.",
        "use": "모임의 첫 발언을 짧은 본문 근거와 질문으로 준비하는 방식을 적용했다."
      },
      {
        "title": "한 책, 한 도시 독서운동의 이해와 운영",
        "publisher": "경기도메모리",
        "url": "https://memory.library.kr/files/original/bddbca5975a8b7afafa73f9e08e6871b.pdf",
        "kind": "독서운동 운영 자료",
        "observation": "한 책을 함께 읽고 토론을 중심으로 주제에 관한 경험을 확장하는 방식을 설명한다.",
        "use": "참가자 모두가 볼 수 있는 공통의 짧은 원문을 제공한다."
      },
      {
        "title": "독서토론 프로그램 운영의 실제",
        "publisher": "문화체육관광부 작은도서관",
        "url": "https://www.mcst.go.kr/slibrary/program/view/452?currentPage=45&readingProgramCategory=&title=",
        "kind": "공개 진행자 자료",
        "observation": "모둠장이 쟁점을 꺼내고 다른 사람이 근거를 말하도록 후속 질문을 던지는 여러 토론 모형을 설명한다.",
        "use": "의견이 갈렸을 때 근거를 되묻는 후속 질문을 연습한다."
      },
      {
        "title": "독서토론 개념과 진행 방법",
        "publisher": "경기도교육청",
        "url": "https://www.goe.go.kr/resource/old/BBSMSTR_000000030111/BBS_202502170406048820.pdf",
        "kind": "교육 자료",
        "observation": "책을 근거로 토론 주제를 정하고 다른 사람의 뜻을 정확히 이해하기 위해 질문하라고 안내한다.",
        "use": "추측을 원문 사실처럼 적은 메모를 골라 고치게 한다."
      },
      {
        "title": "독서모임 활용하기 매뉴얼",
        "publisher": "제주특별자치도교육청 제남도서관",
        "url": "https://org.jje.go.kr/lib/index.jje?menuCd=DOM_000000806004004000",
        "kind": "도서별 실제 토론 예시",
        "observation": "인상에 남은 점과 해석, 다른 관점, 토론 뒤 달라진 생각을 묻는 발문 사례를 싣고 있다.",
        "use": "한 문장에 여러 해석을 초대할 수 있는 질문을 조립하는 데 참고했다."
      }
    ],
    "lab": {
      "title": "북세통에서 꺼낼 발제 쪽지 만들기",
      "brief": "안산 북세통은 함께 책을 읽고 생각을 나눠요. 종이 한 장을 접었다 펴 보세요. 그 동작을 쓴 ANTI의 짧은 글로 모임에서 꺼낼 질문을 만들어요.",
      "artifact": "본문 한 대목과 열린 질문을 담은 발제 쪽지",
      "rounds": [
        {
          "mode": "inspect",
          "title": "본문에서 근거 밑줄 긋기",
          "instruction": "함께 읽을 글이에요. ‘종이를 반으로 접으면 두 면이 포개진다. 다시 펼쳐도 접힌 선은 남는다. 그 선을 따라 같은 자리에서 다시 접기 쉽다.’ 글과 나란히 놓을 밑줄 메모를 고르세요.",
          "why": "독서 모임에서는 어디를 읽고 그렇게 생각했는지 짚으면 다른 사람도 이야기에 들어올 수 있어요.",
          "sourceRefs": [
            1,
            2,
            4,
            5,
            6
          ],
          "target": "본문에 실제로 있는 말로, 접은 뒤 생기는 변화를 짚은 메모를 담아요.",
          "cases": [
            {
              "label": "펼친 뒤의 종이",
              "fields": [
                {
                  "label": "밑줄",
                  "value": "다시 펼쳐도 접힌 선은 남는다."
                },
                {
                  "label": "눈여겨본 것",
                  "value": "펼쳐도 남아 있는 흔적"
                }
              ],
              "fit": true,
              "feedback": "글에서 직접 찾을 수 있는 변화예요. ‘펼친 뒤’가 어느 때인지도 분명해요."
            },
            {
              "label": "종이의 색",
              "fields": [
                {
                  "label": "밑줄 후보",
                  "value": "종이는 처음보다 어두워졌다."
                },
                {
                  "label": "눈여겨본 것",
                  "value": "접힌 뒤 종이의 빛깔"
                }
              ],
              "fit": false,
              "feedback": "원문은 색이 변했다고 하지 않았어요. 생각을 보탤 수 있지만 본문의 말로 쓰려면 다시 읽어야 해요."
            },
            {
              "label": "다시 접히는 자리",
              "fields": [
                {
                  "label": "밑줄",
                  "value": "그 선을 따라 같은 자리에서 다시 접기 쉽다."
                },
                {
                  "label": "눈여겨본 것",
                  "value": "남은 자국이 다음 동작에 미치는 영향"
                }
              ],
              "fit": true,
              "feedback": "선이 남는다는 관찰에서 한 걸음 더 나아간 문장이에요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "근거와 생각을 나눠 발제하기",
          "instruction": "쪽지에 원문 한 대목, 가능한 해석, 다른 해석을 초대하는 질문을 놓아요.",
          "why": "해석을 말한 뒤 다른 사람에게도 원문을 읽어 달라고 청하면, 먼저 발표할 때의 부담이 줄어요.",
          "sourceRefs": [
            1,
            5,
            6,
            8,
            9,
            10
          ],
          "slots": [
            {
              "label": "본문에 밑줄",
              "hint": "글을 그대로 짚어요."
            },
            {
              "label": "내가 읽은 뜻",
              "hint": "본문을 읽고 떠올린 생각을 붙여요."
            },
            {
              "label": "모임에 건넬 질문",
              "hint": "다른 읽기도 가능하도록 끝을 열어요."
            }
          ],
          "pieces": [
            {
              "label": "다시 펼쳐도 접힌 선은 남는다.",
              "slot": 0,
              "feedback": "모두가 같은 글에서 찾을 수 있는 대목이에요."
            },
            {
              "label": "남은 자국이 다음 행동을 도와주는 길처럼 읽힌다.",
              "slot": 1,
              "feedback": "길이라는 표현은 원문에 없는 나의 해석이에요."
            },
            {
              "label": "그 선은 길에 더 가까울까요, 제한에 더 가까울까요? 어느 대목이 그렇게 들렸나요?",
              "slot": 2,
              "feedback": "서로 다른 해석과 그 근거가 함께 나올 수 있어요."
            },
            {
              "label": "누가 이 종이를 접었는지 맞혀 보세요.",
              "slot": -1,
              "feedback": "글에는 누가 접었는지 단서가 없어요. 짐작만 남으면 원문을 놓고 대화하기 어려워요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "의견이 다를 때 이어 갈 질문 고르기",
          "instruction": "같은 선에서 ‘도움’과 ‘제약’이라는 두 해석이 나왔어요. 두 사람이 각각 글의 어느 표현을 보았는지 들을 질문을 골라 보세요.",
          "why": "처음 읽은 생각을 고집할 필요는 없어요. 질문을 한 번 더 건네면 상대가 본 대목을 내 메모에도 남길 수 있어요.",
          "sourceRefs": [
            3,
            7,
            8,
            9,
            10
          ],
          "target": "결론을 강요하지 않고 원문을 다시 볼 길을 열어 두세요.",
          "cases": [
            {
              "label": "표현 짚기",
              "fields": [
                {
                  "label": "다음 질문",
                  "value": "어느 낱말에서 ‘제약’이 느껴졌나요?"
                },
                {
                  "label": "돌아갈 곳",
                  "value": "‘같은 자리’라고 한 대목"
                }
              ],
              "fit": true,
              "feedback": "이유를 들을 자리가 있고, 원문에서 함께 확인할 말도 있어요."
            },
            {
              "label": "다수결로 끝내기",
              "fields": [
                {
                  "label": "다음 질문",
                  "value": "‘도움’이라는 해석에 찬성하는 분이 더 많죠?"
                },
                {
                  "label": "돌아갈 곳",
                  "value": "표를 더 많이 얻은 의견"
                }
              ],
              "fit": false,
              "feedback": "찬성 수는 세지만 다른 사람이 어떤 대목을 읽었는지는 듣기 어려워요."
            },
            {
              "label": "두 해석 나란히 놓기",
              "fields": [
                {
                  "label": "다음 질문",
                  "value": "‘쉽다’와 ‘같은 자리’ 가운데 어느 표현에 더 눈이 갔나요? 이유도 궁금해요."
                },
                {
                  "label": "돌아갈 곳",
                  "value": "글 끝의 두 표현"
                }
              ],
              "fit": true,
              "feedback": "한 문장 안에서 서로 다른 해석의 근거를 나란히 찾을 수 있어요."
            }
          ]
        }
      ]
    }
  },
  "L16": {
    "sources": [
      {
        "title": "평생비전센터 동아리 현황과 주요 활동",
        "publisher": "안산시 평생비전센터",
        "url": "https://wm.ansan.go.kr/wmvision/selectWmClub.do",
        "kind": "해당 기관 실제 동아리",
        "observation": "한소리가 민요와 장고 작품을 연습하고 봉사활동을 한다. 다른 음악 동아리도 각각의 활동을 운영한다.",
        "use": "한소리를 출발점으로 장구 반주의 기초에 초점을 맞췄다."
      },
      {
        "title": "스트레스 타파 트롯 장구 강의계획",
        "publisher": "안산시평생학습관",
        "url": "https://lll.ansan.go.kr/web/cop/regEduDetail.do?mId=EDUMNG_0000000001561",
        "kind": "같은 지역의 별도 기관 강좌",
        "observation": "궁채와 열채를 익혀 곡에 맞춰 연습하는 장구 수업의 내용을 공개했다.",
        "use": "양편과 한편을 구분하고 나서 박을 짚는 연습으로 연결했다."
      },
      {
        "title": "국악사전 굿거리",
        "publisher": "국립국악원",
        "url": "https://www.gugak.go.kr/ency/topic/view/1321",
        "kind": "장단 구조·연주 설명",
        "observation": "큰박 하나를 세 부분으로 나누는 네 박 장단이다. 민요에서 장구 반주에 쓰인다.",
        "use": "큰박 네 개를 채우는 연습 마디로 바꿨다."
      },
      {
        "title": "국악사전 자진모리",
        "publisher": "국립국악원",
        "url": "https://www.gugak.go.kr/ency/topic/view/1318",
        "kind": "장단 구조·작품 예",
        "observation": "굿거리처럼 큰박 하나가 세 부분으로 나뉘며 여러 민요와 농악에 쓰인다.",
        "use": "빠르기와 큰박의 묶음은 구별해야 한다는 설명에 참고했다."
      },
      {
        "title": "국악사전 장구",
        "publisher": "국립국악원",
        "url": "https://www.gugak.go.kr/ency/topic/view/%EC%9E%A5%EA%B5%AC",
        "kind": "악기 구조와 주법 자료",
        "observation": "장구의 두 면과 채, 연주 형태에 따른 주법의 차이를 설명한다.",
        "use": "구음과 칠 면을 연결하는 세 개의 손동작 카드를 만들었다."
      },
      {
        "title": "장단맞춰, 쿵딱!",
        "publisher": "국립국악원 e국악아카데미",
        "url": "https://academy.gugak.go.kr/open/open/lecture/detail.do?openLectureSeq=1536",
        "kind": "공식 영상 소개·활동지 목록 확인",
        "observation": "굿거리와 자진모리를 배우는 애니메이션 소개와 첨부 활동지 목록을 확인했다. 영상 본편은 열리지 않았다.",
        "use": "별도의 교육용 장단 연습이 있음을 소개하고 박 구분은 악보 자료로 확인했다."
      },
      {
        "title": "예술지식백과의 장구 구음과 신체장단놀이",
        "publisher": "문화포털",
        "url": "https://www.culture.go.kr/portal/cltKnw/artCont/view.do?knwldgSn=7541&menuNo=200022",
        "kind": "실제 무릎장단 지도 자료",
        "observation": "두 무릎을 함께 치거나 오른쪽과 왼쪽을 따로 치며 덩, 덕, 쿵을 소리 내는 활동을 제시한다.",
        "use": "악기 없이 양손과 양 무릎으로 직접 소리를 읽을 수 있도록 했다."
      },
      {
        "title": "국악 교과서 표준악보집, 민속악 장단 및 사물놀이",
        "publisher": "국립국악원",
        "url": "https://www.gugak.go.kr/userfiles/files/%EA%B5%90%EA%B3%BC%EC%84%9C%ED%91%9C%EC%A4%80%EC%95%85%EB%B3%B4%EC%A7%91%20%EB%82%B4%EC%A7%80%20%EC%88%98%EC%A0%95%20%EC%B5%9C%EC%A2%85%282%29.pdf",
        "kind": "실제 악보·구음표",
        "observation": "악보의 장구 구음표는 궁편과 채편을 함께 치는 소리, 각 편을 따로 치는 소리를 나눈다.",
        "use": "손 카드의 표기를 악보의 구음 설명과 대조했다."
      },
      {
        "title": "음악 지도서 기악 편의 장구 연주",
        "publisher": "아침나라",
        "url": "https://www.achimnara.kr/upload/2024/07/28/f0a18331a31d482c81bdde6fc9fe07cb.pdf",
        "kind": "음악 교사용 지도서",
        "observation": "구음으로 익힌 뒤 무릎장단으로 연습하고 악기로 옮기는 지도법을 싣는다.",
        "use": "악기를 구하지 않아도 연습 결과를 확인할 수 있는 과제로 만들었다."
      },
      {
        "title": "국악사전 경기민요",
        "publisher": "국립국악원",
        "url": "https://www.gugak.go.kr/ency/topic/view/832",
        "kind": "민요 합창 형태 자료",
        "observation": "함께 노래할 때 독창으로 부르는 앞소리와 여럿이 부르는 후렴을 구분한다.",
        "use": "합주에서 반주와 노래가 맡는 일이 다르다는 역할표에 참고했다."
      }
    ],
    "lab": {
      "title": "무릎으로 쳐 보는 민요 반주 한 마디",
      "brief": "평생비전센터 ‘한소리’는 민요와 장고 작품을 연습해요. 장구 없이 무릎으로 칠 수 있는 연습 악보를 만들어 봐요. ANTI가 만든 한 마디로, 동아리의 공연 곡과는 구별해요.",
      "artifact": "집에서도 따라 칠 수 있는 무릎장단 악보",
      "rounds": [
        {
          "mode": "assemble",
          "title": "소리와 손을 맞춰 손그림 악보 만들기",
          "instruction": "두 손을 무릎에 올려요. ‘덩, 쿵, 덕’이라고 말할 때 어느 쪽을 칠지 짝을 지어 보세요. 놓은 뒤 실제로 가볍게 두드려 보세요.",
          "why": "‘덩’은 장구의 양편, ‘쿵’은 궁편, ‘덕’은 채편 소리예요. 무릎장단은 이 세 가지를 두 손으로 구분하는 방법이에요.",
          "sourceRefs": [
            1,
            2,
            5,
            7,
            8,
            9
          ],
          "slots": [
            {
              "label": "덩 · 두 면이 함께 울리는 소리",
              "hint": "두 손을 동시에 내려요."
            },
            {
              "label": "쿵 · 궁편이 울리는 소리",
              "hint": "왼손으로 짚어요."
            },
            {
              "label": "덕 · 채편이 울리는 소리",
              "hint": "오른손으로 짚어요."
            }
          ],
          "pieces": [
            {
              "label": "양손으로 양 무릎을 함께 치기",
              "slot": 0,
              "feedback": "양편을 함께 치는 ‘덩’의 동작이에요."
            },
            {
              "label": "왼손으로 왼 무릎 치기",
              "slot": 1,
              "feedback": "궁편에 해당하는 ‘쿵’을 왼쪽에 두면 오른쪽 소리와 쉽게 구별해요."
            },
            {
              "label": "오른손으로 오른 무릎 치기",
              "slot": 2,
              "feedback": "채편에 해당하는 ‘덕’의 동작이에요."
            },
            {
              "label": "손은 두고 소리가 지나가게 두기",
              "slot": -1,
              "feedback": "쉴 때의 동작이에요. ‘덩, 쿵, 덕’은 모두 치는 소리예요."
            }
          ]
        },
        {
          "mode": "allocate",
          "title": "네 큰박에 맞는 반주 한 마디 짜기",
          "instruction": "한 큰박은 작은칸 셋이에요. ‘덩·쉼·쉼’, ‘덕·쿵’, ‘쉼’을 아래 적힌 순서로 이어 작은칸 열둘을 채워요. 소리 내며 손으로 쳐 보세요.",
          "why": "같은 열두 칸에도 소리를 촘촘히 칠 수도, 쉬는 자리를 늘릴 수도 있어요. 이번 마디는 굿거리의 박 구조를 빌린 ANTI 연습 리듬이에요.",
          "sourceRefs": [
            3,
            4,
            6,
            7,
            8,
            9
          ],
          "tokens": [
            {
              "label": "덩·쉼·쉼",
              "unit": "묶음",
              "min": 1,
              "max": 3,
              "initial": 1,
              "step": 1,
              "coefficient": 3
            },
            {
              "label": "덕·쿵",
              "unit": "짝",
              "min": 1,
              "max": 4,
              "initial": 1,
              "step": 1,
              "coefficient": 2
            },
            {
              "label": "쉼",
              "unit": "번",
              "min": 1,
              "max": 4,
              "initial": 1,
              "step": 1,
              "coefficient": 1
            }
          ],
          "target": 12,
          "targetLabel": "큰박 넷에 들어갈 작은칸",
          "rule": "긴 묶음은 세 칸, 두 소리는 두 칸, 한 번 쉬면 한 칸을 써요. 큰박마다 속으로 ‘하나 둘 셋’을 세요.",
          "unit": "칸",
          "solutionHint": "막히면 ‘덩·쉼·쉼’ 두 묶음, ‘덕·쿵’ 두 짝, ‘쉼’ 두 번으로 쳐 보세요. 쉼에서도 속으로 세면 다음 박이 이어져요."
        },
        {
          "mode": "assemble",
          "title": "반주할 자리를 합주표에 표시하기",
          "instruction": "민요를 함께 부를 때의 역할을 펼쳤어요. 앞소리, 후렴, 장구 반주에 각자 할 일을 놓고 반주 자리를 찾아 보세요.",
          "why": "함께할 때 모든 사람이 처음부터 모든 가사를 외울 필요는 없어요. 경기민요에 나타나는 선창과 후렴, 민요와 어우러지는 장구 역할을 구분해 봐요.",
          "sourceRefs": [
            1,
            3,
            4,
            5,
            10
          ],
          "slots": [
            {
              "label": "앞소리",
              "hint": "본절의 가락을 이끌어요."
            },
            {
              "label": "후렴",
              "hint": "반복되는 대목을 함께 불러요."
            },
            {
              "label": "장구 반주",
              "hint": "노래가 이어지도록 박을 받쳐요."
            }
          ],
          "pieces": [
            {
              "label": "한 사람이 본절을 먼저 부르기",
              "slot": 0,
              "feedback": "앞소리 담당은 본절을 독창으로 이끌어요."
            },
            {
              "label": "되풀이되는 가사를 여럿이 함께 부르기",
              "slot": 1,
              "feedback": "같은 가락을 나눌 수 있는 후렴 자리예요."
            },
            {
              "label": "노랫말을 따라가며 큰박 짚기",
              "slot": 2,
              "feedback": "방금 손으로 친 연습을 쓰는 자리예요. 가사를 부르지 않아도 박을 함께해요."
            },
            {
              "label": "가장 빠른 속도로 처음부터 끝까지 치기",
              "slot": -1,
              "feedback": "소리의 빠르기를 독주처럼 마음대로 정하면 노래와 맞추기 어려워요."
            }
          ]
        }
      ]
    }
  },
  "L08_MIND_COUNSELING": {
    "sources": [
      {
        "title": "성인 정신건강상담 이용 안내",
        "publisher": "안산시정신건강복지센터",
        "url": "https://wmind.org/sub.php?menukey=18",
        "kind": "지역 사업 안내",
        "observation": "성인 상담 절차에 상담 예약 신청이 있으며 상담에서 필요한 서비스를 살펴본다.",
        "use": "전문가와 이야기할 약속을 잡는 선택지를 구성했다."
      },
      {
        "title": "참여공간의 상담예약 신청 화면",
        "publisher": "안산시정신건강복지센터",
        "url": "https://wmind.org/sub.php?menukey=33",
        "kind": "공식 접수 화면",
        "observation": "성인·아동을 구분하고 동의 사항과 신청 항목을 제시한다.",
        "use": "체험에서 입력란을 복제하지 않고 실제 신청은 별도라는 점을 표시했다."
      },
      {
        "title": "마음쏙카로 찾아가는 캠페인의 현장 업무",
        "publisher": "안산시정신건강복지센터",
        "url": "https://www.mentalhealth.or.kr/Community/Clinic/Files/2024%EB%85%84%2005%EC%9B%94%20%EC%95%88%EC%82%B0%EC%8B%9C%EC%A0%95%EC%8B%A0%EA%B1%B4%EA%B0%95%EB%B3%B5%EC%A7%80%EC%84%BC%ED%84%B0%20%EC%9B%94%EA%B0%84%EC%97%85%EB%AC%B4%EB%B3%B4%EA%B3%A0.pdf",
        "kind": "지역 현장 운영계획",
        "observation": "2024년 5월 보고서는 이동 차량으로 지역 행사와 기관을 찾아 시민에게 마음건강 서비스를 안내하는 계획을 담았다.",
        "use": "현장 참여와 집에서 받는 문자상담의 차이를 이동 서비스 카드로 보여 준다."
      },
      {
        "title": "버스정류장에 마련한 마음벤치",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1670837",
        "kind": "지역 운영 사례",
        "observation": "벤치에 붙인 QR로 온라인 상담을 신청하는 방식을 공개했다.",
        "use": "마음벤치의 QR도 같은 문자상담으로 연결된다는 피드백을 만들었다."
      },
      {
        "title": "안산시정신건강복지센터 2026년 1월 주요업무",
        "publisher": "안산시정신건강복지센터",
        "url": "https://www.mentalhealth.or.kr/Community/Clinic/Files/2026%EB%85%84%201%EC%9B%94%20%EC%95%88%EC%82%B0%EC%8B%9C%EC%A0%95%EC%8B%A0%EA%B1%B4%EA%B0%95%EB%B3%B5%EC%A7%80%EC%84%BC%ED%84%B0%20%EC%9B%94%EA%B0%84%EC%97%85%EB%AC%B4%EB%B3%B4%EA%B3%A0.pdf",
        "kind": "지역 운영 보고서",
        "observation": "공공장소의 마음건강 기기에서 정보를 보고 상담 예약이나 병의원 안내로 연결하는 계획을 담았다.",
        "use": "무인기기로 정보를 보는 일과 예약하는 일을 구별했다."
      },
      {
        "title": "마음건강 로켓처방 시작 화면",
        "publisher": "안산시정신건강복지센터",
        "url": "https://rocket.ansanmind.or.kr/",
        "kind": "지역 온라인 서비스",
        "observation": "실제 서비스가 고민 주제로 시작할 수 있는 단추를 제공한다.",
        "use": "집에서 글로 문의하는 카드의 명칭과 출발점을 확인했다."
      },
      {
        "title": "스트레스 영상과 게시자 대본",
        "publisher": "국립정신건강센터",
        "url": "https://www.mentalhealth.go.kr/portal/bbs/bbsDetail.do?bbsId=BBSINIT_5&nttId=407",
        "kind": "공식 영상 · 게시자 대본 확인",
        "observation": "영상 대본은 일상의 변화를 살피고 큰 목표를 실행하기 쉬운 작은 일로 나누는 예를 든다.",
        "use": "막연한 목표 대신 바로 해 볼 행동 한 가지를 고르는 칸을 구성했다."
      },
      {
        "title": "마음봄봄 워크시트의 스트레스 사건과 대처 행동",
        "publisher": "국립정신건강센터 공개·국제성모병원 연구진",
        "url": "https://www.ncmh.go.kr/static/jsp/viewHtmlDownload.jsp?filePath=%2F2020%2F05%2F20200528153737163162_2.pdf&filename=%EB%A7%88%EC%9D%8C%EA%B1%B4%EA%B0%95_%EA%B3%A0%EC%9C%84%ED%97%98%EA%B5%B0%EC%9D%84_%EC%9C%84%ED%95%9C_%EB%A7%88%EC%9D%8C_%EB%B4%84%EB%B4%84_%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8_%EC%A7%84%ED%96%89%EC%9E%90_%EB%A7%A4%EB%89%B4%EC%96%BC.pdf",
        "kind": "공개 활동지",
        "observation": "청년용 원자료는 사건과 그때 해 보았던 행동을 별도로 정리한다.",
        "use": "칸을 나누는 원리만 빌려 연령에 무관한 생활 예시 메모로 새로 만들었다."
      },
      {
        "title": "지역사회 정신건강 우수사례집의 스트레스 수업",
        "publisher": "국립정신건강센터",
        "url": "https://www.ncmh.go.kr/static/jsp/viewHtmlDownload.jsp?filePath=%2F2020%2F01%2F20200122155006121325_1.pdf&filename=2019_%EC%A7%80%EC%97%AD%EC%82%AC%ED%9A%8C_%EC%A0%95%EC%8B%A0%EA%B1%B4%EA%B0%95_%EC%9A%B0%EC%88%98%EC%82%AC%EB%A1%80%EC%A7%91_%EC%B5%9C%EC%A2%85.pdf",
        "kind": "지역 프로그램 사례집",
        "observation": "수업에서 정서·행동의 신호를 알아차리고 일상에서 쓸 대처 방법을 찾아본다.",
        "use": "생활에 생긴 변화와 앞으로 시도할 행동을 별도 칸으로 나눴다."
      },
      {
        "title": "안산시 정신건강사업의 상담·재활 지원 안내",
        "publisher": "안산시 단원보건소",
        "url": "https://ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=health01",
        "kind": "지역 서비스 안내",
        "observation": "보건소가 시민 대상 상담과 센터의 전문 지원 업무를 구분해 소개한다.",
        "use": "체험 결과가 병명이나 서비스 배정으로 읽히지 않도록 상담 준비 메모만 완성하게 했다."
      }
    ],
    "lab": {
      "title": "마음이 복잡할 때 꺼내 쓸 상담 메모",
      "brief": "안산에서 받을 수 있는 도움을 비교하고, 생활에 생긴 변화를 상담에서 어떻게 설명할지 예시 메모를 정리해요.",
      "artifact": "문자상담 경로와 생활 메모",
      "rounds": [
        {
          "mode": "inspect",
          "title": "글로 답장을 받으려면 어디로 갈까요?",
          "instruction": "안내 카드마다 무엇을 보내고 무엇을 받는지 열어 보세요. 집에서 글을 남기고 전문가의 문자 답장을 받을 수 있는 경로를 골라요.",
          "target": "집에서 고민을 남길 수 있고 개별 문자 답장이 오는 경로",
          "why": "예약 접수와 정보 열람, 고민에 대한 문자 답변은 서로 다른 일입니다. 안산의 마음벤치 QR도 같은 로켓처방으로 연결돼요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            5,
            6,
            10
          ],
          "cases": [
            {
              "label": "센터 상담예약",
              "fields": [
                {
                  "label": "보내는 것",
                  "value": "상담 약속을 잡기 위한 신청"
                },
                {
                  "label": "이어지는 일",
                  "value": "예약에 관한 안내"
                }
              ],
              "fit": false,
              "feedback": "상담 약속을 원할 때 맞아요. 예약 접수만으로 고민에 대한 문자 답변을 신청한 것은 아니에요."
            },
            {
              "label": "마음건강 로켓처방",
              "fields": [
                {
                  "label": "시작하는 곳",
                  "value": "집에서 여는 로켓처방 누리집"
                },
                {
                  "label": "보내는 것",
                  "value": "답을 받고 싶은 고민"
                },
                {
                  "label": "받는 것",
                  "value": "전문가가 보내는 개별 문자 답변"
                }
              ],
              "fit": true,
              "feedback": "원하는 방식이에요. 누리집에서 바로 시작할 수 있어 마음벤치를 찾아갈 필요가 없어요."
            },
            {
              "label": "마음건강 무인기기",
              "fields": [
                {
                  "label": "시작하는 곳",
                  "value": "도서관 등 공공장소"
                },
                {
                  "label": "할 수 있는 일",
                  "value": "마음건강 정보 읽기, 상담 예약 경로 확인"
                }
              ],
              "fit": false,
              "feedback": "기기를 사용하려면 설치 장소에 가야 해요. 지금 원하는 문자 답변과 이용 방식이 달라요."
            },
            {
              "label": "찾아가는 마음쏙카",
              "fields": [
                {
                  "label": "시작하는 곳",
                  "value": "이동 차량이 나가는 지역 행사나 기관"
                },
                {
                  "label": "참여 방식",
                  "value": "현장에서 마음건강 안내를 받음"
                }
              ],
              "fit": false,
              "feedback": "생활 가까이에서 참여하는 현장 프로그램이에요. 집에서 개별 문자 답장을 받는 방식은 로켓처방이에요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "상담 때 꺼내 볼 메모 만들기",
          "instruction": "예시 메모에는 맡던 일이 끝난 뒤의 변화가 적혀 있어요. 있었던 일과 느낀 점, 작게 해 볼 일을 나누어 놓으세요.",
          "why": "병명을 알아야만 이야기를 시작할 수 있는 것은 아니에요. 생활에서 달라진 한 장면과 물어보고 싶은 한 가지로 시작할 수 있어요.",
          "sourceRefs": [
            1,
            7,
            8,
            9,
            10
          ],
          "slots": [
            {
              "label": "달라진 일",
              "hint": "다른 사람도 보거나 확인할 수 있는 사건이에요."
            },
            {
              "label": "내가 느낀 변화",
              "hint": "내가 경험한 느낌이에요."
            },
            {
              "label": "함께 살펴볼 일",
              "hint": "해 볼 수 있는 작은 행동을 담아요."
            }
          ],
          "pieces": [
            {
              "label": "맡았던 일이 끝난 뒤 아침에 나갈 일이 줄었다.",
              "slot": 0,
              "feedback": "언제부터 일상이 바뀌었는지 설명하는 단서예요."
            },
            {
              "label": "집에 머무는 날이 늘면서 허전했다.",
              "slot": 1,
              "feedback": "누구나 같을 것이라 단정하지 않고 한 사람의 느낌을 담았어요."
            },
            {
              "label": "다음 주에 즐겨 하던 산책을 한 번 다시 해 볼 방법 찾기",
              "slot": 2,
              "feedback": "시작점을 작게 정하면 상담에서 어떤 도움이 필요한지 짚기 쉬워요."
            },
            {
              "label": "앞으로 생길 걱정을 모두 없애기",
              "slot": -1,
              "feedback": "결과가 너무 커서 시작점을 정하기 어려워요. 할 수 있는 작은 행동으로 바꿔 보세요."
            }
          ]
        }
      ]
    }
  },
  "L08_FAMILY_COUNSELING": {
    "sources": [
      {
        "title": "가족을 위한 심리·정서 상담 서비스 운영",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=18660&opt=&page=724&pg=vv&sword=",
        "kind": "지역 운영 안내",
        "observation": "부부·부모자녀·개인상담과 방문·전화·사이버 상담을 구분했다.",
        "use": "가족이 함께 시작하기 어려워도 개인으로 문의할 수 있는 안내 근거로 삼았다."
      },
      {
        "title": "The 더 통하는 가정의 대화법 수업",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=8126&opt=&page=2027&pg=vv&sword=",
        "kind": "현장 프로그램·참여자 후기",
        "observation": "가족 소통 프로그램에서 대화법을 배우고 가족과 가까워졌다는 참여자의 소감이 실렸다.",
        "use": "말싸움의 원인 판정보다 경청 행동을 고르는 활동을 택했다."
      },
      {
        "title": "부부 힐링캠프 쀼, 좋은날 운영 결과",
        "publisher": "안산시건강가정지원센터·안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1647929",
        "kind": "지역 운영 사례",
        "observation": "부부가 함께 활동하며 서로에 대해 알아보는 프로그램을 운영했다.",
        "use": "서로에게 한 가지씩 확인하는 활동 목표에 반영했다."
      },
      {
        "title": "가족센터 가족상담 매뉴얼의 부부·가족 의사소통",
        "publisher": "한국건강가정진흥원",
        "url": "https://www.kihf.or.kr/download.do?uuid=1cbe6fae-d4f5-44cc-a570-549008579a73.pdf",
        "kind": "공식 실무 매뉴얼",
        "observation": "의사소통 문제의 예로 말 자르기를 들고 두 사람이 동의할 수 있는 행동을 구체화한다.",
        "use": "상대가 끝맺기 전 조언하기와 작고 구체적인 부탁하기를 대비했다."
      },
      {
        "title": "다문화가정을 위한 가족관계 향상 프로그램의 부부 활동지",
        "publisher": "부산여성가족개발원·부산시건강가정지원센터 연구진",
        "url": "https://clik.nanet.go.kr/clikr-collection/policyinfo/43/184/1900/CLIKC2441850370033383_attach_1.pdf",
        "kind": "공공 연구·활동지",
        "observation": "부부 활동지는 관찰한 행동과 자신의 느낌을 나눠 표현하는 방법을 설명한다.",
        "use": "사람의 성격을 평가하는 문구와 실제로 보았던 일을 구분했다."
      },
      {
        "title": "갈등을 예방하는 대화법",
        "publisher": "국립국어원",
        "url": "https://korean.go.kr/common/download.do%3Bfront%3D61A9A3DA87995114FF73DC1FE0803A4F?c_file_name=685a8edc-83ed-44ff-9d6d-cf4bdc753285_0.pdf&file_path=reportData&o_file_name=%EC%B2%AD%EC%86%8C%EB%85%84%EC%9D%98+%EC%96%B8%EC%96%B4%EB%AC%B8%ED%99%94+%EA%B0%9C%EC%84%A0%EC%9D%84+%EC%9C%84%ED%95%9C+%EC%97%B0%EA%B5%AC+%EA%B0%9C%EB%B0%9C_%EC%97%B0%EA%B5%AC%EB%B3%B4%EA%B3%A0%EC%84%9C.pdf",
        "kind": "공개 소통 활동지",
        "observation": "보이는 상황을 정확히 전하고 책임을 추궁하는 표현을 피하는 방법을 다룬다.",
        "use": "말의 의도를 추측하는 선택을 했을 때 다시 확인할 점을 안내한다."
      },
      {
        "title": "함께 가꾸는 우리말, 우리 꿈의 경청 활동",
        "publisher": "국립국어원",
        "url": "https://www.korean.go.kr/common/download.do?c_file_name=edc37daf-1a0c-4462-b6e1-e93785b96d55_0.pdf&file_path=etcData&o_file_name=%ED%95%A8%EA%BB%98+%EA%B0%80%EA%BE%B8%EB%8A%94+%EC%9A%B0%EB%A6%AC%EB%A7%90+%EC%9A%B0%EB%A6%AC+%EA%BF%88.pdf",
        "kind": "공개 교재",
        "observation": "다툼을 낳는 상황을 읽고 경청과 나 전달법을 연습하게 한다.",
        "use": "감정·부탁이 섞인 메모를 직접 편집하는 활동에 적용했다."
      },
      {
        "title": "효과적인 의사소통 팁",
        "publisher": "한림대학교춘천성심병원",
        "url": "https://chuncheon.hallym.or.kr/file/file_ptm411_07_02.pdf",
        "kind": "기관 교육자료",
        "observation": "공개 교육자료가 원활하게 듣고 반응하는 방법을 소개한다.",
        "use": "바로 해답을 제시하기 전에 듣는 행동을 선택지로 만들었다."
      },
      {
        "title": "건강가정지원센터가 제공하는 가족상담과 교육",
        "publisher": "보건복지부",
        "url": "https://www.mohw.go.kr/upload/140/202105/1620097349797_20210504120230.pdf",
        "kind": "공공 서비스 안내",
        "observation": "중년기 부부교육과 갈등 상담을 별도 서비스로 안내한다.",
        "use": "센터의 집단 교육 사례를 개인 상담의 정해진 진행 순서로 표현하지 않았다."
      },
      {
        "title": "부모용 보건교육 책자의 나 전달법 활동",
        "publisher": "정책브리핑 공개 교육자료",
        "url": "https://m.korea.kr/expertWeb/resources/files/data/document_file/2012/%EC%9C%A0%EC%95%84_%EB%B3%B4%EA%B1%B4%EA%B5%90%EC%9C%A1%28%EB%B6%80%EB%AA%A8%EC%9A%A9%EC%B1%85%EC%9E%90%29.pdf",
        "kind": "공개 가족 교육자료",
        "observation": "상대의 성격을 지적하는 표현을 자신의 생각과 느낌으로 바꾸는 활동을 제시한다.",
        "use": "두 가지 느낀 점 중 상대의 동기를 단정한 문구를 걸러 내게 했다."
      }
    ],
    "lab": {
      "title": "같은 일을 다르게 기억할 때",
      "brief": "가족 일정이 바뀐 예시를 보고, 들은 사실과 짐작을 나눠요. 상담에서 함께 다룰 부탁도 한 문장으로 정리해요.",
      "artifact": "가족 대화에 꺼낼 사실·느낌·부탁 카드",
      "rounds": [
        {
          "mode": "inspect",
          "title": "일정표에서 확인할 수 있는 일 찾기",
          "instruction": "예시 일정표에는 주말 장보기 담당이 바뀌었고 함께 쓰는 달력에는 새 담당이 적히지 않았어요. 누구 마음도 대신 정하지 않고 확인할 수 있는 내용을 모두 남겨요.",
          "target": "달력이나 변경 표시로 확인할 수 있는 사실",
          "why": "가족이 같은 일을 다르게 기억할 때는 확인할 수 있는 일에서 시작하면 서로의 설명을 들을 자리가 생겨요.",
          "sourceRefs": [
            2,
            3,
            4,
            5,
            6,
            8
          ],
          "cases": [
            {
              "label": "공유 달력",
              "fields": [
                {
                  "label": "달력의 장보기 칸",
                  "value": "바뀌기 전 담당"
                },
                {
                  "label": "새 담당 이름",
                  "value": "기록 없음"
                }
              ],
              "fit": true,
              "feedback": "달력의 빈칸은 함께 확인할 수 있어요. 누가 왜 적지 않았는지는 알려 주지 않아요."
            },
            {
              "label": "담당 변경 메모",
              "fields": [
                {
                  "label": "원래 담당",
                  "value": "변경 표시 있음"
                },
                {
                  "label": "누가 맡았는지",
                  "value": "다른 담당으로 바뀐 기록 있음"
                }
              ],
              "fit": true,
              "feedback": "일정이 달라졌다는 사실을 확인했어요. 각자가 언제 알았는지는 따로 물어볼 수 있어요."
            },
            {
              "label": "바뀐 이유에 대한 짐작",
              "fields": [
                {
                  "label": "해석",
                  "value": "상대가 내 수고를 가볍게 여겼다"
                },
                {
                  "label": "확인 자료",
                  "value": "상대가 설명한 내용 없음"
                }
              ],
              "fit": false,
              "feedback": "그렇게 느낄 수 있어요. 상대의 의도는 일정표에서 확인할 수 없으니 먼저 들어보는 편이 좋아요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "막연한 불만을 바꿔 말할 카드 만들기",
          "instruction": "같은 예시에서 일어난 일, 내가 받은 영향, 다음에 함께 해 볼 행동을 한 칸씩 채워요. 상대의 성격을 평가하는 조각은 빼세요.",
          "why": "상대가 참여할 수 있는 작은 부탁까지 적으면 가족이나 상담 담당자와 무엇을 의논하고 싶은지 또렷해져요. 혼자 이야기하고 싶다면 개인상담도 문의할 수 있어요.",
          "sourceRefs": [
            1,
            4,
            5,
            6,
            7,
            9,
            10
          ],
          "slots": [
            {
              "label": "함께 확인할 일",
              "hint": "직접 본 변화나 기록을 놓아요."
            },
            {
              "label": "내게 생긴 영향",
              "hint": "그때 어려웠던 점이나 느낌을 놓아요."
            },
            {
              "label": "다음에 함께 해 볼 일",
              "hint": "상대가 이해하고 의논할 수 있는 구체적인 행동이에요."
            }
          ],
          "pieces": [
            {
              "label": "장보기 담당이 바뀌었는데 달력은 그대로였다.",
              "slot": 0,
              "feedback": "기록에서 함께 확인할 수 있는 일이에요."
            },
            {
              "label": "내가 나갈 차례인지 헷갈려 준비가 어려웠다.",
              "slot": 1,
              "feedback": "상대의 성격을 판단하지 않고 나에게 생긴 영향을 담았어요."
            },
            {
              "label": "담당을 바꾸는 날에는 달력에도 표시하기",
              "slot": 2,
              "feedback": "두 사람이 실제로 해 볼 수 있고 효과도 확인할 수 있는 부탁이에요."
            },
            {
              "label": "가족 일을 대하는 태도부터 고치기",
              "slot": -1,
              "feedback": "어느 행동을 바꾸면 되는지 알기 어려워요. 달력에 남기는 것처럼 작은 행동을 정해 보세요."
            }
          ]
        }
      ]
    }
  },
  "H10": {
    "sources": [
      {
        "title": "시간제서비스 · 돌봄활동 범위",
        "publisher": "아이돌봄서비스",
        "url": "https://www.idolbom.go.kr/front/srvcGuide/prttm",
        "kind": "운영기관 서비스 지침",
        "observation": "기본형은 등하원과 준비된 식사·간식, 종합형은 정해진 아동 관련 가사를 포함한다.",
        "use": "부탁할 일과 서비스 범위를 대조한다."
      },
      {
        "title": "아이돌봄사 활동 · 아이돌봄 활동 내용",
        "publisher": "아이돌봄서비스",
        "url": "https://care.idolbom.go.kr/dolbomi/sitter/activities",
        "kind": "활동 보고 안내",
        "observation": "돌봄 뒤 아동의 일상·특이사항을 가정에 구두나 서면 등으로 전달한다.",
        "use": "돌봄이 끝난 뒤 주고받을 메모를 구성한다."
      },
      {
        "title": "서비스 신청안내 · 단기서비스",
        "publisher": "아이돌봄서비스",
        "url": "https://www.idolbom.go.kr/front/srvcUtztnGuide/srvcApply/tmpLink",
        "kind": "운영기관 절차 안내",
        "observation": "신청서 작성과 연계 절차가 따로 안내되어 있다.",
        "use": "한 번 이용할 때 신청과 연계 확인을 분리한다."
      },
      {
        "title": "서비스 신청안내 · 정기서비스",
        "publisher": "아이돌봄서비스",
        "url": "https://www.idolbom.go.kr/front/srvcUtztnGuide/srvcApply",
        "kind": "운영기관 절차 안내",
        "observation": "반복 이용 때 대기 신청을 하고 제공기관이 정기아동 전환을 안내한다.",
        "use": "반복 돌봄과 일회 돌봄의 문의 내용을 나눈다."
      },
      {
        "title": "아이돌봄 지원 · 안산시아이LOVEYOU",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/iloveyou/sub/contents.do?c1=4&c2=49&c3=58",
        "kind": "안산시 사업 안내",
        "observation": "안산에서 돌봄 연계를 문의할 제공기관과 지역 이용 절차를 안내한다.",
        "use": "문의 메모에서 지역 제공기관에 확인할 일을 남긴다."
      },
      {
        "title": "안산시, 안전한 돌봄환경 조성 위해 아이돌보미 교육 실시",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1668150",
        "kind": "안산시 현장 교육 기록",
        "observation": "지역 아이돌보미들이 아동학대 예방 교육을 이수한 현장을 소개한다.",
        "use": "아이의 상태를 살피고 알리는 맥락을 더한다."
      },
      {
        "title": "2026년 안산시 아이돌봄사 모집안내",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0214&bbs_seq=1673069",
        "kind": "안산시 공개 모집 공고",
        "observation": "모집기관을 안산시건강가정지원센터로 밝히고 아이돌봄지원사업팀 문의처를 게시했다.",
        "use": "이용 가정과 돌봄사 모집 대상을 구분한다."
      },
      {
        "title": "문지애 아나운서가 알려주는, 더 든든해진 아이돌봄서비스",
        "publisher": "대한민국 정책브리핑",
        "url": "https://m.korea.kr/multi/mediaNewsView.do?newsId=148963303&pWise=mSub&pWiseSub=I1",
        "kind": "공식 영상의 게시 본문",
        "observation": "영상과 함께 공개된 설명이 시간제 기본형 등하원·준비된 식사, 종합형 아동 관련 가사를 나누고 있다.",
        "use": "가사 대상이 누구인지 구별한다."
      },
      {
        "title": "2026년 아이돌봄 서비스 이용안내",
        "publisher": "가족센터",
        "url": "https://www.familynet.or.kr/download.do?uuid=67a913c0-78ca-48bf-81ab-f3b8c5b0bf6d.pdf",
        "kind": "지역 가족센터 이용 안내 PDF",
        "observation": "시작 전 보호자나 정한 사람이 인계한다. 장소 변경이 필요할 경우 제공기관과 상의하도록 안내한다.",
        "use": "연습 인계표에 인계 방법과 미확인 사항을 남긴다."
      },
      {
        "title": "아이돌봄 지원사업 · 서비스 유형 소개",
        "publisher": "아이돌봄서비스",
        "url": "https://www.idolbom.go.kr/front/biz/srvcGuide",
        "kind": "운영기관 서비스 지침",
        "observation": "영아종일제에는 이유식 먹이기, 젖병 소독 등 영아 돌봄 활동이 포함된다.",
        "use": "영아종일제 문의와 초등 하교 지원 요청을 분리한다."
      }
    ],
    "lab": {
      "title": "하교 돌봄 인계표 만들기",
      "brief": "연습용 가족 메모를 읽고, 하교 뒤 필요한 돌봄과 요청 범위를 맞춰 봐요. 이름이나 연락처를 쓰지 않고도 기관에 확인할 내용을 정리할 수 있어요.",
      "artifact": "하교 돌봄을 문의할 때 쓸 인계 메모",
      "rounds": [
        {
          "mode": "inspect",
          "title": "기본형으로 부탁할 일을 골라요",
          "instruction": "이번 연습은 초등학생 하교 뒤의 시간제 기본형이에요. 메모에 적힌 일이 모두 기본형 활동에 해당하는 경우를 골라요.",
          "why": "시간제 기본형에는 등하원 보조와 놀이, 이미 준비된 식사·간식을 챙기는 일이 포함돼요. 식사를 새로 만드는 일이나 가족 전체 가사는 범위가 달라요.",
          "sourceRefs": [
            1,
            2,
            5,
            8,
            10
          ],
          "target": "메모의 모든 일이 시간제 기본형에 들어가는 경우",
          "cases": [
            {
              "label": "하교와 간식",
              "fields": [
                {
                  "label": "하교",
                  "value": "학교에서 아이와 함께 돌아오기"
                },
                {
                  "label": "간식",
                  "value": "보호자가 준비해 둔 간식 챙기기"
                }
              ],
              "fit": true,
              "feedback": "하교를 돕고 이미 준비된 간식을 챙기는 일이 모두 들어가요."
            },
            {
              "label": "놀이와 가족 저녁",
              "fields": [
                {
                  "label": "아이",
                  "value": "하교 뒤 책 함께 읽기"
                },
                {
                  "label": "추가 부탁",
                  "value": "부모를 포함한 가족의 저녁을 처음부터 요리하기"
                }
              ],
              "fit": false,
              "feedback": "놀이 활동은 가능해요. 가족 전체의 식사 조리는 기본형 범위 밖이에요."
            },
            {
              "label": "준비된 저녁",
              "fields": [
                {
                  "label": "식사",
                  "value": "이미 만든 아이 몫을 데워 챙기기"
                },
                {
                  "label": "그 뒤",
                  "value": "보호자가 올 때까지 함께 놀기"
                }
              ],
              "fit": true,
              "feedback": "아이를 위한 준비된 식사를 데우고 놀이를 함께할 수 있어요."
            },
            {
              "label": "아이와 집안일",
              "fields": [
                {
                  "label": "아이",
                  "value": "학교 준비물 챙기기"
                },
                {
                  "label": "집안일",
                  "value": "가족 전체의 빨래와 거실 청소"
                }
              ],
              "fit": false,
              "feedback": "가족 전체 가사를 묶어 요청할 수 없어요. 종합형의 추가 가사도 돌봄 아동과 관련된 범위예요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "하교 뒤 쓸 인계표를 채워요",
          "instruction": "아래 메모 조각을 보호자가 정해 둘 일, 돌봄 중 할 일, 돌봄 뒤 나눌 정보, 기관에 확인할 일로 나눠요.",
          "why": "아이를 누가 인계하는지, 어떤 활동을 맡는지, 무엇을 보고받을지 구분해 두면 첫 문의에 필요한 말이 구체적이 돼요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            5,
            6,
            8,
            9
          ],
          "slots": [
            {
              "label": "시작 전 인계",
              "hint": "아이를 누가 맡아 넘길지 미리 확인해요."
            },
            {
              "label": "돌봄 중 활동",
              "hint": "맡기기로 한 일을 적어요."
            },
            {
              "label": "돌봄 뒤 공유",
              "hint": "관찰한 내용 중 다음 보호자에게 전해요."
            },
            {
              "label": "기관에 확인",
              "hint": "일정이나 장소 변경은 제공기관과 확인해요."
            }
          ],
          "pieces": [
            {
              "label": "보호자가 미리 정한 인계 담당자가 아이를 맡긴다.",
              "slot": 0,
              "feedback": "지정한 사람이 인계하는지 시작 전 확인해요."
            },
            {
              "label": "준비된 간식을 챙기고 그림책을 함께 본다.",
              "slot": 1,
              "feedback": "시간제 기본형의 놀이와 준비된 간식에 해당해요."
            },
            {
              "label": "함께 읽은 책과 간식을 얼마나 먹었는지 전달한다.",
              "slot": 2,
              "feedback": "아이의 생활과 관찰한 일을 다음 보호자에게 전하는 예예요."
            },
            {
              "label": "정해 둔 돌봄 장소를 바꿔야 해 제공기관과 상의한다.",
              "slot": 3,
              "feedback": "변경을 미리 기관에 확인할 사항으로 남겨요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "무엇을 문의할지 정리해요",
          "instruction": "아래 자료와 문의 대상이 맞는 메모를 골라요. 정확한 이용 가능 여부는 제공기관이 확인해요.",
          "why": "정기 이용과 한 번 이용은 절차가 달라요. 신청 뒤 연계가 되었는지도 구분하면 문의할 내용이 분명해져요.",
          "sourceRefs": [
            3,
            4,
            5,
            7,
            8,
            10
          ],
          "target": "우리 가족에게 필요한 서비스와 신청 상태를 정확히 적은 메모",
          "cases": [
            {
              "label": "반복 하교 지원",
              "fields": [
                {
                  "label": "필요한 일",
                  "value": "매주 같은 요일에 하교를 돕는 돌봄"
                },
                {
                  "label": "문의 메모",
                  "value": "정기 이용을 위한 대기 신청과 연계 여부는 어디에서 확인할까요?"
                }
              ],
              "fit": true,
              "feedback": "반복 이용 의사와 확인할 절차가 분명해요."
            },
            {
              "label": "하루만 이용",
              "fields": [
                {
                  "label": "필요한 일",
                  "value": "하루 동안 하교 뒤 돌봄"
                },
                {
                  "label": "문의 메모",
                  "value": "단기 신청서를 작성했으니 돌봄사가 이미 정해졌어요."
                }
              ],
              "fit": false,
              "feedback": "신청서를 쓴 것과 실제 연계가 된 것은 별도예요. 신청 상태를 확인해요."
            },
            {
              "label": "기관 찾기",
              "fields": [
                {
                  "label": "필요한 일",
                  "value": "안산에서 시간제 이용을 문의하고 싶음"
                },
                {
                  "label": "문의 메모",
                  "value": "아이돌봄사 채용에 지원하면 우리 가족도 서비스를 이용하게 되나요?"
                }
              ],
              "fit": false,
              "feedback": "채용 공고는 일할 사람을 위한 창구예요. 가정은 지역 제공기관의 이용 안내로 문의해요."
            },
            {
              "label": "영아 돌봄",
              "fields": [
                {
                  "label": "필요한 일",
                  "value": "하교 지원 대신 영아의 이유식과 젖병 돌봄이 궁금함"
                },
                {
                  "label": "문의 메모",
                  "value": "영아종일제에서는 어떤 영아 돌봄 활동을 제공하나요?"
                }
              ],
              "fit": true,
              "feedback": "필요한 활동을 직접 밝혀 맞는 서비스 유형을 문의하는 문장이에요."
            }
          ]
        }
      ]
    }
  },
  "H13": {
    "sources": [
      {
        "title": "서부건강생활지원센터 원스톱 건강상담",
        "publisher": "안산시 단원보건소",
        "url": "https://www.ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=health05",
        "kind": "지역 사업 안내",
        "observation": "센터가 영양·건강을 함께 상담하는 내용을 공개했다.",
        "use": "완성한 식사 기록에서 상담할 주제를 한 가지 추릴 수 있게 했다."
      },
      {
        "title": "서부센터 주민 대상 저염·저당 건강요리 만들기",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=25408&opt=&page=48&pg=vv&sword=",
        "kind": "지역 프로그램 공고",
        "observation": "주민 프로그램의 실습 중 하나로 저염·저당 건강요리 만들기를 안내했다.",
        "use": "소금을 덜 쓰는 실제 조리 선택을 핵심 과제로 정했다."
      },
      {
        "title": "서부센터 신길천 걷기 활동과 마무리 요리교실",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=18124&opt=&page=770&pg=vv&sword=",
        "kind": "지역 활동 결과",
        "observation": "주민 걷기 활동을 마치며 건강음식 만들기 교실을 진행한 기록이 있다.",
        "use": "일상생활에서 직접 해 볼 수 있는 한 끼 만들기로 체험 단위를 잡았다."
      },
      {
        "title": "안산서부건강생활지원센터 마음돌봄 힐링교실",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1687636",
        "kind": "지역 프로그램 공고",
        "observation": "프로그램에 음식과 요리 실습을 포함했다.",
        "use": "실제 프로그램을 본뜬 조리 활동과 센터 접수는 구분했다."
      },
      {
        "title": "나트륨 섭취를 줄이는 방법 포스터",
        "publisher": "식품의약품안전처 식품안전나라",
        "url": "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=NAINFO&menu_grp=MENU_NEW03&menu_no=2912",
        "kind": "공식 그림 자료·그림 설명 확인",
        "observation": "외식 소스를 따로 받고 국 건더기를 건지는 모습, 향신료를 쓰는 모습을 상황별로 제시한다.",
        "use": "도시락 소스, 국, 조리대의 세 가지 조작 재료로 바꿨다."
      },
      {
        "title": "성인 영양 가이드의 국물음식 조리 방법",
        "publisher": "식품안전나라",
        "url": "https://various.foodsafetykorea.go.kr/nq/data/adult_guidebook.pdf",
        "kind": "공식 식생활 교재",
        "observation": "마른 표고버섯·멸치 등으로 국물 맛을 내고 건더기 위주로 먹는 방법을 설명한다.",
        "use": "육수 만들기와 음식을 담는 동작을 분리했다."
      },
      {
        "title": "한국인을 위한 아홉 가지 식생활 지침 포스터",
        "publisher": "보건복지부·농림축산식품부·식품의약품안전처",
        "url": "https://www.kdca.go.kr/bbs/capital/153/307018/download.do",
        "kind": "공식 그림 자료",
        "observation": "여러 식품을 고르게 먹기와 덜 짜게 먹기를 생활 행동으로 소개한다.",
        "use": "어떤 메뉴의 건강 효과를 보장하지 않고 한 끼의 선택을 점검하게 했다."
      },
      {
        "title": "영양표시 읽는 법",
        "publisher": "질병관리청 국가건강정보포털",
        "url": "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6763",
        "kind": "공식 생활교육 자료",
        "observation": "표시 한 단위의 양과 실제 먹을 양이 다른 경우를 구분해 계산하는 방법을 설명한다.",
        "use": "기준이 다른 모의 포장지 세 장을 모두 같은 양으로 맞춰 비교하도록 했다."
      },
      {
        "title": "반월건강생활지원센터 건강밥상 활동 안내",
        "publisher": "안산시 상록수보건소",
        "url": "https://www.ansan.go.kr/snshealth/common/cntnts/selectContents.do?cntnts_id=hea01843",
        "kind": "같은 시의 별도 센터 사례",
        "observation": "반월센터가 건강밥상 실습과 염도계 대여를 각각 안내한다.",
        "use": "실습의 예는 참고하되 기구 대여를 서부센터 제공 항목으로 옮기지 않았다."
      },
      {
        "title": "서부건강생활지원센터 시설별 이용 공간",
        "publisher": "안산시 단원보건소",
        "url": "https://www.ansan.go.kr/health/common/cntnts/selectContents.do?cntnts_id=health07",
        "kind": "지역 시설 안내",
        "observation": "서부센터의 영양교육 공간과 건강상담 공간을 구분해 소개한다.",
        "use": "요리교실에서 해 볼 일과 상담에서 물어볼 점을 각각 표시했다."
      }
    ],
    "lab": {
      "title": "오늘 먹을 국 한 그릇, 포장지부터 조리까지",
      "brief": "서부센터의 건강요리 활동을 바탕으로 만든 예시 조리대예요. 포장지의 작은 글씨를 읽고 국과 반찬을 담아 보세요.",
      "artifact": "국 한 그릇의 포장지 비교표와 조리 메모",
      "rounds": [
        {
          "mode": "inspect",
          "title": "같은 한 그릇으로 맞춰 비교하기",
          "instruction": "오늘 먹을 국은 200g이에요. 기준 제품은 200g에 나트륨 600mg이에요. 같은 양으로 계산해서 기준 제품보다 나트륨이 적은 포장지를 모두 남겨요.",
          "target": "200g을 먹었을 때 600mg보다 적은 예시 제품",
          "why": "포장에 크게 쓰인 숫자만 비교하면 더 많은 쪽을 고를 수 있어요. 이 숫자들은 예시 제품의 비교값이에요.",
          "sourceRefs": [
            1,
            5,
            7,
            8
          ],
          "cases": [
            {
              "label": "채소국 예시 포장지",
              "fields": [
                {
                  "label": "표시 기준",
                  "value": "100g당"
                },
                {
                  "label": "나트륨",
                  "value": "220mg"
                },
                {
                  "label": "먹을 양",
                  "value": "200g"
                }
              ],
              "fit": true,
              "feedback": "100g 표시값을 두 번 더하면 440mg이에요. 같은 양의 기준 제품보다 적어요."
            },
            {
              "label": "버섯국 예시 포장지",
              "fields": [
                {
                  "label": "표시 기준",
                  "value": "100g당"
                },
                {
                  "label": "나트륨",
                  "value": "350mg"
                },
                {
                  "label": "먹을 양",
                  "value": "200g"
                }
              ],
              "fit": false,
              "feedback": "350mg이라는 숫자는 작아 보이지만 200g을 먹으면 700mg이에요. 기준 제품보다 많아요."
            },
            {
              "label": "무국 예시 포장지",
              "fields": [
                {
                  "label": "표시 기준",
                  "value": "한 팩 200g당"
                },
                {
                  "label": "나트륨",
                  "value": "580mg"
                },
                {
                  "label": "먹을 양",
                  "value": "한 팩"
                }
              ],
              "fit": true,
              "feedback": "표시 단위가 먹을 양과 같아요. 한 그릇에 580mg으로 기준 제품보다 적어요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "국·반찬·소스 조리대 채우기",
          "instruction": "덜 짜게 먹고 싶은 날의 예시 밥상이에요. 육수를 낼 때, 국을 담을 때, 소스를 놓을 때 할 일을 각각 골라 놓으세요.",
          "why": "완성한 메모에서 집에서 바꾸기 가장 어려운 일 하나를 골라 서부센터 영양상담의 주제로 삼을 수 있어요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            9,
            10
          ],
          "slots": [
            {
              "label": "육수 냄비",
              "hint": "소금을 더 넣기 전 국물 맛을 낼 재료예요."
            },
            {
              "label": "국그릇",
              "hint": "무엇을 중심으로 담을지 정해요."
            },
            {
              "label": "구운 반찬 옆",
              "hint": "양념의 양을 먹는 사람이 정할 수 있게 해요."
            }
          ],
          "pieces": [
            {
              "label": "마른 표고버섯으로 국물 맛 내기",
              "slot": 0,
              "feedback": "표고버섯으로 향을 내면 소금 외에도 국물 맛을 더할 방법이 생겨요."
            },
            {
              "label": "국자로 건더기를 먼저 떠서 담기",
              "slot": 1,
              "feedback": "국물을 다 붓기 전에 먹을 양을 정할 수 있어요."
            },
            {
              "label": "소스를 작은 종지에 따로 놓기",
              "slot": 2,
              "feedback": "찍어 먹으면 한꺼번에 부을 때보다 양을 조절하기 쉬워요."
            },
            {
              "label": "상을 내기 전 반찬 전체에 소스를 붓기",
              "slot": -1,
              "feedback": "모두 버무리고 나면 먹는 사람이 소스 양을 고르기 어려워져요."
            }
          ]
        }
      ]
    }
  },
  "H20_INFO": {
    "sources": [
      {
        "title": "안산시 누구나 돌봄사업 운영 평가",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1658849",
        "kind": "지역 운영 결과",
        "observation": "동 행정복지센터와 민간 제공기관이 돌봄이 필요한 시민을 찾아 서비스를 연결했다.",
        "use": "완성 자료를 동의 돌봄 담당자에게 문의할 때 활용하도록 했다."
      },
      {
        "title": "안산시 누구나돌봄 식사 지원 협약 보고",
        "publisher": "안산시의회",
        "url": "https://council-record.ansan.go.kr/minutes/svc/web/cms/mnts/SvcMntsViewer.php?schSn=6049",
        "kind": "지역 의회 회의록",
        "observation": "안산시가 식사 제공기관인 요리조리사회적협동조합과 협약을 맺은 사실을 보고했다.",
        "use": "지역에서 식사 제공과 접수 담당이 나뉜다는 점을 반영했다."
      },
      {
        "title": "도민 약 1만 명 누구나 돌봄 받았다",
        "publisher": "경기도 GTV",
        "url": "https://gnews.gg.go.kr/news/news_detail_m.do?number=202412170743017429C048&s_code=C500",
        "kind": "현장 영상 · 게시자 대본 확인",
        "observation": "가사 도움을 받은 현장의 돌봄 인력이 욕실·방·주방에서 필요한 일을 조정한다고 설명한다.",
        "use": "도시락을 가져다주는 일과 집 안에서 도울 일을 서로 다른 요청으로 제시했다."
      },
      {
        "title": "손헌수의 누구나 돌봄 첫 출근기",
        "publisher": "경기도 소셜방송 LIVE경기",
        "url": "https://live.gg.go.kr/movie/view.html?cate_s=&sort_s=&uid=32934",
        "kind": "공식 영상 · 게시자 장면표 확인",
        "observation": "게시자가 식사지원 제공처인 파주지역자활센터를 찾아가는 장면을 별도 항목으로 안내한다.",
        "use": "지역 제공기관이 준비한 식사를 전달하는 경로에 적용했다. 파주 사례를 안산 협약기관 사례로 소개하지 않는다."
      },
      {
        "title": "경기민원24 누구나 돌봄 신청과 자주 묻는 질문",
        "publisher": "경기도",
        "url": "https://gg24.gg.go.kr/svcreqst/selectSvcReqst.do?svc_seq=858",
        "kind": "공식 접수 안내",
        "observation": "일반식·죽식 도시락 제공과 생활돌봄을 구분하고 돌봄매니저가 상황을 파악하는 절차를 설명한다.",
        "use": "희망 식사 형태는 담당자에게 확인할 항목으로 남겼다."
      },
      {
        "title": "통합돌봄을 위한 누구나 돌봄 발전 전략",
        "publisher": "경기복지재단",
        "url": "https://ggwf.gg.go.kr/wp-content/themes/ggwf/includes/download.php?file=d1ExakYyVHdvcXBMakJ6Qjd5a3hKVzk5cnR3eHpJd3JYbXl3d2tOeGE2LzJyUXBPbTI0ZkxyY1JTbENVS0ppL1E5UXRTNjlTbVhnQlhROTRiVTdSdnZoOXRsd29EaFVGR2FUNVlvNGJDM2FJZXRkWlJjQ2JuemZZUi9YTUgvS0ZXWjNHdllKVFcvNDFLdHNadGpCM0p3PT0%3D&filename=%5B%EB%B3%B5%EC%A7%80%EC%9D%B4%EC%8A%88FOCUS+18%ED%98%B8%5D+%ED%86%B5%ED%95%A9%EB%8F%8C%EB%B4%84%EC%9D%84+%EC%9C%84%ED%95%9C+%EB%88%84%EA%B5%AC%EB%82%98+%EB%8F%8C%EB%B4%84+%EB%B0%9C%EC%A0%84+%EC%A0%84%EB%9E%B5.pdf",
        "kind": "공공 정책연구",
        "observation": "실제 생활돌봄 예시로 식사 준비·설거지와 같은 가사활동을 제시한다.",
        "use": "설거지를 도와달라는 요청은 도시락 문의와 별도 칸에 놓았다."
      },
      {
        "title": "찾아가는 경기도 돌봄의료센터의 파주 사례",
        "publisher": "경기도 소식지 나의 경기도",
        "url": "https://www.gg.go.kr/myggd/vol182/sub1_3.html",
        "kind": "연관 사업 실제 사례",
        "observation": "의료진·사회복지사가 가정을 찾아 복지 연계와 도시락 배달을 도운 사례를 담았다.",
        "use": "도시락과 다른 지원이 동시에 필요할 수 있다는 구성을 참고했다. 별도 사업임을 구분한다."
      },
      {
        "title": "누구나돌봄 서비스 신청",
        "publisher": "경기도 누구나돌봄 플랫폼",
        "url": "https://www.gg.go.kr/ggcare/hmpg/srap/appl/srapInfoForm.do",
        "kind": "공식 서비스 신청 화면",
        "observation": "신청 메뉴를 두고 있어 서비스 종류를 알아보는 단계와 실제 신청을 구별할 수 있다.",
        "use": "지원 신청이나 서비스 확정으로 보이지 않는 문의용 메모로 구성했다."
      },
      {
        "title": "도민과 함께하는 9월의 경기, 누구나 돌봄",
        "publisher": "경기도뉴스포털",
        "url": "https://gnews.gg.go.kr/news/news_detail.do?newsType=N&number=202509161126079885C048&s_code=C401",
        "kind": "공식 이용 절차 해설",
        "observation": "신청 뒤 시군이 상황을 살피고 필요한 돌봄을 연계하는 흐름을 소개한다.",
        "use": "당장 비는 도움과 확인할 일을 함께 전달하는 칸을 넣었다."
      },
      {
        "title": "경기도 31개 시군으로 확대된 누구나 돌봄",
        "publisher": "경기도",
        "url": "https://gnews.gg.go.kr/news/news_detail.do?number=202601190904053050C048&s_code=C109",
        "kind": "현행 사업 공고",
        "observation": "식사·생활·이동 등 여러 서비스를 구분해 안내한다.",
        "use": "함께 걸어 줄 사람이 필요한 예시를 식사·주방 지원과 구별했다."
      }
    ],
    "lab": {
      "title": "도시락 한 끼로 해결되는 일, 남는 일",
      "brief": "예시 가정의 식탁과 주방을 살펴봐요. 도시락만 있으면 될지, 식사 준비나 정리도 따로 요청해야 할지 메모를 완성해요.",
      "artifact": "식사와 집안일 도움을 나눈 돌봄 문의 메모",
      "rounds": [
        {
          "mode": "inspect",
          "title": "도시락이 도착한 뒤를 살펴보기",
          "instruction": "세 메모를 열어 보세요. 이미 만든 식사를 배달받는 것만으로, 메모에 적힌 어려움을 해결할 수 있는 경우를 모두 남겨요.",
          "target": "조리된 식사를 받으면 다른 사람의 도움 없이 식사를 마칠 수 있는 예시",
          "why": "식사 배달, 집 안에서 하는 일, 이동 동행은 도움의 내용이 달라요. 원하는 일을 나눠 전하면 담당자가 무엇을 더 확인할지 알 수 있어요.",
          "sourceRefs": [
            2,
            3,
            4,
            5,
            6,
            7,
            10
          ],
          "cases": [
            {
              "label": "빈 냉장고",
              "fields": [
                {
                  "label": "어려운 일",
                  "value": "재료를 사 와서 한 끼를 만드는 일"
                },
                {
                  "label": "이미 되는 일",
                  "value": "받은 도시락을 열어 먹고 용기를 정리하기"
                }
              ],
              "fit": true,
              "feedback": "조리가 끝난 식사를 받으면 이 메모의 공백이 메워져요. 식사 지원이 가능한지 물어볼 수 있어요."
            },
            {
              "label": "쌓인 그릇",
              "fields": [
                {
                  "label": "현재 식사",
                  "value": "완성된 식사가 이미 도착함"
                },
                {
                  "label": "남는 어려움",
                  "value": "상에 차리고 먹은 뒤 그릇 정리하기"
                }
              ],
              "fit": false,
              "feedback": "식사 자체는 준비돼 있어요. 차리거나 정리하는 일에 필요한 도움도 따로 알려야 해요."
            },
            {
              "label": "병원 가는 날",
              "fields": [
                {
                  "label": "현재 식사",
                  "value": "집에 준비되어 있고 혼자 먹을 수 있음"
                },
                {
                  "label": "남는 어려움",
                  "value": "혼자 진료 장소로 이동하기"
                }
              ],
              "fit": false,
              "feedback": "도시락이 생겨도 이동 문제가 남아요. 이동에 동행할 지원이 있는지 문의할 내용이에요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "두 가지 도움이 필요한 식탁 메모",
          "instruction": "이번 예시에는 먹을 반찬이 없고 설거지도 밀려 있어요. 도시락 요청, 집안일 요청, 담당자에게 확인할 일을 나눠 놓으세요.",
          "why": "문의할 때 지금 부족한 일과 따로 확인할 일을 구체적으로 전할 수 있어요. 실제로 제공할 항목과 방식은 담당자가 상황을 살핀 뒤 안내해요.",
          "sourceRefs": [
            1,
            2,
            3,
            5,
            6,
            7,
            8,
            9,
            10
          ],
          "slots": [
            {
              "label": "식사 요청",
              "hint": "완성된 한 끼를 마련하는 일이에요."
            },
            {
              "label": "생활 도움 요청",
              "hint": "집에 남아 있는 가사 일이에요."
            },
            {
              "label": "담당자에게 확인",
              "hint": "제공 가능 여부나 다음 안내를 확인할 일이에요."
            }
          ],
          "pieces": [
            {
              "label": "직접 조리하기 어려워 완성된 식사 배달이 필요함",
              "slot": 0,
              "feedback": "장보기와 조리가 어렵다는 설명을 덧붙일 수 있어요."
            },
            {
              "label": "식후 설거지를 혼자 하기 어려워 도움이 필요함",
              "slot": 1,
              "feedback": "도시락 배달과는 다른 요청이에요. 집 안의 어떤 일이 어려운지 알 수 있어요."
            },
            {
              "label": "받을 수 있는 식사 형태와 두 가지 도움을 함께 의논할 곳 확인",
              "slot": 2,
              "feedback": "지역과 상황에 따라 확인할 점을 열어 둔 문의가 돼요."
            },
            {
              "label": "도시락을 요청하면 집안일 지원도 이미 확정",
              "slot": -1,
              "feedback": "식사 배달과 집안일 도움은 별도 항목이에요. 함께 필요한 일을 밝히고 안내를 받아요."
            }
          ]
        }
      ]
    }
  },
  "H22": {
    "sources": [
      {
        "title": "안산시 치매 환자와 보호자를 위한 치유농업 프로그램",
        "publisher": "아시아타임즈 경기취재본부",
        "url": "https://www.asiatime.co.kr/article/20250409500006",
        "kind": "안산 현장 보도",
        "observation": "단원·상록수 치매안심센터 협업 사업에서 텃밭 팻말을 만들고 모종을 심었다.",
        "use": "화면에서 식물 이름이 보이는 텃밭 팻말을 완성한다."
      },
      {
        "title": "치매환자와 보호자 치유농업 활동 결과",
        "publisher": "안산시 안산톡톡",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=21464&opt=&page=454&pg=vv&sword=",
        "kind": "안산 활동 결과",
        "observation": "운영 후 꽃바구니, 텃밭, 다육정원, 모스액자, 수확물로 만든 샌드위치 등을 소개했다.",
        "use": "서로 다른 회차의 결과물을 구분해 원예가 무엇인지 보여 준다."
      },
      {
        "title": "시정소식지 건강면의 치매환자쉼터 안내",
        "publisher": "안산시",
        "url": "https://www.ansan.go.kr/ansantalktalk/UPDIR/newsletter/3547469391_SHNPkcvr_c361f8b8b54c1c6900a042ee7b7093fe061d6062.pdf",
        "kind": "안산 운영 안내",
        "observation": "쉼터의 실제 프로그램에 원예와 미술, 운동이 함께 실려 있다.",
        "use": "팻말 만들기를 쉼터 원예의 한 예로 안내한다."
      },
      {
        "title": "치유농업활동 • 압화 이름표 만들기",
        "publisher": "농촌진흥청 치유농업ON",
        "url": "https://www.agrohealing.go.kr/sf/crfrmPrg/crfrmActv/retrieveCrfrmActvDetail01.do",
        "kind": "공식 단계 사진·작업 안내",
        "observation": "재료 목록과 과정 사진에서 이름표에 쓴 식물 이름, 압화 배치, 접착제와 시트지 마감을 확인했다.",
        "use": "재료 고르기와 글자·꽃·보호막을 올리는 작업대의 기준이다."
      },
      {
        "title": "치매안심센터의 나만의 정원 만들기",
        "publisher": "경주시",
        "url": "https://www.gyeongju.go.kr/news/page.do?mnu_uid=1335&pageNo=238&pageOrder=0&pagePrvNxt=1&pageRef=0&parm_bod_uid=221634&parm_mnu_uid=0&srchBgpUid=-1&srchColumn=&srchEDate=9999-12-31&srchEnable=1&srchKeyword=&srchSDate=1960-01-01&srchVoteType=-1&step=258",
        "kind": "타 지역 실제 수업",
        "observation": "원예치료사가 진행한 수업에서 압화 이름표와 화분 텃밭을 함께 만들었다.",
        "use": "안산 팻말 활동을 모바일 압화 공정으로 옮길 때 참고했다."
      },
      {
        "title": "치매환자와 가족을 위한 힐링 프로그램",
        "publisher": "강화군",
        "url": "https://www.ganghwa.go.kr/open_content/main/bbs/bbsMsgDetail.do%3Bjsessionid%3D052B75809F9C924658DB88525AED1462?bcd=report&msg_seq=18409&pgno=262",
        "kind": "타 지역 활동 결과",
        "observation": "생화 꽃바구니와 눌러 말린 꽃을 쓴 글씨 액자를 서로 다른 작품으로 만들었다.",
        "use": "싱싱한 꽃과 눌러 말린 꽃을 작품 목적에 맞게 고른다."
      },
      {
        "title": "치유농업 기억 더하기",
        "publisher": "원주시",
        "url": "https://www.wonju.go.kr/www/selectBbsNttView.do?bbsNo=145&key=222&nttNo=372533&pageIndex=1&pageUnit=10&searchCnd=all",
        "kind": "타 지역 운영 사례",
        "observation": "꽃으로 꾸민 부채와 꽃바구니, 테라리움이 별도 과제로 소개된다.",
        "use": "바구니용 생화와 유리병용 재료를 팻말 재료 옆에 놓았다."
      },
      {
        "title": "의식주로 즐기는 텃밭정원 이야기",
        "publisher": "농촌진흥청 국립원예특작과학원",
        "url": "https://www.nongsaro.go.kr/portal/ps/psb/psby/vodPlay.ps?mvpNo=1860",
        "kind": "공식 영상 내레이션·자막",
        "observation": "연구사가 높인 화단 옆 의자와 휴식 공간을 둔 실외 텃밭을 설명한다.",
        "use": "앉아서 작업하고 곁에서 쉴 수 있는 화단을 가려내는 과제다."
      },
      {
        "title": "기흥구 치매안심센터 치유농업프로그램 성료",
        "publisher": "뉴스앤톡",
        "url": "https://newsnt.co.kr/news/view/1065568890247559",
        "kind": "타 지역 현장 결과",
        "observation": "모종을 심어 가꾸고 수확한 채소를 요리한 과정과 농사 경험을 나눈 일을 보도했다.",
        "use": "심은 뒤 구분할 수 있도록 작물 이름을 팻말에 먼저 넣는다."
      },
      {
        "title": "식물과 함께 마음 돌보는 원예치유 프로그램",
        "publisher": "안산시 농업기술센터",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1684415",
        "kind": "안산 복지기관 연계 사례",
        "observation": "관내 복지기관에서 반려식물 심기, 이끼액자, 허브화분, 꽃바구니 등을 운영했다.",
        "use": "같은 원예 수업에서도 작품에 따라 다른 재료가 필요함을 보여 준다."
      }
    ],
    "lab": {
      "title": "텃밭에 꽂을 압화 팻말 만들기",
      "brief": "안산 치유농장에서는 모종을 심고 텃밭 팻말을 만들었어요. 여기서는 농촌진흥청이 공개한 압화 방법으로 바질 팻말 한 장을 꾸며요.",
      "artifact": "바질 압화 팻말과 앉아서 가꿀 화단 선택표",
      "rounds": [
        {
          "mode": "inspect",
          "title": "팻말 재료 상자를 열어 보세요",
          "instruction": "글자를 쓸 판, 납작한 압화, 꽃을 덮는 투명 시트가 모두 든 상자를 골라요.",
          "target": "글씨판 · 눌러 말린 꽃 · 투명 보호막",
          "why": "생화 바구니와 유리병 정원에는 다른 재료가 들어요. 납작하게 눌러 말린 꽃을 쓰면 팻말 위에서 글자와 꽃을 함께 볼 수 있어요.",
          "sourceRefs": [
            1,
            4,
            5,
            6,
            7,
            10
          ],
          "cases": [
            {
              "label": "종이 공예함",
              "fields": [
                {
                  "label": "받침",
                  "value": "글씨를 쓸 흰 팻말"
                },
                {
                  "label": "꽃",
                  "value": "눌러 말린 작은 꽃"
                },
                {
                  "label": "덮개",
                  "value": "투명 접착 시트"
                }
              ],
              "fit": true,
              "feedback": "팻말에 글자를 쓰고 압화를 붙인 다음 덮을 수 있어요."
            },
            {
              "label": "꽃바구니 재료함",
              "fields": [
                {
                  "label": "받침",
                  "value": "손잡이 바구니"
                },
                {
                  "label": "꽃",
                  "value": "줄기가 달린 생화"
                },
                {
                  "label": "덮개",
                  "value": "포장 리본"
                }
              ],
              "fit": false,
              "feedback": "생화 꽃바구니는 만들 수 있지만 글씨판과 투명 덮개가 없어요."
            },
            {
              "label": "유리병 정원 재료함",
              "fields": [
                {
                  "label": "받침",
                  "value": "유리병과 흙"
                },
                {
                  "label": "꽃",
                  "value": "작은 생식물"
                },
                {
                  "label": "덮개",
                  "value": "병뚜껑"
                }
              ],
              "fit": false,
              "feedback": "살아 있는 작은 정원을 만드는 재료예요. 눌러 말린 꽃이 없어요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "바질 팻말에 글자와 꽃을 얹으세요",
          "instruction": "팻말 초안에서 각 재료가 들어갈 자리를 눌러 보세요. 식물 이름은 완성 뒤에도 읽을 수 있게 두세요.",
          "why": "실제 압화 이름표는 식물 이름을 쓰고 꽃 위치를 정한 뒤 접착제로 고정하고 시트로 덮어요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            5,
            9
          ],
          "slots": [
            {
              "label": "이름을 읽을 가운데 칸",
              "hint": "무엇을 심었는지 적어 둘 자리예요."
            },
            {
              "label": "글자를 가리지 않는 빈 모서리",
              "hint": "꽃을 놓을 여백이에요."
            },
            {
              "label": "꽃 뒷면",
              "hint": "미끄러지지 않게 붙여요."
            },
            {
              "label": "완성한 판 전체",
              "hint": "꽃과 글씨 위를 덮어요."
            }
          ],
          "pieces": [
            {
              "label": "바질 글자 카드",
              "slot": 0,
              "feedback": "심어 둔 작물을 알아볼 수 있어요."
            },
            {
              "label": "작은 압화 두 송이",
              "slot": 1,
              "feedback": "글자는 보이고 빈 모서리에 꽃이 놓였어요."
            },
            {
              "label": "이쑤시개 끝에 찍은 소량의 풀",
              "slot": 2,
              "feedback": "꽃이 움직이지 않게 고정했어요."
            },
            {
              "label": "투명 시트",
              "slot": 3,
              "feedback": "꽃과 글씨를 볼 수 있게 마감했어요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "이 팻말을 꽂을 화단을 고르세요",
          "instruction": "이번에는 의자에 앉아 흙에 손이 닿고, 바로 곁에서 쉴 수도 있는 예시 화단을 찾아요.",
          "target": "앉아서 닿는 흙 + 곁에 놓인 의자",
          "why": "국립원예특작과학원 연구자는 나이가 들어도 텃밭을 가꾸기 쉽도록 화단을 높이고 의자를 곁에 두는 설계를 소개해요. 실제 장소의 시설은 운영기관에서 확인해요.",
          "sourceRefs": [
            1,
            2,
            8
          ],
          "cases": [
            {
              "label": "높임 화단",
              "fields": [
                {
                  "label": "흙 높이",
                  "value": "앉은 자리에서 손이 닿음"
                },
                {
                  "label": "휴식",
                  "value": "화단 옆 의자"
                }
              ],
              "fit": true,
              "feedback": "앉은 자리에서 작물을 돌보고 같은 자리에서 쉴 수 있어요."
            },
            {
              "label": "바닥 텃밭",
              "fields": [
                {
                  "label": "흙 높이",
                  "value": "몸을 낮춰야 닿음"
                },
                {
                  "label": "휴식",
                  "value": "밭 옆 의자"
                }
              ],
              "fit": false,
              "feedback": "의자는 있지만 앉은 자리에서 흙에 손이 닿지 않아요."
            },
            {
              "label": "선반 화분",
              "fields": [
                {
                  "label": "흙 높이",
                  "value": "서서 가꾸는 선반 위"
                },
                {
                  "label": "휴식",
                  "value": "휴식 의자 없음"
                }
              ],
              "fit": false,
              "feedback": "서서 작업해야 하고 곁에서 쉴 자리도 없어요."
            }
          ]
        }
      ]
    }
  },
  "H23": {
    "sources": [
      {
        "title": "당뇨식사 체험교실 운영",
        "publisher": "안산시 안산톡톡",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=16020&opt=&page=904&pg=vv&sword=",
        "kind": "안산 수업 공지·활동 사진",
        "observation": "식품 교환단위 이론 뒤 밥량을 직접 재고 적정량을 계산하는 수업을 소개했다.",
        "use": "가상 저울에 다른 크기 숟가락으로 밥을 담는 조작을 만들었다."
      },
      {
        "title": "식사체험교실 현장 취재와 참여자 소감",
        "publisher": "안산시 시정소식지 제449호",
        "url": "https://www.ansan.go.kr/ansantalktalk/UPDIR/newsletter/747497845_bkuaEm56_d14fdcbb10755557ef22de27872cc89de08f3ec3.pdf",
        "kind": "안산 현장 취재·참여자 후기",
        "observation": "교육장 사진과 자신의 평소 밥량을 돌아본 참여자 말이 실렸다.",
        "use": "양을 짐작한 뒤 실제 저울 숫자를 보고 고쳐 담는 구조다."
      },
      {
        "title": "고혈압·당뇨병 등록교육센터 사업 안내",
        "publisher": "안산대학교",
        "url": "https://www.ansan.ac.kr/www/content/135",
        "kind": "안산 운영기관 안내",
        "observation": "운영기관이 실습 중심 교육, 교육 예약, 전화상담을 별도로 설명한다.",
        "use": "실습 수치와 내 식사량 상담을 구분한다."
      },
      {
        "title": "시민 만성질환 관리를 돕는 고당센터",
        "publisher": "안산시 안산톡톡",
        "url": "https://www.ansan.go.kr/ansantalktalk/content/ansantalk/cityNews.html?fidx=20186&opt=&page=474&pg=vv&sword=",
        "kind": "안산 운영 사례",
        "observation": "상설교육, 식사방법 교육, 당뇨 식사체험, 전문가 상담을 소개했다.",
        "use": "센터에서 실제 해 볼 수 있는 수업을 설명한다."
      },
      {
        "title": "영양 표시 읽고 나에게 맞는 식품 선택하기",
        "publisher": "식품의약품안전처 식품안전나라",
        "url": "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs426&menu_grp=MENU_NEW03&menu_no=3720&ntctxt_no=1091180",
        "kind": "공식 영상 시간대별 자막",
        "observation": "01:32에 표시 기준 단위, 03:03~03:18에 30g 표시를 총 120g으로 환산하는 예가 나온다.",
        "use": "새 예시 25g당 열량과 총 100g으로 포장 전체 열량을 계산한다."
      },
      {
        "title": "식품영양표시! 왜 꼼꼼히 확인해야 할까?",
        "publisher": "식품의약품안전처 식품안전나라",
        "url": "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs426&menu_grp=MENU_NEW03&menu_no=3720&ntctxt_no=1091179",
        "kind": "공식 영상 시간대별 자막",
        "observation": "영양정보 기준 단위와 전체 열량을 계산하고 00:56 이후 관심 성분을 골라 본다.",
        "use": "같은 봉지에서도 나트륨과 열량이 다른 단위임을 보여 준다."
      },
      {
        "title": "나트륨 함량 비교표시, 어떤 내용을 확인해야 할까요?",
        "publisher": "식품의약품안전처 식품안전나라",
        "url": "https://www.foodsafetykorea.go.kr/portal/board/boardDetail.do?bbs_no=bbs109&menu_grp=MENU_NEW05&menu_no=2873&ntctxt_no=1075134",
        "kind": "공식 라벨 읽기 자료",
        "observation": "총 내용량 기준 나트륨 mg와 비교표시의 뜻을 포장 예시로 설명한다.",
        "use": "총 내용량 기준 mg로 바꾼 뒤 예시 장보기 메모와 비교한다."
      },
      {
        "title": "식품 영양표시 읽기 리플릿",
        "publisher": "식품의약품안전처",
        "url": "https://www.foodsafetykorea.go.kr/upload/20180629/nutrition/content/20250729.pdf",
        "kind": "공식 라벨 도해",
        "observation": "포장 전체 기준의 성분 함량과 하루 기준치 비율을 나누어 보여 준다.",
        "use": "mg와 %를 구분해 같은 단위로 비교한다."
      },
      {
        "title": "영양표시, 어떻게 활용할까요?",
        "publisher": "식품의약품안전처",
        "url": "https://www.foodsafetykorea.go.kr/upload/20180629/nutrition/content/1024.pdf",
        "kind": "공식 포장 비교 실습",
        "observation": "포장 크기가 서로 다른 두 음료와 과자의 성분 표시를 비교한다.",
        "use": "제품마다 표시 단위가 다를 수 있는 세 가지 연습 라벨을 구성했다."
      },
      {
        "title": "지역사회 통합건강증진사업 안내의 영양실습 목록",
        "publisher": "질병관리청",
        "url": "https://www.kdca.go.kr/bbs/kdca/55/304421/download.do",
        "kind": "공식 교육과정",
        "observation": "고급 영양실습에 영양표시 읽기, 짠 음식 알아보기, 한 끼 밥상 차리기가 포함된다.",
        "use": "계량·열량 환산·제품 고르기를 각각 직접 조작하게 했다."
      }
    ],
    "lab": {
      "title": "밥을 달고 식품 포장을 비교해요",
      "brief": "안산 식사체험교실에서는 밥을 직접 달아 봐요. 팀이 만든 계량 주문표와 식품 모형으로 양과 표시 단위를 맞춰 보세요. 수치는 연습용이에요.",
      "artifact": "밥 계량 기록과 한 봉지 영양표 비교표",
      "rounds": [
        {
          "mode": "allocate",
          "title": "빈 그릇에 예시 주문량을 담으세요",
          "instruction": "저울은 빈 그릇 무게를 뺐어요. 큰 숟가락과 작은 숟가락을 더하거나 덜어서 전시용 밥 140g을 맞춰요.",
          "target": 140,
          "targetLabel": "전시 그릇 주문량",
          "rule": "큰 숟가락은 60g, 작은 숟가락은 20g이에요. 숫자는 이 활동에서만 써요.",
          "unit": "g",
          "solutionHint": "큰 숟가락 두 번에 작은 숟가락 한 번을 더해 보세요.",
          "why": "센터에서도 밥량을 직접 재어 짐작한 양과 비교해요. 개인에게 알맞은 식사량은 센터에서 상담할 수 있어요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            10
          ],
          "tokens": [
            {
              "label": "큰 밥숟가락",
              "unit": "번",
              "min": 0,
              "max": 3,
              "initial": 0,
              "step": 1,
              "coefficient": 60
            },
            {
              "label": "작은 밥숟가락",
              "unit": "번",
              "min": 0,
              "max": 7,
              "initial": 0,
              "step": 1,
              "coefficient": 20
            }
          ]
        },
        {
          "mode": "allocate",
          "title": "작은 포장 넷의 열량을 합쳐요",
          "instruction": "상자에는 과자 100g이 들었어요. 영양표는 25g 한 묶음당 125kcal예요. 상자 전체가 되도록 묶음을 올려 보세요.",
          "target": 500,
          "targetLabel": "상자 전체 열량",
          "rule": "상자 무게 ÷ 표시 기준 무게가 묶음 수예요. 묶음을 하나 올리면 열량 125kcal가 더해져요.",
          "unit": "kcal",
          "solutionHint": "100g을 25g씩 나누면 네 묶음이에요.",
          "why": "25g 기준을 네 번 더하면 100g 한 상자는 500kcal예요. 포장에 적힌 숫자 옆의 기준 단위를 먼저 읽어요.",
          "sourceRefs": [
            5,
            6,
            8
          ],
          "tokens": [
            {
              "label": "과자 25g 묶음",
              "unit": "묶음",
              "min": 0,
              "max": 6,
              "initial": 1,
              "step": 1,
              "coefficient": 125
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "장보기 메모에 맞는 국을 고르세요",
          "instruction": "이 연습의 장보기 메모에는 한 봉지 나트륨 300mg 이하라고 쓰여 있어요. 한 봉지를 기준으로 계산해요.",
          "target": "한 봉지 전체가 300mg 이하인 예시 국",
          "why": "메모 속 숫자는 예시 제품을 비교하기 위한 값이에요. 표시 한 단위가 봉지에 몇 개 들어 있는지 보고 mg끼리 비교해요.",
          "sourceRefs": [
            5,
            6,
            7,
            8,
            9,
            10
          ],
          "cases": [
            {
              "label": "맑은 무국",
              "fields": [
                {
                  "label": "표시 기준",
                  "value": "반 봉지당 나트륨 140mg"
                },
                {
                  "label": "한 봉지 구성",
                  "value": "표시량 두 개"
                }
              ],
              "fit": true,
              "feedback": "140mg × 2 = 280mg이에요. 메모에 맞아요."
            },
            {
              "label": "구수한 버섯국",
              "fields": [
                {
                  "label": "표시 기준",
                  "value": "한 컵당 나트륨 110mg"
                },
                {
                  "label": "한 봉지 구성",
                  "value": "표시량 세 컵"
                }
              ],
              "fit": false,
              "feedback": "110mg × 3 = 330mg이에요. 한 컵 숫자만 보고 고르면 메모를 넘겨요."
            },
            {
              "label": "감자양파국",
              "fields": [
                {
                  "label": "표시 기준",
                  "value": "총 내용량당 나트륨 290mg"
                },
                {
                  "label": "한 봉지 구성",
                  "value": "표시량 한 개"
                }
              ],
              "fit": true,
              "feedback": "총 내용량당 표시라서 한 봉지가 290mg이에요. 메모에 맞아요."
            }
          ]
        }
      ]
    }
  },
  "H24": {
    "sources": [
      {
        "title": "상록수보건소 금연클리닉 맞춤상담 행사",
        "publisher": "안산시 상록수보건소",
        "url": "https://www.ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1659896",
        "kind": "안산 사업 사례",
        "observation": "등록자에게 맞춤 상담과 행동을 돕는 물품을 제공한 사례다.",
        "use": "연습 후 개인에게 맞는 지원을 상담할 수 있다고 안내한다."
      },
      {
        "title": "우리동네 작은보건소 금연 서비스",
        "publisher": "안산시 상록수보건소",
        "url": "https://www.ansan.go.kr/snshealth/common/cntnts/selectContents.do?cntnts_id=hea01844",
        "kind": "안산 서비스 안내",
        "observation": "행동요법 지도와 물품 지원 장소가 구분되어 있다.",
        "use": "서비스를 고를 때 무엇을 어디에서 받는지 함께 읽게 했다."
      },
      {
        "title": "행정복지센터 찾아가는 금연클리닉 운영",
        "publisher": "안산시 상록수보건소",
        "url": "https://ansan.go.kr/www/common/bbs/selectBbsDetail.do?bbs_code=B0238&bbs_seq=1680056",
        "kind": "안산 현장 운영 기록",
        "observation": "현장 개인 상담과 기존 등록자 전화·문자 후속상담을 따로 안내한다.",
        "use": "방문형과 원격형 예시 카드를 서로 구별한다."
      },
      {
        "title": "찾아가는 사업장 이동금연클리닉 신청 안내",
        "publisher": "안산시 상록수보건소",
        "url": "https://www.ansan.go.kr/snshealth/common/bbs/selectBbsDetail.do?bbs_code=B0174&bbs_seq=1614913&currentPage=1&key=1682&sch_text=%EC%B0%BE%EC%95%84%EA%B0%80%EB%8A%94&sch_type=sj",
        "kind": "안산 운영 공지",
        "observation": "사업장 신청형으로 대면 상담과 추후 전화상담을 함께 운영했다.",
        "use": "사업장 현장 프로그램이 집에서 바로 시작하는 선택지는 아님을 표시했다."
      },
      {
        "title": "금연 실천하기와 환경 정리",
        "publisher": "금연길라잡이",
        "url": "https://www.nosmokeguide.go.kr/challenge/home",
        "kind": "국가 금연 지원 실천 안내",
        "observation": "흡연 욕구가 커지는 상황을 찾고 관련 물품을 정리하며 주변에 협조를 구하는 방법을 설명한다.",
        "use": "재떨이·주변 사람·식후 습관에 붙일 행동 카드를 만들었다."
      },
      {
        "title": "흡연자를 위한 금연교육 자료의 흡연 일기",
        "publisher": "금연길라잡이",
        "url": "https://www.nosmokeguide.go.kr/download.do?uuid=bab9c6ff-925e-4aad-9fda-21a79ba3d46d.pdf",
        "kind": "공식 활동지",
        "observation": "장소, 상황, 함께한 사람, 욕구를 기록하고 가장 갈망이 컸던 때를 찾아 대응을 준비한다.",
        "use": "이미 채운 가상 일기에서 조건이 겹치는 기록을 직접 찾는다."
      },
      {
        "title": "국가건강정보포털 흡연의 금연 지원과 행동요법",
        "publisher": "질병관리청",
        "url": "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6764",
        "kind": "공식 생활 행동 자료",
        "observation": "식사 등 일상 습관과 흡연 욕구의 연결, 물 마시기 같은 대체 행동을 설명한다.",
        "use": "식후에 담배가 떠오르는 예시에 물 마시기 행동을 연결한다."
      },
      {
        "title": "보건소 금연클리닉의 상담 내용",
        "publisher": "금연길라잡이",
        "url": "https://www.nosmokeguide.go.kr/helpness/clinic",
        "kind": "국가 공식 프로그램 안내",
        "observation": "대면·전화·문자 등으로 단계에 맞춰 전문상담을 제공한다.",
        "use": "현장 첫 상담과 후속 전화 상담을 섞어 안내하지 않도록 했다."
      },
      {
        "title": "금연상담전화 프로그램과 예약 방식",
        "publisher": "금연길라잡이",
        "url": "https://www.nosmokeguide.go.kr/helpness/counsel",
        "kind": "공식 이용 안내",
        "observation": "전담 상담사가 예약된 전화로 상담하며 직접 예약할 수 있는 화면이 있다.",
        "use": "전문상담을 집에서 시작할 수 있는 예약 방법을 하나의 선택지로 제시한다."
      },
      {
        "title": "금연상담전화 운영 및 상담예약 방법",
        "publisher": "보건복지부",
        "url": "https://www.mohw.go.kr/menu.es?mid=a10706020100",
        "kind": "국가 서비스 운영 지침",
        "observation": "상담전화에 직접 전화를 걸거나 온라인으로 전화상담을 신청해 전화를 받을 수 있다.",
        "use": "두 방법 모두 목표를 만족하는 선택으로 인정한다."
      }
    ],
    "lab": {
      "title": "금연 상담에서 쓰는 생활 일기 펼치기",
      "brief": "공식 흡연 일기 양식을 바탕으로 팀이 만든 예시예요. 기록에서 반복되는 계기를 찾고 다음에 해 볼 행동 하나를 붙여 보세요.",
      "artifact": "흡연 계기·대응 카드와 집에서 상담하는 방법",
      "rounds": [
        {
          "mode": "inspect",
          "title": "기록에서 되풀이된 계기를 찾으세요",
          "instruction": "식사를 마친 뒤이고 흡연 욕구가 강하다고 표시된 기록을 모두 찾아요.",
          "target": "식사 직후 + 욕구가 강함",
          "why": "상담에서는 장소나 행동, 함께 있던 사람, 욕구를 함께 살펴봐요. 두 기록이 겹친다는 사실을 발견하면 어떤 상황부터 바꿔볼지 정하기 쉬워요.",
          "sourceRefs": [
            5,
            6,
            7
          ],
          "cases": [
            {
              "label": "식당 앞",
              "fields": [
                {
                  "label": "직전 행동",
                  "value": "점심 식사를 마침"
                },
                {
                  "label": "욕구",
                  "value": "강함"
                }
              ],
              "fit": true,
              "feedback": "식사 직후이고 욕구가 강해 표시할 기록이에요."
            },
            {
              "label": "집 앞 벤치",
              "fields": [
                {
                  "label": "직전 행동",
                  "value": "저녁 식사를 마침"
                },
                {
                  "label": "욕구",
                  "value": "강함"
                }
              ],
              "fit": true,
              "feedback": "장소는 다르지만 식사 직후라는 계기가 겹쳐요."
            },
            {
              "label": "회사 휴게실",
              "fields": [
                {
                  "label": "직전 행동",
                  "value": "회의를 마침"
                },
                {
                  "label": "욕구",
                  "value": "강함"
                }
              ],
              "fit": false,
              "feedback": "욕구는 강해도 이 기록의 계기는 회의예요."
            },
            {
              "label": "집 식탁",
              "fields": [
                {
                  "label": "직전 행동",
                  "value": "아침 식사를 마침"
                },
                {
                  "label": "욕구",
                  "value": "약함"
                }
              ],
              "fit": false,
              "feedback": "식후 기록이지만 이번에 찾는 강한 욕구 표시는 없어요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "생활 속 장면에 대처 행동을 붙이세요",
          "instruction": "무엇이 담배를 떠올리게 하는지 읽고, 그 계기를 바꿀 행동을 맞춰 보세요.",
          "why": "상황에 맞는 행동을 미리 준비하는 방법을 상담에서도 다뤄요. 어떤 행동이 나에게 맞을지는 상담사와 이야기할 수 있어요.",
          "sourceRefs": [
            1,
            2,
            5,
            6,
            7,
            8
          ],
          "slots": [
            {
              "label": "식사 뒤 담배를 찾는 손",
              "hint": "바로 할 수 있는 다른 행동을 골라요."
            },
            {
              "label": "탁자 위 재떨이",
              "hint": "담배를 떠올리게 하는 물건을 정리해요."
            },
            {
              "label": "동료의 담배 권유",
              "hint": "함께 있는 사람에게 도움을 요청해요."
            }
          ],
          "pieces": [
            {
              "label": "물 한 잔을 천천히 마시기",
              "slot": 0,
              "feedback": "식후에 할 행동 하나를 바꿨어요."
            },
            {
              "label": "재떨이를 치우고 탁자를 닦기",
              "slot": 1,
              "feedback": "탁자에서 담배를 떠올릴 단서를 치웠어요."
            },
            {
              "label": "금연 중임을 알리고 권하지 않도록 부탁하기",
              "slot": 2,
              "feedback": "주변 사람에게 어떤 도움을 바라는지 구체적으로 정했어요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "집에서 상담사와 통화할 방법을 고르세요",
          "instruction": "조건은 집에서 시작하고 전문상담사와 통화하는 것이에요. 두 조건을 만족하는 방법을 모두 찾아요.",
          "target": "외출 없이 시작 + 전문상담사와 통화",
          "why": "보건소 현장 프로그램은 상담과 지원을 함께 제공해요. 국가 금연상담전화는 직접 걸거나 상담 전화를 받도록 예약할 수 있어요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            8,
            9,
            10
          ],
          "cases": [
            {
              "label": "국가 금연상담전화로 걸기",
              "fields": [
                {
                  "label": "시작 장소",
                  "value": "집"
                },
                {
                  "label": "이용 방식",
                  "value": "전문상담사와 전화"
                }
              ],
              "fit": true,
              "feedback": "집에서 직접 전화해 상담을 시작할 수 있어요."
            },
            {
              "label": "상담 전화받기 예약",
              "fields": [
                {
                  "label": "시작 장소",
                  "value": "집에서 온라인 신청"
                },
                {
                  "label": "이용 방식",
                  "value": "예약한 상담 전화를 받음"
                }
              ],
              "fit": true,
              "feedback": "온라인으로 신청하고 전문상담사와 통화해요."
            },
            {
              "label": "찾아가는 사업장 상담",
              "fields": [
                {
                  "label": "시작 장소",
                  "value": "참여 사업장의 상담 장소"
                },
                {
                  "label": "이용 방식",
                  "value": "현장에서 대면 상담"
                }
              ],
              "fit": false,
              "feedback": "전문상담을 받을 수 있지만 집에서 시작하는 방법에는 맞지 않아요."
            },
            {
              "label": "금연 안내문 읽기",
              "fields": [
                {
                  "label": "시작 장소",
                  "value": "집"
                },
                {
                  "label": "이용 방식",
                  "value": "혼자 안내문 읽기"
                }
              ],
              "fit": false,
              "feedback": "집에서 정보를 읽을 수 있지만 상담사와 통화하지 않아요."
            }
          ]
        }
      ]
    }
  },
  "H25": {
    "sources": [
      {
        "title": "검진기관 찾기 실제 검색 화면",
        "publisher": "국민건강보험공단",
        "url": "https://www.nhis.or.kr/nhis/healthin/retrieveExmdAdminSearch.do",
        "kind": "공식 검색 화면",
        "observation": "읍·면·동이나 도로명을 입력하고 일반, 구강 등 검진 항목을 고를 수 있다.",
        "use": "지역·일반·구강 조건을 동시에 읽는 검색결과 표를 구성했다."
      },
      {
        "title": "개인 검진대상 조회",
        "publisher": "국민건강보험공단",
        "url": "https://www.nhis.or.kr/nhis/healthin/retrieveHealthinCheckUpTargetPerson.do",
        "kind": "공식 개인 서비스 진입 화면",
        "observation": "검진대상 조회로 들어가면 공단 본인 로그인 화면으로 연결된다.",
        "use": "내 대상 여부를 확인하는 일과 공개 기관 검색을 구분한다."
      },
      {
        "title": "국가건강검진 안내와 자주 묻는 질문",
        "publisher": "질병관리청 국가건강정보포털",
        "url": "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=6671",
        "kind": "공식 이용 질의응답",
        "observation": "주소지와 관계없이 지정기관에서 받을 수 있고 공단 사이트와 모바일에서 기관을 찾을 수 있다고 설명한다.",
        "use": "안산 단원구는 연습용 희망 지역이라는 점을 분명히 한다."
      },
      {
        "title": "국민건강보험공단 검진기관 찾기 조회",
        "publisher": "국민건강보험공단·공공데이터포털",
        "url": "https://www.data.go.kr/data/15154419/openapi.do",
        "kind": "공식 기관 정보 항목 안내",
        "observation": "지역뿐 아니라 기관별 검진 항목과 운영 정보, 예약 관련 사항이 구분된다.",
        "use": "지정 항목과 예약 여부를 다른 칸에 놓는다."
      },
      {
        "title": "일반건강검진 안내표",
        "publisher": "국민건강보험공단",
        "url": "https://www.nhis.or.kr/static/html/wbma/c/wbhaca04500_2025_1.pdf",
        "kind": "공식 안내문 예시·2025년판",
        "observation": "일반건강검진 내용과 구강검진이 구분되어 있고 검진 과정의 안내가 들어 있다.",
        "use": "공통 항목과 구강 항목을 구분해 읽도록 한다."
      },
      {
        "title": "일반건강검진 실시 안내",
        "publisher": "국민건강보험공단",
        "url": "https://www.nhis.or.kr/nhis/healthin/wbhaca04500m01.do",
        "kind": "공식 서비스 안내",
        "observation": "대상 확인, 일반검진 절차, 결과 통보를 안내한다.",
        "use": "대상 확인·기관 찾기·예약·결과를 각각 다른 확인 단계로 나눴다."
      },
      {
        "title": "건강검진결과 상세내역 확인 예시",
        "publisher": "국민건강보험공단",
        "url": "https://www.nhis.or.kr/static/html/guide/sub2_010502.html",
        "kind": "공식 과거 화면 설명",
        "observation": "공단이 공개한 화면 예시에서 검진결과 상세내역을 열어 볼 수 있다.",
        "use": "건강검진 결과와 예약 완료를 서로 다른 기록으로 보여 준다."
      },
      {
        "title": "사랑의병원 일반건강검진 안내",
        "publisher": "안산 사랑의병원",
        "url": "https://www.saranghp.co.kr/program/p05-01.php",
        "kind": "안산 시행기관 안내",
        "observation": "이 기관의 일반검진 안내에는 별도 예약이 필요하지 않다고 쓰여 있다.",
        "use": "기관마다 접수 방식이 달라 확인된 내용으로만 상태를 적게 했다."
      },
      {
        "title": "공단검진 안내",
        "publisher": "안산 알파원헬스케어 건강검진센터",
        "url": "https://alpha1hc.com/bbs/content.php?co_id=health09",
        "kind": "안산 시행기관 안내",
        "observation": "일반건강검진·암검진·후속 확인이 다른 항목으로 제시된다.",
        "use": "실제 기관 안내처럼 항목 이름을 나눠 예시 기관끼리 비교한다."
      },
      {
        "title": "우리 가족 건강검진 탐구생활",
        "publisher": "국민건강보험공단 웹진",
        "url": "https://www.nhis.or.kr/static/alim/paper/oldpaper/202205/sub/01.html",
        "kind": "공식 절차·문진표 안내 사례",
        "observation": "공개 기사에서 문진표를 본인이 작성하고 검진을 받는 절차를 보여 준다.",
        "use": "개인 준비, 기관 검색, 결과 확인을 구분하는 연습을 만든다."
      }
    ],
    "lab": {
      "title": "국가검진 기관 검색 결과를 직접 읽어요",
      "brief": "공단 공개 검색 화면에 있는 지역·일반·구강 항목을 연습해요. 아래 기관과 안내문은 팀이 만든 예시예요. 실제 예약은 기관에서 확인해요.",
      "artifact": "검진기관 후보와 예약 확인표",
      "rounds": [
        {
          "mode": "inspect",
          "title": "두 항목이 모두 표시된 기관을 찾아요",
          "instruction": "예시 메모는 안산 단원구에서 일반검진과 구강검진을 함께 받을 기관을 찾는 것이에요. 세 조건이 모두 표시된 카드를 골라요.",
          "target": "안산 단원구 + 일반 가능 + 구강 가능",
          "why": "공단 검색 화면에는 일반과 구강이 따로 표시돼요. 한 기관에 두 표시가 있어도 같은 날 받을 수 있는지는 기관에 확인해야 해요.",
          "sourceRefs": [
            1,
            3,
            4,
            5,
            9
          ],
          "cases": [
            {
              "label": "후보 가",
              "fields": [
                {
                  "label": "지역",
                  "value": "안산 단원구"
                },
                {
                  "label": "일반",
                  "value": "가능"
                },
                {
                  "label": "구강",
                  "value": "가능"
                }
              ],
              "fit": true,
              "feedback": "지역과 두 항목이 모두 맞아요. 같은 날 이용 여부는 별도로 확인해요."
            },
            {
              "label": "후보 나",
              "fields": [
                {
                  "label": "지역",
                  "value": "안산 단원구"
                },
                {
                  "label": "일반",
                  "value": "가능"
                },
                {
                  "label": "구강",
                  "value": "표시 없음"
                }
              ],
              "fit": false,
              "feedback": "구강 항목을 확인할 근거가 없어 이번 후보에서는 보류해요."
            },
            {
              "label": "후보 다",
              "fields": [
                {
                  "label": "지역",
                  "value": "안산 상록구"
                },
                {
                  "label": "일반",
                  "value": "가능"
                },
                {
                  "label": "구강",
                  "value": "가능"
                }
              ],
              "fit": false,
              "feedback": "둘 다 가능하지만 이번 메모의 희망 지역은 단원구예요."
            },
            {
              "label": "후보 라",
              "fields": [
                {
                  "label": "지역",
                  "value": "안산 단원구"
                },
                {
                  "label": "일반",
                  "value": "표시 없음"
                },
                {
                  "label": "구강",
                  "value": "가능"
                }
              ],
              "fit": false,
              "feedback": "구강은 가능해도 일반검진 가능 표시는 없어요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "다시 연락할 곳이 어디인지 확인해요",
          "instruction": "두 항목을 같은 날 받을 예약을 확인하려 해요. 기관에서 두 항목 모두 접수됐다고 명시한 안내만 찾아요.",
          "target": "일반·구강이 같은 날 모두 접수됐다는 회신",
          "why": "지정기관이라는 표시, 문의 접수, 실제 예약 확정은 서로 달라요. 기관이 안내한 방법과 예약 항목을 읽어야 다시 전화할 내용을 줄일 수 있어요.",
          "sourceRefs": [
            1,
            4,
            6,
            8,
            9
          ],
          "cases": [
            {
              "label": "기관 회신 가",
              "fields": [
                {
                  "label": "일반",
                  "value": "희망일 접수 완료"
                },
                {
                  "label": "구강",
                  "value": "같은 날 접수 완료"
                },
                {
                  "label": "기록 종류",
                  "value": "예약 확인"
                }
              ],
              "fit": true,
              "feedback": "기관이 같은 날 두 항목의 접수를 모두 확인했어요."
            },
            {
              "label": "기관 회신 나",
              "fields": [
                {
                  "label": "일반",
                  "value": "희망일 접수 완료"
                },
                {
                  "label": "구강",
                  "value": "치과 접수 별도"
                },
                {
                  "label": "기록 종류",
                  "value": "일반 예약 확인"
                }
              ],
              "fit": false,
              "feedback": "구강 접수 여부가 남아 있어요. 치과의 접수 방법을 확인해요."
            },
            {
              "label": "기관 안내 다",
              "fields": [
                {
                  "label": "일반",
                  "value": "실시 기관"
                },
                {
                  "label": "구강",
                  "value": "실시 기관"
                },
                {
                  "label": "기록 종류",
                  "value": "공개 기관 목록"
                }
              ],
              "fit": false,
              "feedback": "두 항목을 실시한다는 뜻이에요. 내 예약이 완료됐는지는 알 수 없어요."
            },
            {
              "label": "접수 알림 라",
              "fields": [
                {
                  "label": "일반",
                  "value": "희망한다고 문의함"
                },
                {
                  "label": "구강",
                  "value": "희망한다고 문의함"
                },
                {
                  "label": "기록 종류",
                  "value": "문의 전달 알림"
                }
              ],
              "fit": false,
              "feedback": "문의만 전달됐어요. 기관의 회신을 확인해야 해요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "내가 확인할 일을 알맞은 곳에 놓으세요",
          "instruction": "공개 목록에서 알아볼 일, 공단 개인 화면에서 볼 일, 실제 기관이 정하는 일을 나눠요.",
          "why": "연습 화면에는 이름과 결과를 입력할 필요가 없어요. 개인 정보가 필요한 일은 공단의 개인 서비스에서, 실제 접수는 기관이 안내한 경로에서 진행해요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            6,
            7,
            8,
            10
          ],
          "slots": [
            {
              "label": "공단의 검진대상 조회",
              "hint": "내가 이번에 받을 수 있는 항목을 알아봐요."
            },
            {
              "label": "공단의 검진기관 찾기",
              "hint": "지역별로 어떤 곳이 어떤 항목을 제공하는지 봐요."
            },
            {
              "label": "실제 이용할 기관의 접수처",
              "hint": "희망일에 받을 수 있는지 최종 확인해요."
            },
            {
              "label": "공단의 건강검진 결과조회",
              "hint": "이미 받은 검진의 개인 기록을 봐요."
            }
          ],
          "pieces": [
            {
              "label": "나에게 안내된 올해 항목",
              "slot": 0,
              "feedback": "본인 확인을 거쳐 내 대상 항목을 봐요."
            },
            {
              "label": "구강검진 가능 표시가 있는 근처 기관",
              "slot": 1,
              "feedback": "공개 기관 목록에서 제공 항목을 확인해요."
            },
            {
              "label": "희망일에 두 항목을 함께 받을 수 있는지",
              "slot": 2,
              "feedback": "기관이 정한 접수 방식과 가능 여부를 확인해요."
            },
            {
              "label": "지난 검진의 결과 통보 내용",
              "slot": 3,
              "feedback": "예약이 아닌 과거 개인 기록을 확인하는 곳이에요."
            }
          ]
        }
      ]
    }
  },
  "C_BOOK": {
    "sources": [
      {
        "title": "생활북토크 『당신과 내가 대화할 수 있을까』",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/togather/?idx=881",
        "kind": "해당 책방 공식 행사 공지",
        "observation": "정희진의 책을 놓고 정혜실이 사회와 대담을 맡는다고 명시한다.",
        "use": "책을 쓴 이와 진행자를 공지에서 직접 찾는 과제를 만들었다."
      },
      {
        "title": "생활북토크 『아무튼, 명상』",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/togather/?idx=876",
        "kind": "해당 책방 공식 행사 공지",
        "observation": "이은경의 저서 한 권을 중심으로 여는 북토크를 안내한다.",
        "use": "지정 도서와 그 책을 쓴 사람을 따로 확인하는 예로 읽었다."
      },
      {
        "title": "생활북토크 『유한한 삶을 사랑하는 법』",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/togather/?idx=875",
        "kind": "해당 책방 공식 행사 공지",
        "observation": "정시우 작가의 책으로 진행하는 북토크를 소개한다.",
        "use": "책의 주제와 모임 형식을 따로 읽는 데 참고했다."
      },
      {
        "title": "생각의 전환과 생활책 추천주문서",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/thinking",
        "kind": "해당 책방 실제 큐레이션 서비스",
        "observation": "취향과 관심사를 적으면 호스트가 어울리는 책을 골라주는 양식을 안내한다.",
        "use": "취향에 해당하는 공지와 선택 이유를 엮는 책방 활동표를 만든다."
      },
      {
        "title": "생활북토크 『재지마인드』",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/shop_view/?idx=870",
        "kind": "해당 책방 공식 행사 공지",
        "observation": "키키와 프랭키의 이름으로 진행하는 북토크를 안내한다.",
        "use": "같은 북토크라도 어떤 사람이 이야기하는지 공지에서 확인하도록 했다."
      },
      {
        "title": "차 스터디클럽 다독임 네 번째",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/togather/?idx=855",
        "kind": "해당 책방 실제 독서 모임 공지",
        "observation": "차 크리에이터 유하가 이끌고 『매일 아침 차를 마십니다』를 읽으며 차를 마시는 모임이다.",
        "use": "호스트가 있는 모임과 저자가 출연하는 대담을 구분하는 실물 사례로 쓴다."
      },
      {
        "title": "생활북토크 『수련의 말들』",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/culture/?idx=871",
        "kind": "해당 책방 공식 행사 공지",
        "observation": "책과 요가소년을 함께 명시한 작가 북토크 공지를 열어 보았다.",
        "use": "작가와 작품을 함께 적는 행사 카드의 표기에 참고했다."
      },
      {
        "title": "시클럽 스무 번째 『단 하나의 눈송이』",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/club/?idx=759",
        "kind": "해당 책방 실제 시집 모임 공지",
        "observation": "사이토 마리코 시집 하나를 여러 회에 걸쳐 다루는 모임으로 안내한다.",
        "use": "한 권을 이어 읽고 싶은 경우 고를 활동으로 구성했다."
      },
      {
        "title": "생활철학클럽 대화편, 오디세이",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/togather/?idx=862",
        "kind": "해당 책방 실제 철학 모임 공지",
        "observation": "여러 회로 구성되며 회차별 신청도 가능하다고 안내한다.",
        "use": "참여 단위와 모임 주제를 분리해 읽는 방법을 검토했다."
      },
      {
        "title": "마더스북클럽 엄마적응모임 『빅토리노트』",
        "publisher": "마을상점생활관",
        "url": "https://www.insidethevillage.com/togather/?idx=863",
        "kind": "해당 책방 실제 생활 주제 모임",
        "observation": "엄마적응모임이라는 주제로 『빅토리노트』를 지정한 독서모임을 공개했다.",
        "use": "책 제목만으로 독자층을 짐작하지 않고 공지의 모임 이름까지 읽도록 했다."
      }
    ],
    "lab": {
      "title": "책방 공지를 펼쳐 내 독서 모임 고르기",
      "brief": "마을상점생활관은 작가 대담, 차를 마시며 읽는 모임, 시집을 함께 읽는 모임을 열었어요. 책방이 공개한 행사 사례로 책과 활동 방식을 맞춰 보세요.",
      "artifact": "책 제목과 활동 방식, 확인할 점을 담은 모임 카드",
      "rounds": [
        {
          "mode": "inspect",
          "title": "같은 ‘책 모임’에서 작가 대담 찾기",
          "instruction": "이번에는 ‘책을 쓴 이와 다른 진행자가 주고받는 이야기를 듣고 싶다’는 조건이에요. 실제 공지를 줄인 카드에서 두 사람의 역할이 모두 확인되는 행사를 담아요.",
          "why": "제목에 ‘책’이 들어가도 저자가 오는 자리, 회원끼리 읽는 자리, 호스트가 진행하는 자리는 서로 달라요. 누가 무엇을 하는지 먼저 보면 참여할 모습을 떠올릴 수 있어요.",
          "sourceRefs": [
            1,
            2,
            3,
            5,
            6,
            7,
            8
          ],
          "target": "지은이와 대담 진행자가 각각 누구인지 두 역할을 확인해요.",
          "cases": [
            {
              "label": "『당신과 내가 대화할 수 있을까』 생활북토크",
              "fields": [
                {
                  "label": "책",
                  "value": "정희진이 쓴 『당신과 내가 대화할 수 있을까』"
                },
                {
                  "label": "진행",
                  "value": "정혜실이 사회와 대담을 맡음"
                }
              ],
              "fit": true,
              "feedback": "정희진의 책을 두고 정혜실이 사회와 대담을 맡아요. 두 사람의 역할을 공지에서 확인할 수 있어요."
            },
            {
              "label": "다독임 차 스터디클럽",
              "fields": [
                {
                  "label": "책",
                  "value": "이유진이 쓴 『매일 아침 차를 마십니다』"
                },
                {
                  "label": "진행",
                  "value": "차 크리에이터 유하가 차를 마시며 책 읽는 모임을 이끎"
                }
              ],
              "fit": false,
              "feedback": "저자 이름과 호스트 이름은 보이지만 작가가 출연하는 대담이라는 안내는 없어요. 책과 차를 함께 즐기려는 목적에 맞아요."
            },
            {
              "label": "스무 번째 시클럽",
              "fields": [
                {
                  "label": "책",
                  "value": "사이토 마리코의 시집 『단 하나의 눈송이』"
                },
                {
                  "label": "진행",
                  "value": "시집 한 권을 여러 회에 걸쳐 다루는 모임"
                }
              ],
              "fit": false,
              "feedback": "여러 번 만나 시집을 읽는 공지예요. 책을 쓴 시인이 대담에 나온다는 내용은 없어요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "독서 취향에 맞는 활동표 만들기",
          "instruction": "마음이 가는 방식에 따라 활동표의 빈자리를 채우세요. 책방 공지에 적힌 활동으로 짝을 지으면, 어떤 모임인지 한 문장으로 말할 수 있어요.",
          "why": "실제 책방은 취향에 맞춘 책 추천도 받아요. 취향을 ‘무슨 주제’와 ‘어떻게 읽고 싶은지’로 나누면 고를 자리가 좁혀져요.",
          "sourceRefs": [
            1,
            4,
            6,
            8,
            9,
            10
          ],
          "slots": [
            {
              "label": "맛을 느끼며 읽기",
              "hint": "차를 마시는 활동이 공지에 있어요."
            },
            {
              "label": "한 시집을 천천히 함께 읽기",
              "hint": "여러 번 모이는 시집 모임이에요."
            },
            {
              "label": "작가가 책 이야기를 나누는 자리",
              "hint": "작가와 대담 진행자가 함께 나와요."
            }
          ],
          "pieces": [
            {
              "label": "다독임과 『매일 아침 차를 마십니다』",
              "slot": 0,
              "feedback": "지정된 책을 놓고 함께 차를 마시는 모임이라 두 단서가 모두 맞아요."
            },
            {
              "label": "시클럽과 『단 하나의 눈송이』",
              "slot": 1,
              "feedback": "시집 한 권을 여러 회에 걸쳐 다뤄요. 한번의 작가 강연과 참여 방식이 달라요."
            },
            {
              "label": "생활북토크와 『당신과 내가 대화할 수 있을까』",
              "slot": 2,
              "feedback": "작가와 사회·대담 진행자를 공개한 사례예요."
            },
            {
              "label": "생활책 추천주문서",
              "slot": -1,
              "feedback": "어떤 책을 고를지 호스트에게 요청하는 서비스예요. 모여서 책을 읽는 행사와는 다른 기능이에요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "신청 전에 확인할 것을 남기기",
          "instruction": "시집 모임을 골랐다고 생각하고, 책방의 공개 공지로 알 수 있는 사실과 새 공지에서 다시 볼 정보를 정리한 메모를 고르세요.",
          "why": "지난 행사의 활동 방식은 고르는 데 도움이 돼요. 실제로 참여할 때는 새 공지의 자리·준비물·참여 단위를 따로 확인할 수 있어요.",
          "sourceRefs": [
            2,
            3,
            5,
            7,
            8,
            9,
            10
          ],
          "target": "운영 기록과 지금의 모집 상태를 구분한 메모만 담아요.",
          "cases": [
            {
              "label": "지정 도서 확인",
              "fields": [
                {
                  "label": "공개 기록",
                  "value": "스무 번째 시클럽의 책은 『단 하나의 눈송이』"
                },
                {
                  "label": "새 모임에서 볼 것",
                  "value": "다음 공지의 선정 도서와 준비할 책"
                }
              ],
              "fit": true,
              "feedback": "지난 모임에 쓰인 책과 앞으로 읽을 책을 구분했어요. 처음 참여할 때 준비물 확인에 써요."
            },
            {
              "label": "지난 모집 인원으로 자리 확정",
              "fields": [
                {
                  "label": "공개 기록",
                  "value": "이전 공지에 모집 인원이 있음"
                },
                {
                  "label": "결론",
                  "value": "같은 인원으로 지금도 신청할 수 있음"
                }
              ],
              "fit": false,
              "feedback": "운영했던 행사의 인원으로 오늘 남은 자리를 알 수 없어요. 모집 여부는 새 공지에서 봐야 해요."
            },
            {
              "label": "참여 단위 확인",
              "fields": [
                {
                  "label": "공개 기록",
                  "value": "시클럽은 한 시집을 여러 회에 걸쳐 읽음"
                },
                {
                  "label": "새 모임에서 볼 것",
                  "value": "회차를 골라 갈 수 있는지, 함께 이어 가는 모임인지"
                }
              ],
              "fit": true,
              "feedback": "모임마다 신청 단위가 달라요. 예를 들어 오디세이 철학클럽의 그 공지는 회차별 신청을 안내했어요."
            }
          ]
        }
      ]
    }
  },
  "C_ECO": {
    "sources": [
      {
        "title": "0515_수달 모니터링",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/0ktMwK7",
        "kind": "현장 사진·활동기록",
        "observation": "서식지 넓은 사진과 흔적 옆에 크기 기준을 댄 상세 사진을 확인했다.",
        "use": "전경과 상세 사진의 용도를 나눈다."
      },
      {
        "title": "생물다양성의 날, 우리가 만난 생명들",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/54t3VVV",
        "kind": "현장 사진 소개",
        "observation": "지역 생태지킴이의 사진에 생물 이름과 설명이 각각 붙어 있다.",
        "use": "본 것과 사진 설명을 구분한다."
      },
      {
        "title": "6월 수달모니터링",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/njt04xl",
        "kind": "현장 활동 기록",
        "observation": "카메라에 포착된 수달, 배설물·발자국·휴식 흔적, 따로 발견한 게 두 마리를 구분했다.",
        "use": "개체 수와 흔적 수를 구분한다."
      },
      {
        "title": "20220421(목) 의왕군포안산 공공주택지구 개발 대응 반월 생태모니터링",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/jdtmxo",
        "kind": "현장 조사 기록",
        "observation": "고라니 흔적과 함께 하천 수량·악취·투기 상황도 적었다.",
        "use": "서식지 상태를 기록지의 별도 칸에 둔다."
      },
      {
        "title": "20220929(목) 의왕군포안산 공공주택지구 개발 대응 반월 생태모니터링",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/q1tvkr",
        "kind": "현장 조사 기록",
        "observation": "하천과 논의 포유류 흔적, 하천에 버려진 쓰레기를 따로 보고했다.",
        "use": "흔적만으로 촬영 개체 수를 채우지 않는다."
      },
      {
        "title": "20220525(수) 의왕군포안산 공공주택지구 개발 대응 반월 생태모니터링",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/OEtmBl",
        "kind": "현장 조사 기록",
        "observation": "논습지에서 누룩뱀과 참개구리를 발견했다고 기록했다.",
        "use": "목격 대상과 주변 환경을 짝짓는다."
      },
      {
        "title": "20220701(금) 의왕군포안산 공공주택지구 개발 대응 반월 생태모니터링",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/XBt4PD",
        "kind": "현장 조사 기록",
        "observation": "비가 온 뒤 울음소리로 양서류 여러 종의 서식을 확인했다.",
        "use": "들은 소리와 눈으로 센 개체를 구분한다."
      },
      {
        "title": "시화호 유입 하천 정화 캠페인 - 한양대",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/vKtZZx",
        "kind": "현장 활동 후기",
        "observation": "안산천에서 대학생과 정화 활동을 했고 쓰레기가 잘 보이지 않았다고 적었다.",
        "use": "보인 범위를 넘어 동네 전체로 확대하지 않는다."
      },
      {
        "title": "시화호 유입하천 릴레이 정화 프로그램 (반월천)",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/a0tYDKX",
        "kind": "프로그램 공지",
        "observation": "반월천을 대상으로 한 정화 프로그램의 공지다.",
        "use": "모집 안내와 이미 수행된 관찰의 증거를 구분한다."
      },
      {
        "title": "20220418(월) 4월 지구곳 - 멸종위기종 관찰&서식지 정화 활동",
        "publisher": "안산환경운동연합",
        "url": "https://ansan.ekfem.or.kr/posts/dzt15J",
        "kind": "현장 활동 후기",
        "observation": "관찰한 새와 수거한 쓰레기 자루 수를 각각 적었다.",
        "use": "수거물과 생물의 개수 단위를 나눈다."
      }
    ],
    "lab": {
      "title": "하천 관찰 기록 편집실",
      "brief": "수달의 흔적 사진과 목격 메모를 검토하고, 다른 사람이 다시 확인할 수 있는 하천 기록 한 장을 완성해요. 자료에 나온 관찰 방식을 연습용 카드로 옮겼어요.",
      "artifact": "다시 확인할 수 있는 하천 관찰 기록",
      "rounds": [
        {
          "mode": "inspect",
          "title": "발자국이 몇 마리를 뜻할까요?",
          "instruction": "연습 기록 네 장을 펼쳐 보세요. 자료로 확인할 수 있는 만큼만 적은 기록을 골라요.",
          "why": "같은 동물이 여러 흔적을 남길 수 있어요. 기록한 방법을 함께 남기면 이후 조사에서도 비교하기 쉬워요.",
          "sourceRefs": [
            1,
            2,
            3,
            4,
            5,
            7
          ],
          "target": "관찰 방법과 결론이 맞는 기록",
          "cases": [
            {
              "label": "진흙 위의 발자국",
              "fields": [
                {
                  "label": "자료",
                  "value": "발자국 세 개가 한 줄로 이어진 사진 한 장"
                },
                {
                  "label": "작성한 기록",
                  "value": "수달 세 마리가 동시에 지나갔다."
                }
              ],
              "fit": false,
              "feedback": "사진에서 셀 수 있는 것은 발자국이에요. 이 자료만으로 마릿수는 알기 어려워요."
            },
            {
              "label": "확대 사진과 전경",
              "fields": [
                {
                  "label": "자료",
                  "value": "물가의 흔적 옆에 눈금이 보이는 사진, 같은 구간의 전경"
                },
                {
                  "label": "작성한 기록",
                  "value": "흔적의 크기를 비교할 수 있다. 동물의 몸은 사진에 보이지 않는다."
                }
              ],
              "fit": true,
              "feedback": "흔적의 상세와 주변 환경을 구분해서 기록했어요."
            },
            {
              "label": "연달아 찍힌 모습",
              "fields": [
                {
                  "label": "자료",
                  "value": "카메라에 동물이 한 마리씩 찍힌 사진 두 장"
                },
                {
                  "label": "작성한 기록",
                  "value": "두 장에 각각 한 마리가 보인다. 같은 개체인지는 확인하지 못했다."
                }
              ],
              "fit": true,
              "feedback": "사진 수와 개체 수를 구분했어요."
            },
            {
              "label": "풀숲에서 들린 소리",
              "fields": [
                {
                  "label": "자료",
                  "value": "풀숲 쪽에서 개구리 울음소리를 들었다는 메모"
                },
                {
                  "label": "작성한 기록",
                  "value": "개구리 네 마리를 눈으로 확인했다."
                }
              ],
              "fit": false,
              "feedback": "메모에는 소리를 들었다고만 적혀 있어요. 확인되지 않은 수는 비워 둬요."
            }
          ]
        },
        {
          "mode": "assemble",
          "title": "사진과 소리를 관찰표에 붙여요",
          "instruction": "각 자료가 어떤 기록을 뒷받침하는지 짝지어 보세요.",
          "why": "현장 조사에서는 눈으로 본 대상, 간접 흔적, 소리, 서식지 상태가 서로 다른 자료가 돼요.",
          "sourceRefs": [
            1,
            3,
            4,
            5,
            6,
            7,
            10
          ],
          "slots": [
            {
              "label": "직접 본 동물",
              "hint": "화면에 몸이 보이거나 직접 목격했어요."
            },
            {
              "label": "동물이 남긴 흔적",
              "hint": "몸은 보이지 않아도 물가에 남아 있어요."
            },
            {
              "label": "귀로 들은 기록",
              "hint": "울음소리로 확인했어요."
            },
            {
              "label": "서식지 상태",
              "hint": "동물 주변의 물가가 어떤지 적어요."
            }
          ],
          "pieces": [
            {
              "label": "논습지에서 참개구리가 눈앞에 보였다.",
              "slot": 0,
              "feedback": "발견한 대상을 직접 적는 칸이에요."
            },
            {
              "label": "눈금과 나란히 찍은 물가의 배설물",
              "slot": 1,
              "feedback": "크기를 가늠할 수 있는 흔적 사진이에요."
            },
            {
              "label": "비가 온 뒤 풀숲에서 들린 청개구리 소리",
              "slot": 2,
              "feedback": "누가 보았는지와 별도로 들은 방법을 남길 수 있어요."
            },
            {
              "label": "물의 양이 적고 물가에 버려진 쓰레기가 보였다.",
              "slot": 3,
              "feedback": "같은 구간의 주변 환경을 다시 비교할 단서예요."
            }
          ]
        },
        {
          "mode": "inspect",
          "title": "게시할 조사 메모를 골라요",
          "instruction": "자료가 보여 주는 범위를 지킨 문장을 골라요. 예시는 실제 활동 기록을 바탕으로 짧게 다시 썼어요.",
          "why": "모집 공지, 한 구간에서 본 사실, 실제 수거량은 서로 답할 수 있는 질문이 달라요.",
          "sourceRefs": [
            3,
            8,
            9,
            10
          ],
          "target": "활동 결과로 뒷받침되는 문장",
          "cases": [
            {
              "label": "정화 구간 메모",
              "fields": [
                {
                  "label": "자료",
                  "value": "안산천에서 활동하며 눈에 띄는 쓰레기가 적었다는 후기"
                },
                {
                  "label": "쓸 문장",
                  "value": "조사한 구간에서 쓰레기가 잘 보이지 않았다."
                }
              ],
              "fit": true,
              "feedback": "현장에서 본 범위와 메모의 범위가 같아요."
            },
            {
              "label": "반월천 알림",
              "fields": [
                {
                  "label": "자료",
                  "value": "아직 진행 결과가 없는 정화 프로그램 모집 공지"
                },
                {
                  "label": "쓸 문장",
                  "value": "이날 쓰레기를 두 자루 수거했다."
                }
              ],
              "fit": false,
              "feedback": "모집 안내에는 수거 결과가 없어요."
            },
            {
              "label": "서식지 정화 후기",
              "fields": [
                {
                  "label": "자료",
                  "value": "현장에서 새를 보고 쓰레기 두 자루를 수거했다는 기록"
                },
                {
                  "label": "쓸 문장",
                  "value": "쓰레기 수거량은 두 자루다. 본 새는 생물 관찰 칸에 따로 적는다."
                }
              ],
              "fit": true,
              "feedback": "수거량과 생물 관찰을 각각 맞는 칸에 기록했어요."
            }
          ]
        }
      ]
    }
  }
} as const satisfies Readonly<Record<string, FieldEntry>>;
