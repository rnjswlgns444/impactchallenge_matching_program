"use client";

import { Eraser, Flower, Flower2, Leaf, Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { healthUi as ui } from "@/content/practice";
import { fill } from "@/content/text";

const panel = "grid min-w-0 gap-[0.8rem] rounded-xl border border-edge bg-card p-[0.8rem] text-[1rem] leading-snug text-ink";
const control = "min-h-[3.1rem] min-w-0 rounded-lg border border-edge bg-card px-[0.5rem] py-[0.3rem] text-[1rem] font-bold focus-visible:outline-2 focus-visible:outline-teal aria-pressed:border-teal aria-pressed:bg-teal aria-pressed:text-white disabled:opacity-45";
const foods = [
  { name: ui.foodA, origin: ui.originA, printedPortions: 1, kcal: 125, sodium: 110, sugars: 1 },
  { name: ui.foodB, origin: ui.originB, printedPortions: 4, kcal: 115, sodium: 90, sugars: 2 },
] as const;

function PackBack({ item, portions }: { item: (typeof foods)[number]; portions: number }) {
  const rows = [
    [ui.energy, fill(ui.kcal, { n: item.kcal * portions })],
    [ui.salt, fill(ui.mg, { n: item.sodium * portions })],
    [ui.sugars, fill(ui.grams, { n: item.sugars * portions })],
  ];
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-edge bg-background">
      <header className="border-y-[0.18rem] border-dashed border-teal/40 bg-teal/10 px-[0.65rem] py-[0.4rem]">
        <h4 className="text-[1.15rem] font-extrabold">{item.name}</h4>
        <p>{ui.weight}</p>
      </header>
      <div className="grid gap-[0.45rem] p-[0.6rem]">
        <p className="font-semibold">{item.origin}<br />{fill(ui.printed, { e: item.kcal * item.printedPortions, s: item.sodium * item.printedPortions })}</p>
        <div className="grid min-w-0 gap-[0.3rem] rounded-md border-[0.1rem] border-ink bg-card p-[0.4rem]">
          <strong className="text-[1.15rem]">{ui.nutrition}</strong>
          <p className="border-b-[0.17rem] border-ink pb-[0.2rem]">{fill(ui.onLabel, { g: portions * 25 })}</p>
          <dl>
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-1 border-b border-edge py-[0.18rem] last:border-b-0">
                <dt className={label === ui.salt ? "font-extrabold text-teal" : undefined}>{label}</dt>
                <dd className="font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  );
}

function FoodLabelDesk() {
  const [basis, setBasis] = useState<"serving" | "whole" | "measured">("serving");
  const [amount, setAmount] = useState(2);
  const [choice, setChoice] = useState<number | null>(null);
  const portions = basis === "serving" ? 1 : basis === "whole" ? 4 : amount;
  const modes = ["serving", "whole", "measured"] as const;
  function portion(delta: number) {
    setAmount(value => Math.max(1, Math.min(4, value + delta)));
    setBasis("measured");
  }
  return (
    <section className={panel} aria-label={ui.labelTitle}>
      <h3 className="text-[1.25rem] font-extrabold">{ui.labelTitle}</h3>
      <p>{ui.labelIntro}</p>
      <fieldset className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),1fr))] gap-1">
        <legend className="mb-1 font-bold">{ui.basis}</legend>
        {modes.map(mode => <button type="button" key={mode} className={control}
          aria-pressed={basis === mode} onClick={() => setBasis(mode)}>{ui[mode]}</button>)}
      </fieldset>
      <div className="grid min-w-0 gap-1 rounded-xl border border-edge bg-background p-[0.5rem]">
        <p className="font-bold">{ui.amount}</p>
        <div className="grid grid-cols-[3.1rem_minmax(0,1fr)_3.1rem] items-center gap-1">
          <button type="button" className={control} disabled={amount <= 1} aria-label={ui.less} onClick={() => portion(-1)}>
            <Minus aria-hidden="true" className="mx-auto" />
          </button>
          <strong className="text-center tabular-nums">{fill(ui.portionCount, { n: amount, g: amount * 25 })}</strong>
          <button type="button" className={control} disabled={amount >= 4} aria-label={ui.more} onClick={() => portion(1)}>
            <Plus aria-hidden="true" className="mx-auto" />
          </button>
        </div>
        <p>{ui.onePiece}</p>
      </div>
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-[0.5rem]">
        {foods.map(item => <PackBack key={item.name} item={item} portions={portions} />)}
      </div>
      <fieldset className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,6rem),1fr))] gap-1">
        <legend className="mb-1 font-bold">{ui.compare}</legend>
        {foods.map((item, i) => <button key={item.name} type="button" className={control}
          aria-pressed={choice === i} onClick={() => setChoice(i)}>{item.name}</button>)}
      </fieldset>
      <div role="status" className={choice === null ? "sr-only" : "rounded-lg bg-teal/10 p-[0.6rem] font-bold"}>
        {choice !== null && (choice === 1
          ? fill(ui.right, { g: portions * 25, a: foods[1].sodium * portions, b: foods[0].sodium * portions, gap: (foods[0].sodium - foods[1].sodium) * portions })
          : fill(ui.wrong, { g: portions * 25 }))}
      </div>
      <p className="text-muted-foreground">{ui.example}</p>
    </section>
  );
}

const materials = [Flower2, Flower, Leaf] as const;
const corners = ["left-2 top-2", "right-2 top-2", "bottom-2 left-2", "bottom-2 right-2"];

function TagDesk() {
  const [tool, setTool] = useState(0);
  const [board, setBoard] = useState<(number | null)[]>([null, null, null, null]);
  const [sealed, setSealed] = useState(false);
  const count = board.filter(value => value !== null).length;
  function place(index: number) {
    if (sealed) return;
    setBoard(previous => previous.map((value, i) => i === index ? (tool === materials.length ? null : tool) : value));
  }
  return (
    <section className={panel} aria-label={ui.tagTitle}>
      <h3 className="text-[1.25rem] font-extrabold">{ui.tagTitle}</h3>
      <p>{ui.tagIntro}</p>
      {!sealed && <fieldset className="grid min-w-0 grid-cols-2 gap-1">
        <legend className="mb-1 font-bold">{ui.chooseTool}</legend>
        {[...ui.flowerTypes, ui.clearOne].map((label, i) => {
          const Icon = materials[i] ?? Eraser;
          return <button type="button" key={label} aria-pressed={tool === i} onClick={() => setTool(i)}
            className={control + " flex flex-wrap items-center justify-center gap-x-1"}><Icon aria-hidden="true" size="1.15rem" />{label}</button>;
        })}
      </fieldset>}
      <div className="grid min-w-0 justify-items-center overflow-hidden rounded-xl bg-teal/10 p-[0.65rem]">
        <div role="group" aria-label={ui.board}
          className="relative isolate grid min-h-[9.7rem] w-full max-w-[15rem] place-items-center rounded-[1.25rem] border-[0.16rem] border-teal bg-card shadow-card">
          <strong className="text-[1.7rem] font-extrabold tracking-[0.12em] text-teal">{ui.plant}</strong>
          {board.map((value, i) => {
            const Icon = value === null ? Plus : materials[value];
            const label = fill(ui.mark, { place: ui.positions[i], material: value === null ? ui.empty : ui.flowerTypes[value] });
            return <button type="button" key={i} onClick={() => place(i)} disabled={sealed}
              aria-label={label} title={label} className={"absolute grid size-[3.1rem] place-items-center rounded-xl text-teal focus-visible:outline-2 focus-visible:outline-teal " + corners[i] +
                (sealed ? "" : " border border-dashed border-teal/45 hover:bg-teal/10")}>
              {(value !== null || !sealed) && <Icon aria-hidden="true" size={value === null ? "1rem" : "2.2rem"} strokeWidth={value === null ? 1.5 : 2} />}
            </button>;
          })}
          {sealed && <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[1.1rem] border-[0.26rem] border-teal/15 bg-linear-to-br from-transparent via-teal/5 to-transparent" />}
        </div>
        <div aria-hidden="true" className="h-[2.2rem] w-[0.7rem] rounded-b-full bg-teal" />
      </div>
      <p role="status">{sealed ? ui.finished : fill(ui.placed, { n: count })}</p>
      <Button variant={sealed ? "outline" : "cta"} size="touch" disabled={!sealed && count === 0} onClick={() => setSealed(value => !value)}>
        {sealed ? ui.editTag : ui.seal}
      </Button>
      <p className="text-muted-foreground">{ui.tagNote}</p>
    </section>
  );
}

export function HealthPractice({ id }: { id: string }) {
  if (id === "H22") return <TagDesk />;
  if (id === "H23") return <FoodLabelDesk />;
  return null;
}
