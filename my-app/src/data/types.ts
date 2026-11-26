// 자료의 모양. 원본은 app/data/의 파일이고, scripts/build-data.ts가 읽어
// src/generated/에 써 둔 것을 앱이 가져다 쓴다. 필드 이름은 원본 파일과 같다.

// 세부 질문의 후보 규칙: { 정보표의 열 이름: [값, 값] }
export type Rule = Record<string, string[]>;

export type Option = {
  id: string;
  label: string;
  icon?: string; // ":material/work:" 꼴(원본 그대로). 화면에서 그림으로 바꿔 쓴다
  exclusive?: boolean; // 다른 선택지와 함께 고를 수 없다
  exclude?: Rule; // 고르면 이 값인 프로그램을 뺀다
  first?: Rule; // 고르면 이 값인 프로그램을 앞으로 가져온다
};

export type Selection = "single" | "multi" | "number" | "scale" | "text";

export type Question = {
  id: string;
  text: string;
  help?: string;
  selection: Selection;
  options?: Option[];
  type?: string; // 척도 문항만: 점수가 더해질 유형 id
  where?: "result"; // 설문이 아니라 결과 쪽에서 묻는다
  min?: number; // 숫자 문항
  max?: number;
  short_base?: number; // 두 자리로 적으면 더할 값(66 → 1966)
  options_from?: "candidate_types";
  max_characters?: number;
};

export type ScaleOption = { value: number; label: string };

export type Area = { id: string; label: string };

export type Detail = {
  id: string;
  text: string;
  selection: "single" | "multi";
  options: Option[];
  last?: Rule; // 이 값인 프로그램은 맨 뒤로 보낸다
  enabled?: boolean;
  prominent?: boolean;
  match_tags?: boolean; // 고른 뒤에는 그 세부태그가 붙은 곳만 남긴다
  require_choice?: boolean; // 고르기 전에는 곳을 보여 주지 않는다
  log_answer?: boolean; // false면 고른 것을 기록에도 AI에도 남기지 않는다
};

export type TypeInfo = {
  id: string;
  area: string;
  name: string;
  purpose?: string;
  statement: string;
  feature: string;
  definition?: string;
  detail?: Detail;
};

// 프로그램 정보표의 한 행. { 열 이름: 값 }이고 값은 모두 글자다(빈칸은 "").
export type Program = Record<string, string>;

// 찾아갈 수 있는 곳의 좌표. 길찾기 단추와 지도가 쓴다.
export type Venue = { name: string; address: string; lat: number; lon: number };

export type Worry = { id: string; label: string; show?: string[]; checks?: boolean };

export type FallbackCard = {
  name: string;
  org: string;
  description: string;
  phone: string;
  say: string;
  url?: string;
};

// 화면이 쓰는 자료 (공개 정보라 브라우저에 실어도 된다)
export type AppData = {
  questions: Question[]; // 걸림돌 문항(Q_BARRIER)은 빠져 있다
  scale: ScaleOption[]; // 척도 문항의 공통 선택지(5 → 1 순서)
  areas: Area[];
  types: TypeInfo[]; // 파일에 적힌 순서(T01~T12)
  programs: Program[];
  venues: Record<string, Venue[]>; // { 프로그램 id: 곳 목록 }. 곳이 없는 id는 없다
  settings: {
    scoring: { high: number };
    ai_top_n: number;
    worries: Worry[];
    free_empty_words: string[];
    fallback_card: FallbackCard;
  };
};

// 서버만 쓰는 자료 (AI 지시문과 모델 설정). 화면 쪽 코드에서 가져오지 않는다.
export type ServerData = {
  prompt: string;
  llm: { provider: string; model: string; effort: string; timeout_seconds: number };
};
