import {
  BookOpenIcon,
  BriefcaseBusinessIcon,
  DumbbellIcon,
  GiftIcon,
  HandHeartIcon,
  HeartHandshakeIcon,
  HeartPulseIcon,
  MapPinIcon,
  MessagesSquareIcon,
  MonitorIcon,
  PaletteIcon,
  PhoneIcon,
  PiggyBankIcon,
  StoreIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

// 기관의 종류를 한눈에 보여 주는 동그란 그림. 정보표의 '핀그림' 칸에 적힌 낱말(일·상담·배움 등)을 따른다.
// 낱말 묶음은 app/core/loader.py의 PIN_WORDS와 같다. 낱말이 없거나 모르는 낱말이면 기본 그림을 쓴다.
// 색은 네 묶음이다: 일(청록) / 배움·여가(살구) / 생활·건강(하늘) / 전화·온라인(회갈색).

export type KindTone = "work" | "leisure" | "life" | "remote";
type Look = { Icon: LucideIcon; tone: KindTone };

const TONES: Record<KindTone, string> = {
  work: "bg-[#DDF4EC] text-[#12675F] ring-[#9CCFBF]",
  leisure: "bg-[#FBE8D3] text-[#984A32] ring-[#E3BE9A]",
  life: "bg-[#DFEDF2] text-[#295B72] ring-[#A9C8D4]",
  remote: "bg-[#EFE9E1] text-[#6B5646] ring-[#CFC2B2]",
};

const LOOKS: Record<string, Look> = {
  일: { Icon: BriefcaseBusinessIcon, tone: "work" },
  가게: { Icon: StoreIcon, tone: "work" },
  봉사: { Icon: HandHeartIcon, tone: "work" },
  배움: { Icon: BookOpenIcon, tone: "leisure" },
  문화: { Icon: PaletteIcon, tone: "leisure" },
  운동: { Icon: DumbbellIcon, tone: "leisure" },
  모임: { Icon: UsersIcon, tone: "leisure" },
  상담: { Icon: MessagesSquareIcon, tone: "life" },
  건강: { Icon: HeartPulseIcon, tone: "life" },
  돌봄: { Icon: HeartHandshakeIcon, tone: "life" },
  돈: { Icon: PiggyBankIcon, tone: "life" },
  혜택: { Icon: GiftIcon, tone: "life" },
  전화: { Icon: PhoneIcon, tone: "remote" },
  온라인: { Icon: MonitorIcon, tone: "remote" },
};

const DEFAULT: Look = { Icon: MapPinIcon, tone: "work" };

// 낱말의 그림과 색 묶음. 산책길 그림의 건물도 이것을 쓴다
export function kindLook(word: string | undefined): Look {
  return (word ? LOOKS[word] : undefined) ?? DEFAULT;
}

export function KindIcon({
  word,
  className,
}: {
  word: string | undefined; // 정보표의 '핀그림' 칸
  className?: string; // 크기는 size-*로 준다(기본 2.4rem)
}) {
  const { Icon, tone } = kindLook(word);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-[2.4rem] shrink-0 place-items-center rounded-full ring-2 [&_svg]:size-[55%]",
        TONES[tone],
        className
      )}
    >
      <Icon strokeWidth={2.2} />
    </span>
  );
}
