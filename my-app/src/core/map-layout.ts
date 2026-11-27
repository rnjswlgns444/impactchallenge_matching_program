// 지도 그림에서 무엇을 어디에 놓을지 정한다. 화면과 무관한 순수 함수다(그리기는 ansan-map.tsx).
//
// 그림의 크기는 가로 100으로 두고, 모든 자리를 이 눈금으로 센다. 화면은 이 값을 %로 바꿔 쓴다.
// 건물 그림은 화면 폭을 따라 커지고(가로의 14%), 이름표의 글씨는 커지지 않는다. 그래서 이름표가 차지하는 자리는
// 가장 좁은 휴대폰(화면 폭 320px, 지도 폭 288px)을 기준으로 넉넉히 잡아 둔다. 넓은 화면에서는 남을 뿐 겹치지 않는다.

import type { MapDong } from "@/data/types";

import { fitFrame, isDaebu, overlaps, project, spreadBoxes, type Box, type Frame, type Point } from "./geo";

export const CANVAS: Box = { x: 0, y: 0, w: 100, h: 107 };
// 건물 + 이름표가 설 수 있는 자리. 위쪽은 번호와 '가까워요' 딱지가 잘리지 않게 조금 비운다
const ROOM: Box = { x: 1, y: 3, w: 98, h: 103 };
// 본토(대부동을 뺀 안산)를 그리는 자리. 아래쪽은 대부동 상자와 밀려난 건물이 쓴다
const MAIN: Box = { x: 3, y: 11, w: 94, h: 62 };
// 대부동을 줄여 그리는 작은 상자(왼쪽 아래)
export const INSET: Box = { x: 2, y: 85, w: 22, h: 20 };
const INSET_PAD = 2.5;

// 건물 그림의 크기(가로 100 기준). 화면에서도 같은 비율로 그린다
export const PIN = { w: 14, roof: 5, wall: 11 };
export const PIN_H = PIN.roof + PIN.wall;
// 건물 + 이름표 한 묶음이 차지하는 자리(가장 좁은 화면 기준). 문 앞(실제 위치에 맞추는 점)은 건물의 아래쪽 가운데다
export const UNIT = { w: 32, h: PIN_H + 17 };

export type MapUnit = {
  anchor: { x: number; y: number }; // 실제 위치
  box: Box; // 건물 + 이름표가 놓이는 자리
  door: { x: number; y: number }; // 건물의 문 앞. 실제 위치와 떨어져 있으면 선으로 잇는다
  moved: boolean; // 겹치지 않게 밀려났는지
};

export type MapLayout = {
  main: Frame;
  inset: Frame;
  units: MapUnit[];
};

// 좌표를 그림 자리로. 대부동 쪽이면 작은 상자 안의 자리다
export function place(layout: Pick<MapLayout, "main" | "inset">, point: Point): { x: number; y: number } {
  return project(isDaebu(point.lon) ? layout.inset : layout.main, point.lon, point.lat);
}

// 가까운 빈자리 찾기로 놓되, 끝내 겹치는 것이 남으면(먼저 놓은 것이 한가운데를 막았을 때) 미리 정한 칸에 나눠 놓는다.
// 칸은 가로 3 × 세로 3이고 대부동 상자와 겹치는 칸은 뺀다. 바라는 자리에서 가장 덜 움직이는 짝을 고른다.
function settle(wanted: Box[]): Box[] {
  const spread = spreadBoxes(wanted, ROOM, [INSET]);
  const clash = spread.some(
    (box, i) => overlaps(box, INSET) || spread.some((other, j) => j > i && overlaps(box, other))
  );
  if (!clash) return spread;

  const slots: Box[] = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const slot = { x: ROOM.x + column * (UNIT.w + 1), y: ROOM.y + row * (UNIT.h + 1), w: UNIT.w, h: UNIT.h };
      if (!overlaps(slot, INSET, 1)) slots.push(slot);
    }
  }
  let best: Box[] = spread;
  let bestCost = Infinity;
  const pick = (index: number, used: number[], cost: number) => {
    if (cost >= bestCost) return;
    if (index === wanted.length) {
      bestCost = cost;
      best = used.map((slot) => slots[slot]);
      return;
    }
    for (let slot = 0; slot < slots.length; slot += 1) {
      if (used.includes(slot)) continue;
      const move = Math.hypot(slots[slot].x - wanted[index].x, slots[slot].y - wanted[index].y);
      pick(index + 1, [...used, slot], cost + move);
    }
  };
  if (wanted.length <= slots.length) pick(0, [], 0);
  return best;
}

// 지도의 틀을 잡고, 건물을 세울 곳(points, 추천 순서)을 겹치지 않게 놓는다.
export function layoutMap(dongs: MapDong[], points: Point[]): MapLayout {
  const rings = dongs.flatMap((dong) => dong.rings);
  const islands = rings.filter((ring) => isDaebu(ring[0][0]));
  // 대부동은 가장 큰 섬에 맞춘다(멀리 떨어진 작은 섬까지 담으면 큰 섬이 점처럼 작아진다)
  const island = islands.reduce((best, ring) => (ring.length > best.length ? ring : best), islands[0] ?? []);
  const frames = {
    main: fitFrame(
      rings.filter((ring) => !isDaebu(ring[0][0])).flat(),
      MAIN
    ),
    inset: fitFrame(island, {
      x: INSET.x + INSET_PAD,
      y: INSET.y + INSET_PAD,
      w: INSET.w - 2 * INSET_PAD,
      h: INSET.h - 2 * INSET_PAD - 3.5, // 아래에 '대부동' 글자가 들어간다
    }),
  };
  const anchors = points.map((point) => place(frames, point));
  // 처음에는 문 앞이 실제 위치에 오게 놓는다
  const first = anchors.map((anchor): Box => ({ x: anchor.x - UNIT.w / 2, y: anchor.y - PIN_H, w: UNIT.w, h: UNIT.h }));
  const boxes = settle(first);
  const units = boxes.map((box, index): MapUnit => {
    const door = { x: box.x + box.w / 2, y: box.y + PIN_H };
    const anchor = anchors[index];
    return { anchor, box, door, moved: Math.hypot(door.x - anchor.x, door.y - anchor.y) > 1.5 };
  });
  return { ...frames, units };
}
