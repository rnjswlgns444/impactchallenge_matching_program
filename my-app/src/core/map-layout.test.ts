// 지도 그림의 자리 잡기. 실제 자료(동 경계, 기관 좌표)로 건물이 겹치지 않는지 본다.
import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import { mapData } from "@/data/map";

import { fitFrame, overlaps, project, ringsPath, spreadBoxes, type Box } from "./geo";
import {
  DOT,
  LABEL,
  MAP,
  MAP_STAR,
  framesOf,
  labelWidth,
  layoutPins,
  moreNoteBox,
  place,
  sideLabels,
  starNoteBox,
} from "./map-layout";

const inside = (box: Box, outer: Box) =>
  box.x >= outer.x - 1e-6 &&
  box.y >= outer.y - 1e-6 &&
  box.x + box.w <= outer.x + outer.w + 1e-6 &&
  box.y + box.h <= outer.y + outer.h + 1e-6;

describe("fitFrame · project", () => {
  const box = { x: 10, y: 20, w: 60, h: 30 };
  const frame = fitFrame(
    [
      [126.8, 37.3],
      [126.9, 37.35],
    ],
    box
  );

  it("범위의 모서리가 상자 안에 들어가고, 가운데에 놓인다", () => {
    const topLeft = project(frame, 126.8, 37.35);
    const bottomRight = project(frame, 126.9, 37.3);
    expect(topLeft.x).toBeGreaterThanOrEqual(box.x - 1e-6);
    expect(bottomRight.y).toBeLessThanOrEqual(box.y + box.h + 1e-6);
    expect(topLeft.x - box.x).toBeCloseTo(box.x + box.w - bottomRight.x, 6);
    expect(topLeft.y - box.y).toBeCloseTo(box.y + box.h - bottomRight.y, 6);
  });

  it("북쪽이 위, 동쪽이 오른쪽이다", () => {
    expect(project(frame, 126.85, 37.34).y).toBeLessThan(project(frame, 126.85, 37.31).y);
    expect(project(frame, 126.88, 37.32).x).toBeGreaterThan(project(frame, 126.82, 37.32).x);
  });

  it("경도는 위도보다 짧게 그린다(모양이 찌그러지지 않게)", () => {
    const east = project(frame, 126.81, 37.3).x - project(frame, 126.8, 37.3).x;
    const north = project(frame, 126.8, 37.3).y - project(frame, 126.8, 37.31).y;
    expect(east / north).toBeCloseTo(Math.cos((37.325 * Math.PI) / 180), 3);
  });

  it("경계 선은 닫힌 길이 된다", () => {
    const path = ringsPath(frame, [
      [
        [126.8, 37.3],
        [126.9, 37.3],
        [126.9, 37.35],
        [126.8, 37.3],
      ],
    ]);
    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    expect(path.match(/L/g)).toHaveLength(3);
  });
});

describe("spreadBoxes", () => {
  const canvas = { x: 0, y: 0, w: 100, h: 100 };

  it("떨어져 있는 네모는 그대로 둔다", () => {
    const boxes = [
      { x: 5, y: 5, w: 20, h: 20 },
      { x: 60, y: 60, w: 20, h: 20 },
    ];
    expect(spreadBoxes(boxes, canvas)).toEqual(boxes);
  });

  it("같은 자리의 네모 셋을 겹치지 않게 벌린다", () => {
    const same = { x: 40, y: 40, w: 30, h: 20 };
    const moved = spreadBoxes([same, same, same], canvas);
    for (let i = 0; i < 3; i += 1) {
      expect(inside(moved[i], canvas)).toBe(true);
      for (let j = i + 1; j < 3; j += 1) expect(overlaps(moved[i], moved[j])).toBe(false);
    }
  });

  it("그림 밖으로 나간 네모를 안으로 들이고, 막힌 자리를 비켜 간다", () => {
    const wall = { x: 0, y: 70, w: 30, h: 30 };
    const [moved] = spreadBoxes([{ x: -10, y: 80, w: 30, h: 20 }], canvas, [wall]);
    expect(inside(moved, canvas)).toBe(true);
    expect(overlaps(moved, wall)).toBe(false);
  });
});

describe("지도의 핀과 이름표 (실제 자료)", () => {
  const venues = [
    ...new Map(
      Object.values(appData.venues)
        .flat()
        .map((venue) => [`${venue.lon},${venue.lat}`, venue])
    ).values(),
  ];
  const { canvas, inset } = MAP;

  it("본토의 동은 지도 안에, 대부동의 큰 섬은 작은 상자 안에 그려진다", () => {
    const frames = framesOf(mapData.dongs);
    const within = (ring: [number, number][], where: Box) => {
      for (const [lon, lat] of ring) {
        const at = place(frames, { lon, lat });
        expect(at.x).toBeGreaterThanOrEqual(where.x);
        expect(at.x).toBeLessThanOrEqual(where.x + where.w);
        expect(at.y).toBeGreaterThanOrEqual(where.y);
        expect(at.y).toBeLessThanOrEqual(where.y + where.h);
      }
    };
    for (const dong of mapData.dongs.filter((one) => one.name !== "대부동")) dong.rings.forEach((ring) => within(ring, canvas));
    // 멀리 떨어진 작은 섬은 상자 밖으로 나가며, 화면이 잘라 낸다
    const daebu = mapData.dongs.find((one) => one.name === "대부동")!;
    within(
      daebu.rings.reduce((best, ring) => (ring.length > best.length ? ring : best)),
      inset
    );
  });

  it("본토의 동은 대부동 상자와 겹치지 않는다", () => {
    const frames = framesOf(mapData.dongs);
    for (const dong of mapData.dongs.filter((one) => one.name !== "대부동")) {
      for (const [lon, lat] of dong.rings.flat()) {
        const at = place(frames, { lon, lat });
        expect(at.x > inset.x && at.x < inset.x + inset.w && at.y > inset.y && at.y < inset.y + inset.h).toBe(false);
      }
    }
  });

  it.each([
    ["보통 모양", MAP],
    ["별의 뜻을 적는 모양", MAP_STAR],
  ])("%s: 기관 좌표 가운데 어느 셋을 골라도 핀이 겹치지 않고, 핀과 이름표가 그림 안에 있다", (_, shape) => {
    expect(venues.length).toBeGreaterThanOrEqual(19);
    const notes = [starNoteBox(shape), moreNoteBox(shape)];
    let checked = 0;
    let farthest = 0;
    for (let a = 0; a < venues.length; a += 1) {
      for (let b = a; b < venues.length; b += 1) {
        for (let c = b; c < venues.length; c += 1) {
          const { pins } = layoutPins(mapData.dongs, [venues[a], venues[b], venues[c]], shape);
          const labels = sideLabels(pins, [LABEL.max, LABEL.max, LABEL.max], shape, notes);
          for (let i = 0; i < 3; i += 1) {
            expect(inside(pins[i].box, shape.canvas)).toBe(true);
            expect(inside(labels[i], shape.canvas)).toBe(true);
            for (let j = i + 1; j < 3; j += 1) expect(overlaps(pins[i].box, pins[j].box)).toBe(false);
            farthest = Math.max(farthest, Math.hypot(pins[i].tip.x - pins[i].anchor.x, pins[i].tip.y - pins[i].anchor.y));
          }
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
    // 비켜 놓아도 실제 자리에서 핀 두 개 폭을 넘지 않는다
    expect(farthest).toBeLessThanOrEqual(2 * DOT.w);
  });

  it("안내 글 자리는 그림 안에 있고, 땅·대부동 상자·실제 기관 자리와 겹치지 않는다", () => {
    for (const shape of [MAP, MAP_STAR]) {
      const frames = framesOf(mapData.dongs, shape);
      const more = moreNoteBox(shape);
      const boxes = shape === MAP_STAR ? [starNoteBox(shape), more] : [more];
      const hit = (box: Box, at: { x: number; y: number }) =>
        at.x > box.x && at.x < box.x + box.w && at.y > box.y && at.y < box.y + box.h;
      for (const box of boxes) {
        expect(inside(box, shape.canvas)).toBe(true);
        expect(overlaps(box, shape.inset)).toBe(false);
        for (const dong of mapData.dongs.filter((one) => one.name !== "대부동")) {
          for (const [lon, lat] of dong.rings.flat()) expect(hit(box, place(frames, { lon, lat }))).toBe(false);
        }
        for (const venue of venues) expect(hit(box, place(frames, venue))).toBe(false);
      }
    }
  });

  it("하나뿐이면 핀의 끝이 실제 자리에 온다", () => {
    const { pins } = layoutPins(mapData.dongs, [venues[0]]);
    expect(pins[0].moved).toBe(false);
    expect(pins[0].tip).toEqual(pins[0].anchor);
  });

  it("이름표는 다른 핀을 덮지 않는 쪽에 붙는다", () => {
    const { pins } = layoutPins(mapData.dongs, [venues[0]]);
    const [label] = sideLabels(pins, [20]);
    expect(overlaps(label, pins[0].box)).toBe(false);
    expect(labelWidth("가")).toBeLessThan(labelWidth("가나다라마"));
    expect(labelWidth("가".repeat(40))).toBe(LABEL.max);
  });
});
