"use client";

import { useState } from "react";
import { fill, text } from "@/content/text";

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
