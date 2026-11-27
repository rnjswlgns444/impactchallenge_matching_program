// 만들 때 참고한 자료는 화면에 보이지 않는다(11/28 사용자 결정). 기록은 results/programs/에 있다.
type Task = {
  title: string;
  instruction: string;
  why: string;
};

export type FieldRound = Task & (
  | {
      mode: "inspect"; target: string;
      cases: readonly { label: string; fields: readonly { label: string; value: string }[]; fit: boolean; feedback: string }[];
    }
  | {
      mode: "assemble";
      slots: readonly { label: string; hint: string }[];
      pieces: readonly { label: string; slot: number; feedback: string }[];
    }
  | {
      mode: "allocate"; target: number; targetLabel: string; rule: string; unit: string; solutionHint: string;
      tokens: readonly { label: string; unit: string; min: number; max: number; initial: number; step: number; coefficient: number }[];
    }
);

export type FieldLab = {
  title: string; brief: string; artifact: string; rounds: readonly FieldRound[];
};
export type FieldEntry = { lab: FieldLab };

// 검토한 문서 번호와 실습값은 화면 수명 동안만 유지한다.
export type FieldAnswer = { values: number[]; viewed: number[]; checked: boolean };
export type FieldLabState = { page: number; answers: FieldAnswer[] };
export const unplaced = -2;

export function newFieldState(entry: FieldEntry): FieldLabState {
  return {
    page: 0,
    answers: entry.lab.rounds.map(round => ({
      values: round.mode === "assemble" ? round.pieces.map(() => unplaced)
        : round.mode === "allocate" ? round.tokens.map(t => t.initial) : [],
      viewed: [], checked: false,
    })),
  };
}

export function allocationTotal(round: Extract<FieldRound, { mode: "allocate" }>, answer: FieldAnswer): number {
  return Number(round.tokens.reduce((sum, token, i) => sum + token.coefficient * answer.values[i], 0).toFixed(6));
}

export function fitsFieldRound(round: FieldRound, answer: FieldAnswer): boolean {
  switch (round.mode) {
    case "inspect":
      return round.cases.every((item, i) => answer.viewed.includes(i) && item.fit === answer.values.includes(i));
    case "assemble":
      return round.pieces.every((item, i) => item.slot === answer.values[i]);
    case "allocate":
      return Math.abs(allocationTotal(round, answer) - round.target) < 0.00001;
  }
}
