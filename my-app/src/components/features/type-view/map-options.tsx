"use client";

import { useState } from "react";
import Link from "next/link";
import { HouseIcon, StarIcon } from "lucide-react";

import { KindIcon, kindLook } from "@/components/common/kind-icon";
import { LinkButton } from "@/components/common/link-button";
import { PlaceRow } from "@/components/common/place-row";
import { isDaebu, overlaps, ringsPath, type Box, type Point } from "@/core/geo";
import {
  CALLOUT,
  COMPACT,
  calloutBoxes,
  layoutPins,
  place,
  sideLabels,
  type MapPinSpot,
  type MapShape,
} from "@/core/map-layout";
import { mapData } from "@/data/map";
import type { Ring } from "@/data/types";
import { cn } from "@/lib/utils";

import { PAINT } from "./building";

// 기관 지도를 작은 핀으로 그리는 네 가지 방안(11/27, 비교용). 하나를 고르면 나머지는 지운다.
//  list    : 지도에는 번호 핀만, 이름은 지도 아래 번호 줄
//  callout : 핀에서 선을 그어, 땅 밖의 빈자리에 이름 상자
//  label   : 핀 옆에 작은 이름표
//  select  : 핀을 누르면 지도 아래 카드가 바뀜

export type MapOption = "list" | "callout" | "label" | "select";

export type OptionItem = {
  key: string;
  href: string;
  number: number;
  word: string | undefined; // 종류 낱말(핀그림)
  name: string; // 기관 이름
  work: string; // 하는 일(프로그램명)
  note: string; // 줄의 작은 글. 예) "문화", "상담 · 전화·온라인으로"
  star: boolean; // AI가 고른 곳
  near: boolean; // 우리 동네에서 가장 가까운 곳
  point: Point | null; // 지도에 꽂을 자리. 없으면 지도에 없다
};

const pct = (value: number, whole: number) => `${(value / whole) * 100}%`;
const split = (rings: Ring[]) => ({
  main: rings.filter((ring) => !isDaebu(ring[0][0])),
  daebu: rings.filter((ring) => isDaebu(ring[0][0])),
});

// 물방울 지도 핀. 색은 종류 묶음을 따르고 안에 번호를 적는다. 아래의 뾰족한 끝이 기관의 자리다
function Pin({ item, big = false }: { item: OptionItem; big?: boolean }) {
  const { tone } = kindLook(item.word);
  return (
    <span className={cn("relative block size-full origin-bottom transition-transform", big ? "scale-[1.45]" : "")}>
      <svg viewBox="0 0 32 40" aria-hidden="true" className="block size-full drop-shadow-[0_2px_2px_rgb(20_63_60/0.35)]">
        <path
          d="M16 39 C16 39 3 24.5 3 15 A13 13 0 1 1 29 15 C29 24.5 16 39 16 39 Z"
          fill={PAINT[tone].roof}
          stroke={item.star ? "#FEE500" : "#FFFFFF"}
          strokeWidth={item.star ? 3 : 2}
          strokeLinejoin="round"
        />
        <text x="16" y="20.5" textAnchor="middle" fontSize="15" fontWeight="800" fill="#FFFFFF">
          {item.number}
        </text>
      </svg>
      {item.star ? (
        <StarIcon aria-hidden="true" className="absolute -top-[18%] -right-[22%] size-[55%] fill-cta text-cta-border" />
      ) : null}
      {item.near ? (
        <span
          aria-hidden="true"
          className="absolute -top-[14%] -left-[26%] grid size-[55%] place-items-center rounded-full bg-teal text-white ring-1 ring-white"
        >
          <HouseIcon className="size-[72%]" strokeWidth={2.6} />
        </span>
      ) : null}
    </span>
  );
}

// 안산 지도 바탕: 동 색칠, 구 경계, 동 이름, 우리 동네, 대부동 상자. 그 위에 올릴 것은 svg(선)와 children(핀·이름)으로 받는다
function MapFrame({
  shape,
  layout,
  homeName,
  taken,
  svg,
  children,
}: {
  shape: MapShape;
  layout: ReturnType<typeof layoutPins>;
  homeName: string | null;
  taken: Box[]; // 동 이름이 비켜 가야 하는 자리(핀, 이름표)
  svg?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { canvas, inset } = shape;
  const home = mapData.dongs.find((dong) => dong.name === homeName) ?? null;
  const blocked = [...taken];
  const names: { text: string; x: number; y: number }[] = [];
  for (const dong of mapData.dongs) {
    const daebu = isDaebu(dong.label[0]);
    const at = daebu
      ? { x: inset.x + inset.w / 2, y: inset.y + inset.h - 1.6 }
      : place(layout, { lon: dong.label[0], lat: dong.label[1] });
    const width = dong.name.length * 3.4;
    const box = { x: at.x - width / 2, y: at.y - 3.4, w: width, h: 4.4 };
    if (!daebu && blocked.some((other) => overlaps(box, other, 0.3))) continue;
    if (!daebu) blocked.push(box);
    names.push({ text: dong.name, x: at.x, y: at.y });
  }

  return (
    <div
      className="@container relative mx-auto w-full max-w-[24rem] overflow-hidden rounded-[0.9rem] border border-[#E7DFC8] bg-[radial-gradient(circle_at_50%_35%,#FFFDF3,#F6F0DC)]"
      style={{ aspectRatio: `${canvas.w} / ${canvas.h}` }}
    >
      <svg viewBox={`0 0 ${canvas.w} ${canvas.h}`} aria-hidden="true" className="absolute inset-0 size-full">
        <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} rx="2" fill="#FFFDF6" stroke="#D8CFB4" strokeWidth="0.4" />
        <clipPath id={`inset-${canvas.h}`}>
          <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} rx="2" />
        </clipPath>
        {mapData.dongs.map((dong) => {
          const rings = split(dong.rings);
          const mine = dong === home;
          return (
            <g key={dong.name}>
              {rings.main.length > 0 ? (
                <path
                  d={ringsPath(layout.main, rings.main)}
                  fill={mine ? "#FEE500" : dong.color}
                  stroke={mine ? "#B99700" : "#FFFDF3"}
                  strokeWidth={mine ? 0.7 : 0.45}
                  strokeLinejoin="round"
                />
              ) : null}
              {rings.daebu.length > 0 ? (
                <path
                  d={ringsPath(layout.inset, rings.daebu)}
                  clipPath={`url(#inset-${canvas.h})`}
                  fill={mine ? "#FEE500" : "#C9D8B4"}
                  stroke={mine ? "#B99700" : "#8FA381"}
                  strokeWidth="0.35"
                  strokeLinejoin="round"
                />
              ) : null}
            </g>
          );
        })}
        {mapData.borders.map((border) => (
          <path
            key={border.gu}
            d={ringsPath(layout.main, split(border.rings).main)}
            fill="none"
            stroke="#6F8478"
            strokeWidth="0.35"
            strokeLinejoin="round"
          />
        ))}
        {names.map((name) => (
          <text
            key={name.text}
            x={name.x}
            y={name.y}
            textAnchor="middle"
            fontSize="3.3"
            fontWeight="600"
            fill="#4F5F56"
            stroke="#FFFDF3"
            strokeWidth="0.6"
            paintOrder="stroke"
          >
            {name.text}
          </text>
        ))}
        {/* 겹쳐서 비켜 놓은 핀은 실제 자리와 선으로 잇는다 */}
        {layout.pins.map((pin, index) =>
          pin.moved ? (
            <g key={index}>
              <line x1={pin.anchor.x} y1={pin.anchor.y} x2={pin.tip.x} y2={pin.tip.y} stroke="#143F3C" strokeWidth="0.4" />
              <circle cx={pin.anchor.x} cy={pin.anchor.y} r="0.9" fill="#143F3C" />
            </g>
          ) : null
        )}
        {svg}
      </svg>
      {children}
    </div>
  );
}

const boxStyle = (box: Box, canvas: Box): React.CSSProperties => ({
  left: pct(box.x, canvas.w),
  top: pct(box.y, canvas.h),
  width: pct(box.w, canvas.w),
  height: pct(box.h, canvas.h),
});

const spoken = (item: OptionItem) =>
  [`${item.number}번 ${item.word ?? ""} ${item.name}`, item.star ? "적어 주신 내용에 맞춰 고른 곳" : "", item.near ? "우리 동네에서 가까워요" : ""]
    .filter(Boolean)
    .join(", ");

// 지도 아래의 번호 줄
function Rows({ items }: { items: OptionItem[] }) {
  return (
    <div className="flex flex-col gap-[0.45rem]">
      {items.map((item) => (
        <PlaceRow
          key={item.key}
          href={item.href}
          lead={<KindIcon word={item.word} />}
          number={item.number}
          title={item.name}
          sub={[item.note, item.near ? "우리 동네에서 가까워요" : ""].filter(Boolean).join(" · ")}
          star={item.star ? "적어 주신 내용에 맞춰 고른 곳" : undefined}
        />
      ))}
    </div>
  );
}

export function MapOptionView({
  option,
  items,
  homeName,
}: {
  option: MapOption;
  items: OptionItem[]; // 추천 순서
  homeName: string | null;
}) {
  const onMap = items.filter((item) => item.point);
  const offMap = items.filter((item) => !item.point);
  const shape = option === "callout" ? CALLOUT : COMPACT;
  const layout = layoutPins(
    mapData.dongs,
    onMap.map((item) => item.point as Point),
    shape
  );
  const pinBoxes = layout.pins.map((pin) => pin.box);
  const [chosen, setChosen] = useState(items[0]?.key ?? "");

  if (option === "list") {
    return (
      <div className="flex flex-col gap-[0.6rem]">
        {onMap.length > 0 ? (
          <MapFrame shape={shape} layout={layout} homeName={homeName} taken={pinBoxes}>
            {onMap.map((item, index) => (
              <Link
                key={item.key}
                href={item.href}
                aria-label={spoken(item)}
                style={boxStyle(layout.pins[index].box, shape.canvas)}
                className="absolute"
              >
                <Pin item={item} />
              </Link>
            ))}
          </MapFrame>
        ) : null}
        <Rows items={items} />
      </div>
    );
  }

  if (option === "callout") {
    const boxes = calloutBoxes(layout.pins, shape);
    const lineOf = (pin: MapPinSpot, box: Box) => {
      const above = box.y < pin.box.y;
      return {
        x1: pin.box.x + pin.box.w / 2,
        y1: above ? pin.box.y + 1 : pin.tip.y,
        x2: Math.min(Math.max(pin.box.x + pin.box.w / 2, box.x + 4), box.x + box.w - 4),
        y2: above ? box.y + box.h : box.y,
      };
    };
    return (
      <div className="flex flex-col gap-[0.6rem]">
        {onMap.length > 0 ? (
          <MapFrame
            shape={shape}
            layout={layout}
            homeName={homeName}
            taken={[...pinBoxes, ...boxes.flatMap((box) => (box ? [box] : []))]}
            svg={layout.pins.map((pin, index) => {
              const box = boxes[index];
              return box ? <line key={index} {...lineOf(pin, box)} stroke="#143F3C" strokeWidth="0.45" strokeLinecap="round" /> : null;
            })}
          >
            {onMap.map((item, index) => {
              const box = boxes[index];
              return (
                <span key={item.key}>
                  <Link href={item.href} aria-hidden="true" tabIndex={-1} style={boxStyle(layout.pins[index].box, shape.canvas)} className="absolute">
                    <Pin item={item} />
                  </Link>
                  {box ? (
                    <Link
                      href={item.href}
                      aria-label={spoken(item)}
                      style={{ left: pct(box.x, shape.canvas.w), top: pct(box.y, shape.canvas.h), width: pct(box.w, shape.canvas.w), minHeight: pct(box.h, shape.canvas.h) }}
                      className={cn(
                        "absolute flex items-center gap-[0.25rem] rounded-[0.45rem] border px-[0.3rem] py-[0.2rem] shadow-[0_2px_6px_rgb(20_63_60/0.18)]",
                        item.star ? "border-cta-border bg-cta" : "border-edge bg-card"
                      )}
                    >
                      <span className="grid size-[1.05rem] shrink-0 place-items-center rounded-full bg-ink text-[0.6rem] leading-none font-extrabold text-white">
                        {item.number}
                      </span>
                      <span className="line-clamp-2 text-[0.7rem] leading-[1.3] font-bold break-keep text-ink">{item.name}</span>
                    </Link>
                  ) : null}
                </span>
              );
            })}
          </MapFrame>
        ) : null}
        {offMap.length > 0 ? (
          <>
            <h3 className="text-[0.85rem] leading-[1.5] font-bold text-foreground">지도에 없는 곳</h3>
            <Rows items={offMap} />
          </>
        ) : null}
      </div>
    );
  }

  if (option === "label") {
    // 이름표의 폭: 12px 글씨로 한 글자가 지도 폭(가장 좁을 때 288px)의 4.2%쯤이다
    const widths = onMap.map((item) => Math.min(item.name.length * 4.3 + 4, 38));
    const labels = sideLabels(layout.pins, widths, shape);
    return (
      <div className="flex flex-col gap-[0.6rem]">
        {onMap.length > 0 ? (
          <MapFrame shape={shape} layout={layout} homeName={homeName} taken={[...pinBoxes, ...labels]}>
            {onMap.map((item, index) => {
              const label = labels[index];
              return (
                <span key={item.key}>
                  <Link href={item.href} aria-hidden="true" tabIndex={-1} style={boxStyle(layout.pins[index].box, shape.canvas)} className="absolute">
                    <Pin item={item} />
                  </Link>
                  <Link
                    href={item.href}
                    aria-label={spoken(item)}
                    style={{ left: pct(label.x, shape.canvas.w), top: pct(label.y, shape.canvas.h), maxWidth: pct(label.w, shape.canvas.w) }}
                    className={cn(
                      "absolute truncate rounded-[0.35rem] border px-[0.25rem] py-[0.05rem] text-[0.6rem] leading-[1.4] font-bold text-ink shadow-[0_1px_4px_rgb(20_63_60/0.2)]",
                      item.star ? "border-cta-border bg-cta" : "border-edge bg-card"
                    )}
                  >
                    {item.name}
                  </Link>
                </span>
              );
            })}
          </MapFrame>
        ) : null}
        {offMap.length > 0 ? (
          <>
            <h3 className="text-[0.85rem] leading-[1.5] font-bold text-foreground">지도에 없는 곳</h3>
            <Rows items={offMap} />
          </>
        ) : null}
      </div>
    );
  }

  // select: 핀이나 번호를 누르면 아래 카드가 그 기관으로 바뀐다
  const current = items.find((item) => item.key === chosen) ?? items[0];
  if (!current) return null;
  const { Icon, tone } = kindLook(current.word);
  return (
    <div className="flex flex-col gap-[0.6rem]">
      {onMap.length > 0 ? (
        <MapFrame shape={shape} layout={layout} homeName={homeName} taken={pinBoxes}>
          {onMap.map((item, index) => (
            <button
              key={item.key}
              type="button"
              aria-label={spoken(item)}
              aria-pressed={item.key === current.key}
              onClick={() => setChosen(item.key)}
              style={{ ...boxStyle(layout.pins[index].box, shape.canvas), zIndex: item.key === current.key ? 2 : 1 }}
              className="absolute cursor-pointer"
            >
              <Pin item={item} big={item.key === current.key} />
            </button>
          ))}
        </MapFrame>
      ) : null}
      {/* 번호로도 넘겨 본다(핀이 작아 누르기 어려울 때) */}
      <div role="group" aria-label="추천 기관 고르기" className="flex justify-center gap-[0.5rem]">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={item.key === current.key}
            aria-label={spoken(item)}
            onClick={() => setChosen(item.key)}
            className={cn(
              "grid h-[2.4rem] min-w-[3.4rem] cursor-pointer place-items-center rounded-full border-2 text-[0.95rem] font-extrabold transition-colors",
              item.key === current.key ? "border-ink bg-ink text-white" : "border-edge bg-card text-ink"
            )}
          >
            {item.number}
          </button>
        ))}
      </div>
      <div
        aria-live="polite"
        className={cn("flex flex-col gap-[0.6rem] rounded-xl border bg-card p-[0.8rem] shadow-card", current.star ? "border-2 border-cta" : "border-edge")}
      >
        <div className="flex items-center gap-[0.7rem]">
          {/* 작은 건물: 지붕 색과 벽의 그림이 종류를 보여 준다 */}
          <span className="flex w-[3.2rem] shrink-0 flex-col" aria-hidden="true">
            <span className="h-[0.55rem] rounded-t-[0.5rem]" style={{ backgroundColor: PAINT[tone].roof }} />
            <span
              className="grid h-[2.5rem] place-items-center rounded-b-[0.4rem]"
              style={{ backgroundColor: PAINT[tone].wall, color: PAINT[tone].ink }}
            >
              <Icon className="size-[1.5rem]" strokeWidth={2.2} />
            </span>
          </span>
          <div className="flex flex-col gap-[0.1rem]">
            <span className="text-[1rem] leading-[1.35] font-bold text-ink">
              {current.star ? <StarIcon aria-hidden="true" className="mr-[0.2rem] inline size-[0.95rem] -translate-y-[0.1rem] fill-cta text-cta-border" /> : null}
              {current.number}. {current.name}
            </span>
            <span className="text-[0.8rem] leading-[1.45] text-muted-foreground">{current.work}</span>
            <span className="text-[0.75rem] leading-[1.45] font-semibold text-teal">
              {[current.note, current.near ? "우리 동네에서 가까워요" : ""].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>
        <LinkButton href={current.href} variant="cta">
          자세히 보기
        </LinkButton>
      </div>
    </div>
  );
}
