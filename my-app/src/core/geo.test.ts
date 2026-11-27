// 기관 그림에 쓰는 계산. 자료는 이 파일의 견본을 쓴다.
import { describe, expect, it } from "vitest";

import type { Program, Venue } from "@/data/types";

import { distanceKm, nearStop, nearest, routeStops } from "./geo";

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

describe("nearStop", () => {
  const stop = (id: string, km: number | null) => ({ program: program(id), number: 1, venue: null, km });

  it("가장 가까운 한 곳을 고른다. 거리를 모르는 곳은 보지 않는다", () => {
    expect(nearStop([stop("A", 2.5), stop("B", null), stop("C", 1.2)], 3)?.program.id).toBe("C");
  });

  it("가장 가까운 곳도 기준보다 멀면 고르지 않는다", () => {
    expect(nearStop([stop("A", 3.1), stop("B", 8)], 3)).toBeNull();
  });

  it("기준과 꼭 같은 거리는 고른다. 거리가 같으면 앞의 곳이다", () => {
    expect(nearStop([stop("A", 3), stop("B", 3)], 3)?.program.id).toBe("A");
  });

  it("거리를 아는 곳이 없으면 null이다(동을 고르지 않았거나 좌표가 없다)", () => {
    expect(nearStop([stop("A", null)], 3)).toBeNull();
    expect(nearStop([], 3)).toBeNull();
  });
});
