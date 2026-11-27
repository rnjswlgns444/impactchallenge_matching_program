"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { artUi as ui, fill } from "@/content/text";

const panel = "grid min-w-0 gap-3 rounded-xl border border-edge bg-card p-[0.8rem] text-[1rem] leading-snug text-ink";
const control = "min-h-[2.4rem] min-w-0 rounded-lg border border-edge px-2 py-1 text-[1rem] font-semibold focus-visible:outline-2 focus-visible:outline-teal aria-pressed:border-teal aria-pressed:bg-teal aria-pressed:text-white disabled:opacity-60";
const frames = [
  "none",
  "translate(50%, 50%) scale(1.95) translate(-33%, -48%)",
  "translate(50%, 50%) scale(1.95) translate(-72%, -54%)",
] as const;

function StillLife({ frame, guides }: { frame: number; guides: boolean }) {
  return (
    <div role="img" aria-label={ui.scenes[frame]} className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-lg border border-edge bg-muted">
      <div className="absolute inset-0 origin-top-left transition-transform duration-300 motion-reduce:transition-none" style={{
        transform: frames[frame],
        background: "repeating-linear-gradient(8deg,transparent 0 1.4rem,color-mix(in srgb,var(--color-ink) 6%,transparent) 1.45rem 1.49rem,transparent 1.54rem 2.9rem),linear-gradient(126deg,color-mix(in srgb,var(--color-cta) 24%,var(--card)),color-mix(in srgb,var(--color-cta) 46%,var(--card)) 55%,color-mix(in srgb,var(--color-ink) 18%,var(--color-cta)))",
      }}>
        <div className="absolute inset-0" style={{background:"repeating-linear-gradient(116deg,transparent 0 19%,color-mix(in srgb,var(--card) 37%,transparent) 21% 28%,transparent 30% 39%)"}} />
        <div className="absolute left-[58%] top-[44%] h-[22%] w-[28%] -rotate-12 rounded-[50%]" style={{
          border:"0.2rem solid", borderColor:"color-mix(in srgb,var(--color-ink) 43%,transparent) color-mix(in srgb,var(--color-ink) 14%,transparent) transparent color-mix(in srgb,var(--color-ink) 34%,transparent)",
          boxShadow:"inset 0.12rem 0.05rem 0 color-mix(in srgb,var(--card) 56%,transparent)",
        }} />
        <div className="absolute left-[19%] top-[39%] h-[35%] w-[38%] -rotate-12 rounded-[50%] bg-ink/15 blur-[0.22rem]" />
        <div className="absolute left-[44%] top-[42%] h-[16%] w-[15%] -rotate-12 rounded-[45%] border-[0.3rem] border-card" style={{boxShadow:"0.06rem 0.11rem 0 color-mix(in srgb,var(--color-ink) 28%,transparent)"}} />
        <div className="absolute left-[15%] top-[28%] h-[37%] w-[36%] -rotate-12 rounded-[50%] border-[0.18rem] border-card" style={{
          background:"radial-gradient(ellipse at 67% 33%,var(--card) 0 8%,transparent 29%),radial-gradient(ellipse at 57% 61%,color-mix(in srgb,var(--color-teal) 13%,var(--card)) 0 42%,color-mix(in srgb,var(--color-ink) 25%,var(--card)) 66%,var(--card) 85%)",
          boxShadow:"0.07rem 0.16rem 0 color-mix(in srgb,var(--color-ink) 23%,var(--card)),0.12rem 0.35rem 0 color-mix(in srgb,var(--color-ink) 15%,var(--card))",
        }} />
      </div>
      {guides && <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{background:"linear-gradient(90deg,transparent 33%,var(--card) 33.2% 33.5%,transparent 33.7% 66%,var(--card) 66.2% 66.5%,transparent 66.7%),linear-gradient(transparent 33%,var(--card) 33.2% 33.5%,transparent 33.7% 66%,var(--card) 66.2% 66.5%,transparent 66.7%)"}} />}
    </div>
  );
}

function PoemDesk() {
  const [frame, setFrame] = useState(0);
  const [guides, setGuides] = useState(false);
  const [proof, setProof] = useState(false);
  const [lines, setLines] = useState<string[]>([...ui.originals[0]]);
  const formId = useId();
  const labels = [ui.artTitle, ui.lineOne, ui.lineTwo];
  return (
    <section className={panel} aria-label={ui.photoTitle}>
      <h3 className="text-[1.2rem] font-bold">{ui.photoTitle}</h3>
      {!proof && <p>{ui.photoIntro}</p>}
      <figure className="grid min-w-0 gap-2 overflow-hidden rounded-xl border border-edge bg-background p-2">
        <StillLife frame={frame} guides={!proof && guides} />
        <figcaption className="grid min-w-0 gap-1 break-words px-1">
          <strong className="text-[1.15rem]">{lines[0]}</strong>
          <p className="text-[1rem]">{lines[1]}<br />{lines[2]}</p>
          <small className="text-[0.8rem] text-muted-foreground">{ui.attribution}</small>
        </figcaption>
      </figure>
      {proof ? <Button variant="outline" size="touch" onClick={() => setProof(false)}>{ui.returnEdit}</Button> : <>
        <fieldset className="grid min-w-0 gap-2">
          <legend className="mb-1 font-bold">{ui.crop}</legend>
          <div className="grid grid-cols-3 gap-1">
            {ui.frames.map((name, index) => <button key={name} type="button" className={control} aria-pressed={frame === index} onClick={() => setFrame(index)}>{name}</button>)}
          </div>
          <p className="text-muted-foreground" aria-live="polite">{ui.scenes[frame]}</p>
          <label className="flex min-h-[2.2rem] cursor-pointer items-center gap-2"><input type="checkbox" checked={guides} onChange={event => setGuides(event.target.checked)} className="size-[1.1rem] accent-teal" />{ui.guides}</label>
        </fieldset>
        <fieldset className="grid min-w-0 gap-2">
          <legend className="mb-1 font-bold">{ui.edit}</legend>
          <p>{ui.editHint}</p>
          <button type="button" className={control} onClick={() => setLines([...ui.originals[frame]])}>{ui.useSample}</button>
          {labels.map((label, index) => <div key={label} className="grid min-w-0 gap-1">
            <label htmlFor={formId + index}>{label}</label>
            <textarea id={formId + index} value={lines[index]} maxLength={90} rows={index === 0 ? 1 : 2} autoComplete="off" spellCheck={false} className="w-full min-w-0 rounded-lg border border-edge bg-card px-2 py-1 text-[1rem] focus-visible:outline-teal" onChange={event => {
              const value = event.target.value;
              setLines(previous => previous.map((line, pos) => pos === index ? value : line));
            }} />
          </div>)}
        </fieldset>
        <Button variant="cta" size="touch" disabled={lines.some(line => !line.trim())} onClick={() => setProof(true)}>{ui.proof}</Button>
      </>}
    </section>
  );
}

type Stroke = 0 | 1 | 2 | 3;
const strokes = [0, 1, 2, 3] as const;
const originalScore: Stroke[] = [0, 3, 3, 1, 3, 3, 0, 3, 3, 2, 1, 2];

// 실제 악기 녹음 대신, 양편의 높낮이가 구별되는 짧은 연습음을 기기 안에서 만든다.
function strike(context: AudioContext, stroke: Stroke) {
  if (stroke === 3 || context.state !== "running") return;
  const voices = stroke === 0 ? [112, 335] : [stroke === 1 ? 112 : 335];
  for (const frequency of voices) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const time = context.currentTime;
    oscillator.type = frequency < 200 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.63, time + 0.16);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(0.14, time + 0.009);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + 0.20);
    oscillator.connect(envelope).connect(context.destination);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(time);
    oscillator.stop(time + 0.21);
  }
}

function RhythmDesk() {
  const [score, setScore] = useState<Stroke[]>([...originalScore]);
  const [tool, setTool] = useState<Stroke>(0);
  const [sound, setSound] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [message, setMessage] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<number | null>(null);
  const mounted = useRef(false);
  const enabled = useRef(false);
  const soundAttempt = useRef<symbol | null>(null);
  const playing = cursor >= 0;
  useEffect(() => {
    mounted.current = true;
    function pauseInBackground() {
      if (document.hidden) {
        if (timer.current !== null) window.clearTimeout(timer.current);
        setCursor(-1);
      }
    }
    document.addEventListener("visibilitychange", pauseInBackground);
    return () => {
      mounted.current = false;
      enabled.current = false;
      soundAttempt.current = null;
      document.removeEventListener("visibilitychange", pauseInBackground);
      if (timer.current !== null) window.clearTimeout(timer.current);
      if (audio.current) void audio.current.close().catch(() => {});
      audio.current = null;
    };
  }, []);
  async function toggleSound() {
    const attempt = Symbol();
    soundAttempt.current = attempt;
    if (enabled.current) {
      enabled.current = false;
      setSound(false);
      if (audio.current?.state === "running") void audio.current.suspend().catch(() => {});
      return;
    }
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      await context.resume();
      if (!mounted.current || attempt !== soundAttempt.current) return;
      enabled.current = true;
      setSound(true);
      setMessage("");
      strike(context, tool);
    } catch {
      if (mounted.current && attempt === soundAttempt.current) setMessage(ui.quiet);
    }
  }
  function soundStroke(stroke: Stroke) {
    if (enabled.current && audio.current) strike(audio.current, stroke);
  }
  function play() {
    if (playing) {
      if (timer.current !== null) window.clearTimeout(timer.current);
      setCursor(-1);
      return;
    }
    setMessage("");
    function tick(index: number) {
      if (index === score.length) {
        setCursor(-1);
        setMessage(ui.finish);
        timer.current = null;
        return;
      }
      setCursor(index);
      soundStroke(score[index]);
      timer.current = window.setTimeout(() => tick(index + 1), 350);
    }
    tick(0);
  }
  return (
    <section className={panel} aria-label={ui.drumTitle}>
      <h3 className="text-[1.2rem] font-bold">{ui.drumTitle}</h3>
      <p>{ui.drumIntro}</p>
      <fieldset className="grid min-w-0 gap-2">
        <legend className="mb-1 font-bold">{ui.chooseSound}</legend>
        <div className="grid grid-cols-2 gap-1">
          {strokes.map(stroke => <button key={stroke} type="button" aria-pressed={tool === stroke} className={control} disabled={playing} onClick={() => { setTool(stroke); soundStroke(stroke); }}>
            <strong className="block">{ui.sounds[stroke]}</strong><span className="block font-normal">{ui.hands[stroke]}</span>
          </button>)}
        </div>
      </fieldset>
      <fieldset className="grid min-w-0 gap-1">
        <legend className="mb-1 font-bold">{ui.board}</legend>
        {[0, 1, 2, 3].map(beat => <div key={beat} className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-1 rounded-lg bg-muted p-1">
          <span className="px-1 font-bold">{fill(ui.beat,{n:beat + 1})}</span>
          {score.slice(beat * 3, beat * 3 + 3).map((stroke, part) => {
            const index = beat * 3 + part;
            return <button key={index} type="button" disabled={playing} aria-current={cursor === index ? "step" : undefined} aria-label={fill(ui.cell, {beat:beat + 1, part:part + 1, sound:ui.sounds[stroke]})} className={control + (cursor === index ? " border-teal bg-cta text-ink ring-2 ring-teal disabled:opacity-100" : " bg-card")} onClick={() => {
              setScore(previous => previous.map((s, i) => i === index ? tool : s));
              setMessage("");
              soundStroke(tool);
            }}>{ui.sounds[stroke]}</button>;
          })}
        </div>)}
      </fieldset>
      <p>{ui.drumHint}</p>
      <button type="button" className={control} aria-pressed={sound} onClick={toggleSound}>{ui.soundToggle} · {sound ? ui.on : ui.off}</button>
      <Button variant="cta" size="touch" onClick={play}>{playing ? ui.stop : ui.play}</Button>
      <Button variant="outline" size="touch" disabled={playing} onClick={() => {setScore([...originalScore]); setMessage("");}}>{ui.reset}</Button>
      <p className="empty:hidden" role="status">{message}</p>
    </section>
  );
}

export function ArtPractice({ id }: { id: string }) {
  if (id === "L06_PIUM_DIRECTORY") return <PoemDesk />;
  if (id === "L16") return <RhythmDesk />;
  return null;
}
