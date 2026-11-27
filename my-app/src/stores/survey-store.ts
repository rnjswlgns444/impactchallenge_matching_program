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
// 유형의 세부 질문에서 고른 것: 선택지 id 하나, 여러 개, 또는 고르지 않음
export type DetailChoice = string | string[] | null;

// AI 추가 추천의 결과(core/matcher.ts의 AiResult와 같은 모양)
export type AiState = {
  status: "ok" | "partial" | "fail" | "unclear";
  matches: { id: string; reason: string }[];
  unmatched: string[];
};

export type SurveyState = {
  answers: Record<string, Answer>; // { 문항 id: 답 }
  details: Record<string, DetailChoice>; // { 유형 id: 세부 질문의 답 } 설문 결과에서 고른 것
  browseDetails: Record<string, DetailChoice>; // 둘러보기에서 고른 것. 설문 결과와 섞이지 않게 따로 둔다
  tuned: boolean; // '조금 더 맞춰 보기' 화면을 지나왔는지. 한 번만 거친다
  wish: string; // 직접 적은 글. 기기 안에만 두고(다시 적을 때 보여 주려고) 서버에는 남기지 않는다
  ai: AiState | null; // AI 추가 추천 결과. 없으면 null
  aiPending: boolean; // AI에게 물어야 하는지. 결과 화면이 한 번 부르고 끈다
  setAnswer: (questionId: string, answer: Answer) => void;
  // 맞춰 보기를 마친다. mode: none(글 없음) / ask(AI에게 묻기) / unclear(바라는 점이 없는 글)
  finishTune: (wish: string, mode: "none" | "ask" | "unclear") => void;
  setAi: (result: AiState) => void;
  removeAnswer: (questionId: string) => void;
  setDetail: (typeId: string, choice: DetailChoice, browse?: boolean) => void;
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
      details: {},
      browseDetails: {},
      tuned: false,
      wish: "",
      ai: null,
      aiPending: false,
      // 답이 바뀌면 예전 답으로 AI가 찾아 준 것은 지운다(먼저 볼 분야를 다시 고를 때도 여기로 온다)
      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
          ai: null,
          aiPending: false,
        })),
      finishTune: (wish, mode) =>
        set({
          tuned: true,
          wish,
          ai: mode === "unclear" ? { status: "unclear", matches: [], unmatched: [] } : null,
          aiPending: mode === "ask",
        }),
      setAi: (result) => set({ ai: result, aiPending: false }),
      removeAnswer: (questionId) =>
        set((state) => ({
          answers: Object.fromEntries(Object.entries(state.answers).filter(([id]) => id !== questionId)),
        })),
      setDetail: (typeId, choice, browse = false) =>
        set((state) =>
          browse
            ? { browseDetails: { ...state.browseDetails, [typeId]: choice } }
            : { details: { ...state.details, [typeId]: choice } }
        ),
      reset: () =>
        set({ answers: {}, details: {}, browseDetails: {}, tuned: false, wish: "", ai: null, aiPending: false }),
    }),
    {
      name: "anti-survey",
      version: 3,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        answers: state.answers,
        details: state.details,
        browseDetails: state.browseDetails,
        tuned: state.tuned,
        wish: state.wish,
        ai: state.ai,
        aiPending: state.aiPending,
      }),
      // 예전 모양으로 저장된 답은 버리고 새로 시작한다
      migrate: () => ({
        answers: {},
        details: {},
        browseDetails: {},
        tuned: false,
        wish: "",
        ai: null,
        aiPending: false,
      }),
    }
  )
);

// 답이 하나라도 있는지. selector로도, getState()와도 쓴다.
export const hasAnswers = (state: SurveyState) =>
  Object.keys(state.answers).length > 0;
