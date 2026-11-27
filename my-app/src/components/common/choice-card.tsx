"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// 하나만 고르는 선택지. 설문의 5점 척도와 단일 선택에 쓴다.
// 고르면 물빛 바탕 + 청록 테두리 + 채워진 동그라미로 보인다(색만으로 구분하지 않는다).
// 고르기만 해서는 넘어가지 않는다. 넘기는 것은 화면의 '다음' 단추가 한다.

export function ChoiceGroup({
  value,
  onValueChange,
  label,
  children,
}: {
  value: string | null;
  onValueChange: (value: string) => void;
  label: string; // 화면 읽기 도구가 읽어 줄 이름(보통 질문 문장)
  children: React.ReactNode;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onValueChange(String(next))}
      aria-label={label}
      className="gap-[0.5rem]"
    >
      {children}
    </RadioGroup>
  );
}

export function ChoiceCard({
  value,
  icon,
  note,
  children,
}: {
  value: string;
  icon?: React.ReactNode; // 주면 동그라미 대신 둥근 바탕의 그림을 보여 준다(고르면 청록 바탕이 된다)
  note?: React.ReactNode; // 선택지 글 아래의 작은 글
  children: React.ReactNode;
}) {
  return (
    <FieldLabel className="group/choice cursor-pointer rounded-xl border-[1.5px] border-edge bg-card text-base font-semibold text-ink shadow-card transition-all hover:border-teal active:translate-y-px has-data-checked:border-teal has-data-checked:bg-aqua has-data-checked:shadow-none has-data-checked:ring-2 has-data-checked:ring-teal has-[>[data-slot=field]]:rounded-xl has-[>[data-slot=field]]:border-[1.5px]">
      <Field
        orientation="horizontal"
        className="min-h-[3.3rem] items-center gap-[0.7rem] px-[0.9rem]! py-[0.5rem]!"
      >
        <RadioGroupItem
          value={value}
          className={cn("size-[1.15rem] border-[1.5px] border-line bg-card", icon ? "sr-only" : "")}
        />
        {icon ? (
          <span
            aria-hidden="true"
            className="grid size-[2.08rem] shrink-0 place-items-center rounded-full bg-aqua text-teal group-has-data-checked/choice:bg-teal group-has-data-checked/choice:text-white [&_svg]:size-[1.2rem]"
          >
            {icon}
          </span>
        ) : null}
        <span className="flex flex-1 flex-col leading-snug">
          {children}
          {note ? <span className="text-sm font-normal text-muted-foreground">{note}</span> : null}
        </span>
      </Field>
    </FieldLabel>
  );
}
