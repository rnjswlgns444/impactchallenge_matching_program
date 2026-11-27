// 지도 그림에서 무엇을 어디에 놓을지 정한다. 화면과 무관한 순수 함수다(그리기는 place-map.tsx).
//
// 그림의 크기는 가로 100으로 두고, 모든 자리를 이 눈금으로 센다. 화면은 이 값을 %로 바꿔 쓴다.
// 기관은 작은 핀으로 실제 자리에 꽂고, 핀 옆에 작은 이름표를 붙인다. 핀은 화면 폭을 따라 커지고(가로의 8%),
// 이름표의 글씨는 커지지 않는다. 그래서 이름표의 폭은 가장 좁은 휴대폰(화면 폭 320px, 지도 폭 288px)을 기준으로 잡는다.

import type { MapDong } from "@/data/types";

import { fitFrame, isDaebu, overlaps, project, spreadBoxes, type Box, type Frame, type Point } from "./geo";

// 지도 그림의 모양: 그림 크기, 본토(대부동을 뺀 안산)를 그리는 자리, 대부동을 줄여 그리는 작은 상자(왼쪽 아래)
export type MapShape = { canvas: Box; main: Box; inset: Box };
export const MAP: MapShape = {
  canvas: { x: 0, y: 0, w: 100, h: 84 },
  main: { x: 3, y: 4, w: 94, h: 60 },
  inset: { x: 2, y: 62, w: 22, h: 20 },
};
const INSET_PAD = 2.5;

// 핀의 크기(가로 100 기준). 아래쪽 가운데의 뾰족한 끝이 기관의 자리다
export const DOT = { w: 8, h: 10 };
// 이름표의 높이와 가장 넓은 폭, 한 글자의 폭(12px 글씨, 가장 좁은 화면 기준)
export const LABEL = { h: 6.5, max: 38, letter: 4.3, pad: 4 };

export type MapFrames = { main: Frame; inset: Frame };

export type MapPinSpot = {
  anchor: { x: number; y: number }; // 실제 자리
  box: Box; // 핀이 놓이는 자리
  tip: { x: number; y: number }; // 핀의 끝. 겹쳐서 비켜 놓았으면 실제 자리와 조금 다르다
  moved: boolean; // 비켜 놓았는지(화면이 실제 자리와 선으로 잇는다)
};

// 좌표를 그림 자리로. 대부동 쪽이면 작은 상자 안의 자리다
export function place(frames: MapFrames, point: Point): { x: number; y: number } {
  return project(isDaebu(point.lon) ? frames.inset : frames.main, point.lon, point.lat);
}

export function framesOf(dongs: MapDong[], shape: MapShape = MAP): MapFrames {
  const rings = dongs.flatMap((dong) => dong.rings);
  const islands = rings.filter((ring) => isDaebu(ring[0][0]));
  // 대부동은 가장 큰 섬에 맞춘다(멀리 떨어진 작은 섬까지 담으면 큰 섬이 점처럼 작아진다)
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
      h: shape.inset.h - 2 * INSET_PAD - 3.5, // 아래에 '대부동' 글자가 들어간다
    }),
  };
}

// 핀을 실제 자리에 꽂는다. 같은 자리에 겹칠 때만 가까운 빈자리로 조금 비킨다(추천 순서가 앞선 핀이 제자리에 남는다).
export function layoutPins(dongs: MapDong[], points: Point[], shape: MapShape = MAP): MapFrames & { pins: MapPinSpot[] } {
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

// 이름표의 폭(글자 수로 어림한다). 넘치는 이름은 화면이 말줄임으로 자른다
export const labelWidth = (name: string) => Math.min(name.length * LABEL.letter + LABEL.pad, LABEL.max);

// 핀 옆의 작은 이름표 자리. 오른쪽 → 왼쪽 → 아래 → 위 가운데, 그림 안에 들어가고 다른 핀·이름표와 겹치지 않는 첫 자리.
// 끝내 자리가 없으면 오른쪽에 두되 그림 안으로 들인다(이때는 다른 것과 겹칠 수 있다).
export function sideLabels(pins: MapPinSpot[], widths: number[], shape: MapShape = MAP): Box[] {
  const { canvas } = shape;
  const within = (box: Box) =>
    box.x >= canvas.x && box.y >= canvas.y && box.x + box.w <= canvas.x + canvas.w && box.y + box.h <= canvas.y + canvas.h;
  const placed: Box[] = [];
  return pins.map((pin, index) => {
    const w = widths[index];
    const middle = pin.box.y + (pin.box.h - LABEL.h) / 2;
    const center = pin.box.x + pin.box.w / 2 - w / 2;
    const options: Box[] = [
      { x: pin.box.x + pin.box.w + 0.5, y: middle, w, h: LABEL.h },
      { x: pin.box.x - w - 0.5, y: middle, w, h: LABEL.h },
      { x: center, y: pin.box.y + pin.box.h + 0.8, w, h: LABEL.h },
      { x: center, y: pin.box.y - LABEL.h - 0.5, w, h: LABEL.h },
    ];
    const others = pins.filter((_, other) => other !== index).map((other) => other.box);
    const free = options.find(
      (box) => within(box) && ![...others, ...placed].some((taken) => overlaps(box, taken, 0.3))
    );
    const chosen = free ?? {
      ...options[0],
      x: Math.max(canvas.x, Math.min(options[0].x, canvas.x + canvas.w - w)),
      y: Math.max(canvas.y, Math.min(options[0].y, canvas.y + canvas.h - LABEL.h)),
    };
    placed.push(chosen);
    return chosen;
  });
}
