"use client";

import { useState } from "react";

import { MapOptionView, type MapOption, type OptionItem } from "@/components/features/type-view/map-options";
import { cn } from "@/lib/utils";

// 기관 지도 네 가지 방안을 같은 자료로 바꿔 가며 본다(개발용).

export type MapCase = { title: string; heading: string; homeName: string | null; items: OptionItem[] };

const OPTIONS: { id: MapOption; label: string; note: string }[] = [
  { id: "list", label: "방안 1", note: "지도에는 번호 핀만, 이름은 아래 번호 줄. 핀과 줄 모두 누르면 기관 화면으로 가요." },
  { id: "callout", label: "방안 2", note: "핀에서 선을 그어 땅 밖의 빈자리에 이름 상자. 상자를 누르면 기관 화면으로 가요." },
  { id: "label", label: "방안 3", note: "핀 옆에 작은 이름표(12px). 이름표를 누르면 기관 화면으로 가요." },
  { id: "select", label: "방안 4", note: "핀이나 번호를 누르면 아래 카드가 바뀌고, '자세히 보기'로 기관 화면에 가요." },
];

function Tabs<T extends string | number>({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: T;
  choices: { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-[0.3rem]">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          aria-pressed={choice.id === value}
          onClick={() => onChange(choice.id)}
          className={cn(
            "cursor-pointer rounded-full border-2 px-[0.7rem] py-[0.25rem] text-[0.8rem] font-bold",
            choice.id === value ? "border-teal bg-teal text-white" : "border-edge bg-card text-ink"
          )}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}

export function MapCompare({ cases }: { cases: MapCase[] }) {
  const [option, setOption] = useState<MapOption>("list");
  const [index, setIndex] = useState(0);
  const current = cases[index];
  const chosen = OPTIONS.find((one) => one.id === option)!;

  return (
    <div className="flex flex-col gap-[0.7rem]">
      <div className="sticky top-0 z-10 flex flex-col gap-[0.4rem] rounded-xl border border-edge bg-background/95 p-[0.5rem] backdrop-blur">
        <Tabs label="방안" value={option} choices={OPTIONS} onChange={setOption} />
        <Tabs label="경우" value={index} choices={cases.map((one, at) => ({ id: at, label: one.title }))} onChange={setIndex} />
        <p className="text-[0.75rem] leading-[1.5] text-muted-foreground">{chosen.note}</p>
      </div>

      <section className="flex flex-col gap-[0.5rem]">
        <h2 className="text-[1.15rem] leading-[1.4] font-extrabold tracking-[-0.02em]">{current.heading}</h2>
        {current.homeName ? (
          <p className="text-[0.8rem] leading-[1.5] text-muted-foreground">우리 동네: {current.homeName}</p>
        ) : null}
        {/* 방안이나 경우를 바꾸면 고른 핀을 처음으로 되돌린다 */}
        <MapOptionView key={`${option}-${index}`} option={option} items={current.items} homeName={current.homeName} />
        <div className="rounded-xl border border-edge bg-card px-[1rem] py-[0.9rem] text-center text-[0.95rem] font-bold text-teal">
          목록으로 보기 · 모두 {current.items.length}곳
        </div>
      </section>
    </div>
  );
}
