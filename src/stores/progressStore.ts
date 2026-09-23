import { createStorage, createStore } from '../lib';

export interface CardRecord {
  ok: number;
  ng: number;
  last: 'ok' | 'ng' | null;
}

export interface ProgressState {
  xp: number;
  streak: number;
  lastDay: string | null;
  done: Record<string, boolean>;
  cards: Record<string, CardRecord>;
  introSeen: boolean;
  sound: boolean;
}

export type ProgressAction =
  | { type: 'INTRO_SEEN' }
  | { type: 'RECORD_ANSWER'; cardId: string; ok: boolean }
  | { type: 'COMPLETE_LESSON'; lessonId: string | null; xp: number; streak: number; day: string }
  | { type: 'TOGGLE_SOUND' };

// 예전 버전(순수 HTML 앱)과 같은 키를 써서 푼 기록을 그대로 이어받는다
export const progressStorage = createStorage<ProgressState>('jcq-duo-v1');

const initialState: ProgressState = {
  xp: 0, streak: 0, lastDay: null, done: {}, cards: {}, introSeen: false, sound: true,
  ...(progressStorage.get() ?? {}),
};

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'INTRO_SEEN':
      return state.introSeen ? state : { ...state, introSeen: true };
    case 'RECORD_ANSWER': {
      const prev = state.cards[action.cardId] ?? { ok: 0, ng: 0, last: null };
      const next: CardRecord = action.ok
        ? { ...prev, ok: prev.ok + 1, last: 'ok' }
        : { ...prev, ng: prev.ng + 1, last: 'ng' };
      return { ...state, cards: { ...state.cards, [action.cardId]: next } };
    }
    case 'COMPLETE_LESSON':
      return {
        ...state,
        xp: state.xp + action.xp,
        streak: action.streak,
        lastDay: action.day,
        done: action.lessonId ? { ...state.done, [action.lessonId]: true } : state.done,
      };
    case 'TOGGLE_SOUND':
      return { ...state, sound: !state.sound };
    default:
      return state;
  }
}

export const progressStore = createStore(progressReducer, initialState);
progressStore.subscribe(() => progressStorage.set(progressStore.getState()));

export const weakCardIds = (state: ProgressState) =>
  Object.entries(state.cards).filter(([, r]) => r.last === 'ng').map(([id]) => id);
