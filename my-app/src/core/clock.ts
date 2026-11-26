// 한국 시각. 기기나 서버의 시간대가 어디든 날짜 판단을 한국 기준으로 맞춘다.
// 원본: app/core/clock.py
//
// 판단 함수(candidates.ts)는 시각을 인자로 받는다. 안에서 시계를 읽지 않는다.
// now()는 그리는 중에 부르지 않는다. 답을 읽은 뒤(브라우저에서만 그려지는 부품 안)에 부른다.

import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const KOREA = "Asia/Seoul";

// 판단에 쓰는 '때'
export type Moment = {
  day: string; // "2026-11-30"
  time: string; // "14:00". 빈 글자면 날짜로만 판단한다(종료일 당일은 그날 끝까지 보여 준다)
  year: number; // 태어난 해를 만 나이로 바꿀 때 쓴다
};

// 어떤 순간을 한국 시각의 '때'로 바꾼다
export function momentOf(instant: Date): Moment {
  const local = new TZDate(instant, KOREA);
  return { day: format(local, "yyyy-MM-dd"), time: format(local, "HH:mm"), year: local.getFullYear() };
}

// 지금(한국 시각)
export function now(): Moment {
  return momentOf(new Date());
}

// 날짜만 아는 '때'. 테스트와, 시각 없이 날짜로만 판단할 때 쓴다
export function dayOnly(day: string): Moment {
  return { day, time: "", year: Number(day.slice(0, 4)) };
}
