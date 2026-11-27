"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, CheckCheck,
  ClipboardList, FileText, FolderOpen, Hand, ListFilter, Minus, Package, Plus,
  Scale, Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { fieldUi } from "@/content/practice";
import { fill } from "@/content/text";
import {
  allocationTotal, fitsFieldRound, newFieldState, unplaced,
  type FieldAnswer, type FieldEntry, type FieldLabState, type FieldRound,
} from "@/core/field-lab";

const box = "min-w-0 rounded-xl border border-edge bg-card p-[0.75rem]";
const stack = "grid min-w-0 gap-[0.55rem]";
const sectionHeading = "flex min-w-0 items-center gap-[0.4rem] font-bold text-teal";
const icon = "size-[1.15rem] shrink-0";
const touch = "min-h-[3.1rem] text-[1rem] leading-snug whitespace-normal";
const number = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 6 });
const units = (n: number, unit: string) => fill(fieldUi.number, { n: number(n), unit });
type Changes = { answer: FieldAnswer; onChange: (answer: FieldAnswer) => void };
type Inspect = Extract<FieldRound, { mode: "inspect" }>;
type Assemble = Extract<FieldRound, { mode: "assemble" }>;
type Allocate = Extract<FieldRound, { mode: "allocate" }>;

function Documents({ round, answer, onChange }: Changes & { round: Inspect }) {
  const [opened, setOpened] = useState<number | null>(null);
  const baseId = useId();
  function open(index: number) {
    setOpened(opened === index ? null : index);
    if (!answer.viewed.includes(index)) onChange({ ...answer, viewed: [...answer.viewed, index] });
  }
  function toggle(index: number) {
    const values = answer.values.includes(index) ? answer.values.filter(i => i !== index) : [...answer.values, index];
    onChange({ ...answer, values, checked: false });
  }
  return <div className={stack}>
    <p className="rounded-lg bg-aqua p-[0.6rem] text-ink"><strong>{fieldUi.goal}</strong> · {round.target}</p>
    <p className={sectionHeading}><ListFilter className={icon} aria-hidden="true" />{fieldUi.inspect}</p>
    {round.cases.map((item, index) => {
      const marked = answer.values.includes(index);
      const visible = opened === index;
      const id = baseId + "-" + index;
      return <div key={item.label} className="overflow-hidden rounded-xl border border-line bg-card shadow-card">
        <button type="button" className={`flex w-full items-center gap-[0.5rem] px-[0.7rem] text-left font-bold text-ink hover:bg-muted focus-visible:outline-2 ${touch}`}
          onClick={() => open(index)} data-field-doc={index} aria-expanded={visible} aria-controls={id}>
          {marked ? <BookmarkCheck className={icon} aria-hidden="true"/> : <FileText className={icon} aria-hidden="true"/>}
          <span className="min-w-0 flex-1 break-words">{item.label}</span>
          {answer.viewed.includes(index) && <Check className={icon} aria-hidden="true"/>}
        </button>
        <div id={id} hidden={!visible}>
          <div className="grid gap-[0.5rem] border-t border-edge p-[0.6rem]">
            <dl className="grid gap-[0.3rem]">{item.fields.map((field, i) =>
              <div key={i} className="min-w-0 rounded-md bg-muted px-[0.6rem] py-[0.35rem]">
                <dt className="font-bold text-teal">{field.label}</dt><dd className="break-words">{field.value}</dd>
              </div>)}</dl>
            <Button type="button" variant={marked ? "default" : "outline"} size="touch" data-field-mark={index}
              aria-pressed={marked} className={touch} onClick={() => toggle(index)}>
              {marked ? <BookmarkCheck aria-hidden="true"/> : <Bookmark aria-hidden="true"/>}
              {marked ? fieldUi.unmark : fieldUi.mark}
            </Button>
          </div>
        </div>
      </div>;
    })}
    <div className={box} aria-live="polite">
      <p className={sectionHeading}><FolderOpen className={icon} aria-hidden="true" />{fieldUi.folio}</p>
      <p className="my-[0.3rem]">{fill(fieldUi.reviewed, { n: round.cases.length, read: answer.viewed.length })}</p>
      {answer.values.length ? <ul className="list-disc pl-[1.15rem]">{answer.values.map(i => <li key={i}>{round.cases[i].label}</li>)}</ul>
        : <p className="text-muted-foreground">{fieldUi.emptyFolio}</p>}
    </div>
  </div>;
}

function SortingTable({ round, answer, onChange }: Changes & { round: Assemble }) {
  const [held, setHeld] = useState<number | null>(null);
  const dragging = useRef<number | null>(null);
  const [notice, setNotice] = useState("");
  const slots = [...round.slots.map((s, i) => ({ ...s, index: i }))];
  if (round.pieces.some(piece => piece.slot === -1)) slots.push({ label: fieldUi.aside, hint: "", index: -1 });
  function move(slot: number, label: string, index: number | null) {
    if (index === null) return;
    const piece = round.pieces[index];
    onChange({ ...answer, values: answer.values.map((value, i) => i === index ? slot : value), checked: false });
    setNotice(fill(fieldUi.moved, { piece: piece.label, slot: label }));
    setHeld(null);
  }
  function pieceButton(i: number) {
    const piece = round.pieces[i];
    return <Button type="button" size="touch" variant={held === i ? "default" : "outline"} key={i}
      draggable data-field-piece={i} aria-pressed={held === i} className={`justify-start text-left ${touch}`}
      onClick={() => { setHeld(held === i ? null : i); setNotice(""); }}
      onDragStart={event => {
        dragging.current = i; setHeld(i); event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", "ANTI");
      }} onDragEnd={() => { dragging.current = null; }}>
      <Package className={icon} aria-hidden="true" />{piece.label}
    </Button>;
  }
  const remaining = round.pieces.map((_, i) => i).filter(i => answer.values[i] === unplaced);
  return <div className={stack}>
    <p className="rounded-lg bg-aqua p-[0.6rem] text-ink">{fieldUi.arrange}</p>
    <div className={box}><h4 className={sectionHeading}><Package className={icon} aria-hidden="true" />{fieldUi.remaining}</h4>
      <div className="mt-[0.4rem] grid gap-[0.3rem]">{remaining.length ? remaining.map(pieceButton) : <p>{fieldUi.empty}</p>}</div>
    </div>
    <p role="status" className="min-h-[1.35rem] break-words font-semibold text-teal">
      {held !== null ? fill(fieldUi.selected, { name: round.pieces[held].label }) : notice}
    </p>
    {slots.map(slot => <div key={slot.index} data-field-bin={slot.index}
      className={`rounded-xl border-2 border-dashed p-[0.6rem] ${held === null ? "border-edge bg-muted" : "border-teal bg-aqua"}`}
      onDragOver={event => { if (dragging.current !== null) event.preventDefault(); }}
      onDrop={event => {
        if (dragging.current === null) return;
        event.preventDefault(); move(slot.index, slot.label, dragging.current); dragging.current = null;
      }}>
      <h4 className={sectionHeading}><FolderOpen className={icon} aria-hidden="true" />{slot.label}</h4>
      {slot.hint && <p className="mt-[0.2rem]">{slot.hint}</p>}
      <div className="my-[0.4rem] grid gap-[0.3rem]">
        {round.pieces.map((_, i) => answer.values[i] === slot.index ? pieceButton(i) : null)}
      </div>
      <Button size="touch" type="button" variant="outline" data-field-slot={slot.index} disabled={held === null}
        onClick={() => move(slot.index, slot.label, held)} className={touch}>
        <Hand className={icon} aria-hidden="true" />{fieldUi.place}<span className="sr-only">{slot.label}</span>
      </Button>
    </div>)}
    {held !== null && answer.values[held] !== unplaced &&
      <Button size="touch" type="button" variant="outline" onClick={() => move(unplaced, fieldUi.remaining, held)} className={touch}>
        <Undo2 className={icon} aria-hidden="true" />{fieldUi.putBack}
      </Button>}
  </div>;
}

function Counter({ round, answer, onChange }: Changes & { round: Allocate }) {
  const total = allocationTotal(round, answer);
  const gap = Number((round.target - total).toFixed(6));
  function adjust(index: number, direction: number) {
    const token = round.tokens[index];
    const amount = Number((answer.values[index] + direction * token.step).toFixed(6));
    const values = [...answer.values];
    values[index] = Math.min(token.max, Math.max(token.min, amount));
    onChange({ ...answer, values, checked: false });
  }
  return <div className={stack}>
    <p className="rounded-lg bg-aqua p-[0.6rem] text-ink"><strong>{round.targetLabel}</strong> · {units(round.target, round.unit)}<br/>{round.rule}</p>
    {round.tokens.map((item, i) => <div key={item.label} className={box} role="group" aria-label={item.label}>
      <h4 className={sectionHeading}><Package className={icon} aria-hidden="true"/>{item.label}</h4>
      <p>{fill(fieldUi.rate, { n: 1, unit: item.unit, v: number(item.coefficient), out: round.unit })}</p>
      <div className="my-[0.45rem] grid grid-cols-[3.1rem_minmax(0,1fr)_3.1rem] items-center gap-[0.25rem]">
        <Button size="touch" variant="outline" type="button" aria-label={fill(fieldUi.less, { name: item.label })}
          className="min-w-0 px-0" data-field-less={i} disabled={answer.values[i] <= item.min} onClick={() => adjust(i, -1)}><Minus aria-hidden="true"/></Button>
        <output data-field-count={i} className="break-words text-center text-[1.18rem] font-bold tabular-nums">{units(answer.values[i], item.unit)}</output>
        <Button size="touch" variant="outline" type="button" aria-label={fill(fieldUi.more, { name: item.label })}
          className="min-w-0 px-0" data-field-more={i} disabled={answer.values[i] >= item.max} onClick={() => adjust(i, 1)}><Plus aria-hidden="true"/></Button>
      </div>
      <p className="text-right text-teal">{fill(fieldUi.part, { n: number(item.coefficient * answer.values[i]), unit: round.unit })}</p>
    </div>)}
    <div aria-live="polite" className="rounded-xl border-2 border-teal bg-card p-[0.65rem]">
      <p className={sectionHeading}><Scale className={icon} aria-hidden="true"/>{fieldUi.tally}</p>
      <p className="text-[1.2rem] font-bold tabular-nums" data-field-total>{fill(fieldUi.of, { now: number(total), target: number(round.target), unit: round.unit })}</p>
      {round.target > 0 && <progress aria-label={fieldUi.tally} className="h-[0.55rem] w-full accent-teal" max={round.target} value={Math.max(0, Math.min(total, round.target))}/>}
      <p>{gap ? fill(gap > 0 ? fieldUi.short : fieldUi.over, { n: number(Math.abs(gap)), unit: round.unit }) : fieldUi.equal}</p>
    </div>
  </div>;
}

function Correction({ round, answer }: { round: FieldRound; answer: FieldAnswer }) {
  if (!answer.checked) return null;
  const passed = fitsFieldRound(round, answer);
  const messages: string[] = [];
  if (!passed) {
    if (round.mode === "inspect") {
      if (answer.viewed.length < round.cases.length) messages.push(fieldUi.inspectAll);
      round.cases.forEach((item, i) => {
        if (answer.viewed.includes(i) && answer.values.includes(i) !== item.fit) messages.push(item.label + " · " + item.feedback);
      });
    } else if (round.mode === "assemble") {
      if (answer.values.includes(unplaced)) messages.push(fieldUi.notPlaced);
      round.pieces.forEach((piece, i) => {
        if (answer.values[i] !== unplaced && answer.values[i] !== piece.slot) messages.push(piece.label + " · " + piece.feedback);
      });
    } else {
      messages.push(round.solutionHint);
    }
  }
  return <section role="status" data-field-verdict={passed ? "pass" : "retry"}
    className={`rounded-xl border-l-4 bg-card p-[0.65rem] ${passed ? "border-teal" : "border-clay"}`}>
    <h4 className={sectionHeading}>{passed ? <CheckCheck className={icon} aria-hidden="true"/> : <Undo2 className={icon} aria-hidden="true"/>}
      {passed ? fieldUi.pass : fieldUi.retry}</h4>
    {passed ? <p>{round.why}</p> : <ul className="mt-[0.3rem] list-disc pl-[1.15rem]">
      {messages.map((message, i) => <li key={i}>{message}</li>)}
    </ul>}
  </section>;
}

export function FieldLabPanel({ entry, initialState, onBack, onComplete }: {
  entry: FieldEntry;
  initialState?: FieldLabState | null;
  onBack: (state: FieldLabState) => void;
  onComplete: (state: FieldLabState) => void;
}) {
  const [state, setState] = useState<FieldLabState>(() => initialState ?? newFieldState(entry));
  const title = useRef<HTMLHeadingElement>(null);
  const { page, answers } = state;
  const { lab } = entry;
  const round = lab.rounds[page];
  const answer = answers[page];
  const passed = answer.checked && fitsFieldRound(round, answer);
  const last = page + 1 === lab.rounds.length;
  useEffect(() => { title.current?.focus(); }, [page]);
  function change(updated: FieldAnswer) {
    setState(old => ({ ...old, answers: old.answers.map((item, i) => i === old.page ? updated : item) }));
  }
  return <section data-field-round={page} data-field-mode={round.mode}
    className="grid min-w-0 gap-[0.65rem] rounded-2xl border border-edge bg-background p-[0.65rem] text-[1rem] leading-relaxed text-ink shadow-card">
    <header className="rounded-xl bg-teal p-[0.7rem] text-white">
      <div className="flex flex-wrap justify-between gap-[0.3rem] font-bold">
        <span className="flex items-center gap-[0.3rem]"><ClipboardList className={icon} aria-hidden="true"/>{fieldUi.practice}</span>
        <span>{fill(fieldUi.step, { now: page + 1, total: lab.rounds.length })}</span>
      </div>
      <p className="mt-[0.3rem] text-[1.18rem] font-extrabold leading-snug">{lab.title}</p>
    </header>
    {page === 0 && <div className={box}><p>{lab.brief}</p></div>}
    <div className="px-[0.15rem]">
      <h2 tabIndex={-1} ref={title} className="text-[1.2rem] leading-snug font-extrabold">{round.title}</h2>
      <p className="mt-[0.2rem]">{round.instruction}</p>
    </div>
    {round.mode === "inspect" ? <Documents key={page} round={round} answer={answer} onChange={change}/>
      : round.mode === "assemble" ? <SortingTable key={page} round={round} answer={answer} onChange={change}/>
      : <Counter key={page} round={round} answer={answer} onChange={change}/>}
    <Correction round={round} answer={answer}/>
    {passed
      ? <Button size="touch" type="button" variant="cta" data-field-next className={touch}
          onClick={() => last ? onComplete(state) : setState(old => ({ ...old, page: old.page + 1 }))}>
          {last ? fieldUi.finish : fieldUi.next}<ArrowRight aria-hidden="true" />
        </Button>
      : <Button size="touch" type="button" variant="cta" data-field-check className={touch}
          onClick={() => change({ ...answer, checked: true })}><Check aria-hidden="true"/>{fieldUi.check}</Button>}
    <Button type="button" variant="ghost" size="touch" className={touch} data-field-back
      onClick={() => page === 0 ? onBack(state) : setState(old => ({ ...old, page: old.page - 1 }))}>
      <ArrowLeft aria-hidden="true"/>{fieldUi.back}
    </Button>
  </section>;
}

function WorkNotes({ round, answer }: { round: FieldRound; answer: FieldAnswer }) {
  if (round.mode === "inspect") return <div className={stack}>
    {answer.values.map(i => {
      const item = round.cases[i];
      return <div key={i} className="min-w-0 border-l-[0.18rem] border-teal pl-[0.55rem]">
        <strong>{item.label}</strong>
        {item.fields.map((field, index) => <p key={index}>{field.label} · {field.value}</p>)}
      </div>;
    })}
  </div>;
  if (round.mode === "assemble") {
    const groups = round.slots.map((slot, i) => ({ label: slot.label, pieces: round.pieces.filter((_, j) => answer.values[j] === i) }));
    const aside = round.pieces.filter((_, j) => answer.values[j] === -1);
    if (aside.length) groups.push({ label: fieldUi.aside, pieces: aside });
    return <dl className={stack}>{groups.filter(g => g.pieces.length).map(group => <div key={group.label}>
      <dt className="font-semibold text-teal">{group.label}</dt>
      <dd>{group.pieces.map(piece => piece.label).join(" · ")}</dd>
    </div>)}</dl>;
  }
  return <dl className={stack}>
    {round.tokens.map((item, i) => <div key={item.label}>
      <dt className="font-semibold text-teal">{item.label}</dt>
      <dd>{units(answer.values[i], item.unit)} → {units(answer.values[i] * item.coefficient, round.unit)}</dd>
    </div>)}
    <div><dt className="font-bold">{round.targetLabel}</dt>
      <dd>{fill(fieldUi.of, { now: number(allocationTotal(round, answer)), target: number(round.target), unit: round.unit })}</dd>
    </div>
  </dl>;
}

export function FieldLabResult({ entry, state }: { entry: FieldEntry; state: FieldLabState }) {
  return <article data-field-result className="grid min-w-0 gap-[0.6rem] rounded-xl border border-edge border-t-[0.3rem] border-t-teal bg-card p-[0.75rem] text-[1rem] leading-relaxed shadow-card">
    <p className={sectionHeading}><CheckCheck className={icon} aria-hidden="true"/>{fieldUi.made}</p>
    <h3 className="text-[1.25rem] font-extrabold">{entry.lab.artifact}</h3>
    {entry.lab.rounds.map((round, i) => <section key={i} data-field-note={i} className="grid gap-[0.35rem] border-t border-dashed border-line pt-[0.55rem]">
      <h4 className="font-bold">{round.title}</h4>
      <WorkNotes round={round} answer={state.answers[i]}/>
    </section>)}
  </article>;
}
