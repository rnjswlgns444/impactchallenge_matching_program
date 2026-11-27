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

// ── 작은 핀으로 그리는 지도 (11/27, 방안 비교용) ──
// 건물 + 이름표 묶음은 지도를 가려서, 실제 자리에 작은 핀만 꽂는 모양을 따로 둔다.

// 지도 그림의 모양: 그림 크기, 본토를 그리는 자리, 대부동 상자
export type MapShape = { canvas: Box; main: Box; inset: Box };
// 핀만 꽂는 지도. 이름을 지도 밖에 두므로 여백이 작다
export const COMPACT: MapShape = {
  canvas: { x: 0, y: 0, w: 100, h: 84 },
  main: { x: 3, y: 4, w: 94, h: 60 },
  inset: { x: 2, y: 62, w: 22, h: 20 },
};
// 이름 상자를 땅 위아래의 빈자리에 두는 지도. 위아래 여백이 크다
export const CALLOUT: MapShape = {
  canvas: { x: 0, y: 0, w: 100, h: 110 },
  main: { x: 3, y: 20, w: 94, h: 60 },
  inset: { x: 2, y: 88, w: 22, h: 20 },
};

// 핀의 크기(가로 100 기준). 아래쪽 가운데의 뾰족한 끝이 기관의 자리다
export const DOT = { w: 8, h: 10 };

export type MapPinSpot = {
  anchor: { x: number; y: number }; // 실제 자리
  box: Box; // 핀이 놓이는 자리
  tip: { x: number; y: number }; // 핀의 끝. 겹쳐서 비켜 놓았으면 실제 자리와 조금 다르다
  moved: boolean;
};

export function framesOf(dongs: MapDong[], shape: MapShape): Pick<MapLayout, "main" | "inset"> {
  const rings = dongs.flatMap((dong) => dong.rings);
  const islands = rings.filter((ring) => isDaebu(ring[0][0]));
  const island = islands.reduce((best, ring) => (ring.length > best.length ? ring : best), islands[0] ?? []);
  return {
    main: fitFrame(
      rings.filter((ring) => !isDaebu(ring[0][0])).flat(),
      shape.main
    ),
    inset: fitFrame(island, {
      x: shape.inset.x + INSET_PAD,
      y: shape.inset.y + INSET_PAD,
      w: shape.inset.w - 2 * INSET_PAD,
      h: shape.inset.h - 2 * INSET_PAD - 3.5,
    }),
  };
}

// 핀을 실제 자리에 꽂는다. 같은 자리에 겹칠 때만 가까운 빈자리로 조금 비킨다(추천 순서가 앞선 핀이 제자리에 남는다).
export function layoutPins(
  dongs: MapDong[],
  points: Point[],
  shape: MapShape
): Pick<MapLayout, "main" | "inset"> & { pins: MapPinSpot[] } {
  const frames = framesOf(dongs, shape);
  const anchors = points.map((point) => place(frames, point));
  const wanted = anchors.map((anchor): Box => ({ x: anchor.x - DOT.w / 2, y: anchor.y - DOT.h, w: DOT.w, h: DOT.h }));
  const boxes = spreadBoxes(wanted, shape.canvas, [], 0.4, 1);
  const pins = boxes.map((box, index): MapPinSpot => {
    const tip = { x: box.x + box.w / 2, y: box.y + box.h };
    const anchor = anchors[index];
    return { anchor, box, tip, moved: Math.hypot(tip.x - anchor.x, tip.y - anchor.y) > 0.8 };
  });
  return { ...frames, pins };
}

// 이름 상자의 크기(가장 좁은 화면 기준)
export const CALLOUT_BOX = { w: 31, h: 16 };

// 이름 상자를 땅 위아래의 빈자리(위 3칸, 아래 2칸. 아래 왼쪽은 대부동 상자)에 나눠 놓는다.
// 핀에서 가장 덜 먼 짝을 고른다. 핀이 칸보다 많으면 남는 핀은 상자가 없다(null).
export function calloutBoxes(pins: MapPinSpot[], shape: MapShape): (Box | null)[] {
  const { canvas } = shape;
  const xs = [1, 34.5, 68];
  const slots: Box[] = [
    ...xs.map((x) => ({ x, y: canvas.y + 1.5, ...CALLOUT_BOX })),
    ...xs.slice(1).map((x) => ({ x, y: canvas.y + canvas.h - CALLOUT_BOX.h - 1.5, ...CALLOUT_BOX })),
  ];
  const count = Math.min(pins.length, slots.length);
  let best: number[] = [];
  let bestCost = Infinity;
  const pick = (index: number, used: number[], cost: number) => {
    if (cost >= bestCost) return;
    if (index === count) {
      bestCost = cost;
      best = used;
      return;
    }
    for (let slot = 0; slot < slots.length; slot += 1) {
      if (used.includes(slot)) continue;
      const center = { x: slots[slot].x + slots[slot].w / 2, y: slots[slot].y + slots[slot].h / 2 };
      // 선이 서로 엇갈리지 않게 가로로 먼 칸에 벌을 더 준다
      const move = Math.abs(center.y - pins[index].tip.y) + 2 * Math.abs(center.x - pins[index].tip.x);
      pick(index + 1, [...used, slot], cost + move);
    }
  };
  pick(0, [], 0);
  return pins.map((_, index) => (index < count ? slots[best[index]] : null));
}

// 핀 옆의 작은 이름표 자리. 오른쪽 → 왼쪽 → 아래 → 위 가운데, 그림 안에 들어가고 다른 핀·이름표와 겹치지 않는 첫 자리.
// widths는 이름표마다의 폭이다. 끝내 자리가 없으면 오른쪽(그림 안으로 들인 자리)에 둔다.
export function sideLabels(pins: MapPinSpot[], widths: number[], shape: MapShape, height = 6.5): Box[] {
  const { canvas } = shape;
  const within = (box: Box) =>
    box.x >= canvas.x && box.y >= canvas.y && box.x + box.w <= canvas.x + canvas.w && box.y + box.h <= canvas.y + canvas.h;
  const placed: Box[] = [];
  return pins.map((pin, index) => {
    const w = widths[index];
    const middle = pin.box.y + (pin.box.h - height) / 2;
    const options: Box[] = [
      { x: pin.box.x + pin.box.w + 0.5, y: middle, w, h: height },
      { x: pin.box.x - w - 0.5, y: middle, w, h: height },
      { x: pin.box.x + pin.box.w / 2 - w / 2, y: pin.box.y + pin.box.h + 0.8, w, h: height },
      { x: pin.box.x + pin.box.w / 2 - w / 2, y: pin.box.y - height - 0.5, w, h: height },
    ];
    const others = pins.filter((_, other) => other !== index).map((other) => other.box);
    const free = options.find(
      (box) => within(box) && ![...others, ...placed].some((taken) => overlaps(box, taken, 0.3))
    );
    const chosen = free ?? {
      ...options[0],
      x: Math.min(options[0].x, canvas.x + canvas.w - w),
    };
    placed.push(chosen);
    return chosen;
  });
}
