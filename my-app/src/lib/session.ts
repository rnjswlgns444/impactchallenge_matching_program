// 지금 답으로 알 수 있는 것: 설문을 다 했는지, 어느 유형인지.
// 판단은 core가 하고, 여기서는 자료(appData)를 묶어 넘겨 줄 뿐이다. 저장해 두지 않고 부를 때마다 답에서 다시 만든다.

import { score, type Score } from "@/core/scoring";
import { choiceQuestions, nextQuestion, surveyQuestions } from "@/core/selection";
import { PRIORITY_Q } from "@/core/table";
import { appData } from "@/data";

// 설문 화면에서 차례로 묻는 문항(12개 = 기본정보 3 + 유형 찾기 9)
export const SURVEY = surveyQuestions(appData.questions);

// 점수를 주는 문항(choice_questions.yaml의 C01~)
const CHOICE_QUESTIONS = choiceQuestions(appData.questions);
const TYPE_IDS = appData.types.map((type) => type.id);

// 아직 답하지 않은 첫 문항의 자리(0부터). 다 답했으면 문항 수와 같다
export function firstOpen(answers: Record<string, unknown>): number {
  const next = nextQuestion(answers, appData.questions);
  return next ? SURVEY.indexOf(next) : SURVEY.length;
}

export function isComplete(answers: Record<string, unknown>): boolean {
  return firstOpen(answers) === SURVEY.length;
}

// 설문을 덜 한 사람이 결과 쪽 화면에 왔을 때 보낼 곳.
// 답이 하나도 없으면 시작 화면으로 보낸다('처음으로 가기'로 답을 지운 직후에도 여기로 온다).
// 답하던 중이면 이어서 답할 문항으로 보낸다.
export function resumeHref(answers: Record<string, unknown>): string {
  return Object.keys(answers).length === 0 ? "/" : "/survey";
}

// 지금 답으로 유형을 판정한다. 설문을 다 한 뒤에만 부른다(빠진 답이 있으면 오류가 난다).
// 본인이 고른 것(Q_PRIORITY)은 지금 후보에 있을 때만 쓰인다.
export function judge(answers: Record<string, unknown>): Score {
  const priority = answers[PRIORITY_Q];
  return score(answers, CHOICE_QUESTIONS, TYPE_IDS, appData.tiebreak, typeof priority === "string" ? priority : null);
}

// 둘러보기에서 쓸 캐릭터 그림의 성별. 성별 답이 없으므로 유형 순서대로 여성·남성을 번갈아 쓴다.
export function browseGender(typeId: string): "female" | "male" {
  return appData.types.findIndex((type) => type.id === typeId) % 2 === 0 ? "female" : "male";
}
