// '내 결과 저장하기'의 사진(세로 1080×1350)에 무엇을 어디에 그릴지 정한다.
// 원본: app/ui/result_image.py (배치와 치수를 그대로 옮겼다)
//
// 화면과 무관한 순수 함수다. 글자만 받으므로 설문 답·점수·전화번호·사는 동이 사진에 들어갈 길이 없다.
// 답(answers)이나 프로그램 행을 통째로 넘기지 않는다.
// 글자 폭을 재는 자(measure)는 밖에서 받는다. 브라우저에서는 캔버스가, 테스트에서는 가짜 자가 잰다.
// 실제로 그리는 일은 lib/card-canvas.ts가 한다.

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;
export const MAX_PLACES = 3;

// 색은 globals.css의 값과 같다
export const CARD_COLORS = {
  canvas: "#F8FBF7",
  ink: "#143F3C",
  body: "#263C37",
  muted: "#4B615A",
  teal: "#12675F",
  rule: "#D3E1D8",
  yellow: "#FEE500",
  yellowRule: "#857810",
  pillInk: "#202E27",
} as const;

// 분야별 유형 상자의 [바탕, 테두리]. globals.css의 --area-wash / --area-rule
const AREA_COLORS: Record<string, [string, string]> = {
  work: ["#DDF4EC", "#B8D0C2"],
  leisure: ["#FBEEDE", "#DDC4AD"],
  life: ["#E8F1F2", "#B2CBD0"],
};
const PLAIN_COLORS: [string, string] = ["#DDF4EC", "#B8D0C2"];

const PAD_X = 64;
const PAD_TOP = 48;
const PAD_BOTTOM = 40;
const TOP_H = 52;
const FOOT_H = 40;
const GAP = 24;
const MID_GAP = 28;
const BOX_W = CARD_WIDTH - 2 * PAD_X; // 952
const ART_MAX = 320;
const ART_MIN = 200;
const FEATURE_MAX_LINES = 6;
const PILL_H = 80;

export type CardFont = { bold: boolean; size: number };
export type Measure = (value: string, font: CardFont) => number;

// 글자 크기와 줄 높이(px). 휴대폰에서는 사진이 0.36배쯤으로 보이므로 본문을 36px 아래로 줄이지 않는다
const F = {
  app: { bold: true, size: 32 },
  sub: { bold: false, size: 26 },
  foot: { bold: false, size: 28 },
  pill: { bold: true, size: 48 },
  statement: { bold: false, size: 36 },
  feature: { bold: false, size: 36 },
  heading: { bold: true, size: 30 },
  name: { bold: true, size: 38 },
  org: { bold: false, size: 28 },
} satisfies Record<string, CardFont>;
const LINE = { statement: 50, feature: 50, heading: 42, name: 50, org: 38 };

// 사진에 찍히는 글자. 이것 말고는 받지 않는다
export type CardInput = {
  appName: string; // 맨 위 왼쪽. "ANTI"
  appSub: string; // 맨 위 오른쪽. "안산 다음걸음 유형 찾기"
  typeName: string;
  statement: string; // 유형 설명 한 문장
  feature: string; // 특징 글
  area: string; // 분야 id(work / leisure / life). 상자 색을 고른다
  hasArt: boolean; // 캐릭터 그림을 그릴지(성별 답이 없으면 그리지 않는다)
  heading: string; // 기관 구역의 소제목
  places: { name: string; sub: string }[]; // 기관 이름과 하는 일. 앞의 3곳까지만 쓴다
  footer: string; // 맨 아래 한 줄
};

// 그릴 것 하나. 글자의 y는 줄의 세로 가운데다
export type CardOp =
  | { kind: "box"; x: number; y: number; w: number; h: number; radius: number; fill: string; stroke?: string }
  | { kind: "text"; x: number; y: number; value: string; font: CardFont; fill: string; align: "left" | "center" | "right" }
  | { kind: "art"; x: number; y: number; size: number };

export type CardLayout = {
  ops: CardOp[];
  art: number; // 캐릭터 그림의 한 변(0이면 그리지 않음)
  places: number; // 실제로 들어간 기관 수
};

// 한 줄에 들어가게 자르고 끝에 …을 붙인다
export function clip(value: string, font: CardFont, width: number, measure: Measure): string {
  if (measure(value, font) <= width) return value;
  let cut = value;
  while (cut && measure(cut + "…", font) > width) cut = cut.slice(0, -1);
  return cut.trimEnd() + "…";
}

// 낱말 단위로 줄을 바꾼다(한글이 낱말 중간에서 끊기지 않게). 한 낱말이 너무 길 때만 글자 단위로 끊는다.
// maxLines를 넘으면 마지막 줄 끝에 …을 붙인다.
export function wrap(value: string, font: CardFont, width: number, maxLines: number, measure: Measure): string[] {
  const lines: string[] = [];
  let line = "";
  for (let word of value.split(/\s+/).filter(Boolean)) {
    const trial = line ? `${line} ${word}` : word;
    if (measure(trial, font) <= width) {
      line = trial;
      continue;
    }
    if (line) lines.push(line);
    while (measure(word, font) > width) {
      // 한 낱말이 한 줄보다 길다
      let cut = word.length;
      while (cut > 1 && measure(word.slice(0, cut), font) > width) cut -= 1;
      lines.push(word.slice(0, cut));
      word = word.slice(cut);
    }
    line = word;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = clip(lines[maxLines - 1] + "…", font, width, measure);
  }
  return lines;
}

// 자리가 모자라면 그림을 먼저 줄이고, 그래도 넘치면 마지막 기관을 뺀다.
export function layoutCard(input: CardInput, measure: Measure): CardLayout {
  const C = CARD_COLORS;
  const places = input.places
    .map((place) => ({ name: place.name.trim(), sub: place.sub.trim() }))
    .filter((place) => place.name)
    .slice(0, MAX_PLACES);

  const inner = BOX_W - 2 * 36; // 유형 상자 안쪽 폭
  const textW = BOX_W - 2 * 12; // 특징·기관 구역의 글 폭
  const stateLines = wrap(input.statement, F.statement, inner, 2, measure);
  const featureLines = input.feature ? wrap(input.feature, F.feature, textW, FEATURE_MAX_LINES, measure) : [];
  const pillText = clip(input.typeName, F.pill, inner - 2 * 52, measure);

  type Parts = { hero: number; feature: number; spots: number; names: string[][] };
  const measureParts = (shown: typeof places, art: number): Parts => {
    const hero =
      24 +
      (input.hasArt ? art + 10 : 0) +
      PILL_H +
      (stateLines.length > 0 ? 16 + LINE.statement * stateLines.length : 0) +
      32;
    const feature = LINE.feature * featureLines.length;
    const names = shown.map((place) => wrap(place.name, F.name, textW, 2, measure));
    let spots = 0;
    if (shown.length > 0) {
      spots = 2 + 24 + LINE.heading + 12;
      shown.forEach((place, index) => {
        spots += LINE.name * names[index].length + (place.sub ? LINE.org : 0);
      });
      spots += 16 * (shown.length - 1);
    }
    return { hero, feature, spots, names };
  };
  const total = (parts: Parts): number => {
    const blocks = [parts.hero, parts.feature, parts.spots].filter((height) => height > 0);
    return blocks.reduce((sum, height) => sum + height, 0) + MID_GAP * (blocks.length - 1);
  };

  const midTop = PAD_TOP + TOP_H + GAP;
  const midH = CARD_HEIGHT - PAD_BOTTOM - FOOT_H - GAP - midTop;
  let art = ART_MAX;
  let shown = places;
  let parts = measureParts(shown, art);
  if (input.hasArt && total(parts) > midH) {
    art = Math.max(ART_MIN, art - (total(parts) - midH)); // 1) 그림을 줄인다
    parts = measureParts(shown, art);
  }
  while (total(parts) > midH && shown.length > 1) {
    shown = shown.slice(0, -1); // 2) 마지막 기관을 뺀다
    parts = measureParts(shown, art);
  }

  const ops: CardOp[] = [];
  const left = (x: number, top: number, lineHeight: number, value: string, font: CardFont, fill: string) =>
    ops.push({ kind: "text", x, y: top + lineHeight / 2, value, font, fill, align: "left" });
  const center = (top: number, lineHeight: number, value: string, font: CardFont, fill: string) =>
    ops.push({ kind: "text", x: CARD_WIDTH / 2, y: top + lineHeight / 2, value, font, fill, align: "center" });

  // 머리줄: 앱 이름(왼쪽), 풀이(오른쪽)
  const sub = clip(input.appSub, F.sub, 420, measure);
  left(PAD_X, PAD_TOP, TOP_H, clip(input.appName, F.app, BOX_W - 420 - 24, measure), F.app, C.ink);
  ops.push({
    kind: "text",
    x: CARD_WIDTH - PAD_X,
    y: PAD_TOP + TOP_H / 2,
    value: sub,
    font: F.sub,
    fill: C.muted,
    align: "right",
  });

  // 가운데 덩어리는 세로 가운데에 둔다
  let y = midTop + Math.max(0, Math.floor((midH - total(parts)) / 2));

  // 유형 상자: 그림, 이름(노란 알약), 설명
  const [wash, rule] = AREA_COLORS[input.area] ?? PLAIN_COLORS;
  ops.push({ kind: "box", x: PAD_X, y, w: BOX_W, h: parts.hero, radius: 40, fill: wash, stroke: rule });
  let cursor = y + 24;
  if (input.hasArt) {
    ops.push({ kind: "art", x: (CARD_WIDTH - art) / 2, y: cursor, size: art });
    cursor += art + 10;
  }
  const pillW = measure(pillText, F.pill) + 2 * 52;
  ops.push({
    kind: "box",
    x: (CARD_WIDTH - pillW) / 2,
    y: cursor,
    w: pillW,
    h: PILL_H,
    radius: PILL_H / 2,
    fill: C.yellow,
    stroke: C.yellowRule,
  });
  center(cursor, PILL_H, pillText, F.pill, C.pillInk);
  cursor += PILL_H + 16;
  for (const line of stateLines) {
    center(cursor, LINE.statement, line, F.statement, C.ink);
    cursor += LINE.statement;
  }
  y += parts.hero + MID_GAP;

  // 특징 글
  if (parts.feature > 0) {
    cursor = y;
    for (const line of featureLines) {
      left(PAD_X + 12, cursor, LINE.feature, line, F.feature, C.body);
      cursor += LINE.feature;
    }
    y += parts.feature + MID_GAP;
  }

  // 기관: 가는 줄, 소제목, 기관 이름(크게)과 하는 일(작게)
  if (parts.spots > 0) {
    ops.push({ kind: "box", x: PAD_X, y, w: BOX_W, h: 2, radius: 0, fill: C.rule });
    cursor = y + 2 + 24;
    left(PAD_X + 12, cursor, LINE.heading, clip(input.heading, F.heading, textW, measure), F.heading, C.teal);
    cursor += LINE.heading + 12;
    shown.forEach((place, index) => {
      for (const line of parts.names[index]) {
        left(PAD_X + 12, cursor, LINE.name, line, F.name, C.ink);
        cursor += LINE.name;
      }
      if (place.sub) {
        left(PAD_X + 12, cursor, LINE.org, clip(place.sub, F.org, textW, measure), F.org, C.muted);
        cursor += LINE.org;
      }
      cursor += 16;
    });
  }

  // 맨 아래 한 줄
  center(CARD_HEIGHT - PAD_BOTTOM - FOOT_H, FOOT_H, clip(input.footer, F.foot, BOX_W, measure), F.foot, C.muted);

  return { ops, art: input.hasArt ? art : 0, places: shown.length };
}
