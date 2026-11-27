// 지도 그림의 자리 잡기. 실제 자료(동 경계, 기관 좌표)로 건물이 겹치지 않는지 본다.
import { describe, expect, it } from "vitest";

import { appData } from "@/data";
import { mapData } from "@/data/map";

import { fitFrame, overlaps, project, ringsPath, spreadBoxes, type Box } from "./geo";
import { CANVAS, INSET, PIN_H, layoutMap, place } from "./map-layout";

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

describe("layoutMap (실제 자료)", () => {
  const venues = [
    ...new Map(
      Object.values(appData.venues)
        .flat()
        .map((venue) => [`${venue.lon},${venue.lat}`, venue])
    ).values(),
  ];

  it("본토의 동은 지도 안에, 대부동은 작은 상자 안에 그려진다", () => {
    const layout = layoutMap(mapData.dongs, []);
    for (const dong of mapData.dongs) {
      for (const [lon, lat] of dong.rings.flat()) {
        const at = place(layout, { lon, lat });
        const where = dong.name === "대부동" ? INSET : CANVAS;
        expect(at.x).toBeGreaterThanOrEqual(where.x);
        expect(at.x).toBeLessThanOrEqual(where.x + where.w);
        expect(at.y).toBeGreaterThanOrEqual(where.y);
        expect(at.y).toBeLessThanOrEqual(where.y + where.h);
      }
    }
  });

  it("본토의 동은 대부동 상자와 겹치지 않는다", () => {
    const layout = layoutMap(mapData.dongs, []);
    for (const dong of mapData.dongs.filter((one) => one.name !== "대부동")) {
      for (const [lon, lat] of dong.rings.flat()) {
        const at = place(layout, { lon, lat });
        expect(at.x > INSET.x && at.x < INSET.x + INSET.w && at.y > INSET.y && at.y < INSET.y + INSET.h).toBe(false);
      }
    }
  });

  it("기관 좌표 가운데 어느 셋을 골라도 건물이 겹치지 않고 그림 안에 선다", () => {
    expect(venues.length).toBeGreaterThanOrEqual(19);
    let checked = 0;
    for (let a = 0; a < venues.length; a += 1) {
      for (let b = a; b < venues.length; b += 1) {
        for (let c = b; c < venues.length; c += 1) {
          const { units } = layoutMap(mapData.dongs, [venues[a], venues[b], venues[c]]);
          for (let i = 0; i < 3; i += 1) {
            expect(inside(units[i].box, CANVAS)).toBe(true);
            expect(overlaps(units[i].box, INSET)).toBe(false);
            for (let j = i + 1; j < 3; j += 1) expect(overlaps(units[i].box, units[j].box)).toBe(false);
          }
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
  });

  it("하나뿐이고 자리가 넉넉하면 문 앞이 실제 위치에 온다", () => {
    const cityHall = venues.find((venue) => venue.name.includes("일자리센터")) ?? venues[0];
    const { units } = layoutMap(mapData.dongs, [cityHall]);
    expect(units[0].moved).toBe(false);
    expect(units[0].door.y).toBeCloseTo(units[0].box.y + PIN_H, 6);
  });
});
