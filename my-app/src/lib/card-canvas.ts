// 결과 사진을 브라우저의 캔버스에 그려 PNG로 돌려준다. 서버로는 아무것도 보내지 않는다.
// 무엇을 어디에 그릴지는 core/result-card.ts가 정하고, 여기서는 그리기만 한다.
// 받는 것은 사진에 찍히는 글자와 그림 주소뿐이다.

import {
  CARD_COLORS,
  CARD_HEIGHT,
  CARD_WIDTH,
  layoutCard,
  type CardFont,
  type CardInput,
} from "@/core/result-card";

// 화면 글꼴과 같다(globals.css의 --font-sans)
const FAMILY =
  '"Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif';

const fontOf = (font: CardFont) => `${font.bold ? 700 : 400} ${font.size}px ${FAMILY}`;

// 사진에 쓸 글자의 글꼴 조각을 미리 받는다. 안 받으면 처음 그릴 때 기기 글꼴로 찍힌다.
// 못 받아도 그리기는 계속한다(기기 글꼴로 찍힌다).
async function loadFonts(input: CardInput): Promise<void> {
  const letters = [
    input.appName,
    input.appSub,
    input.typeName,
    input.statement,
    input.feature,
    input.heading,
    input.footer,
    ...input.places.flatMap((place) => [place.name, place.sub]),
    "…",
  ].join(" ");
  try {
    await Promise.all([
      document.fonts.load(fontOf({ bold: true, size: 32 }), letters),
      document.fonts.load(fontOf({ bold: false, size: 32 }), letters),
    ]);
  } catch {
    // 기기 글꼴로 그린다
  }
}

// 캐릭터 그림. 못 받으면 그림 없이 그린다
async function loadArt(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) return null;
  try {
    const image = new Image();
    image.src = src;
    await image.decode();
    return image;
  } catch {
    return null;
  }
}

function roundedBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): void {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// artSrc: 캐릭터 그림의 주소(같은 사이트의 것). 없으면 그림 없이 그린다
export async function drawCard(input: CardInput, artSrc: string | null): Promise<Blob> {
  const [art] = await Promise.all([loadArt(input.hasArt ? artSrc : null), loadFonts(input)]);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const layout = layoutCard({ ...input, hasArt: art !== null }, (value, font) => {
    ctx.font = fontOf(font);
    return ctx.measureText(value).width;
  });

  ctx.fillStyle = CARD_COLORS.canvas;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.textBaseline = "middle";

  for (const op of layout.ops) {
    if (op.kind === "box") {
      roundedBox(ctx, op.x, op.y, op.w, op.h, op.radius);
      ctx.fillStyle = op.fill;
      ctx.fill();
      if (op.stroke) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = op.stroke;
        ctx.stroke();
      }
    } else if (op.kind === "text") {
      ctx.font = fontOf(op.font);
      ctx.fillStyle = op.fill;
      ctx.textAlign = op.align;
      ctx.fillText(op.value, op.x, op.y);
    } else if (art) {
      // 정사각형 자리 안에 비율을 지켜 넣는다
      const scale = Math.min(op.size / art.naturalWidth, op.size / art.naturalHeight);
      const w = art.naturalWidth * scale;
      const h = art.naturalHeight * scale;
      ctx.drawImage(art, op.x + (op.size - w) / 2, op.y + (op.size - h) / 2, w, h);
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png");
  });
}
