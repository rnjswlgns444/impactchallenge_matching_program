import { describe, expect, it } from "vitest";

import { appData } from "@/data";

import {
  CARD_HEIGHT,
  CARD_WIDTH,
  MAX_PLACES,
  clip,
  layoutCard,
  wrap,
  type CardFont,
  type CardInput,
  type CardOp,
  type Measure,
} from "./result-card";

// 가짜 자: 한글·전각은 글자 크기만큼, 그 밖의 글자는 그 절반
const measure: Measure = (value, font) =>
  [...value].reduce((sum, char) => sum + (char.charCodeAt(0) > 0x2e7f ? font.size : font.size / 2), 0);

const font: CardFont = { bold: false, size: 10 };

function input(over: Partial<CardInput> = {}): CardInput {
  return {
    appName: "ANTI",
    appSub: "안산 다음걸음 유형 찾기",
    typeName: "일터찾기형",
    statement: "다시 일할 곳을 찾고 싶어요.",
    feature: "꾸준히 다닐 일자리를 찾는 분이 먼저 살펴보는 유형이에요.",
    area: "work",
    hasArt: true,
    heading: "일터찾기형에 맞는 기관",
    places: [
      { name: "안산시 일자리센터", sub: "취업 상담" },
      { name: "중장년내일센터", sub: "재취업 지원" },
      { name: "여성새로일하기센터", sub: "직업 교육" },
    ],
    footer: "11월 27일에 저장한 결과예요. 정보는 바뀔 수 있어요.",
    ...over,
  };
}

const texts = (ops: CardOp[]) => ops.flatMap((op) => (op.kind === "text" ? [op.value] : []));

// 그린 것이 모두 사진 안에 있는지
function expectInside(ops: CardOp[]) {
  for (const op of ops) {
    if (op.kind === "box") {
      expect(op.x).toBeGreaterThanOrEqual(0);
      expect(op.x + op.w).toBeLessThanOrEqual(CARD_WIDTH);
      expect(op.y).toBeGreaterThanOrEqual(0);
      expect(op.y + op.h).toBeLessThanOrEqual(CARD_HEIGHT);
    } else if (op.kind === "art") {
      expect(op.y).toBeGreaterThanOrEqual(0);
      expect(op.y + op.size).toBeLessThanOrEqual(CARD_HEIGHT);
    } else {
      const half = measure(op.value, op.font) / 2;
      const [from, to] =
        op.align === "left"
          ? [op.x, op.x + half * 2]
          : op.align === "right"
            ? [op.x - half * 2, op.x]
            : [op.x - half, op.x + half];
      expect(from).toBeGreaterThanOrEqual(0);
      expect(to).toBeLessThanOrEqual(CARD_WIDTH);
      expect(op.y).toBeGreaterThan(0);
      expect(op.y).toBeLessThan(CARD_HEIGHT);
    }
  }
}

describe("줄바꿈", () => {
  it("낱말 단위로 줄을 바꾼다", () => {
    expect(wrap("가나다 라마바 사아자", font, 65, 5, measure)).toEqual(["가나다 라마바", "사아자"]);
  });

  it("한 낱말이 한 줄보다 길면 글자 단위로 끊는다", () => {
    expect(wrap("가나다라마바사", font, 30, 5, measure)).toEqual(["가나다", "라마바", "사"]);
  });

  it("줄 수를 넘으면 마지막 줄 끝에 …을 붙인다", () => {
    const lines = wrap("가나다 라마바 사아자 차카타", font, 30, 2, measure);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith("…")).toBe(true);
    expect(measure(lines[1], font)).toBeLessThanOrEqual(30);
  });

  it("빈 글은 줄이 없다", () => {
    expect(wrap("  ", font, 30, 2, measure)).toEqual([]);
  });

  it("한 줄에 안 들어가면 잘라서 …을 붙인다", () => {
    expect(clip("가나다", font, 30, measure)).toBe("가나다");
    expect(clip("가나다라마", font, 30, measure)).toBe("가나…");
  });
});

describe("사진 배치", () => {
  it("받은 글자만 그린다", () => {
    const card = input();
    const drawn = texts(layoutCard(card, measure).ops).join(" ");
    for (const value of [card.appName, card.appSub, card.typeName, card.heading, card.footer]) {
      expect(drawn).toContain(value);
    }
    for (const place of card.places) {
      expect(drawn).toContain(place.name);
      expect(drawn).toContain(place.sub);
    }
  });

  it("기관은 3곳까지만 넣는다", () => {
    const places = ["가", "나", "다", "라", "마"].map((name) => ({ name: `${name}센터`, sub: "" }));
    const layout = layoutCard(input({ places }), measure);
    expect(layout.places).toBe(MAX_PLACES);
    expect(texts(layout.ops)).not.toContain("라센터");
  });

  it("이름이 빈 기관은 넣지 않는다", () => {
    const layout = layoutCard(input({ places: [{ name: " ", sub: "상담" }] }), measure);
    expect(layout.places).toBe(0);
    expect(texts(layout.ops)).not.toContain("상담");
  });

  it("기관이 없으면 소제목도 그리지 않는다", () => {
    const card = input({ places: [] });
    expect(texts(layoutCard(card, measure).ops)).not.toContain(card.heading);
  });

  it("성별 답이 없으면 그림을 그리지 않는다", () => {
    const layout = layoutCard(input({ hasArt: false }), measure);
    expect(layout.art).toBe(0);
    expect(layout.ops.some((op) => op.kind === "art")).toBe(false);
  });

  it("자리가 모자라면 그림을 먼저 줄이고, 그래도 넘치면 마지막 기관을 뺀다", () => {
    const long = "아주 긴 이름의 기관 ".repeat(8);
    const roomy = layoutCard(input(), measure);
    expect(roomy.art).toBe(320);
    expect(roomy.places).toBe(3);

    const tight = layoutCard(
      input({
        feature: "특징을 길게 적은 글이에요. ".repeat(30),
        places: [1, 2, 3].map(() => ({ name: long, sub: "하는 일" })),
      }),
      measure
    );
    expect(tight.art).toBe(200);
    expect(tight.places).toBeLessThan(3);
    expect(tight.places).toBeGreaterThanOrEqual(1);
    expectInside(tight.ops);
  });

  it("실제 유형 12개의 글이 모두 사진 안에 들어간다", () => {
    expect(appData.types).toHaveLength(12);
    for (const type of appData.types) {
      const layout = layoutCard(
        input({
          typeName: type.name,
          statement: type.statement,
          feature: type.feature,
          area: type.area,
          heading: `${type.name}에 맞는 기관`,
        }),
        measure
      );
      expectInside(layout.ops);
      expect(layout.places).toBe(3);
      expect(layout.art).toBeGreaterThanOrEqual(200);
    }
  });
});
