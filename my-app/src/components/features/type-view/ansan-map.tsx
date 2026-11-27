import { HouseIcon } from "lucide-react";

import { Character, type CharacterGender } from "@/components/common/character";
import { fill, text } from "@/content/text";
import { isDaebu, overlaps, ringsPath, type Box, type Point } from "@/core/geo";
import { CANVAS, INSET, UNIT, layoutMap, place } from "@/core/map-layout";
import { mapData } from "@/data/map";
import type { Ring } from "@/data/types";

import { MapBuilding, type Building } from "./building";

// 안산 지도 위에 추천 기관을 건물로 세운 그림.
// - 바탕은 지도 서비스가 아니라, 안산 25개 동의 경계를 색칠한 그림이다(동료가 만든 지도의 모양. 바깥으로 보내는 것이 없다).
// - 건물은 기관의 실제 자리에 선다. 가까이 붙은 건물은 겹치지 않게 조금 벌려 놓고, 실제 자리와 선으로 잇는다.
// - 대부동은 멀리 떨어진 섬이라 왼쪽 아래의 작은 상자에 줄여 그린다.
// - 우리 동네(고른 동)는 노랗게 칠하고 집 그림을 둔다.
// 움직이거나 확대되지 않는 한 장의 그림이다. 숫자 거리와 가는 순서는 말하지 않는다.

export type MapItem = { building: Building; point: Point };

// 지도 자료를 읽지 못했으면 지도를 그리지 않는다(건물 줄만 나온다)
export const MAP_READY = mapData.dongs.length > 0;

const pct = (value: number, whole: number) => `${(value / whole) * 100}%`;
const split = (rings: Ring[]) => ({
  main: rings.filter((ring) => !isDaebu(ring[0][0])),
  daebu: rings.filter((ring) => isDaebu(ring[0][0])),
});

export function AnsanMap({
  items,
  dots = [],
  homeName,
  typeId,
  gender,
}: {
  items: MapItem[]; // 건물로 세울 곳(추천 순서)
  dots?: Point[]; // 건물 없이 점으로만 찍을 다른 곳
  homeName: string | null; // 우리 동네(고른 동의 이름)
  typeId: string;
  gender: CharacterGender | null; // 구석에 세울 캐릭터의 성별
}) {
  const layout = layoutMap(
    mapData.dongs,
    items.map((item) => item.point)
  );
  const home = mapData.dongs.find((dong) => dong.name === homeName) ?? null;
  const homeAt = home ? place(layout, { lon: home.label[0], lat: home.label[1] }) : null;
  // 동 이름을 적을 자리. 건물·이름표, 우리 동네의 집 그림, 먼저 적은 동 이름과 겹치면 적지 않는다
  const taken: Box[] = layout.units.map((unit) => unit.box);
  if (homeAt) taken.push({ x: homeAt.x - 3.5, y: homeAt.y - 3.5, w: 7, h: 7 });
  const names: { text: string; x: number; y: number }[] = [];
  for (const dong of mapData.dongs) {
    const daebu = isDaebu(dong.label[0]);
    const at = daebu
      ? { x: INSET.x + INSET.w / 2, y: INSET.y + INSET.h - 1.6 }
      : place(layout, { lon: dong.label[0], lat: dong.label[1] });
    const width = dong.name.length * 3.4;
    const box = { x: at.x - width / 2, y: at.y - 3.4, w: width, h: 4.4 };
    if (!daebu && taken.some((other) => overlaps(box, other, 0.4))) continue;
    if (!daebu) taken.push(box);
    names.push({ text: dong.name, x: at.x, y: at.y });
  }

  return (
    <div
      className="@container relative mx-auto w-full max-w-[24rem] overflow-hidden rounded-[0.9rem] border border-[#E7DFC8] bg-[radial-gradient(circle_at_50%_35%,#FFFDF3,#F6F0DC)]"
      style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}
    >
      <svg viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`} aria-hidden="true" className="absolute inset-0 size-full">
        {/* 대부동 상자 */}
        <rect
          x={INSET.x}
          y={INSET.y}
          width={INSET.w}
          height={INSET.h}
          rx="2"
          fill="#FFFDF6"
          stroke="#D8CFB4"
          strokeWidth="0.4"
        />
        {/* 동: 동마다 정해진 색. 우리 동네는 노랗게. 대부동은 작은 상자 안에만 그린다 */}
        <clipPath id="ansan-map-inset">
          <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx="2" />
        </clipPath>
        {mapData.dongs.map((dong) => {
          const rings = split(dong.rings);
          const mine = dong === home;
          const paint = {
            fill: mine ? "#FEE500" : dong.color,
            stroke: mine ? "#B99700" : "#FFFDF3",
            strokeWidth: mine ? 0.7 : 0.45,
            strokeLinejoin: "round" as const,
          };
          return (
            <g key={dong.name}>
              {rings.main.length > 0 ? <path d={ringsPath(layout.main, rings.main)} {...paint} /> : null}
              {rings.daebu.length > 0 ? (
                <path
                  d={ringsPath(layout.inset, rings.daebu)}
                  clipPath="url(#ansan-map-inset)"
                  {...paint}
                  fill={mine ? "#FEE500" : "#C9D8B4"}
                  stroke={mine ? "#B99700" : "#8FA381"}
                  strokeWidth={0.35}
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
        {/* 동 이름. 건물·이름표에 가리거나 다른 동 이름과 겹치는 것은 적지 않는다 */}
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
        {/* 건물 없이 점으로만 찍는 다른 곳 */}
        {dots.map((dot, index) => {
          const at = place(layout, dot);
          return <circle key={index} cx={at.x} cy={at.y} r="1.1" fill="#12675F" stroke="#FFFFFF" strokeWidth="0.4" />;
        })}
        {/* 밀려난 건물은 실제 자리와 선으로 잇는다 */}
        {layout.units.map((unit, index) =>
          unit.moved ? (
            <g key={index}>
              <line
                x1={unit.anchor.x}
                y1={unit.anchor.y}
                x2={unit.door.x}
                y2={unit.door.y}
                stroke="#143F3C"
                strokeWidth="0.5"
                strokeLinecap="round"
              />
              <circle cx={unit.anchor.x} cy={unit.anchor.y} r="1.4" fill="#143F3C" stroke="#FFFFFF" strokeWidth="0.5" />
            </g>
          ) : null
        )}
      </svg>

      {/* 구석의 캐릭터(꾸밈) */}
      {gender ? (
        <Character
          typeId={typeId}
          gender={gender}
          sizes="80px"
          className="pointer-events-none absolute right-[1%] bottom-[1%] w-[17%]"
        />
      ) : null}

      {/* 우리 동네 */}
      {home && homeAt ? (
        <span
          role="img"
          aria-label={fill(text.homeLabel, { dong: home.name })}
          style={{ left: pct(homeAt.x, CANVAS.w), top: pct(homeAt.y, CANVAS.h) }}
          className="absolute grid size-[6.5cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[0_1px_4px_rgb(20_63_60/0.3)] ring-2 ring-[#B99700]"
        >
          <HouseIcon aria-hidden="true" className="size-[4.2cqw]" strokeWidth={2.4} />
        </span>
      ) : null}

      {/* 건물 + 이름표. 추천 순서대로 그린다 */}
      {items.map((item, index) => {
        const { box } = layout.units[index];
        return (
          <MapBuilding
            key={item.building.key}
            building={item.building}
            style={{ left: pct(box.x, CANVAS.w), top: pct(box.y, CANVAS.h), width: pct(UNIT.w, CANVAS.w) }}
          />
        );
      })}
    </div>
  );
}
