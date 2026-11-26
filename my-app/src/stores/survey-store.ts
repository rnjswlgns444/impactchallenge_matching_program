import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

// 설문 답 저장소. 답은 브라우저의 sessionStorage에만 둔다.
// - 새로고침해도 남고, 탭을 닫으면 지워진다.
// - 서버로 보내지 않는다.
//
// 쓰는 법
// - 화면이 그리는 중에 읽을 때: hooks/use-survey.ts의 useSurvey만 쓴다.
// - 누름 처리 안에서 읽거나 쓸 때: useSurveyStore.getState()

export type Answer = string | number | string[];

export type SurveyState = {
  answers: Record<string, Answer>; // { 문항 id: 답 }
  setAnswer: (questionId: string, answer: Answer) => void;
  reset: () => void;
};

// 저장이 막힌 브라우저(개인정보 보호 모드 등)에서도 앱이 멈추지 않게 감싼다.
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // 저장하지 못해도 화면의 답은 그대로 둔다
    }
  },
  removeItem: (name) => {
    try {
      sessionStorage.removeItem(name);
    } catch {
      // 지우지 못해도 넘어간다
    }
  },
};

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      answers: {},
      setAnswer: (questionId, answer) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
      reset: () => set({ answers: {} }),
    }),
    {
      name: "anti-survey",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ answers: state.answers }),
    }
  )
);

// 답이 하나라도 있는지. selector로도, getState()와도 쓴다.
export const hasAnswers = (state: SurveyState) =>
  Object.keys(state.answers).length > 0;
