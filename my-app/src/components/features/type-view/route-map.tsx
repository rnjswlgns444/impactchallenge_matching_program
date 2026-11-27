import Link from "next/link";
import { HouseIcon } from "lucide-react";

import { KindIcon } from "@/components/common/kind-icon";
import { dongPath, frameOf, project, spread, viewBox, type Stop } from "@/core/geo";
import type { Dong } from "@/data/types";

// 첫걸음 길: 안산 지도 그림 위에 우리 동네에서 추천 기관마다 점선 길을 긋는다.
// 지도는 우리 동네와 기관들이 들어가는 만큼만 그린다(안산 전체를 담으면 기관이 한데 뭉쳐 보인다).
// - 동 경계는 옅은 조각, 우리 동네는 노란 조각이다.
// - 번호가 붙은 핀(종류 그림)은 누르면 그 기관의 화면으로 간다. 이름은 지도 아래의 번호 줄에 있다.
// - 번호 없는 작은 점은 '다른 곳'이다(누르지 않는다. 지도 아래 단추로 목록에 간다).
// 움직이지 않는 그림이다. 시각이나 가는 순서는 말하지 않는다(번호는 추천 순서다).
// 가까이 붙은 핀은 겹치지 않게 조금 밀어 놓으므로 정확한 위치와 조금 다를 수 있다.

const PIN_GAP = 19; // 핀 사이의 최소 거리(지도 가로를 100으로 볼 때). 핀의 폭(화면 폭의 11%쯤)보다 넉넉히 둔다

export function RouteMap({
  dongs,
  home,
  stops,
  others,
  hrefOf,
  labelOf,
  homeLabel,
}: {
  dongs: Dong[];
  home: Dong | null; // 우리 동네. 고르지 않았으면 null
  stops: Stop[]; // 번호를 붙여 길로 이을 곳
  others: Stop[]; // 작은 점으로만 찍을 곳
  hrefOf: (stop: Stop) => string;
  labelOf: (stop: Stop) => string; // 핀을 읽어 주는 말(번호와 기관 이름)
  homeLabel: string; // '우리 동네: 고잔동'
}) {
  const placed = stops.filter((stop) => stop.venue);
  const dots = others.filter((stop) => stop.venue);
  if (dongs.length === 0 || (placed.length === 0 && dots.length === 0)) return null;

  // 그릴 범위: 우리 동네와, 지도에 찍을 기관들이 넉넉히 들어가는 만큼. 범위 밖의 동은 잘려 보인다
  const drawn = dongs;
  const frame = frameOf(viewBox([...(home ? [home] : []), ...[...placed, ...dots].map((stop) => stop.venue!)]), 0);

  // 핀 자리: 우리 동네와 번호 핀이 서로 겹치지 않게 밀어 놓는다
  const pins = spread(
    [
      ...(home ? [{ key: "home", stop: null as Stop | null, ...project(frame, home.lon, home.lat) }] : []),
      ...placed.map((stop) => ({ key: stop.program.id, stop, ...project(frame, stop.venue!.lon, stop.venue!.lat) })),
    ],
    PIN_GAP,
    frame
  );
  // 길: 우리 동네가 있으면 거기서 기관마다 점선을 하나씩 긋는다(번호는 추천 순서일 뿐, 도는 순서가 아니다).
  // 우리 동네가 없으면 기관끼리 번호 순서로 잇는다.
  const homePin = pins.find((pin) => !pin.stop);
  const stopPins = pins.filter((pin) => pin.stop);
  const point = (pin: { x: number; y: number }) => `${pin.x.toFixed(2)},${pin.y.toFixed(2)}`;
  const routes = homePin
    ? stopPins.map((pin) => `${point(homePin)} ${point(pin)}`)
    : stopPins.length > 1
      ? [stopPins.map(point).join(" ")]
      : [];
  const at = (x: number, y: number) => ({ left: `${(x / frame.width) * 100}%`, top: `${(y / frame.height) * 100}%` });

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[#CFDFCB] bg-[#E3F0DC] shadow-card"
      style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
    >
      <svg viewBox={`0 0 ${frame.width} ${frame.height}`} aria-hidden="true" className="absolute inset-0 size-full">
        {drawn.map((dong) => (
          <path
            key={dong.name}
            d={dongPath(frame, dong)}
            fill={dong.name === home?.name ? "#FEE500" : "#FBFDF8"}
            fillOpacity={dong.name === home?.name ? 0.75 : 1}
            stroke="#C5D6BF"
            strokeWidth={0.35}
            strokeLinejoin="round"
          />
        ))}
        {routes.map((points) => (
          <polyline
            key={points}
            points={points}
            fill="none"
            stroke="#12675F"
            strokeWidth={1.1}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0.2 2.6"
          />
        ))}
        {dots.map((stop) => {
          const { x, y } = project(frame, stop.venue!.lon, stop.venue!.lat);
          return <circle key={stop.program.id} cx={x} cy={y} r={1.8} fill="#79A48E" stroke="#fff" strokeWidth={0.6} />;
        })}
      </svg>

      {pins.map((pin) =>
        pin.stop ? (
          <Link
            key={pin.key}
            href={hrefOf(pin.stop)}
            aria-label={labelOf(pin.stop)}
            style={at(pin.x, pin.y)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform active:scale-95"
          >
            <KindIcon
              word={pin.stop.program["핀그림"]}
              className="size-[clamp(2rem,11vw,2.5rem)] shadow-[0_3px_6px_rgb(20_63_60/0.28)] ring-[2.5px] ring-white"
            />
            <span
              aria-hidden="true"
              className="absolute -top-[0.3rem] -right-[0.3rem] grid size-[1.1rem] place-items-center rounded-full bg-ink text-[0.65rem] leading-none font-extrabold text-white ring-2 ring-white"
            >
              {pin.stop.number}
            </span>
          </Link>
        ) : (
          <span
            key={pin.key}
            role="img"
            aria-label={homeLabel}
            style={at(pin.x, pin.y)}
            className="absolute grid size-[1.9rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-cta shadow-[0_3px_6px_rgb(20_63_60/0.28)] ring-[2.5px] ring-white"
          >
            <HouseIcon aria-hidden="true" className="size-[1rem]" strokeWidth={2.4} />
          </span>
        )
      )}
    </div>
  );
}
