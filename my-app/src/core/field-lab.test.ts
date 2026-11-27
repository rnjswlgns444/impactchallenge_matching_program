import { describe, expect, it } from "vitest";

import { fieldContent, tasteSimulations } from "@/content/practice";
import {
  allocationTotal, fitsFieldRound, newFieldState, unplaced,
  type FieldAnswer, type FieldEntry, type FieldRound,
} from "./field-lab";

const task = { title: "자료 확인", instruction: "예시로 조작해요.", why: "모의 자료예요.", sourceRefs: [1] };
const inspect: FieldRound = {
  ...task, mode: "inspect", target: "조건에 맞는 자료",
  cases: [true, false, true].map((fit, index) => ({
    label: String(index), fields: [{ label: "항목", value: String(index) }], fit, feedback: "확인했어요.",
  })),
};
const assemble: FieldRound = {
  ...task, mode: "assemble", slots: [{ label: "자료", hint: "맞는 자리에 놓아요." }],
  pieces: [{ label: "남길 자료", slot: 0, feedback: "맞는 자리예요." },
    { label: "뺄 자료", slot: -1, feedback: "여기에는 쓰지 않아요." }],
};
const allocate: FieldRound = {
  ...task, mode: "allocate", rule: "무게를 맞춰요.", targetLabel: "합계", unit: "단위", target: 0.8,
  solutionHint: "계수를 확인해요.", tokens: [
    { label: "묶음", unit: "개", min: 0, max: 3, step: 1, initial: 1, coefficient: 0.3 },
    { label: "낱개", unit: "개", min: 0, max: 4, step: 1, initial: 0, coefficient: 0.1 },
  ],
};
const fixture: FieldEntry = {
  sources: [], lab: { title: "연습", brief: "모의 자료예요.", artifact: "완성 메모", rounds: [inspect, assemble, allocate] },
};
const answer = (values: number[], viewed: number[] = []): FieldAnswer => ({ values, viewed, checked: false });

describe("기관별 자료 체험", () => {
  it("다시 시작하면 검토 기록과 놓은 조각이 모두 새로 만들어진다", () => {
    const first = newFieldState(fixture);
    first.answers[0].viewed.push(1);
    first.answers[1].values[0] = 0;
    expect(newFieldState(fixture)).toEqual({
      page: 0, answers: [answer([]), answer([unplaced, unplaced]), answer([1, 0])],
    });
  });

  it("모든 자료를 열고 조건에 맞는 자료만 남겨야 확인을 마친다", () => {
    expect(fitsFieldRound(inspect, answer([0, 2], [0, 2]))).toBe(false);
    expect(fitsFieldRound(inspect, answer([], [0, 1, 2]))).toBe(false);
    expect(fitsFieldRound(inspect, answer([0, 1, 2], [0, 1, 2]))).toBe(false);
    expect(fitsFieldRound(inspect, answer([0], [0, 1, 2]))).toBe(false);
    expect(fitsFieldRound(inspect, answer([2, 0], [1, 0, 2]))).toBe(true);
  });

  it("아직 놓지 않은 조각과 의도적으로 제외한 조각은 서로 다르다", () => {
    expect(unplaced).toBe(-2);
    expect(fitsFieldRound(assemble, answer([0, unplaced]))).toBe(false);
    expect(fitsFieldRound(assemble, answer([-1, 0]))).toBe(false);
    expect(fitsFieldRound(assemble, answer([0, -1]))).toBe(true);
  });

  it("조절한 수량에 각각의 계수를 적용하고 소수 오차를 정리한다", () => {
    expect(allocationTotal(allocate, answer([1, 0]))).toBe(0.3);
    expect(fitsFieldRound(allocate, answer([2, 1]))).toBe(false);
    expect(allocationTotal(allocate, answer([2, 2]))).toBe(0.8);
    expect(fitsFieldRound(allocate, answer([2, 2]))).toBe(true);
  });

  it("자체 체험 20종 각각에 고유 근거 10개 이상과 유효한 단계별 근거 번호가 있다", () => {
    const catalog: Readonly<Record<string, FieldEntry>> = fieldContent;
    expect(Object.keys(catalog)).toHaveLength(20);
    expect(Object.keys(catalog).sort()).toEqual(Object.keys(tasteSimulations).sort());
    for (const [id, { sources, lab }] of Object.entries(catalog)) {
      const urls = sources.map(source => {
        const url = new URL(source.url);
        expect(["https:", "http:"].includes(url.protocol), id).toBe(true);
        expect([source.title, source.publisher, source.kind, source.observation, source.use].every(
          value => value.trim().length > 0,
        ), id).toBe(true);
        url.hash = "";
        return url.toString();
      });
      expect(new Set(urls).size, id).toBeGreaterThan(9);
      expect(new Set(urls).size, id).toBe(sources.length);
      expect(lab.rounds.length, id).toBeGreaterThan(1);
      for (const round of lab.rounds) {
        expect(round.sourceRefs.length, id).toBeGreaterThan(0);
        expect(round.sourceRefs.every(ref => Number.isInteger(ref) && ref >= 1 && ref <= sources.length), id).toBe(true);
      }
    }
  });
});
