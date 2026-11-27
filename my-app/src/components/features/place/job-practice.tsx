"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, ClipboardCheck, FileUser, Phone } from "lucide-react";

import { LinkButton } from "@/components/common/link-button";
import { Button } from "@/components/ui/button";
import { fill, jobPracticeText as copy } from "@/content/text";

const control = "min-h-[3.1rem] w-full min-w-0 rounded-lg border border-edge bg-card px-[0.65rem] text-[1rem] text-ink focus-visible:outline-2 focus-visible:outline-teal";
const group = "grid min-w-0 gap-[0.35rem]";
const actions = "grid min-w-0 gap-[0.5rem] sm:grid-cols-2";
const icon = "size-[1.2rem] shrink-0";

function EmploymentCard() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [role, setRole] = useState("");
  const [roleNote, setRoleNote] = useState("");
  const [past, setPast] = useState("");
  const [pastNote, setPastNote] = useState("");
  const [inquiry, setInquiry] = useState<string>(copy.inquiries[0].key);
  const previousStep = useRef(step);
  const heading = useRef<HTMLHeadingElement>(null);
  const formId = useId();

  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      heading.current?.focus();
    }
  }, [step]);

  const selectedGoal = copy.goals.find(item => item.key === goal);
  const selectedRole = copy.roles.find(item => item.key === role);
  const selectedPast = copy.past.find(item => item.key === past);
  const question = copy.inquiries.find(item => item.key === inquiry) ?? copy.inquiries[0];
  const roleLabel = role === "custom" ? roleNote.trim() : selectedRole?.name;
  const pastLabel = past === "custom" ? pastNote.trim() : selectedPast?.name;
  const pastSentence = past === "custom" && pastNote.trim()
    ? fill(copy.pastSentence, { work: pastNote.trim() })
    : selectedPast?.sentence;
  const titles = [copy.goalLabel, copy.details, copy.complete];

  function clearCard() {
    setGoal("");
    setRole("");
    setRoleNote("");
    setPast("");
    setPastNote("");
    setInquiry(copy.inquiries[0].key);
    setStep(1);
  }

  return <section className="grid min-w-0 gap-[0.8rem] rounded-xl border border-edge bg-card p-[0.8rem] text-[1rem] leading-relaxed text-ink shadow-card" aria-labelledby={formId + "-title"}>
    <header className="flex min-w-0 items-start gap-[0.6rem]">
      <span className="rounded-xl bg-muted p-[0.55rem] text-teal"><FileUser aria-hidden="true" className="size-[1.5rem]" /></span>
      <div className="min-w-0">
        <h2 id={formId + "-title"} className="text-[1.25rem] font-bold">{copy.title}</h2>
        {step === 1 && <p>{copy.intro}</p>}
      </div>
    </header>
    <div className="flex min-w-0 flex-wrap items-baseline gap-[0.45rem] border-t border-edge pt-[0.65rem]">
      <span className="shrink-0 text-[1rem] font-semibold text-teal">{fill(copy.step, { now: step })}</span>
      <h3 ref={heading} tabIndex={-1} className="min-w-0 text-[1.1rem] font-bold focus-visible:outline-2">{titles[step - 1]}</h3>
    </div>
    {step === 1 && <>
      <fieldset className="grid min-w-0 gap-[0.45rem]">
        <legend className="sr-only">{copy.goalLabel}</legend>
        {copy.goals.map(item => <label key={item.key} className={`flex min-h-[3.1rem] cursor-pointer items-center gap-[0.6rem] rounded-lg border p-[0.6rem] ${goal === item.key ? "border-teal bg-muted" : "border-edge bg-card"}`}>
          <input type="radio" name={formId + "-goal"} value={item.key} checked={goal === item.key} onChange={() => setGoal(item.key)} className="size-[1rem] shrink-0 accent-teal" />
          <span className="min-w-0"><strong className="block">{item.name}</strong>{item.detail}</span>
        </label>)}
      </fieldset>
      <Button type="button" variant="cta" size="touch" disabled={!selectedGoal} onClick={() => setStep(2)}>{copy.next}<ArrowRight aria-hidden="true" className={icon} /></Button>
    </>}
    {step === 2 && <>
      <label className={group}><strong>{copy.roleLabel}</strong>
        <select className={control} value={role} onChange={event => setRole(event.target.value)}>
          <option value="">{copy.pickRole}</option>
          {copy.roles.map(item => <option value={item.key} key={item.key}>{item.name}</option>)}
          <option value="custom">{copy.other}</option>
        </select>
      </label>
      {role === "custom" && <label className={group}><strong>{copy.customRole}</strong>
        <input className={control} maxLength={80} autoComplete="off" value={roleNote} onChange={event => setRoleNote(event.target.value)} placeholder={copy.customRolePlaceholder} />
      </label>}
      <p>{copy.roleNote}</p>
      {selectedRole && <details className="rounded-lg border border-edge">
        <summary className="min-h-[3.1rem] cursor-pointer content-center px-[0.65rem] font-semibold text-teal">{copy.reference}</summary>
        <div className="p-[0.5rem] pt-0"><LinkButton href={selectedRole.url}>{selectedRole.source}</LinkButton></div>
      </details>}
      <label className={group}><strong>{copy.pastLabel}</strong>
        <select className={control} value={past} onChange={event => setPast(event.target.value)}>
          <option value="">{copy.noHistory}</option>
          {copy.past.map(item => <option value={item.key} key={item.key}>{item.name}</option>)}
          <option value="custom">{copy.other}</option>
        </select>
      </label>
      {past === "custom" && <label className={group}><strong>{copy.pastCustom}</strong>
        <input className={control} value={pastNote} autoComplete="off" maxLength={80} onChange={event => setPastNote(event.target.value)} placeholder={copy.pastPlaceholder} />
      </label>}
      {(past === "custom" || role === "custom") && <p className="rounded-lg bg-muted p-[0.5rem]">{copy.privacy}</p>}
      <label className={group}><strong>{copy.inquiryLabel}</strong>
        <select className={control} value={inquiry} onChange={event => setInquiry(event.target.value)}>
          {copy.inquiries.map(item => <option value={item.key} key={item.key}>{item.name}</option>)}
        </select>
      </label>
      <div className={actions}>
        <Button type="button" variant="outline" size="touch" onClick={() => setStep(1)}><ArrowLeft aria-hidden="true" className={icon} />{copy.back}</Button>
        <Button type="button" variant="cta" size="touch" disabled={!roleLabel} onClick={() => setStep(3)}>{copy.make}<ClipboardCheck aria-hidden="true" className={icon} /></Button>
      </div>
    </>}
    {step === 3 && selectedGoal && roleLabel && <>
      <div className="rounded-xl border border-edge border-l-4 border-l-teal bg-muted p-[0.7rem]">
        <BriefcaseBusiness className="mb-[0.4rem] size-[1.35rem] text-teal" aria-hidden="true" />
        <dl className="grid min-w-0 gap-[0.4rem]">
          {[[copy.goalSummary, selectedGoal.name], [copy.roleSummary, roleLabel], [copy.pastSummary, pastLabel], [copy.firstSummary, question.name]].map(([label, value]) => value && <div key={label} className={group}>
            <dt className="text-teal">{label}</dt><dd className="font-bold [overflow-wrap:anywhere]">{value}</dd>
          </div>)}
        </dl>
      </div>
      <div className="grid gap-[0.35rem] rounded-xl border border-edge bg-card p-[0.7rem] leading-relaxed [overflow-wrap:anywhere]">
        <p>{copy.greeting} {selectedGoal.sentence}</p>
        {pastSentence && <p>{pastSentence}</p>}
        <p>{fill(copy.roleSentence, { role: roleLabel })}</p>
        <p className="font-semibold">{question.question}</p>
      </div>
      <LinkButton href={copy.phoneHref} variant="cta"><Phone aria-hidden="true" className={icon} /><span>{copy.call}<span className="block">{copy.phone}</span></span></LinkButton>
      <div className={actions}>
        <Button type="button" variant="outline" size="touch" onClick={() => setStep(2)}>{copy.edit}</Button>
        <Button type="button" variant="ghost" size="touch" onClick={clearCard}>{copy.reset}</Button>
      </div>
    </>}
  </section>;
}

export function JobPractice({ id }: { id: string }) {
  return id === "JOB01" ? <EmploymentCard /> : null;
}
