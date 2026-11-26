// 자료 파일에 적는 값과 이름. 다른 파일은 글자를 다시 적지 않고 이 이름을 가져다 쓴다.
// 원본: app/core/loader.py, app/core/selection.py

// ── 코드가 id로 찾는 문항 ──
export const BARRIER_Q = "Q_BARRIER"; // 걸림돌. 새 앱에서는 묻지 않는다(자료 검사에만 쓴다)
export const PRIORITY_Q = "Q_PRIORITY";
export const FREE_Q = "Q_FREE";
// 기본정보. 유형은 바꾸지 않는다. 후보 거르기에만 쓰고 저장하지 않는다
export const GENDER_Q = "P_GENDER";
export const AGE_Q = "P_AGE";
export const WORK_Q = "P_WORK";

// 기본정보 답과 견주는 정보표 열: [문항 id, 열 이름, 그 열에 적을 수 있는 선택지 id]. 빈칸은 '조건 없음'이다
export const PROFILE_CHOICES: [string, string, string[]][] = [
  [GENDER_Q, "대상성별", ["male", "female"]],
  [WORK_Q, "대상재직상태", ["employed", "self_employed", "not_working"]],
];
// 만 나이. 빈칸은 '제한 없음'이다
export const AGE_MIN_COLUMN = "최소나이";
export const AGE_MAX_COLUMN = "최대나이";

export const SCALE = "scale"; // 척도 문항의 selection 값
export const CANDIDATE_TYPES = "candidate_types"; // options_from에 적는 값

// 척도 값의 범위
export const SCALE_MIN = 1;
export const SCALE_MAX = 5;

// ── 정보표(programs.csv)의 칸에 적는 값 ──
export const KIND_ALWAYS = "상시서비스";
export const KIND_PERIOD = "기간프로그램";
export const KIND_LIST = "목록";
export const UNCONFIRMED = "미확인";
export const NATIONWIDE = "전국"; // 안산에 있지 않은 전화·온라인 창구. 안산 기관 뒤에 보여 준다

// 'a|b|c' 꼴의 칸을 목록으로 바꾼다
export function splitMulti(value: string | undefined): string[] {
  return (value ?? "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}
