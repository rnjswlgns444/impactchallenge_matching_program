"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Binoculars, Check, ClipboardList, MapPin, Minus, Plus, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/common/link-button";
import { fieldLocalUi, fill } from "@/content/text";

const box = "grid min-w-0 gap-[0.65rem] rounded-xl border border-edge bg-card p-[0.65rem] text-[1rem]";
const touch = "h-auto min-h-[3.1rem] min-w-0 whitespace-normal px-[0.55rem] text-[1rem] leading-snug";
const ink = "var(--color-ink)";
const teal = "var(--color-teal)";
const aqua = "var(--color-aqua)";
const muted = "var(--color-off)";
const clay = "var(--color-clay)";
const ui = fieldLocalUi;

function ToolCard({ title, children, icon }: { title: string; children: React.ReactNode; icon: React.ReactNode }) {
  return <section aria-label={title} className="min-w-0 rounded-xl border border-edge bg-card">
    <h3 className="flex items-center gap-[0.45rem] p-[0.65rem] font-bold text-teal">
      {icon}<span className="min-w-0 flex-1">{title}</span>
    </h3>
    <div className="grid min-w-0 gap-[0.7rem] border-t border-edge p-[0.65rem]">{children}</div>
  </section>;
}

function Stepper({ label, value, min, max, status, onChange, horizontal = false }: {
  label: string; value: number; min: number; max: number; status: string; onChange: (n: number) => void; horizontal?: boolean;
}) {
  const directions = horizontal ? [ui.eco.left, ui.eco.right] : [ui.menu.less, ui.menu.more];
  const First = horizontal ? ArrowLeft : Minus;
  const Last = horizontal ? ArrowRight : Plus;
  return <div className="grid min-w-0 gap-[0.2rem]">
    <strong>{label}</strong>
    <div className="grid grid-cols-[3.1rem_minmax(0,1fr)_3.1rem] items-center gap-[0.25rem]">
      <Button variant="outline" className={touch} disabled={value <= min} aria-label={fill(ui.menu.qtyLabel, { label, direction: directions[0] })} onClick={() => onChange(value - 1)}><First aria-hidden="true" /></Button>
      <span className="text-center font-semibold tabular-nums" aria-live="polite">{status}</span>
      <Button variant="outline" className={touch} disabled={value >= max} aria-label={fill(ui.menu.qtyLabel, { label, direction: directions[1] })} onClick={() => onChange(value + 1)}><Last aria-hidden="true" /></Button>
    </div>
  </div>;
}

function Reeds() {
  return <g fill="none" stroke={teal} strokeWidth="2.3" strokeLinecap="round">
    <path d="M22 109Q29 72 16 49M30 110Q39 78 34 42M36 109Q53 79 51 54M45 114Q53 93 65 80M23 88Q14 83 11 71M38 83Q46 73 48 61" />
    <path d="m15 48 2 9m16-17 1 10m17 3 0 9" stroke={clay} strokeWidth="4" />
  </g>;
}

function Riverbank({ viewBox = "0 0 320 168", label = ui.eco.wideAlt, cropped = false }: { viewBox?: string; label?: string; cropped?: boolean }) {
  return <svg viewBox={viewBox} className={cropped ? "block max-h-[9rem] w-full rounded-lg bg-aqua" : "block w-full"} role="img" aria-label={label}>
    <rect width="320" height="168" fill={aqua} />
    <path d="M0 42Q72 6 127 22T239 16Q273 10 320 20V39Q252 28 197 47Q132 63 86 49T0 59Z" fill={teal} opacity=".32" />
    <path d="M0 82Q52 67 99 85T193 85Q242 95 320 61V168H0Z" fill={muted}/>
    <path d="M0 86Q59 71 95 87T193 89Q257 100 320 68" fill="none" stroke={teal} strokeWidth="2" opacity=".6"/>
    <g fill="none" stroke={teal} strokeWidth="1.4" opacity=".52"><path d="M70 56q15-4 36 0m48 8q13-4 36-2m33-20q24 4 39 1m-19 17q23 5 52-4m-22 12 20-4"/></g>
    <path d="M100 119q4-14 27-20l36-3q24 3 34 18l-9 12q-29 8-72 4z" fill="var(--color-edge)" stroke={teal} strokeWidth="1.5"/>
    <path d="M127 112q5-8 11-4l5-4q6 0 8 4l6-2q6 0 7 3l-9 4-23 2z" fill={clay}/>
    <Reeds />
    <g fill="none" stroke={teal} opacity=".3" strokeLinecap="round"><path d="M63 134l8-2m147-12 6-2m44 18 5-1m-89 16 7-4m-73 1 5-1m-43-29 6-2" strokeWidth="3"/></g>
  </svg>;
}

const axisX = (n: number) => 42 + n * 28;
function MeasuringView({ zero, end, onMark }: { zero: number; end: number; onMark: (n: number) => void }) {
  return <button type="button" tabIndex={-1} className="block w-full overflow-hidden rounded-lg border border-edge text-left" aria-label={ui.eco.near}
    onClick={event => {
      if (!event.detail) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 320;
      onMark(Math.max(0, Math.min(8, Math.round((x - 42) / 28))));
    }}>
    <svg viewBox="0 0 320 170" className="block w-full cursor-crosshair" role="img" aria-label={ui.eco.sampleAlt}>
      <rect width="320" height="170" fill={muted} />
      <path d="M0 25Q78 8 141 17T320 10M0 79q30 4 48-7m204-50q32 10 57 4M8 92q22-3 34 0" fill="none" stroke="var(--color-edge)" strokeWidth="3"/>
      <g stroke={teal} opacity=".22" strokeDasharray="2 4">{Array.from({ length: 9 }, (_,i) => <path key={i} d={`M${axisX(i)} 17v122`}/>)}</g>
      <path d="M98 64q7-13 22-9q9 4 20-4q12-8 26-1q9 6 19 3q12-3 25 5q-9 12-23 12q-10-1-18 4q-13 6-25-1q-8-4-19 0q-13 3-27-9Z" fill={clay} stroke={ink} strokeWidth="1.7"/>
      <path d="m118 61 7-1m18-3 7-1m18 8 7-1m12-5 6-1" stroke={muted} opacity=".7" fill="none" strokeWidth="2" strokeLinecap="round"/>
      <g transform={`translate(${axisX(zero)},0)`}>
        <rect x="-7" y="98" width="199" height="50" rx="4" fill="var(--color-card)" stroke={ink} strokeWidth="1.5"/>
        {Array.from({length: 7}, (_,i) => <g key={i}>
          <path d={`M${28*i} 98v15m14-15v8`} stroke={ink} strokeWidth="1.5"/>
          <text x={28*i} y="133" fill={ink} textAnchor="middle" fontSize="15">{i}</text>
        </g>)}
        <path d="M0 42v57" stroke={teal} strokeWidth="2" strokeDasharray="4 3"/>
        <path d="m-5 41h10l-5 7z" fill={teal} />
      </g>
      <path d={`M${axisX(end)} 28v71`} stroke={clay} strokeWidth="2.5" strokeDasharray="3 3"/>
      <path d={`m${axisX(end)-6} 24h12l-6 8z`} fill={clay} />
    </svg>
  </button>;
}

function EcoTool() {
  const t = ui.eco;
  const [spot, setSpot] = useState<number | null>(null);
  const [detail, setDetail] = useState(false);
  const [zero, setZero] = useState(1);
  const [end, setEnd] = useState(4);
  const [checked, setChecked] = useState(false);
  const select = (i: number) => { setSpot(i); setDetail(true); };
  const spots = [[11,51], [48,64], [82,31]];
  const measured = checked && zero === 2 && end === 6;
  return <ToolCard title={t.title} icon={<Binoculars aria-hidden="true" />}>
    <p>{t.intro}</p>
    <div className="grid grid-cols-2 gap-[0.3rem]">
      <Button variant={detail ? "outline" : "default"} className={touch} aria-pressed={!detail} onClick={() => setDetail(false)}>{t.wide}</Button>
      <Button variant={detail ? "default" : "outline"} className={touch} aria-pressed={detail} disabled={spot === null} onClick={() => setDetail(true)}>{t.detail}</Button>
    </div>
    {!detail && <>
      <div className="relative overflow-hidden rounded-lg border border-edge">
        <Riverbank />
        {spots.map(([left,top],i) => <button type="button" key={i} aria-label={t.spot[i]} style={{ left: left+"%", top: top+"%" }} className="absolute flex size-[2.2rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-card bg-teal/85 text-white shadow-card focus-visible:outline-2" onClick={() => select(i)}><MapPin aria-hidden="true" /></button>)}
      </div>
      <p>{t.locate}</p>
      <div className="grid gap-[0.3rem] sm:grid-cols-3">{t.spot.map((s,i) => <Button key={s} variant="outline" className={touch} onClick={() => select(i)}>{s}</Button>)}</div>
    </>}
    {detail && spot !== null && <>
      <p aria-live="polite"><strong>{t.spot[spot]}</strong><br/>{t.hint[spot]}</p>
      {spot !== 1 && <Riverbank viewBox={spot === 0 ? "0 34 73 96" : "215 32 98 64"} label={t.spot[spot]} cropped />}
      {spot === 1 && <>
        <p>{t.ruler}</p>
        <MeasuringView zero={zero} end={end} onMark={n => {setEnd(n);setChecked(false);}} />
        <span className="sr-only">{t.sampleAlt}</span>
        <Stepper label={t.zero} horizontal min={0} max={3} value={zero} status={fill(t.pos,{n:zero})} onChange={n => {setZero(n); setChecked(false);}}/>
        <Stepper label={t.end} horizontal min={0} max={8} value={end} status={fill(t.pos,{n:end})} onChange={n => {setEnd(n); setChecked(false);}}/>
        <p className="rounded-md bg-aqua p-[0.45rem] text-center font-bold text-teal" aria-live="polite">{end < zero ? t.reverse : fill(t.difference,{n:end-zero})}</p>
        <Button variant="cta" size="touch" onClick={() => setChecked(true)}><ClipboardList aria-hidden="true"/>{t.mark}</Button>
        {checked && <div className={box} role="status">{measured ? <><strong className="text-teal">{t.record}</strong><p>{t.recordBody}</p></> : zero !== 2 ? t.wrongStart : t.wrongEnd}</div>}
      </>}
    </>}
    <LinkButton href="https://ansan.ekfem.or.kr/posts/0ktMwK7" variant="outline" className={touch}>{t.source}</LinkButton>
  </ToolCard>;
}

const recipes = [
  { base: 1500, extra: 500, wrap: 200, packPrice: 4800, packUnits: 12, price: 5000 },
  { base: 1850, extra: 250, wrap: 300, packPrice: 3600, packUnits: 12, price: 4000 },
] as const;

function MenuTool() {
  const t = ui.menu;
  const [index, setIndex] = useState(0);
  const [portion, setPortion] = useState(2);
  const [qty, setQty] = useState(3);
  const [saved, setSaved] = useState(false);
  const recipe = recipes[index];
  const unitPrice = recipe.packPrice / recipe.packUnits;
  const portionsPrice = unitPrice * portion;
  const cost = recipe.base + recipe.extra + recipe.wrap + portionsPrice;
  const margin = recipe.price - cost;
  const number = (n: number) => n.toLocaleString("ko-KR");
  const money = (n: number) => fill(t.price,{ n:number(n) });
  const count = (n: number, unit: string) => fill(t.quantity,{n,unit});
  const costs = [[t.parts[index],money(recipe.base)], [t.extras[index],money(recipe.extra)],
    [t.ingredients[index]+" · "+fill(t.eq,{price:number(unitPrice),n:portion,unit:t.units[index]}),money(portionsPrice)], [t.pack[index],money(recipe.wrap)]];
  const receipt = [[t.units,count(qty,t.products[index])],[t.gross,money(recipe.price*qty)],[t.costs,money(cost*qty)],[t.contribution,money(margin*qty)]];
  const row = ([name,value]: string[]) => <div key={name} className="flex flex-wrap items-baseline justify-between gap-x-[0.6rem] border-b border-dashed border-edge py-[0.25rem]"><dt className="min-w-0">{name}</dt><dd className="ml-auto font-bold tabular-nums">{value}</dd></div>;
  return <ToolCard title={t.title} icon={<ReceiptText aria-hidden="true"/>}>
    <p>{t.intro}</p>
    <strong>{t.recipeTitle}</strong>
    <div className="grid grid-cols-2 gap-[0.25rem]">{t.names.map((name,i) => <Button key={name} variant={i===index?"default":"outline"} className={touch} aria-pressed={i===index} onClick={() => {setIndex(i);setSaved(false);}}>{name}</Button>)}</div>
    <p className="rounded-lg bg-aqua p-[0.5rem]">{fill(t.packPrice,{ingredient:t.ingredients[index],count:recipe.packUnits,unit:t.units[index],price:number(recipe.packPrice),unitPrice:number(unitPrice)})}</p>
    <Stepper label={fill(t.portion,{ingredient:t.ingredients[index]})} min={1} max={3} value={portion} status={count(portion,t.units[index])} onChange={n => {setPortion(n);setSaved(false);}}/>
    <Stepper label={t.batch} min={1} max={6} value={qty} status={count(qty,t.products[index])} onChange={n => {setQty(n);setSaved(false);}}/>
    <div className={box}><strong>{t.each}</strong><dl>{costs.map(row)}</dl>
      <dl aria-live="polite">{[[t.sold,money(recipe.price)],[t.cost,money(cost)],[t.remains,money(margin)]].map(row)}</dl>
    </div>
    <p>{t.limit}</p>
    <Button variant="cta" size="touch" onClick={() => setSaved(true)}><ReceiptText aria-hidden="true"/>{t.write}</Button>
    {saved && <div role="status" className="grid gap-[0.45rem] rounded-lg border-2 border-dashed border-teal bg-aqua p-[0.6rem]">
      <strong className="flex items-center gap-[0.3rem] text-teal"><Check aria-hidden="true"/>{t.paper}</strong>
      <strong>{t.names[index]}</strong><dl>{receipt.map(row)}</dl><p>{t.saved}</p>
    </div>}
  </ToolCard>;
}

export function LocalPractice({ id }: { id: string }) {
  if (id === "C_ECO") return <EcoTool />;
  if (id === "JOB11") return <MenuTool />;
  return null;
}
