import type { Question } from '../domain/types';
import { createStore } from '../lib';

export const MAX_LIVES = 3;

export interface Outcome {
  passed: boolean;
  xp: number;
  accuracy: number;
  streak: number;
  perfect: boolean;
}

export interface LessonSession {
  /** 레슨 지도에서 연 레슨이면 id, 약점 복습이면 null */
  lessonId: string | null;
  queue: Question[];
  total: number;
  solved: number;
  lives: number;
  mistakes: number;
  /** 지금까지 연속으로 맞힌 개수. 틀리면 0 */
  combo: number;
  /** 카드별 첫 시도 결과. 정확도는 이것으로 계산한다 (다시 맞힌 건 치지 않는다) */
  firstTry: Record<string, boolean>;
  selected: number | null;
  typed: string;
  recallShown: boolean;
  feedback: { ok: boolean; question: Question } | null;
  outcome: Outcome | null;
}

export type LessonAction =
  | { type: 'START'; lessonId: string | null; queue: Question[] }
  | { type: 'SELECT'; index: number }
  | { type: 'TYPE'; text: string }
  | { type: 'SHOW_RECALL' }
  | { type: 'ANSWER'; ok: boolean; retry: Question | null; withSheet: boolean }
  | { type: 'CLOSE_SHEET' }
  | { type: 'FINISH'; outcome: Outcome };

export function lessonReducer(state: LessonSession | null, action: LessonAction): LessonSession | null {
  if (action.type === 'START') {
    return {
      lessonId: action.lessonId, queue: action.queue, total: action.queue.length, solved: 0,
      lives: MAX_LIVES, mistakes: 0, combo: 0, firstTry: {}, selected: null, typed: '', recallShown: false,
      feedback: null, outcome: null,
    };
  }
  if (!state) return state;

  switch (action.type) {
    case 'SELECT':
      return state.feedback ? state : { ...state, selected: action.index };
    case 'TYPE':
      return { ...state, typed: action.text };
    case 'SHOW_RECALL':
      return { ...state, recallShown: true };
    case 'ANSWER': {
      const current = state.queue[0];
      const cardId = current.card.id;
      const firstTry = cardId in state.firstTry ? state.firstTry : { ...state.firstTry, [cardId]: action.ok };
      // 틀린 문제는 줄 맨 뒤로 보내 레슨 안에서 다시 묻는다 (보기 순서는 새로 섞은 것으로)
      const rest = state.queue.slice(1);
      const queue = action.ok || !action.retry ? rest : [...rest, action.retry];
      return {
        ...state,
        queue,
        firstTry,
        solved: state.solved + (action.ok ? 1 : 0),
        lives: state.lives - (action.ok ? 0 : 1),
        mistakes: state.mistakes + (action.ok ? 0 : 1),
        combo: action.ok ? state.combo + 1 : 0,
        feedback: action.withSheet ? { ok: action.ok, question: current } : null,
        selected: action.withSheet ? state.selected : null,
        typed: action.withSheet ? state.typed : '',
        recallShown: false,
      };
    }
    case 'CLOSE_SHEET':
      return { ...state, feedback: null, selected: null, typed: '' };
    case 'FINISH':
      return { ...state, feedback: null, outcome: action.outcome };
    default:
      return state;
  }
}

export const lessonStore = createStore<LessonSession | null, LessonAction>(lessonReducer, null);

/** 지금 화면에 보여 줄 문제. 정답 화면이 떠 있는 동안에는 방금 푼 문제를 계속 보여 준다 */
export const currentQuestion = (s: LessonSession) => s.feedback?.question ?? s.queue[0];
