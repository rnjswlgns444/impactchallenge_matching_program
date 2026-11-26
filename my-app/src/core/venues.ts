// 기관의 위치로 길찾기 주소를 만든다. 원본: app/core/venues.py의 route_url
// 위치 자료는 빌드 때 읽어 둔 것을 쓴다(appData.venues).
//
// 좌표의 출처는 대부분 민간 주소 사이트다. 길을 안내하는 데만 쓰고, 주소 글은 정보표의 '장소'를 쓴다.

import type { Venue } from "@/data/types";

// 파이썬의 quote(이름, safe="")와 같게: 영문·숫자와 _ . - ~ 만 그대로 두고 나머지는 %로 바꾼다
function quote(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

// 카카오맵에서 그 곳까지의 길찾기를 여는 주소
export function routeUrl(venue: Pick<Venue, "name" | "lat" | "lon">): string {
  return `https://map.kakao.com/link/to/${quote(venue.name)},${venue.lat},${venue.lon}`;
}
