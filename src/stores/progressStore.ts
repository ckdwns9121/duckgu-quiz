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
  /** 출력값 문제 입력 방식. auto면 폰은 조각, PC는 키보드 */
  inputMode: 'auto' | 'tiles' | 'keyboard';
  /** 마지막으로 연 코스. 약점 복습과 돌아가기에 쓴다 */
  course: string;
}

export type ProgressAction =
  | { type: 'INTRO_SEEN' }
  | { type: 'RECORD_ANSWER'; cardId: string; ok: boolean }
  | { type: 'COMPLETE_LESSON'; lessonId: string | null; xp: number; streak: number; day: string }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_INPUT_MODE'; mode: 'tiles' | 'keyboard' }
  | { type: 'SET_COURSE'; course: string };

// 예전 버전(순수 HTML 앱)과 같은 키를 써서 푼 기록을 그대로 이어받는다
export const progressStorage = createStorage<ProgressState>('jcq-duo-v1');

const initialState: ProgressState = {
  xp: 0, streak: 0, lastDay: null, done: {}, cards: {}, introSeen: false, sound: true, inputMode: 'auto', course: 'jeongcheogi',
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
    case 'SET_INPUT_MODE':
      return { ...state, inputMode: action.mode };
    case 'SET_COURSE':
      return state.course === action.course ? state : { ...state, course: action.course };
    default:
      return state;
  }
}

export const progressStore = createStore(progressReducer, initialState);
progressStore.subscribe(() => progressStorage.set(progressStore.getState()));

/** 마지막에 틀린 카드. 코스 카드 id 목록을 주면 그 코스 것만 */
export const weakCardIds = (state: ProgressState, only?: Set<string>) =>
  Object.entries(state.cards).filter(([id, r]) => r.last === 'ng' && (!only || only.has(id))).map(([id]) => id);
