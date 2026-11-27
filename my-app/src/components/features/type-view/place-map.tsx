"use client";

import { useState } from "react";
import Link from "next/link";
import { HouseIcon, StarIcon } from "lucide-react";

import { kindLook, type KindTone } from "@/components/common/kind-icon";
import { buttonVariants } from "@/components/ui/button";
import { fill, text } from "@/content/text";
import { isDaebu, overlaps, ringsPath, type Box, type Point } from "@/core/geo";
import { MAP, labelWidth, layoutPins, place, sideLabels } from "@/core/map-layout";
import { mapData } from "@/data/map";
import type { Ring } from "@/data/types";
import { cn } from "@/lib/utils";

// 추천 기관 지도. 안산 지도 그림 위에 추천 기관을 작은 핀과 이름표로 꽂고, 누른 기관을 지도 아래 카드에 보여 준다.
// - 바탕은 지도 서비스가 아니라, 안산 25개 동의 경계를 색칠한 그림이다(동료가 만든 지도의 모양. 바깥으로 보내는 것이 없다).
// - 핀의 뾰족한 끝이 기관의 자리다. 색은 종류 묶음, 안의 숫자는 추천 순서다(시각이나 도는 순서가 아니다).
// - 핀·이름표·번호 단추를 누르면 아래 카드가 그 기관으로 바뀌고, 카드의 '자세히 보기'가 기관 화면으로 간다.
// - 자리(좌표)가 없는 기관은 지도에 핀이 없고 번호 단추와 카드로만 나온다.
// - 대부동은 멀리 떨어진 섬이라 왼쪽 아래의 작은 상자에 줄여 그린다. 우리 동네(고른 동)는 노랗게 칠한다.
// 움직이거나 확대되지 않는 한 장의 그림이다. 숫자 거리는 말하지 않는다.

export type MapPlace = {
  key: string;
  href: string;
  number: number;
  word: string | undefined; // 정보표의 '핀그림' 낱말(종류)
  name: string; // 기관 이름
  work: string; // 하는 일(프로그램명)
  note: string; // 카드의 작은 글. 예) "문화", "상담 · 전화·온라인으로"
  label: string; // 읽어 주는 말
  star: boolean; // AI가 고른 곳
  near: boolean; // 우리 동네에서 가장 가까운 곳
  point: Point | null; // 지도에 꽂을 자리. 없으면 지도에 핀이 없다
};

// 지도 자료를 읽지 못했으면 지도를 그리지 않는다(번호 단추와 카드만 나온다)
const MAP_READY = mapData.dongs.length > 0;

// 종류 묶음마다의 색(핀과 카드의 작은 건물)
const PAINT: Record<KindTone, { wall: string; roof: string; ink: string }> = {
  work: { wall: "#DDF4EC", roof: "#1E7A70", ink: "#12675F" },
  leisure: { wall: "#FBE8D3", roof: "#D9825B", ink: "#984A32" },
  life: { wall: "#DFEDF2", roof: "#5E97AE", ink: "#295B72" },
  remote: { wall: "#EFE9E1", roof: "#A08B77", ink: "#6B5646" },
};

const { canvas, inset } = MAP;
const pct = (value: number, whole: number) => `${(value / whole) * 100}%`;
const split = (rings: Ring[]) => ({
  main: rings.filter((ring) => !isDaebu(ring[0][0])),
  daebu: rings.filter((ring) => isDaebu(ring[0][0])),
});

// 물방울 지도 핀. 고른 핀은 커진다
function Pin({ item, big }: { item: MapPlace; big: boolean }) {
  const { tone } = kindLook(item.word);
  return (
    <span className={cn("relative block size-full origin-bottom transition-transform", big ? "scale-[1.4]" : "")}>
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

export function PlaceMap({
  places,
  dots = [],
  homeName,
}: {
  places: MapPlace[]; // 추천 순서
  dots?: Point[]; // 핀 없이 점으로만 찍을 다른 곳
  homeName: string | null; // 우리 동네(고른 동의 이름)
}) {
  const [chosen, setChosen] = useState(places[0]?.key ?? "");
  const current = places.find((item) => item.key === chosen) ?? places[0];
  if (!current) return null;

  const onMap = MAP_READY ? places.filter((item) => item.point) : [];
  const layout = layoutPins(
    mapData.dongs,
    onMap.map((item) => item.point as Point)
  );
  const labels = sideLabels(
    layout.pins,
    onMap.map((item) => labelWidth(item.name))
  );
  const home = mapData.dongs.find((dong) => dong.name === homeName) ?? null;

  // 동 이름을 적을 자리. 핀·이름표, 먼저 적은 동 이름과 겹치면 적지 않는다
  const taken: Box[] = [...layout.pins.map((pin) => pin.box), ...labels];
  const names: { text: string; x: number; y: number }[] = [];
  for (const dong of mapData.dongs) {
    const daebu = isDaebu(dong.label[0]);
    const at = daebu
      ? { x: inset.x + inset.w / 2, y: inset.y + inset.h - 1.6 }
      : place(layout, { lon: dong.label[0], lat: dong.label[1] });
    const width = dong.name.length * 3.4;
    const box = { x: at.x - width / 2, y: at.y - 3.4, w: width, h: 4.4 };
    if (!daebu && taken.some((other) => overlaps(box, other, 0.3))) continue;
    if (!daebu) taken.push(box);
    names.push({ text: dong.name, x: at.x, y: at.y });
  }

  const { Icon, tone } = kindLook(current.word);
  const paint = PAINT[tone];

  return (
    <div className="flex flex-col gap-[0.6rem]">
      {onMap.length > 0 ? (
        <div
          className="@container relative mx-auto w-full max-w-[24rem] overflow-hidden rounded-[0.9rem] border border-[#E7DFC8] bg-[radial-gradient(circle_at_50%_35%,#FFFDF3,#F6F0DC)]"
          style={{ aspectRatio: `${canvas.w} / ${canvas.h}` }}
        >
          <svg viewBox={`0 0 ${canvas.w} ${canvas.h}`} aria-hidden="true" className="absolute inset-0 size-full">
            {/* 대부동 상자 */}
            <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} rx="2" fill="#FFFDF6" stroke="#D8CFB4" strokeWidth="0.4" />
            <clipPath id="place-map-inset">
              <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} rx="2" />
            </clipPath>
            {/* 동: 동마다 정해진 색. 우리 동네는 노랗게. 대부동은 작은 상자 안에만 그린다 */}
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
                      clipPath="url(#place-map-inset)"
                      fill={mine ? "#FEE500" : "#C9D8B4"}
                      stroke={mine ? "#B99700" : "#8FA381"}
                      strokeWidth="0.35"
                      strokeLinejoin="round"
                    />
                  ) : null}
                </g>
              );
            })}
            {/* 구의 경계(본토만) */}
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
            {/* 핀 없이 점으로만 찍는 다른 곳 */}
            {dots.map((dot, index) => {
              const at = place(layout, dot);
              return <circle key={index} cx={at.x} cy={at.y} r="1" fill="#12675F" stroke="#FFFFFF" strokeWidth="0.4" />;
            })}
            {/* 겹쳐서 비켜 놓은 핀은 실제 자리와 선으로 잇는다 */}
            {layout.pins.map((pin, index) =>
              pin.moved ? (
                <g key={index}>
                  <line x1={pin.anchor.x} y1={pin.anchor.y} x2={pin.tip.x} y2={pin.tip.y} stroke="#143F3C" strokeWidth="0.4" />
                  <circle cx={pin.anchor.x} cy={pin.anchor.y} r="0.9" fill="#143F3C" />
                </g>
              ) : null
            )}
          </svg>

          {/* 핀과 이름표. 누르면 아래 카드가 바뀐다. 읽어 주는 것은 아래의 번호 단추가 맡는다 */}
          {onMap.map((item, index) => {
            const pin = layout.pins[index].box;
            const label = labels[index];
            const on = item.key === current.key;
            return (
              <span key={item.key} aria-hidden="true">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setChosen(item.key)}
                  style={{
                    left: pct(pin.x, canvas.w),
                    top: pct(pin.y, canvas.h),
                    width: pct(pin.w, canvas.w),
                    height: pct(pin.h, canvas.h),
                    zIndex: on ? 3 : 1,
                  }}
                  className="absolute cursor-pointer"
                >
                  <Pin item={item} big={on} />
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setChosen(item.key)}
                  style={{
                    left: pct(label.x, canvas.w),
                    top: pct(label.y, canvas.h),
                    maxWidth: pct(label.w, canvas.w),
                    zIndex: on ? 2 : 1,
                  }}
                  className={cn(
                    "absolute cursor-pointer truncate rounded-[0.35rem] border px-[0.25rem] py-[0.05rem] text-[0.6rem] leading-[1.4] font-bold shadow-[0_1px_4px_rgb(20_63_60/0.2)]",
                    on
                      ? "border-ink bg-ink text-white"
                      : item.star
                        ? "border-cta-border bg-cta text-ink"
                        : "border-edge bg-card text-ink"
                  )}
                >
                  {item.name}
                </button>
              </span>
            );
          })}
        </div>
      ) : null}

      {/* 번호 단추. 핀이 작아 누르기 어려울 때와, 지도에 핀이 없는 곳을 고를 때 쓴다 */}
      {places.length > 1 ? (
        <div role="group" aria-label={text.mapPick} className="flex justify-center gap-[0.5rem]">
          {places.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={item.key === current.key}
              aria-label={item.label}
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
      ) : null}

      {/* 고른 기관의 카드 */}
      <div
        aria-live="polite"
        className={cn(
          "flex flex-col gap-[0.6rem] rounded-xl border bg-card p-[0.8rem] shadow-card",
          current.star ? "border-2 border-cta" : "border-edge"
        )}
      >
        <div className="flex items-center gap-[0.7rem]">
          {/* 작은 건물: 지붕 색과 벽의 그림이 종류를 보여 준다 */}
          <span className="flex w-[3.2rem] shrink-0 flex-col" aria-hidden="true">
            <span className="h-[0.55rem] rounded-t-[0.5rem]" style={{ backgroundColor: paint.roof }} />
            <span
              className="grid h-[2.5rem] place-items-center rounded-b-[0.4rem]"
              style={{ backgroundColor: paint.wall, color: paint.ink }}
            >
              <Icon className="size-[1.5rem]" strokeWidth={2.2} />
            </span>
          </span>
          <div className="flex min-w-0 flex-col gap-[0.1rem]">
            <span className="text-[1rem] leading-[1.35] font-bold text-ink">
              {current.star ? (
                <StarIcon
                  role="img"
                  aria-label={text.aiStarLabel}
                  className="mr-[0.2rem] inline size-[0.95rem] -translate-y-[0.1rem] fill-cta text-cta-border"
                />
              ) : null}
              {current.number}. {current.name}
            </span>
            <span className="text-[0.8rem] leading-[1.45] text-muted-foreground">{current.work}</span>
            <span className="text-[0.75rem] leading-[1.45] font-semibold text-teal">
              {[current.note, current.near ? text.nearTag : ""].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>
        <Link
          href={current.href}
          aria-label={fill(text.mapDetailOf, { place: current.label })}
          className={buttonVariants({ variant: "cta", size: "touch" })}
        >
          {text.mapDetail}
        </Link>
      </div>
    </div>
  );
}
