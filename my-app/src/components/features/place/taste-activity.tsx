"use client";

import { useState } from "react";
import { CheckIcon, ExternalLinkIcon } from "lucide-react";

import { LinkButton } from "@/components/common/link-button";
import { Button } from "@/components/ui/button";
import { fill, text } from "@/content/text";
import type { TasteActivity } from "@/core/taste";

// 브라우저 메모리만 사용한다. 다른 기관으로 가거나 화면을 닫으면 선택은 사라진다.
export function ActivityPanel({ activity }: { activity: TasteActivity }) {
  const [selected, setSelected] = useState<readonly number[]>([]);
  const multiple = activity.mode === "check";
  function toggle(index: number) {
    setSelected(previous => {
      if (previous.includes(index)) return previous.filter(value => value !== index);
      return multiple ? [...previous, index] : [index];
    });
  }
  return (
    <section className="flex min-w-0 flex-col gap-[0.8rem] rounded-xl border border-edge bg-card p-[0.9rem] shadow-card">
      <h2 className="text-[1.3rem] leading-tight font-extrabold text-ink">{activity.title}</h2>
      <p className="text-[1rem] leading-relaxed">{activity.body}</p>
      <fieldset className="min-w-0">
        <legend className="mb-[0.5rem] text-[1rem] font-bold">{activity.prompt}</legend>
        {multiple && <p className="mb-[0.5rem] text-[1rem] text-muted-foreground">{text.tasteChooseMany}</p>}
        <div className="grid gap-[0.4rem]">
          {activity.options.map((option, index) => {
            const pressed = selected.includes(index);
            return (
              <Button key={option.label} type="button" size="touch" variant={pressed ? "default" : "outline"}
                aria-pressed={pressed} onClick={() => toggle(index)}
                className="justify-start gap-[0.5rem] text-left text-[1rem]">
                {pressed && <CheckIcon aria-hidden="true" />}
                {option.label}
              </Button>
            );
          })}
        </div>
      </fieldset>
      <div aria-live="polite" aria-atomic="false" className="grid gap-[0.6rem]">
        {activity.options.map((option, index) => selected.includes(index) && (
          <div key={option.label} className="grid min-w-0 gap-[0.5rem] rounded-xl bg-muted p-[0.75rem]">
            <h3 className="text-[1.05rem] font-bold text-teal">{option.label}</h3>
            <p className="text-[1rem] leading-relaxed">{option.detail}</p>
            {option.items?.length ? (
              <fieldset className="min-w-0">
                <legend className="font-bold">{text.tasteChecklist}</legend>
                {option.items.map(item => (
                  <label key={item} className="flex min-h-[3.1rem] cursor-pointer items-center gap-[0.6rem] text-[1rem]">
                    <input type="checkbox" className="size-[1.15rem] shrink-0 accent-teal" />
                    {item}
                  </label>
                ))}
              </fieldset>
            ) : null}
            {option.url && option.linkLabel && (
              <LinkButton href={option.url} variant="outline" className="text-teal">
                {option.linkLabel}<ExternalLinkIcon aria-hidden="true" />
              </LinkButton>
            )}
          </div>
        ))}
      </div>
      {!activity.options.some((option, index) => selected.includes(index) && option.url === activity.sourceUrl) &&
        <LinkButton href={activity.sourceUrl} variant="outline" className="text-teal">
          {activity.sourceLabel}<ExternalLinkIcon aria-hidden="true" />
        </LinkButton>}
    </section>
  );
}

// 하루 이용 분량과 요일 수만 곱한다. 특정 시각이나 가족 정보는 받지 않는다.
export function CareHours() {
  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(2);
  return (
    <section className="grid gap-[0.75rem] rounded-xl border border-edge bg-card p-[0.9rem] shadow-card">
      <h2 className="text-[1.2rem] font-bold">{text.tasteHoursTitle}</h2>
      <p className="text-[1rem]">{text.tasteHoursBody}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-[0.6rem]">
        <label className="grid gap-[0.25rem] text-[1rem] font-semibold">
          {text.tasteDaysLabel}
          <select className="min-h-[3.1rem] min-w-0 rounded-lg border border-edge bg-card px-[0.6rem]"
            value={days} onChange={event => setDays(Number(event.target.value))}>
            {Array.from({ length: 7 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{fill(text.tasteDaysUnit, { n })}</option>)}
          </select>
        </label>
        <label className="grid gap-[0.25rem] text-[1rem] font-semibold">
          {text.tasteHoursLabel}
          <select className="min-h-[3.1rem] min-w-0 rounded-lg border border-edge bg-card px-[0.6rem]"
            value={hours} onChange={event => setHours(Number(event.target.value))}>
            {Array.from({ length: 45 }, (_, i) => 2 + i * 0.5).map(n => <option key={n} value={n}>{fill(text.tasteHoursUnit, { n })}</option>)}
          </select>
        </label>
      </div>
      <output aria-live="polite" className="rounded-xl bg-muted p-[0.7rem] text-[1.15rem] font-bold text-teal">
        {fill(text.tasteHoursTotal, { n: days * hours })}
      </output>
    </section>
  );
}
