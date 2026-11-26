// AI에게 보내기 전에 직접 적은 글에서 주민번호, 전화번호, 이메일 형태를 지운다. 이름과 주소는 지우지 못한다.
// 원본: app/core/privacy.py
//
// 파이썬의 \w와 \d는 한글과 전각 숫자(０１２)까지 포함한다. 자바스크립트의 \w, \d는 영문·아스키 숫자뿐이라
// 그대로 옮기면 덜 지운다. 그래서 유니코드 방식(\p{L}, \p{N}, \p{Nd})으로 적는다.

export const REMOVED = "[삭제됨]";

const WORD = "\\p{L}\\p{N}_"; // 파이썬의 \w
const DIGIT = "\\p{Nd}"; // 파이썬의 \d

const EMAIL = new RegExp(`[${WORD}.+-]+@[${WORD}-]+(?:\\.[${WORD}-]+)+`, "gu");
// 주민등록번호 형태
const RESIDENT = new RegExp(`(?<!${DIGIT})${DIGIT}{6}\\s*-\\s*${DIGIT}{7}(?!${DIGIT})`, "gu");
// 010-1234-5678, 01012345678, 031 123 4567, 02.123.4567 같은 형태
const PHONE = new RegExp(`(?<!${DIGIT})0${DIGIT}{1,2}[-.\\s]?${DIGIT}{3,4}[-.\\s]?${DIGIT}{4}(?!${DIGIT})`, "gu");

// 지우는 순서: 이메일 → 주민번호 → 전화번호 (파이썬과 같다)
export function scrub(text: string | null | undefined): string {
  return (text ?? "").replace(EMAIL, REMOVED).replace(RESIDENT, REMOVED).replace(PHONE, REMOVED);
}
