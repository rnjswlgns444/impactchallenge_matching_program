type SimOption = { label: string; note: string };
type SimQuantity = { label: string; unit: string; min: number; max: number; initial: number; step: number };
type SimTask = {
  title: string;
  instruction: string;
  caption: string;
};

export type SimStep = SimTask & (
  | { mode: "pick"; options: readonly SimOption[] }
  | { mode: "pack"; options: readonly SimOption[]; min: number; limit: number }
  | { mode: "sort"; groups: readonly string[]; items: readonly { label: string; group: number; hint: string }[] }
  | { mode: "order"; items: readonly string[]; hint: string }
  | { mode: "quantity"; items: readonly SimQuantity[] }
);

export type Simulation = {
  id: string;
  title: string;
  intro: string;
  kind: "desk" | "kiosk" | "workshop" | "planner" | "field";
  artifact: string;
  steps: readonly SimStep[];
};

// 선택 번호, 분류한 칸, 놓은 차례, 조절한 수치를 각각 작업 순서대로 기록한다.
export type SimAnswer = { values: number[]; confirmed: boolean };

export function newSimAnswer(step: SimStep): SimAnswer {
  return {
    values: step.mode === "quantity" ? step.items.map(item => item.initial) : [],
    confirmed: false,
  };
}

export function isStepReady(step: SimStep, answer: SimAnswer): boolean {
  switch (step.mode) {
    case "pick": return answer.values.length === 1;
    case "pack": return answer.values.length >= step.min && answer.values.length <= step.limit;
    case "sort":
    case "order": return answer.values.length === step.items.length;
    case "quantity": return answer.confirmed;
  }
}
