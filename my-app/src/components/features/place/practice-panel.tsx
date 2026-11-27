"use client";

import { tasteSimulations } from "@/content/practice";
import type { Simulation } from "@/core/simulation";

import { SimulationPanel } from "./taste-simulation";

// 팀이 만든 연습 하나. 내용(content/practice.ts)이 커서 이 부품은 체험 화면이 뒤늦게 불러온다.
// 고르거나 적은 것은 화면 안에서만 쓴다. 저장하지 않고 어디로도 보내지 않는다.
const simulations: Readonly<Partial<Record<string, Simulation>>> = tasteSimulations;

export default function PracticePanel({ id }: { id: string }) {
  const simulation = simulations[id];
  return simulation ? <SimulationPanel simulation={simulation} /> : null;
}
