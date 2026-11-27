// 지도 그림에 쓰는 계산. 자료는 이 파일의 견본을 쓴다.
import { describe, expect, it } from "vitest";

import type { Dong, Program, Venue } from "@/data/types";

import { distanceKm, dongPath, frameOf, nearest, project, routeStops, spread, viewBox } from "./geo";

const cityHall = { lat: 37.3219, lon: 126.8309 }; // 안산시청 언저리
const venue = (name: string, lat: number, lon: number): Venue => ({ name, address: "", lat, lon });
const program = (id: string): Program => ({ id });

describe("distanceKm", () => {
  it("같은 점은 0이다", () => {
    expect(distanceKm(cityHall, cityHall)).toBe(0);
  });

  it("위도 0.01도는 약 1.11km다", () => {
    expect(distanceKm(cityHall, { lat: cityHall.lat + 0.01, lon: cityHall.lon })).toBeCloseTo(1.112, 2);
  });

  it("안산에서 경도 0.01도는 약 0.88km다(위도보다 짧다)", () => {
    expect(distanceKm(cityHall, { lat: cityHall.lat, lon: cityHall.lon + 0.01 })).toBeCloseTo(0.884, 2);
  });

  it("어느 쪽에서 재도 같다", () => {
    const other = { lat: 37.29, lon: 126.87 };
    expect(distanceKm(cityHall, other)).toBeCloseTo(distanceKm(other, cityHall), 10);
  });
});

describe("nearest", () => {
  const far = venue("먼 곳", 37.4, 126.9);
  const near = venue("가까운 곳", 37.322, 126.831);

  it("곳이 여럿이면 가장 가까운 곳과 그 거리를 돌려준다", () => {
    const found = nearest(cityHall, [far, near]);
    expect(found?.venue.name).toBe("가까운 곳");
    expect(found?.km).toBeLessThan(0.1);
  });

  it("기준점이 없으면 첫 곳이고 거리는 모른다", () => {
    expect(nearest(null, [far, near])).toEqual({ venue: far, km: null });
  });

  it("곳이 없으면 null이다", () => {
    expect(nearest(cityHall, [])).toBeNull();
  });
});

describe("routeStops", () => {
  const places = ["A", "B", "C", "D", "E"].map(program);
  const venues = {
    A: [venue("가", 37.33, 126.83)],
    C: [venue("다1", 37.4, 126.9), venue("다2", 37.32, 126.83)],
    D: [venue("라", 37.3, 126.85)],
  };

  it("앞의 3곳에 번호를 붙이고 나머지는 번호 없이 둔다. 순서는 받은 그대로다", () => {
    const { stops, others } = routeStops(places, venues, cityHall, 3);
    expect(stops.map((stop) => [stop.program.id, stop.number])).toEqual([
      ["A", 1],
      ["B", 2],
      ["C", 3],
    ]);
    expect(others.map((stop) => [stop.program.id, stop.number])).toEqual([
      ["D", null],
      ["E", null],
    ]);
  });

  it("좌표가 없는 곳은 자리와 거리가 없다", () => {
    const { stops } = routeStops(places, venues, cityHall, 3);
    expect(stops[1]).toMatchObject({ venue: null, km: null });
    expect(stops[2].venue?.name).toBe("다2"); // 가까운 쪽
  });

  it("동을 고르지 않았으면 거리 없이 첫 곳을 찍는다", () => {
    const { stops } = routeStops(places, venues, null, 3);
    expect(stops[0]).toMatchObject({ km: null });
    expect(stops[2].venue?.name).toBe("다1");
  });

  it("곳이 3곳보다 적으면 있는 만큼만 돌려준다", () => {
    expect(routeStops(places.slice(0, 2), venues, cityHall, 3)).toMatchObject({ stops: [{}, {}], others: [] });
  });
});

describe("지도 좌표", () => {
  const corners: [number, number][] = [
    [126.8, 37.3],
    [126.9, 37.3],
    [126.9, 37.35],
    [126.8, 37.35],
  ];
  const frame = frameOf(corners, 4);

  it("가로는 100이고, 범위의 네 귀퉁이가 여백 안쪽에 놓인다", () => {
    expect(frame.width).toBe(100);
    expect(project(frame, 126.8, 37.35)).toEqual({ x: 4, y: 4 }); // 왼쪽 위
    const bottomRight = project(frame, 126.9, 37.3);
    expect(bottomRight.x).toBeCloseTo(96, 6);
    expect(bottomRight.y).toBeCloseTo(frame.height - 4, 6);
  });

  it("경도를 줄여 모양이 찌그러지지 않는다(같은 km는 같은 길이)", () => {
    const origin = project(frame, 126.8, 37.3);
    const east = project(frame, 126.81, 37.3); // 동쪽으로 0.01도
    const north = project(frame, 126.8, 37.31); // 북쪽으로 0.01도
    const kmEast = distanceKm({ lat: 37.3, lon: 126.8 }, { lat: 37.3, lon: 126.81 });
    const kmNorth = distanceKm({ lat: 37.3, lon: 126.8 }, { lat: 37.31, lon: 126.8 });
    expect((east.x - origin.x) / kmEast).toBeCloseTo((origin.y - north.y) / kmNorth, 1);
  });

  it("동의 경계를 닫힌 길로 만든다", () => {
    const dong: Dong = { name: "가동", gu: "상록구", lat: 37.32, lon: 126.85, rings: [[...corners, corners[0]]] };
    const d = dongPath(frame, dong);
    expect(d.startsWith("M4.00 ")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect(d.match(/L/g)).toHaveLength(4);
  });
});

describe("viewBox", () => {
  const kmWide = (box: [number, number][]) =>
    distanceKm({ lat: box[0][1], lon: box[0][0] }, { lat: box[0][1], lon: box[1][0] });
  const kmTall = (box: [number, number][]) =>
    distanceKm({ lat: box[0][1], lon: box[0][0] }, { lat: box[1][1], lon: box[0][0] });

  it("점이 하나뿐이어도 최소 크기(세로 4km, 가로는 4:3)로 잡는다", () => {
    const box = viewBox([cityHall]);
    expect(kmTall(box)).toBeCloseTo(4, 1);
    expect(kmWide(box)).toBeCloseTo(4 * (4 / 3), 1);
    // 그 점이 한가운데에 있다
    expect((box[0][0] + box[1][0]) / 2).toBeCloseTo(cityHall.lon, 6);
    expect((box[0][1] + box[1][1]) / 2).toBeCloseTo(cityHall.lat, 6);
  });

  it("모든 점이 여백 안쪽에 들어가고, 가로:세로가 4:3이다", () => {
    const points = [cityHall, { lat: 37.28, lon: 126.74 }, { lat: 37.36, lon: 126.9 }];
    const box = viewBox(points);
    for (const point of points) {
      expect(point.lon).toBeGreaterThan(box[0][0]);
      expect(point.lon).toBeLessThan(box[1][0]);
      expect(point.lat).toBeGreaterThan(box[0][1]);
      expect(point.lat).toBeLessThan(box[1][1]);
    }
    expect(kmWide(box) / kmTall(box)).toBeCloseTo(4 / 3, 2);
  });

  it("세로로 긴 범위는 가로를 넓혀 비율을 맞춘다", () => {
    const box = viewBox([
      { lat: 37.25, lon: 126.83 },
      { lat: 37.37, lon: 126.83 },
    ]);
    expect(kmWide(box) / kmTall(box)).toBeCloseTo(4 / 3, 2);
  });
});

describe("spread", () => {
  const frame = frameOf(
    [
      [126.8, 37.3],
      [126.9, 37.38],
    ],
    4
  );

  it("겹친 핀을 gap만큼 떼어 놓고, 떨어져 있는 핀은 그대로 둔다", () => {
    const pins = [
      { id: "a", x: 50, y: 50 },
      { id: "b", x: 51, y: 50 },
      { id: "c", x: 80, y: 20 },
    ];
    const moved = spread(pins, 12, frame);
    expect(Math.hypot(moved[1].x - moved[0].x, moved[1].y - moved[0].y)).toBeGreaterThanOrEqual(11.99);
    expect(moved[2]).toEqual(pins[2]);
    expect(pins[0]).toEqual({ id: "a", x: 50, y: 50 }); // 원래 목록은 바꾸지 않는다
  });

  it("똑같은 자리의 핀도 떼어 놓고, 그림 밖으로 내보내지 않는다", () => {
    const moved = spread(
      [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
      ],
      12,
      frame
    );
    expect(Math.hypot(moved[1].x - moved[0].x, moved[1].y - moved[0].y)).toBeGreaterThan(5);
    for (const pin of moved) {
      expect(pin.x).toBeGreaterThanOrEqual(6);
      expect(pin.y).toBeGreaterThanOrEqual(6);
    }
  });
});
