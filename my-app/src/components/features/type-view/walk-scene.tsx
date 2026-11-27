import Link from "next/link";
import { StarIcon } from "lucide-react";

import { Character, type CharacterGender } from "@/components/common/character";
import { kindLook, type KindTone } from "@/components/common/kind-icon";
import { cn } from "@/lib/utils";

// 첫걸음 산책길: 실제 지도가 아닌 그림 한 장이다. 내 캐릭터가 선 구불구불한 길가에 추천 기관이 건물로 서 있다.
// - 건물의 지붕 모양과 색이 종류 묶음을, 벽의 그림과 낱말이 종류를, 간판이 기관 이름을 보여 준다.
// - 건물을 누르면 그 기관의 화면으로 간다.
// - 번호는 추천 순서다. 시각이나 도는 순서는 말하지 않는다.
// 자리는 건물 수(1~3)마다 미리 정해 둔 것이라 서로 겹치지 않는다. 기관의 실제 위치와는 관계가 없다.

export type Building = {
  key: string;
  href: string;
  number: number;
  word: string | undefined; // 정보표의 '핀그림' 낱말(종류)
  name: string; // 간판에 적을 기관 이름
  label: string; // 건물을 읽어 주는 말
  star: boolean; // AI가 고른 곳
  tag?: string; // 간판 아래의 딱지('우리 동네에서 가까워요')
};

// 종류 묶음마다의 건물 색
const PAINT: Record<KindTone, { wall: string; roof: string; ink: string }> = {
  work: { wall: "#DDF4EC", roof: "#1E7A70", ink: "#12675F" },
  leisure: { wall: "#FBE8D3", roof: "#D9825B", ink: "#984A32" },
  life: { wall: "#DFEDF2", roof: "#5E97AE", ink: "#295B72" },
  remote: { wall: "#EFE9E1", roof: "#A08B77", ink: "#6B5646" },
};

// 건물 수마다의 자리. 값은 그림 상자에 대한 %이고, 건물은 아래쪽 가운데(문 앞)를 그 점에 맞춘다.
// start는 캐릭터가 선 길의 시작점이다.
type Layout = { height: string; start: [number, number]; doors: [number, number][]; bushes: [number, number][] };
const LAYOUTS: Record<number, Layout> = {
  1: { height: "h-[11.5rem]", start: [24, 90], doors: [[73, 90]], bushes: [[8, 44], [46, 40]] },
  2: {
    height: "h-[16rem]",
    start: [24, 93],
    doors: [[73, 93], [27, 54]],
    bushes: [[90, 34], [56, 22], [6, 62]],
  },
  3: {
    height: "h-[22rem]",
    start: [24, 95],
    doors: [[73, 95], [27, 68], [73, 43]],
    bushes: [[10, 26], [44, 16], [93, 52], [52, 80]],
  },
};

// 시작점에서 문 앞들을 차례로 지나는 부드러운 길
function roadPath(points: [number, number][]): string {
  return points
    .map(([x, y], index) => {
      if (index === 0) return `M${x} ${y}`;
      const [px, py] = points[index - 1];
      const mid = (px + x) / 2;
      return `C${mid} ${py} ${mid} ${y} ${x} ${y}`;
    })
    .join(" ");
}

// 지붕: 종류 묶음마다 모양이 다르다(일: 평지붕 사무 건물 / 여가·배움: 박공지붕 / 생활: 둥근 지붕 / 전화·온라인: 차양)
function Roof({ tone }: { tone: KindTone }) {
  const { roof } = PAINT[tone];
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true" className="block h-[1.1rem] w-full">
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

function BuildingLink({ building, door }: { building: Building; door: [number, number] }) {
  const { Icon, tone } = kindLook(building.word);
  const paint = PAINT[tone];
  return (
    <Link
      href={building.href}
      aria-label={building.label}
      style={{ left: `${door[0]}%`, top: `${door[1]}%` }}
      className="absolute w-[44%] max-w-[11rem] -translate-x-1/2 -translate-y-full transition-transform active:scale-[0.97]"
    >
      <Roof tone={tone} />
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
        <span
          className={cn(
            "flex flex-col items-center gap-[0.2rem] px-[0.3rem] py-[0.3rem] text-center",
            building.star ? "bg-cta" : "bg-card"
          )}
        >
          <span className="line-clamp-2 text-[0.7rem] leading-[1.3] font-bold break-keep text-ink">
            {building.star ? (
              <StarIcon aria-hidden="true" className="mr-[0.15rem] inline size-[0.7rem] -translate-y-[0.05rem] fill-ink" />
            ) : null}
            {building.name}
          </span>
          {building.tag ? (
            <span className="rounded-full bg-teal px-[0.4rem] py-[0.1rem] text-[0.6rem] leading-[1.35] font-bold tracking-[-0.03em] text-balance text-white">
              {building.tag}
            </span>
          ) : null}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="absolute top-[0.5rem] -left-[0.4rem] grid size-[1.3rem] place-items-center rounded-full bg-ink text-[0.75rem] leading-none font-extrabold text-white ring-2 ring-white"
      >
        {building.number}
      </span>
    </Link>
  );
}

export function WalkScene({
  buildings,
  typeId,
  gender,
}: {
  buildings: Building[]; // 1~3채. 받은 순서대로 길의 시작에서 가까운 자리부터 놓는다
  typeId: string;
  gender: CharacterGender | null; // 길의 시작에 세울 캐릭터. 없으면 세우지 않는다
}) {
  const shown = buildings.slice(0, 3);
  const layout = LAYOUTS[shown.length];
  if (!layout) return null;
  const road = roadPath([layout.start, ...layout.doors]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#CFDFCB] bg-[#E6F2DE] shadow-card",
        layout.height
      )}
    >
      {/* 하늘과 해, 구름 */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3rem] bg-[#DCEFF6]" />
      <div aria-hidden="true" className="absolute -inset-x-[10%] top-[2rem] h-[2.4rem] rounded-[50%] bg-[#E6F2DE]" />
      <div aria-hidden="true" className="absolute top-[0.5rem] left-[0.8rem] size-[1.3rem] rounded-full bg-[#FFE45C]" />
      <div aria-hidden="true" className="absolute top-[0.7rem] left-[38%] h-[0.5rem] w-[2rem] rounded-full bg-white/90" />

      {/* 길 */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 size-full">
        <path
          d={road}
          fill="none"
          stroke="#FBF6E6"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={road}
          fill="none"
          stroke="#C9B98F"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="1 9"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* 덤불 */}
      {layout.bushes.map(([x, y]) => (
        <span
          key={`${x}-${y}`}
          aria-hidden="true"
          style={{ left: `${x}%`, top: `${y}%` }}
          className="absolute h-[0.8rem] w-[1.3rem] -translate-x-1/2 rounded-[50%] bg-[#BBDCAE] shadow-[0.5rem_0.15rem_0_-0.1rem_#CBE5BF]"
        />
      ))}

      {/* 길의 시작에 선 캐릭터 */}
      {gender ? (
        <span
          aria-hidden="true"
          style={{ left: `${layout.start[0] - 6}%`, top: `${layout.start[1] + 3}%` }}
          className="absolute w-[4.4rem] -translate-x-1/2 -translate-y-full"
        >
          <Character typeId={typeId} gender={gender} sizes="90px" className="w-full drop-shadow-[0_3px_3px_rgb(20_63_60/0.2)]" />
        </span>
      ) : null}

      {shown.map((building, index) => (
        <BuildingLink key={building.key} building={building} door={layout.doors[index]} />
      ))}
    </div>
  );
}
