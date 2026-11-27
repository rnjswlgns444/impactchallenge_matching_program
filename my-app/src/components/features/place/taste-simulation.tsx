"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays,
  Check, CheckCheck, Circle, CircleDot, FileText, Hammer, Lightbulb,
  ListOrdered, MapPin, Minus, MonitorSmartphone, PackageOpen, Plus, RotateCcw,
  SlidersHorizontal, Undo2, FileBadge, Store, Sprout, HandHeart, ShoppingBag,
  Palette, BookOpen, Music2, MessageCircle, Users, Baby, ClipboardList,
  Utensils, NotebookPen, Salad, Leaf, CalendarSearch, BookMarked, Binoculars,
  Volume2, type LucideIcon,
} from "lucide-react";

import { LinkButton } from "@/components/common/link-button";
import { Button } from "@/components/ui/button";
import { fieldContent, fieldNavigation, fill, simUi } from "@/content/text";
import { isStepReady, newSimAnswer, type SimAnswer, type SimStep, type Simulation } from "@/core/simulation";
import { SceneHand, SceneObject, SceneTargets, SimulationStage } from "./simulation-stage";
import { SimulationWorkpiece } from "./simulation-workpiece";

import { FieldLabPanel, FieldLabResult } from "./field-lab";
import { ArtPractice } from "./art-practice";
import { JobPractice } from "./job-practice";
import { LocalPractice } from "./field-tools-local";
import { HealthPractice } from "./health-practice";
import type { FieldEntry, FieldLabState } from "@/core/field-lab";

const fieldEntries: Readonly<Partial<Record<string, FieldEntry>>> = fieldContent;
const instruments: Readonly<Partial<Record<string, string>>> = fieldNavigation.instruments;

const layouts = {
  desk: { icon: BriefcaseBusiness, band: "bg-ink text-white" },
  kiosk: { icon: MonitorSmartphone, band: "bg-teal text-white" },
  workshop: { icon: Hammer, band: "bg-clay text-white" },
  planner: { icon: CalendarDays, band: "bg-primary text-primary-foreground" },
  field: { icon: MapPin, band: "bg-teal text-white" },
};

const programIcons: Record<string, LucideIcon> = {
  JOB01: BriefcaseBusiness, JOB02: FileBadge, JOB03: Store, JOB07: Sprout, JOB08: HandHeart, JOB11: ShoppingBag,
  L06_PIUM_DIRECTORY: Palette, L15: BookOpen, L16: Music2, L08_MIND_COUNSELING: MessageCircle,
  L08_FAMILY_COUNSELING: Users, H10: Baby, H13: Utensils, H20_INFO: ClipboardList, H22: NotebookPen,
  H23: Salad, H24: Leaf, H25: CalendarSearch, C_BOOK: BookMarked, C_ECO: Binoculars,
};

// 공통 종이 카드도 기관에 따라 영수증, 철제 클립 기록지, 작업지, 일정표로 보이게 한다.
const paperStyles = {
  desk: "rounded-xl border-l-[0.3rem] border-l-teal",
  kiosk: "rounded-b-sm rounded-t-lg border-b-[0.18rem] border-dashed",
  field: "rounded-lg border-l-[0.38rem] border-l-teal",
  workshop: "rounded-2xl border-t-[0.25rem] border-t-clay",
  planner: "rounded-lg border-t-[0.25rem] border-t-teal",
};

function PaperTop({ kind }: { kind: Simulation["kind"] }) {
  if (kind === "field") return <span aria-hidden="true" className="mx-auto mb-[0.5rem] block h-[0.5rem] w-[3.5rem] rounded-b-md border-2 border-teal bg-edge" />;
  if (kind === "planner") return <div aria-hidden="true" className="mb-[0.4rem] flex justify-around">
    {[0, 1, 2, 3].map(n => <span key={n} className="h-[0.65rem] w-[0.35rem] rounded-full border border-teal bg-muted" />)}
  </div>;
  return null;
}

const panelGrid = "grid min-w-0 gap-[0.6rem]";
const noteCard = "min-w-0 rounded-lg border border-edge bg-card p-[0.7rem] text-[1rem] leading-relaxed text-ink";

type StepProps = {
  answer: SimAnswer;
  onChange: (answer: SimAnswer) => void;
};

function ChoiceBench({ step, answer, onChange }: StepProps & { step: Extract<SimStep, { mode: "pick" | "pack" }> }) {
  const packed = step.mode === "pack";
  const selected = answer.values;
  const full = packed && selected.length >= step.limit;
  function toggle(index: number) {
    const values = packed
      ? selected.includes(index) ? selected.filter(id => id !== index) : [...selected, index]
      : [index];
    onChange({ values, confirmed: true });
  }
  return (
    <div className={panelGrid}>
      {packed && <p className="flex items-center gap-[0.4rem] text-[1rem] font-semibold text-teal">
        <PackageOpen aria-hidden="true" className="size-[1.15rem] shrink-0" />
        {fill(step.min === step.limit ? simUi.exact : simUi.range, { min: step.min, max: step.limit })}
      </p>}
      <SceneTargets><div className="grid min-w-0 gap-[0.4rem]">
        {step.options.map((option, index) => {
          const active = selected.includes(index);
          return <Button key={option.label} variant={active ? "default" : "outline"} size="touch" type="button"
            data-sim-option={index} aria-pressed={active} disabled={!active && full} onClick={() => toggle(index)}
            className="justify-start text-left text-[1rem]">
            <SceneObject label={option.label} index={index} selected={active} />
            {option.label}
          </Button>;
        })}
      </div></SceneTargets>
      <div className="min-w-0 rounded-xl border-2 border-dashed border-line bg-card p-[0.65rem]" aria-live="polite">
        <p className="flex items-center gap-[0.35rem] font-bold text-teal">
          {packed ? <PackageOpen aria-hidden="true" /> : <FileText aria-hidden="true" />}
          {packed ? simUi.packed : simUi.selected}
        </p>
        {selected.length ? <ul className="mt-[0.5rem] grid gap-[0.5rem]">
          {selected.map(index => <li key={index} className="border-l-4 border-teal pl-[0.55rem]">
            <strong className="block">{step.options[index].label}</strong>
            <span>{step.options[index].note}</span>
          </li>)}
        </ul> : <p className="mt-[0.35rem] text-muted-foreground">{simUi.empty}</p>}
        {full && <p className="mt-[0.5rem] text-muted-foreground">{simUi.full}</p>}
      </div>
    </div>
  );
}

function CardBench({ step, answer, onChange }: StepProps & { step: Extract<SimStep, { mode: "sort" | "order" }> }) {
  const [feedback, setFeedback] = useState("");
  const [dragging, setDragging] = useState(false);
  const [hoverGroup, setHoverGroup] = useState<number | null>(null);
  const filled = answer.values;
  const next = filled.length;
  const unfinished = next < step.items.length;
  function append(value: number, message: string) {
    onChange({ values: [...filled, value], confirmed: true });
    setFeedback(message);
  }
  function undo() {
    onChange({ values: filled.slice(0, -1), confirmed: false });
    setFeedback("");
  }
  function reveal() {
    if (step.mode === "sort") {
      const current = step.items[next];
      setFeedback(fill(simUi.sortHint, { group: step.groups[current.group] }));
    } else {
      setFeedback(fill(simUi.orderHint, { item: step.items[next] }));
    }
  }
  function placeCard(group: number) {
    if (step.mode !== "sort" || !unfinished) return;
    const current = step.items[next];
    if (group !== current.group) {
      setFeedback(fill(simUi.wrong, { hint: current.hint }));
      return;
    }
    append(group, fill(simUi.matched, { item: current.label, group: step.groups[group] }));
  }
  function stopDrag() { setDragging(false); setHoverGroup(null); }
  return (
    <div className={panelGrid}>
      {step.mode === "sort" ? <SceneTargets><div className={panelGrid}>
        {unfinished && <SceneHand><div data-sim-card draggable className="cursor-grab select-none rounded-xl border-2 border-teal bg-card p-[0.65rem] shadow-card active:cursor-grabbing"
          onDragStart={event => {
            // 드래그 데이터에는 카드를 구별하는 고정 표식만 넣는다.
            event.dataTransfer.setData("application/x-anti-card", "card");
            event.dataTransfer.effectAllowed = "move";
            setDragging(true);
          }} onDragEnd={stopDrag}>
          <p className="flex items-center gap-[0.35rem] font-semibold text-teal"><ArrowDownRight aria-hidden="true" />{simUi.sortCard}</p>
          <p className="mt-[0.25rem] text-[1.2rem] font-bold text-ink">{step.items[next].label}</p>
          <p className="mt-[0.2rem] text-muted-foreground">{simUi.placeCard}</p>
        </div></SceneHand>}
        <div className="grid min-w-0 gap-[0.45rem] min-[580px]:grid-cols-2">
          {step.groups.map((group, index) => <div key={group} data-sim-tray={index}
            className={`min-w-0 rounded-xl border p-[0.4rem] ${hoverGroup === index ? "border-teal bg-aqua ring-2 ring-teal" : "border-edge bg-card"}`}
            onDragOver={event => {
              if (!dragging) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setHoverGroup(index);
            }}
            onDrop={event => {
              if (!dragging) return;
              event.preventDefault();
              stopDrag();
              placeCard(index);
            }}>
            <Button size="touch" variant="outline" type="button" data-sim-group={index} disabled={!unfinished}
              onClick={() => placeCard(index)} className="justify-start text-left text-[1rem]">
              <SceneObject label={group} index={index} selected={filled.includes(index)} />{group}
            </Button>
            <ul className="grid gap-[0.2rem] px-[0.45rem] pt-[0.35rem] text-[1rem]">
              {filled.includes(index) ? filled.map((v, i) => v === index && <li key={i} className="flex items-baseline gap-[0.35rem] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1">
                <Check className="size-[0.85rem] shrink-0 text-teal" aria-hidden="true" />{step.items[i].label}</li>)
                : <li className="text-muted-foreground">{simUi.groupEmpty}</li>}
            </ul>
          </div>)}
        </div>
      </div></SceneTargets> : <SceneTargets><div className={panelGrid}>
        <ol className="grid gap-[0.35rem] rounded-xl border border-line bg-card p-[0.55rem]">
          {filled.map((id, i) => <li key={id} className="flex items-baseline gap-[0.5rem]">
            <b className="text-teal">{i + 1}</b><span>{step.items[id]}</span></li>)}
          {unfinished && <li className="flex items-center gap-[0.4rem] rounded-md border border-dashed border-line p-[0.45rem] text-muted-foreground">
            <ListOrdered aria-hidden="true" className="size-[1rem] shrink-0" />{filled.length ? simUi.nextSlot : simUi.orderStart}
          </li>}
        </ol>
        {unfinished && <div className="grid gap-[0.35rem]">
          {step.items.map((_, offset) => (offset + 1) % step.items.length).map(index => {
            const used = filled.includes(index);
            return <Button type="button" key={index} variant="outline" size="touch" data-sim-option={index} disabled={used}
              onClick={() => {
                if (index !== next) { setFeedback(fill(simUi.wrong, { hint: step.hint })); return; }
                append(index, fill(simUi.arranged, { item: step.items[index] }));
              }} className="justify-start text-left text-[1rem]">
              <SceneObject label={step.items[index]} index={index} selected={used} />{step.items[index]}
            </Button>;
          })}
        </div>}
      </div></SceneTargets>}
      <p aria-live="polite" role="status" className={feedback ? noteCard : "sr-only"}>{feedback}</p>
      <div className="flex flex-wrap gap-[0.35rem]">
        {unfinished && <Button type="button" variant="ghost" size="touch" className="w-auto text-teal" onClick={reveal}>
          <Lightbulb aria-hidden="true" />{simUi.answer}</Button>}
        {filled.length > 0 && <Button type="button" variant="ghost" size="touch" className="w-auto text-teal" onClick={undo}>
          <Undo2 aria-hidden="true" />{simUi.undo}</Button>}
      </div>
    </div>
  );
}

function QuantityBench({ step, answer, onChange }: StepProps & { step: Extract<SimStep, { mode: "quantity" }> }) {
  const totals = new Map<string, number>();
  step.items.forEach((item, index) => totals.set(item.unit, (totals.get(item.unit) ?? 0) + answer.values[index]));
  function adjust(index: number, direction: number) {
    const item = step.items[index];
    const amount = Number((answer.values[index] + direction * item.step).toFixed(4));
    const values = answer.values.map((value, i) => i === index ? Math.max(item.min, Math.min(item.max, amount)) : value);
    onChange({ values, confirmed: true });
  }
  return (
    <div className={panelGrid}>
      <SceneTargets><div className={panelGrid}>{step.items.map((item, index) => <div className={noteCard} key={item.label} role="group" aria-label={item.label}>
        <p className="mb-[0.4rem] font-bold">{item.label}</p>
        <div className="grid grid-cols-[3.1rem_1fr_3.1rem] items-center gap-[0.2rem]">
          <Button type="button" size="touch" variant="outline" className="min-w-0 px-0" aria-label={fill(simUi.less, { label: item.label })}
            data-sim-less={index} disabled={answer.values[index] <= item.min} onClick={() => adjust(index, -1)}><Minus aria-hidden="true" /></Button>
          <output aria-live="polite" className="break-words text-center text-[1.2rem] font-extrabold tabular-nums text-teal">
            {fill(simUi.quantity, { n: answer.values[index], unit: item.unit })}
          </output>
          <Button type="button" size="touch" variant="outline" className="min-w-0 px-0" aria-label={fill(simUi.more, { label: item.label })}
            data-sim-more={index} disabled={answer.values[index] >= item.max} onClick={() => adjust(index, 1)}><Plus aria-hidden="true" /></Button>
        </div>
      </div>)}</div></SceneTargets>
      {step.items.length > 1 && totals.size < step.items.length && <p className="flex flex-wrap items-center gap-[0.4rem] rounded-lg bg-aqua p-[0.6rem] text-ink">
        <SlidersHorizontal aria-hidden="true" /><strong>{simUi.total}</strong>
        {Array.from(totals, ([unit, n]) => <span key={unit}>{fill(simUi.quantity, { n: Number(n.toFixed(4)), unit })}</span>)}
      </p>}
      <Button type="button" variant="outline" size="touch" data-sim-confirm aria-pressed={answer.confirmed}
        onClick={() => onChange({ ...answer, confirmed: true })}>{answer.confirmed && <Check aria-hidden="true" />}
        {answer.confirmed ? simUi.kept : simUi.keepValues}</Button>
    </div>
  );
}

function resultRows(step: SimStep, answer: SimAnswer): string[] {
  switch (step.mode) {
    case "pick":
    case "pack": return answer.values.map(i => step.options[i].label);
    case "sort": return answer.values.map((group, i) => fill(simUi.pair, { label: step.items[i].label, value: step.groups[group] }));
    case "order": return answer.values.map((idx, i) => `${i + 1}. ${step.items[idx]}`);
    case "quantity": return answer.values.map((amount, i) => fill(simUi.pair, {
      label: step.items[i].label, value: fill(simUi.quantity, { n: amount, unit: step.items[i].unit }),
    }));
  }
}

function KioskDisplay({ simulation, answers, page }: { simulation: Simulation; answers: SimAnswer[]; page: number }) {
  const rows = simulation.steps.slice(0, page + 1).flatMap((stage, index) => resultRows(stage, answers[index]));
  const Icon = programIcons[simulation.id] ?? MonitorSmartphone;
  return <div className="mx-[0.55rem] rounded-2xl border-[0.25rem] border-ink bg-card p-[0.6rem] text-ink">
    <div className="flex items-center gap-[0.55rem]">
      <div className="grid size-[2.5rem] shrink-0 place-items-center rounded-xl bg-aqua text-teal"><Icon className="size-[1.65rem]" aria-hidden="true" /></div>
      <div className="min-w-0"><strong>{simUi.workSummary}</strong>
        <p className="text-[1rem] leading-snug">{rows.length ? rows.join(" · ") : simUi.blankOrder}</p>
      </div>
    </div>
  </div>;
}

function Missions({ simulation, page, answers }: { simulation: Simulation; page: number; answers: SimAnswer[] }) {
  const completed = simulation.steps.filter((task, index) => isStepReady(task, answers[index])).length;
  return <details className="mx-[0.65rem] rounded-lg border border-edge bg-card">
    <summary className="flex min-h-[3.1rem] cursor-pointer items-center justify-between gap-[0.4rem] rounded-lg px-[0.55rem] font-semibold text-teal focus-visible:outline-2">
      <span className="flex items-center gap-[0.35rem]"><ListOrdered className="size-[1rem] shrink-0" aria-hidden="true"/>{simUi.missions}</span>
      <span className="font-normal">{fill(simUi.completedCount, { n: completed })}</span>
    </summary>
    <ol className="grid gap-[0.35rem] px-[0.55rem] pb-[0.55rem]">{simulation.steps.map((task, i) => {
      const Icon = isStepReady(task, answers[i]) ? Check : i === page ? CircleDot : Circle;
      return <li key={i} aria-current={i === page ? "step" : undefined} className="flex items-start gap-[0.35rem]">
        <Icon className="mt-[0.25rem] size-[1rem] shrink-0 text-teal" aria-hidden="true" /><span>{task.title}</span>
      </li>;
    })}</ol>
  </details>;
}

function FoodTray({ options, selected }: { options: readonly { label: string }[]; selected: number[] }) {
  return <div className="mx-[0.55rem] rounded-2xl border-2 border-line bg-edge p-[0.45rem]" role="group" aria-label={simUi.foodTray}>
    <p className="mb-[0.35rem] flex items-center gap-[0.35rem] font-semibold text-ink"><Utensils className="size-[1rem]" aria-hidden="true" />{simUi.foodTray}</p>
    <div className="grid grid-cols-2 gap-[0.3rem]">{Array.from({ length: Math.max(2, selected.length) }, (_, i) =>
      <div key={i} className="grid min-h-[2.5rem] place-items-center rounded-xl border border-line bg-card px-[0.25rem] text-center font-bold text-teal">
        {selected[i] === undefined ? <span aria-hidden="true" className="h-[0.13rem] w-[1rem] rounded-full bg-edge"/> : options[selected[i]].label}
      </div>)}
    </div>
  </div>;
}

function RhythmPads() {
  const player = useRef<AudioContext | null>(null);
  const [hits, setHits] = useState(0);
  const [last, setLast] = useState(-1);
  useEffect(() => () => {
    if (player.current) void player.current.close().catch(() => {});
  }, []);
  async function strike(pitch: number, index: number) {
    setHits(total => total + 1);
    setLast(index);
    // 사용자가 직접 두드린 순간에만 소리를 만든다. 무음 환경에서도 동작은 보인다.
    try {
      if (!window.AudioContext) return;
      const engine = player.current ?? new AudioContext();
      player.current = engine;
      if (engine.state === "suspended") await engine.resume();
      const now = engine.currentTime;
      const tone = engine.createOscillator();
      const gain = engine.createGain();
      tone.frequency.setValueAtTime(pitch, now);
      tone.frequency.exponentialRampToValueAtTime(pitch * 0.52, now + 0.13);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      tone.connect(gain).connect(engine.destination);
      tone.start(now);
      tone.stop(now + 0.17);
    } catch {
      // 기기의 소리 사용이 막혀도 두드린 횟수는 화면에 반영한다.
    }
  }
  return <div className="mx-[0.55rem] rounded-xl border border-clay bg-card p-[0.6rem]">
    <h3 className="flex items-center gap-[0.35rem] font-bold text-ink"><Volume2 aria-hidden="true" />{simUi.soundTitle}</h3>
    <p className="mb-[0.45rem]">{simUi.soundInfo}</p>
    <div className="grid grid-cols-2 gap-[0.45rem]">{[simUi.low, simUi.high].map((label, i) =>
      <Button type="button" key={label} size="touch" variant="outline" onClick={() => void strike(i ? 215 : 110, i)}
        className={`min-h-[3.4rem] rounded-full border-b-[0.3rem] px-[0.3rem] active:scale-95 ${last === i ? "border-teal bg-aqua text-teal" : "border-clay bg-muted"}`}>{label}</Button>)}</div>
    <p className="mt-[0.35rem] text-center tabular-nums" aria-live="polite">{fill(simUi.strokes, { n: hits })}</p>
  </div>;
}

function SimulationSession({ simulation }: { simulation: Simulation }) {
  const [page, setPage] = useState(-1);
  const [answers, setAnswers] = useState(() => simulation.steps.map(newSimAnswer));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const layout = layouts[simulation.kind];
  const Icon = programIcons[simulation.id] ?? layout.icon;
  const step = simulation.steps[page];
  const answer = answers[page];
  const entry = fieldEntries[simulation.id];
  const fieldPage = simulation.steps.length;
  const [fieldState, setFieldState] = useState<FieldLabState>();
  const [direct, setDirect] = useState(false);
  const [visitedLab, setVisitedLab] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const toolTitle = useRef<HTMLElement>(null);
  const enteringTool = useRef(false);
  const inField = !!entry && page === fieldPage;
  const finished = page === fieldPage + (entry ? 1 : 0);
  useEffect(() => {
    if (enteringTool.current) {
      toolTitle.current?.focus();
      enteringTool.current = false;
    } else if (moved.current) titleRef.current?.focus();
  }, [page]);
  function navigate(next: number) {
    moved.current = true;
    if (entry && next === fieldPage) setVisitedLab(true);
    setPage(next);
  }
  function update(value: SimAnswer) {
    setAnswers(previous => previous.map((old, index) => index === page ? value : old));
  }
  return (
    <section data-sim={simulation.id} className="min-w-0 overflow-hidden rounded-2xl border border-edge bg-card text-[1rem] leading-relaxed text-foreground shadow-card">
      <div className={`flex items-center justify-between gap-[0.4rem] px-[0.8rem] py-[0.45rem] font-bold ${layout.band}`}>
        <span className="flex items-center gap-[0.4rem]"><Icon aria-hidden="true" className="size-[1.2rem]" />{simUi.kind[simulation.kind]}</span>
        <span>{step ? fill(simUi.progress, { now: page + 1, total: simulation.steps.length }) : simUi.practice}</span>
      </div>
      {visitedLab && instruments[simulation.id] && <div hidden={!inField && !finished} className="px-[0.65rem] pt-[0.65rem]">
        <details open={toolOpen} onToggle={event => setToolOpen(event.currentTarget.open)} data-field-tool={simulation.id} className="rounded-xl border border-teal bg-aqua">
          <summary ref={toolTitle} className="min-h-[3.1rem] cursor-pointer content-center rounded-xl px-[0.75rem] py-[0.5rem] text-[1rem] font-bold text-teal focus-visible:outline-2">{instruments[simulation.id]}</summary>
          <div className="min-w-0 p-[0.35rem]"><ArtPractice id={simulation.id}/><JobPractice id={simulation.id}/>
            <LocalPractice id={simulation.id}/><HealthPractice id={simulation.id}/></div>
        </details>
      </div>}
      {page === -1 ? <div className="grid gap-[0.7rem] p-[0.85rem]">
        <h2 ref={titleRef} tabIndex={-1} className="text-[1.4rem] leading-snug font-extrabold text-ink">{simulation.title}</h2>
        <p>{simulation.intro}</p>
        {entry && <div className="grid gap-[0.5rem] rounded-xl border border-teal bg-aqua p-[0.75rem]">
          <h3 className="text-[1.15rem] font-bold text-ink">{entry.lab.title}</h3>
          <p>{entry.lab.brief}</p>
          <Button size="touch" type="button" variant="cta" data-field-direct onClick={() => {
            enteringTool.current = !!instruments[simulation.id]; setToolOpen(enteringTool.current);
            setDirect(true); navigate(fieldPage);
          }}>{instruments[simulation.id] ?? fieldNavigation.open}<ArrowRight aria-hidden="true" /></Button>
        </div>}
        <SimulationStage simulation={simulation} onStart={() => { setDirect(false); navigate(0); }}>
          <div className="grid min-w-0 gap-[0.55rem] rounded-xl bg-card p-[0.6rem]">
            <p className="flex flex-wrap items-center gap-x-[0.35rem] text-ink"><span>{simUi.preview}</span><strong>{simulation.artifact}</strong></p>
          </div>
        </SimulationStage>
        <Missions simulation={simulation} page={page} answers={answers} />
      </div> : inField && entry ? <FieldLabPanel entry={entry} initialState={fieldState}
        onBack={state => { setFieldState(state); navigate(direct ? -1 : fieldPage - 1); }}
        onComplete={state => { setFieldState(state); navigate(fieldPage + 1); }} /> : finished ? <div data-sim-result className="grid gap-[0.65rem] p-[0.75rem]">
        {entry && fieldState && <FieldLabResult entry={entry} state={fieldState} />}
        {!direct && <div data-basic-result className="grid gap-[0.65rem]">
        <SimulationWorkpiece simulation={simulation} answers={answers} page={page} />
        <div className={`border border-line bg-card p-[0.75rem] shadow-card ${paperStyles[simulation.kind]}`}>
          <PaperTop kind={simulation.kind} />
          <p className="flex items-center gap-[0.35rem] font-bold text-teal"><CheckCheck aria-hidden="true" />{simUi.complete}</p>
          <h2 ref={titleRef} tabIndex={-1} className="mt-[0.3rem] text-[1.35rem] leading-snug font-extrabold text-ink">{simulation.artifact}</h2>
          <dl>{simulation.steps.map((task, index) => <div key={index} className="mt-[0.65rem] border-t border-dashed border-line pt-[0.55rem]">
            <dt className="font-bold text-teal">{task.caption}</dt>
            {resultRows(task, answers[index]).map((row, i) => <dd key={i} className="mt-[0.12rem] break-words">{row}</dd>)}
          </div>)}</dl>
        </div></div>}
        <LinkButton href={simulation.sourceUrl} variant="cta">{simulation.sourceLabel}<ArrowUpRight aria-hidden="true" /></LinkButton>
        {entry && fieldState && <Button size="touch" type="button" variant="outline" data-field-edit onClick={() => {
          setFieldState({ ...fieldState, page: 0 }); navigate(fieldPage);
        }}><ArrowLeft aria-hidden="true" />{fieldNavigation.edit}</Button>}
        {!direct && <Button size="touch" type="button" variant="outline" data-sim-edit onClick={() => navigate(0)}><ArrowLeft aria-hidden="true" />{simUi.edit}</Button>}
        <Button size="touch" type="button" variant="ghost" data-sim-restart onClick={() => {
          setAnswers(simulation.steps.map(newSimAnswer)); setFieldState(undefined); setDirect(false); setVisitedLab(false); setToolOpen(false); navigate(-1);
        }}><RotateCcw aria-hidden="true" />{simUi.restart}</Button>
      </div> : <div data-step-mode={step.mode} data-step-index={page} className="grid min-w-0 gap-[0.65rem]">
        <ol className="mx-[0.75rem] mt-[0.6rem] flex gap-[0.25rem]" aria-label={simUi.missions}>
          {simulation.steps.map((task, index) => {
            const done = isStepReady(task, answers[index]);
            return <li key={index} aria-current={index === page ? "step" : undefined}
              className={`flex min-h-[1.15rem] flex-1 items-center justify-center rounded-md border ${done ? "border-teal bg-teal text-white" : index === page ? "border-teal bg-aqua text-teal" : "border-edge bg-muted text-muted-foreground"}`}>
              {done ? <Check className="size-[0.9rem]" aria-hidden="true"/>
                : <span className="text-[0.85rem] font-bold" aria-hidden="true">{index + 1}</span>}
              <span className="sr-only">{task.title}{done ? ` · ${simUi.complete}` : ""}</span>
            </li>;
          })}
        </ol>
        <div className="px-[0.75rem]">
          <h2 ref={titleRef} tabIndex={-1} className="text-[1.25rem] leading-snug font-extrabold text-ink">{step.title}</h2>
          <p className="mt-[0.35rem]">{step.instruction}</p>
        </div>
        <SimulationStage key={page} simulation={simulation} step={step} answer={answer}>
          <SimulationWorkpiece simulation={simulation} answers={answers} page={page} />
          {simulation.kind === "kiosk" && <KioskDisplay simulation={simulation} answers={answers} page={page} />}
          {simulation.id === "H13" && page === 0 && step.mode === "pack" && <FoodTray options={step.options} selected={answer.values} />}
          {simulation.id === "L16" && page === 1 && <RhythmPads />}
          {step.mode === "pick" || step.mode === "pack" ? <ChoiceBench step={step} answer={answer} onChange={update} />
            : step.mode === "quantity" ? <QuantityBench step={step} answer={answer} onChange={update} />
            : <CardBench step={step} answer={answer} onChange={update} />}
        </SimulationStage>
        <Missions simulation={simulation} page={page} answers={answers} />
        <div className="grid min-w-0 gap-[0.35rem] px-[0.7rem] pb-[0.7rem]">
          <Button type="button" variant="cta" size="touch" data-sim-next disabled={!isStepReady(step, answer)} onClick={() => navigate(page + 1)}>
            {page + 1 === simulation.steps.length ? (entry ? fieldNavigation.next : simUi.finish) : simUi.next}<ArrowRight aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="touch" data-sim-back onClick={() => navigate(page - 1)}><ArrowLeft aria-hidden="true" />{simUi.previous}</Button>
        </div>
      </div>}
    </section>
  );
}

export function SimulationPanel({ simulation }: { simulation: Simulation }) {
  return <SimulationSession key={simulation.id} simulation={simulation} />;
}
