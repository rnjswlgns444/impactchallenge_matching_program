// 기관 그림에 쓰는 계산: 직선거리, 그림에 놓을 곳 나누기, 우리 동네에서 가까운 곳 고르기.
// 화면과 무관한 순수 함수만 둔다. 파이썬 앱에는 없는 기능이라 대조 검사는 없고, 이 파일의 테스트가 지킨다.
//
// 여기서는 후보를 거르거나 순서를 바꾸지 않는다. core/places.ts가 정한 순서 그대로 받아 그림에 놓을 뿐이다.
// 거리는 동 행정복지센터 한 점에서 잰 직선거리다. 실제 가는 길과 다르므로 화면에 숫자로 보여 주지 않고,
// '가까워요' 딱지를 붙일 곳을 고르는 데만 쓴다.

import type { Program, Ring, Venue } from "@/data/types";

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

// ── 지도 그림 ──
// 안산의 동을 색칠한 그림 지도 위에 건물을 세우는 계산이다. 지도 서비스가 아니라 도형을 그리는 그림이라
// 길 안내만큼 정확하지 않다. '안산의 어느 쪽에 있는지'를 보여 주는 것이 목적이다.

// 그림 위의 네모. x·y는 왼쪽 위다
export type Box = { x: number; y: number; w: number; h: number };

// 좌표를 그림 자리로 바꾸는 틀
export type Frame = {
  minLon: number;
  maxLat: number;
  scale: number; // 위도 1도가 그림에서 차지하는 길이
  squeeze: number; // 경도를 줄이는 비율(위도에 따라 다르다)
  left: number; // 범위의 왼쪽 위가 놓이는 자리
  top: number;
};

// 이 경도보다 서쪽은 대부동(섬)이다. 본토 지도에 함께 그리면 본토가 너무 작아져서 작은 상자에 따로 그린다
export const DAEBU_LON = 126.69;
export const isDaebu = (lon: number) => lon < DAEBU_LON;

// 점들([경도, 위도])이 box 안에 꼭 맞게, 가운데에 오도록 틀을 만든다.
// 경도 1도는 위도 1도보다 짧으므로(안산에서 약 0.8배) 그만큼 가로를 줄여 모양이 찌그러지지 않게 한다.
export function fitFrame(points: [number, number][], box: Box): Frame {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of points) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const squeeze = Math.cos(rad((minLat + maxLat) / 2));
  const spanX = Math.max((maxLon - minLon) * squeeze, 1e-9);
  const spanY = Math.max(maxLat - minLat, 1e-9);
  const scale = Math.min(box.w / spanX, box.h / spanY);
  return {
    minLon,
    maxLat,
    scale,
    squeeze,
    left: box.x + (box.w - spanX * scale) / 2,
    top: box.y + (box.h - spanY * scale) / 2,
  };
}

// 위도·경도를 그림 자리로 바꾼다(왼쪽 위가 0,0)
export function project(frame: Frame, lon: number, lat: number): { x: number; y: number } {
  return {
    x: frame.left + (lon - frame.minLon) * frame.squeeze * frame.scale,
    y: frame.top + (frame.maxLat - lat) * frame.scale,
  };
}

// 경계 선들을 SVG 길(path)로 만든다
export function ringsPath(frame: Frame, rings: Ring[]): string {
  return rings
    .map(
      (ring) =>
        ring
          .map(([lon, lat], index) => {
            const { x, y } = project(frame, lon, lat);
            return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join("") + "Z"
    )
    .join("");
}

export const overlaps = (a: Box, b: Box, gap = 0) =>
  a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

// 가까이 붙은 네모(건물 + 이름표)가 서로 겹치지 않게 자리를 잡는다.
// - boxes는 바라는 자리(실제 위치에 맞춘 자리)이고, 앞에 있는 것부터 차례로 놓는다(추천 순서가 앞선 곳이 제자리에 가깝다).
// - 바라는 자리가 막혀 있으면 거기서 가장 가까운 빈자리를 찾는다(step 간격으로 둘레를 훑는다).
// - blocked는 비켜 가야 하는 자리(대부동 상자)다. 그림(canvas) 밖으로도 나가지 않는다.
// 빈자리가 끝내 없으면 그림 안으로만 들여 둔다. 실제 위치에서 어긋난 만큼은 화면이 선으로 이어 보여 준다.
export function spreadBoxes(boxes: Box[], canvas: Box, blocked: Box[] = [], gap = 1, step = 2): Box[] {
  const reach = Math.ceil(Math.max(canvas.w, canvas.h) / step);
  const offsets: [number, number][] = [];
  for (let dx = -reach; dx <= reach; dx += 1) {
    for (let dy = -reach; dy <= reach; dy += 1) offsets.push([dx * step, dy * step]);
  }
  // 가까운 자리부터. 거리가 같으면 늘 같은 순서가 되게 가로·세로 값으로 한 번 더 가른다
  offsets.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]) || a[1] - b[1] || a[0] - b[0]);

  const within = (box: Box) =>
    box.x >= canvas.x && box.y >= canvas.y && box.x + box.w <= canvas.x + canvas.w && box.y + box.h <= canvas.y + canvas.h;
  const placed: Box[] = [];
  for (const wanted of boxes) {
    // 그림 밖에서 시작하면 먼저 안으로 들인다
    const start = {
      ...wanted,
      x: Math.min(Math.max(wanted.x, canvas.x), canvas.x + canvas.w - wanted.w),
      y: Math.min(Math.max(wanted.y, canvas.y), canvas.y + canvas.h - wanted.h),
    };
    let found = start;
    for (const [dx, dy] of offsets) {
      const candidate = { ...start, x: start.x + dx, y: start.y + dy };
      if (!within(candidate)) continue;
      if (blocked.some((wall) => overlaps(candidate, wall, gap))) continue;
      if (placed.some((other) => overlaps(candidate, other, gap))) continue;
      found = candidate;
      break;
    }
    placed.push(found);
  }
  return placed;
}
