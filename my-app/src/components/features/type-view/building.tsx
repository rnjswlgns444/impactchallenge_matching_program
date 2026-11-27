import Link from "next/link";
import { HouseIcon, StarIcon } from "lucide-react";

import { kindLook, type KindTone } from "@/components/common/kind-icon";
import { text } from "@/content/text";
import { cn } from "@/lib/utils";

// 추천 기관을 나타내는 건물 그림. 지도 위에 세우는 작은 건물(MapBuilding)과, 지도 아래 줄에 놓는 큰 건물(BuildingCard)이 있다.
// - 지붕 모양과 색이 종류 묶음(일 / 여가·배움 / 생활·돌봄·건강 / 전화·온라인)을, 벽의 그림이 종류를 보여 준다.
// - 누르면 그 기관의 화면으로 간다.
// - 번호는 추천 순서다. 시각이나 도는 순서는 말하지 않는다.

export type Building = {
  key: string;
  href: string;
  number: number;
  word: string | undefined; // 정보표의 '핀그림' 낱말(종류)
  name: string; // 기관 이름
  label: string; // 건물을 읽어 주는 말
  star: boolean; // AI가 고른 곳
  near?: boolean; // 우리 동네에서 가장 가까운 곳
};

// 종류 묶음마다의 건물 색
export const PAINT: Record<KindTone, { wall: string; roof: string; ink: string }> = {
  work: { wall: "#DDF4EC", roof: "#1E7A70", ink: "#12675F" },
  leisure: { wall: "#FBE8D3", roof: "#D9825B", ink: "#984A32" },
  life: { wall: "#DFEDF2", roof: "#5E97AE", ink: "#295B72" },
  remote: { wall: "#EFE9E1", roof: "#A08B77", ink: "#6B5646" },
};

// 지붕: 종류 묶음마다 모양이 다르다(일: 평지붕 사무 건물 / 여가·배움: 박공지붕 / 생활: 둥근 지붕 / 전화·온라인: 차양)
function Roof({ tone, className }: { tone: KindTone; className?: string }) {
  const { roof } = PAINT[tone];
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true" className={cn("block w-full", className)}>
      {tone === "work" ? (
        <>
          <rect x="62" y="4" width="16" height="12" rx="2" fill={roof} />
          <rect x="4" y="12" width="92" height="12" rx="3" fill={roof} />
        </>
      ) : tone === "leisure" ? (
        <path d="M0 24 L50 2 L100 24 Z" fill={roof} />
      ) : tone === "life" ? (
        <path d="M2 24 C2 -4 98 -4 98 24 Z" fill={roof} />
      ) : (
        <path d="M0 8 H100 V18 Q87.5 26 75 18 Q62.5 26 50 18 Q37.5 26 25 18 Q12.5 26 0 18 Z" fill={roof} />
      )}
    </svg>
  );
}

function NumberBadge({ number, className }: { number: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute grid size-[1.2rem] place-items-center rounded-full bg-ink text-[0.7rem] leading-none font-extrabold text-white ring-2 ring-white",
        className
      )}
    >
      {number}
    </span>
  );
}

// 지도 위의 작은 건물 + 이름표. 크기는 지도의 폭을 따른다(cqw: 지도 상자 폭의 1%).
// 건물의 아래쪽 가운데가 문 앞이고, 지도는 그 점을 기관의 자리에 맞춘다(core/map-layout.ts의 PIN과 같은 비율이다).
export function MapBuilding({ building, style }: { building: Building; style: React.CSSProperties }) {
  const { Icon, tone } = kindLook(building.word);
  const paint = PAINT[tone];
  return (
    <Link
      href={building.href}
      aria-label={building.label}
      style={style}
      className="absolute flex flex-col items-center transition-transform active:scale-[0.97]"
    >
      <span className="relative block w-[14cqw]">
        <Roof tone={tone} className="h-[5cqw]" />
        <span
          className={cn(
            "grid h-[11cqw] place-items-center rounded-b-[0.35rem] border-2 border-t-0 shadow-[0_3px_8px_rgb(20_63_60/0.25)]",
            building.star ? "border-cta-border" : "border-white"
          )}
          style={{ backgroundColor: paint.wall, color: paint.ink }}
        >
          <Icon aria-hidden="true" className="size-[7cqw]" strokeWidth={2.2} />
        </span>
        <NumberBadge number={building.number} className="-top-[0.2rem] -left-[0.55rem]" />
        {building.near ? (
          <span
            aria-hidden="true"
            className="absolute -top-[0.45rem] left-[62%] flex items-center gap-[0.1rem] rounded-full bg-teal px-[0.3rem] py-[0.1rem] text-[0.55rem] leading-[1.3] font-bold whitespace-nowrap text-white ring-2 ring-white"
          >
            <HouseIcon className="size-[0.6rem]" strokeWidth={2.4} />
            {text.nearShort}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "mt-[0.1rem] line-clamp-2 max-w-full rounded-[0.4rem] border px-[0.3rem] py-[0.15rem] text-center text-[0.7rem] leading-[1.3] font-bold break-keep text-ink shadow-[0_2px_6px_rgb(20_63_60/0.18)]",
          building.star ? "border-cta-border bg-cta" : "border-white bg-card"
        )}
      >
        {building.star ? (
          <StarIcon aria-hidden="true" className="mr-[0.15rem] inline size-[0.7rem] -translate-y-[0.05rem] fill-ink" />
        ) : null}
        {building.name}
      </span>
    </Link>
  );
}

// 지도 아래 줄에 놓는 큰 건물(간판에 기관 이름이 적혀 있다)
export function BuildingCard({ building }: { building: Building }) {
  const { Icon, tone } = kindLook(building.word);
  const paint = PAINT[tone];
  return (
    <Link
      href={building.href}
      aria-label={building.label}
      className="relative block w-full max-w-[11rem] transition-transform active:scale-[0.97]"
    >
      <Roof tone={tone} className="h-[1.1rem]" />
      <span
        className={cn(
          "flex flex-col overflow-hidden rounded-b-[0.6rem] border-2 border-t-0 bg-card shadow-[0_4px_10px_rgb(20_63_60/0.18)]",
          building.star ? "border-cta-border" : "border-white"
        )}
      >
        {/* 벽: 종류 그림과 낱말 */}
        <span
          className="flex items-center justify-center gap-[0.3rem] px-[0.3rem] py-[0.35rem]"
          style={{ backgroundColor: paint.wall, color: paint.ink }}
        >
          <Icon aria-hidden="true" className="size-[1.5rem] shrink-0" strokeWidth={2.2} />
          {building.word ? <span className="text-[0.8rem] leading-none font-extrabold">{building.word}</span> : null}
        </span>
        {/* 간판: 기관 이름 */}
        <span className={cn("px-[0.3rem] py-[0.3rem] text-center", building.star ? "bg-cta" : "bg-card")}>
          <span className="line-clamp-2 text-[0.7rem] leading-[1.3] font-bold break-keep text-ink">
            {building.star ? (
              <StarIcon aria-hidden="true" className="mr-[0.15rem] inline size-[0.7rem] -translate-y-[0.05rem] fill-ink" />
            ) : null}
            {building.name}
          </span>
        </span>
      </span>
      <NumberBadge number={building.number} className="top-[0.5rem] -left-[0.4rem] size-[1.3rem] text-[0.75rem]" />
    </Link>
  );
}
