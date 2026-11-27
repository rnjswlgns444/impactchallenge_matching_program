// 지도 그림의 도형(동 경계·색·이름 자리, 구 경계). `npm run data`가 src/generated/map.json으로 만든다.
// 지도를 그리는 부품만 이 파일을 가져온다(다른 화면이 무거워지지 않게).

import raw from "@/generated/map.json";

import type { MapData } from "./types";

export const mapData = raw as unknown as MapData;
