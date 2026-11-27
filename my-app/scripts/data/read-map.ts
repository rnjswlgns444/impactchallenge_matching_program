// 지도 그림에 쓸 도형을 읽는다: 동의 경계·색·이름 자리, 구의 경계.
// 원본은 동료가 만든 파일이다(app/anti_map/. 경계의 출처는 행정안전부 원자료를 한국에스리가 공개한 것).
// 지도 서비스가 아니라 도형을 색칠해 그리는 그림 지도라, 화면이 바깥으로 보내는 것이 없다.

import { readFileSync } from "node:fs";

import type { MapData, MapDong, Ring } from "../../src/data/types";

export type MapSources = {
  areasPath: string; // anti_map/neighborhood_areas.json (동의 경계)
  stylesPath: string; // anti_map/dong_styles.json (동의 색과 이름 자리)
  districtsPath: string; // anti_map/districts.geojson (구의 경계)
};

type Dict = Record<string, unknown>;
const isDict = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// 안산을 넉넉히 감싸는 범위(read.ts의 것과 같다)
const ANSAN = { minLat: 37.0, maxLat: 37.45, minLon: 126.3, maxLon: 127.0 };
const inAnsan = (lon: number, lat: number) =>
  lon >= ANSAN.minLon && lon <= ANSAN.maxLon && lat >= ANSAN.minLat && lat <= ANSAN.maxLat;

const round4 = (value: number) => Math.round(value * 1e4) / 1e4; // 소수 넷째 자리(약 10m)

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch {
    return null;
  }
}

// GeoJSON 도형에서 바깥 선만 꺼낸다(구멍은 그리지 않는다). 좌표를 줄이고, 줄여서 겹친 점은 뺀다.
function outerRings(geometry: unknown, where: string, problems: string[]): Ring[] {
  const shape = isDict(geometry) ? geometry : {};
  const polygons =
    shape.type === "Polygon" ? [shape.coordinates] : shape.type === "MultiPolygon" ? shape.coordinates : [];
  const rings: Ring[] = [];
  for (const polygon of Array.isArray(polygons) ? polygons : []) {
    const outer = Array.isArray(polygon) ? polygon[0] : null; // 첫 선이 바깥 경계다
    if (!Array.isArray(outer) || outer.length < 4) continue;
    const ring: Ring = [];
    for (const pair of outer) {
      const lon = round4(Number(pair?.[0]));
      const lat = round4(Number(pair?.[1]));
      const last = ring[ring.length - 1];
      if (!last || last[0] !== lon || last[1] !== lat) ring.push([lon, lat]);
    }
    if (ring.length < 4) continue; // 줄였더니 점이 된 아주 작은 섬
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (ring.some(([lon, lat]) => !inAnsan(lon, lat))) {
      problems.push(`${where}: 경계에 안산 밖의 좌표가 있습니다.`);
    } else if (first[0] !== last[0] || first[1] !== last[1]) {
      problems.push(`${where}: 경계가 닫혀 있지 않습니다(첫 점과 끝 점이 다릅니다).`);
    } else {
      rings.push(ring);
    }
  }
  return rings;
}

// 지도 도형. 동 경계 파일이 없거나 읽지 못하면 null이다(지도 없이 건물 줄만 나온다).
// dongNames는 동 고르기에 쓰는 동 이름이다. 지도에 없는 동이 있으면 problems에 적는다.
export function readMap(sources: MapSources, dongNames: string[], problems: string[] = []): MapData | null {
  const areas = readJson(sources.areasPath);
  if (!isDict(areas) || !Array.isArray(areas.features)) return null;
  const styles = readJson(sources.stylesPath);
  const styleOf = (name: string): Dict => (isDict(styles) && isDict(styles[name]) ? (styles[name] as Dict) : {});

  const dongs: MapDong[] = [];
  for (const feature of areas.features.filter(isDict)) {
    const properties = isDict(feature.properties) ? feature.properties : {};
    const name = String(properties.name ?? "");
    if (!name) continue;
    const rings = outerRings(feature.geometry, `neighborhood_areas.json '${name}'`, problems);
    if (rings.length === 0) continue;
    const style = styleOf(name);
    const color = typeof style.color === "string" && /^#[0-9a-fA-F]{6}$/.test(style.color) ? style.color : "";
    const lon = Number(style.lon);
    const lat = Number(style.lat);
    if (!color || !Number.isFinite(lon) || !Number.isFinite(lat) || !inAnsan(lon, lat)) {
      problems.push(`dong_styles.json: '${name}'의 색이나 이름 자리가 없거나 틀렸습니다.`);
      continue;
    }
    dongs.push({ name, gu: String(properties.gu ?? ""), color, label: [round4(lon), round4(lat)], rings });
  }
  const drawn = new Set(dongs.map((dong) => dong.name));
  for (const name of dongNames) {
    if (!drawn.has(name)) problems.push(`neighborhood_areas.json: '${name}'의 경계가 없습니다.`);
  }

  // 구의 경계는 없어도 지도를 그릴 수 있다
  const districts = readJson(sources.districtsPath);
  const borders: MapData["borders"] = [];
  for (const feature of isDict(districts) && Array.isArray(districts.features) ? districts.features.filter(isDict) : []) {
    const gu = isDict(feature.properties) ? String(feature.properties.gu ?? "") : "";
    const rings = outerRings(feature.geometry, `districts.geojson '${gu}'`, problems);
    if (gu && rings.length > 0) borders.push({ gu, rings });
  }
  return { dongs, borders };
}
