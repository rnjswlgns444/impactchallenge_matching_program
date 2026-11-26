import { describe, expect, it } from "vitest";

import { routeUrl } from "./venues";

describe("길찾기 주소", () => {
  it("이름은 주소에 넣을 수 있게 바꾸고 좌표는 그대로 붙인다", () => {
    expect(routeUrl({ name: "안산시 일자리센터", lat: 37.321370927472, lon: 126.83090409677 })).toBe(
      "https://map.kakao.com/link/to/%EC%95%88%EC%82%B0%EC%8B%9C%20%EC%9D%BC%EC%9E%90%EB%A6%AC%EC%84%BC%ED%84%B0,37.321370927472,126.83090409677"
    );
  });

  it("쉼표·괄호·빗금이 든 이름도 주소를 깨뜨리지 않는다", () => {
    expect(routeUrl({ name: "A(본관), B/C", lat: 37.3, lon: 126.8 })).toBe(
      "https://map.kakao.com/link/to/A%28%EB%B3%B8%EA%B4%80%29%2C%20B%2FC,37.3,126.8"
    );
  });
});
