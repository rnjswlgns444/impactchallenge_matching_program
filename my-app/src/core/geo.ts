// 지도 그림에 쓰는 계산: 직선거리, 위도·경도를 그림 좌표로 바꾸기, 그림에 놓을 곳 고르기.
// 화면과 무관한 순수 함수만 둔다. 파이썬 앱에는 없는 기능이라 대조 검사는 없고, 이 파일의 테스트가 지킨다.
//
// 여기서는 후보를 거르거나 순서를 바꾸지 않는다. core/places.ts가 정한 순서 그대로 받아 그림에 놓을 뿐이다.
// 거리는 동 행정복지센터 한 점에서 잰 직선거리다. 실제 가는 길과 다르므로 화면은 '약'을 붙여 말한다.

import type { Dong, Program, Venue } from "@/data/types";

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
  number: number | null; // 길 위의 번호(1부터). 작은 점으로만 찍는 곳은 null
  venue: Venue | null; // 지도에 찍을 자리. 좌표가 없는 곳(전화·온라인 창구)은 null
  km: number | null; // 우리 동네에서의 직선거리. 동을 고르지 않았거나 좌표가 없으면 null
};

// 화면에 놓을 곳(places, 이미 걸러지고 순서가 정해진 것)을 그림용으로 나눈다.
// 앞의 shown곳은 번호를 붙여 길로 잇고, 나머지는 번호 없이 작은 점으로 찍는다.
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

// 지도 그림의 틀: 그릴 범위와 그림 크기. 가로를 100으로 두고 세로는 범위의 비율을 따른다
export type Frame = {
  minLon: number;
  maxLat: number;
  scale: number; // 위도 1도가 그림에서 차지하는 길이
  squeeze: number; // 경도를 줄이는 비율(위도에 따라 다르다)
  pad: number; // 둘레 여백
  width: number;
  height: number;
};

// 주어진 점들([경도, 위도])이 모두 들어가는 틀을 만든다. pad는 둘레 여백(가로 100 기준)이다.
// 경도 1도는 위도 1도보다 짧으므로(안산에서 약 0.8배) 그만큼 가로를 줄여 모양이 찌그러지지 않게 한다.
export function frameOf(points: [number, number][], pad = 4): Frame {
  const lons = points.map(([lon]) => lon);
  const lats = points.map(([, lat]) => lat);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const squeeze = Math.cos(rad((minLat + maxLat) / 2));
  const spanX = Math.max((maxLon - minLon) * squeeze, 1e-9);
  const spanY = Math.max(maxLat - minLat, 1e-9);
  const width = 100;
  const scale = (width - 2 * pad) / spanX;
  return { minLon, maxLat, scale, squeeze, pad, width, height: spanY * scale + 2 * pad };
}

// 주어진 점들이 넉넉히 들어가는 범위를 잡는다. 지도 그림을 '우리 동네와 추천 기관이 있는 곳'만큼만 그리려는 것이다.
// - 둘레에 margin(범위의 비율)만큼 여백을 둔다.
// - 너무 좁으면 minKm까지 넓힌다(기관이 한 곳뿐이어도 동네 모양이 보이게).
// - 가로:세로가 ratio가 되도록 모자란 쪽을 넓힌다(그림의 모양이 화면마다 같게).
// 돌려주는 것은 범위의 왼쪽 아래와 오른쪽 위다. frameOf(…, 0)에 넘겨 쓴다.
export function viewBox(points: Point[], ratio = 4 / 3, margin = 0.22, minKm = 4): [number, number][] {
  const lats = points.map((point) => point.lat);
  const lons = points.map((point) => point.lon);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const midLon = (Math.min(...lons) + Math.max(...lons)) / 2;
  const kmPerLat = distanceKm({ lat: midLat, lon: midLon }, { lat: midLat + 1, lon: midLon });
  const kmPerLon = distanceKm({ lat: midLat, lon: midLon }, { lat: midLat, lon: midLon + 1 });
  // 범위를 km로 재고, 여백과 최소 크기와 비율을 맞춘다
  let heightKm = Math.max((Math.max(...lats) - Math.min(...lats)) * kmPerLat * (1 + 2 * margin), minKm);
  let widthKm = Math.max((Math.max(...lons) - Math.min(...lons)) * kmPerLon * (1 + 2 * margin), minKm * ratio);
  if (widthKm / heightKm < ratio) widthKm = heightKm * ratio;
  else heightKm = widthKm / ratio;
  const halfLat = heightKm / kmPerLat / 2;
  const halfLon = widthKm / kmPerLon / 2;
  return [
    [midLon - halfLon, midLat - halfLat],
    [midLon + halfLon, midLat + halfLat],
  ];
}

// 위도·경도를 그림 좌표로 바꾼다(왼쪽 위가 0,0)
export function project(frame: Frame, lon: number, lat: number): { x: number; y: number } {
  return {
    x: frame.pad + (lon - frame.minLon) * frame.squeeze * frame.scale,
    y: frame.pad + (frame.maxLat - lat) * frame.scale,
  };
}

// 동의 경계를 SVG 길(path)로 만든다
export function dongPath(frame: Frame, dong: Dong): string {
  return dong.rings
    .map(
      (ring) =>
        ring
          .map(([lon, lat], index) => {
            const { x, y } = project(frame, lon, lat);
            return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
          })
          .join("") + "Z"
    )
    .join("");
}

// 가까이 붙은 핀이 겹치지 않게 조금씩 밀어낸다. gap은 핀 사이에 두려는 최소 거리(그림 좌표)다.
// 실제 위치에서 조금 어긋나지만, 지도는 정확한 길 안내가 아니라 '어느 쪽에 있는지'를 보여 주는 그림이다.
export function spread<T extends { x: number; y: number }>(pins: T[], gap: number, frame: Frame): T[] {
  const moved = pins.map((pin) => ({ ...pin }));
  for (let round = 0; round < 12; round += 1) {
    let touched = false;
    for (let i = 0; i < moved.length; i += 1) {
      for (let j = i + 1; j < moved.length; j += 1) {
        let dx = moved[j].x - moved[i].x;
        let dy = moved[j].y - moved[i].y;
        let distance = Math.hypot(dx, dy);
        if (distance >= gap) continue;
        if (distance < 1e-6) {
          dx = 1;
          dy = 0;
          distance = 1;
        }
        const push = (gap - distance) / 2;
        moved[i].x -= (dx / distance) * push;
        moved[i].y -= (dy / distance) * push;
        moved[j].x += (dx / distance) * push;
        moved[j].y += (dy / distance) * push;
        touched = true;
      }
    }
    // 그림 밖으로 나가지 않게 한다
    for (const pin of moved) {
      pin.x = Math.min(Math.max(pin.x, gap / 2), frame.width - gap / 2);
      pin.y = Math.min(Math.max(pin.y, gap / 2), frame.height - gap / 2);
    }
    if (!touched) break;
  }
  return moved;
}
