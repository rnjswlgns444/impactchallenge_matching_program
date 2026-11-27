// 기관 그림에 쓰는 계산: 직선거리, 그림에 놓을 곳 나누기, 우리 동네에서 가까운 곳 고르기.
// 화면과 무관한 순수 함수만 둔다. 파이썬 앱에는 없는 기능이라 대조 검사는 없고, 이 파일의 테스트가 지킨다.
//
// 여기서는 후보를 거르거나 순서를 바꾸지 않는다. core/places.ts가 정한 순서 그대로 받아 그림에 놓을 뿐이다.
// 거리는 동 행정복지센터 한 점에서 잰 직선거리다. 실제 가는 길과 다르므로 화면에 숫자로 보여 주지 않고,
// '가까워요' 딱지를 붙일 곳을 고르는 데만 쓴다.

import type { Program, Venue } from "@/data/types";

export type Point = { lat: number; lon: number };

const EARTH_KM = 6371;
const rad = (degree: number) => (degree * Math.PI) / 180;

// 두 좌표 사이의 직선거리(km)
export function distanceKm(a: Point, b: Point): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

// 한 기관의 곳들 가운데 from에서 가장 가까운 곳. from이 없으면 첫 곳이고 거리는 모른다(null)
export function nearest(from: Point | null, venues: Venue[]): { venue: Venue; km: number | null } | null {
  if (venues.length === 0) return null;
  if (!from) return { venue: venues[0], km: null };
  let best = { venue: venues[0], km: distanceKm(from, venues[0]) };
  for (const venue of venues.slice(1)) {
    const km = distanceKm(from, venue);
    if (km < best.km) best = { venue, km };
  }
  return best;
}

// 그림에 놓을 곳 하나
export type Stop = {
  program: Program;
  number: number | null; // 길 위의 번호(1부터). 그림에 놓지 않고 목록에만 나오는 곳은 null
  venue: Venue | null; // 우리 동네에서 가장 가까운 곳. 좌표가 없는 곳(전화·온라인 창구)은 null
  km: number | null; // 우리 동네에서의 직선거리. 동을 고르지 않았거나 좌표가 없으면 null
};

// 화면에 놓을 곳(places, 이미 걸러지고 순서가 정해진 것)을 그림용으로 나눈다.
// 앞의 shown곳은 번호를 붙여 그림에 놓고, 나머지는 번호 없이 목록에만 둔다.
export function routeStops(
  places: Program[],
  venues: Record<string, Venue[]>,
  dong: Point | null,
  shown: number
): { stops: Stop[]; others: Stop[] } {
  const all = places.map((program, index): Stop => {
    const found = nearest(dong, venues[program.id] ?? []);
    return {
      program,
      number: index < shown ? index + 1 : null,
      venue: found?.venue ?? null,
      km: found?.km ?? null,
    };
  });
  return { stops: all.slice(0, shown), others: all.slice(shown) };
}

// '우리 동네에서 가까워요' 딱지를 붙이는 기준(직선거리 km)
export const NEAR_KM = 3;

// 번호가 붙은 곳 가운데 우리 동네에서 가장 가까운 한 곳. 그 곳이 limitKm 안일 때만 돌려준다
// (멀리 있는 곳에 '가까워요'라고 말하지 않으려는 것이다). 거리를 모르는 곳은 보지 않는다.
export function nearStop(stops: Stop[], limitKm: number): Stop | null {
  let best: Stop | null = null;
  for (const stop of stops) {
    if (stop.km === null) continue;
    if (best === null || stop.km < (best.km as number)) best = stop;
  }
  return best && (best.km as number) <= limitKm ? best : null;
}
