import { vi } from 'vitest';
import { CARDS } from '../domain/content';
import { makeQuestion } from '../domain/question';
import { lessonStore } from '../stores/lessonStore';
import { progressReducer, progressStore, weakCardIds } from '../stores/progressStore';
import { answer, check } from '../services/lessonService';

vi.mock('../components/effects', () => ({ celebrateCorrect: vi.fn(), celebrateLesson: vi.fn(), loseHeart: vi.fn() }));
vi.mock('../services/sfx', () => ({ sfx: { correct: vi.fn(), wrong: vi.fn(), complete: vi.fn() } }));
vi.mock('../services/analytics', () => ({ track: vi.fn() }));
vi.mock('../router', () => ({ router: { push: vi.fn(), params: {}, route: null } }));

const card = CARDS.find(c => c.id === 'c1')!;
function start(lessonId: string | null) {
  lessonStore.dispatch({ type: 'START', lessonId, queue: [makeQuestion(card, CARDS)] });
}

describe('약점 복습 수명', () => {
  it('레슨 오답을 재도전해 맞혀도 완료 후 약점이 남고, 별도 복습 첫 정답으로 해소한다', () => {
    start('code-c-1');
    answer(false);
    lessonStore.dispatch({ type: 'CLOSE_SHEET' });
    answer(true);
    expect(lessonStore.getState()!.queue).toHaveLength(0);
    expect(weakCardIds(progressStore.getState())).toContain(card.id);
    start(null);
    answer(true);
    expect(weakCardIds(progressStore.getState())).not.toContain(card.id);
  });
  it('복습에서도 힌트를 봤거나 틀린 뒤 재시도하면 약점을 유지한다', () => {
    start('code-c-1'); answer(false);
    start(null);
    lessonStore.dispatch({ type: 'SHOW_HINT' });
    answer(true);
    expect(weakCardIds(progressStore.getState())).toContain(card.id);
    start(null); answer(false);
    lessonStore.dispatch({ type: 'CLOSE_SHEET' }); answer(true);
    expect(weakCardIds(progressStore.getState())).toContain(card.id);
  });
  it('이전 형식의 마지막 오답 기록과 코스 필터를 보존한다', () => {
    const state = { ...progressStore.getState(), cards: {
      legacy: { ok: 0, ng: 1, last: 'ng' as const },
      cleared: { ok: 1, ng: 1, last: 'ok' as const },
    } };
    expect(weakCardIds(state)).toEqual(['legacy']);
    expect(weakCardIds(state, new Set(['cleared']))).toEqual([]);
    const next = progressReducer(state, { type: 'RECORD_ANSWER', cardId: 'legacy', ok: true });
    expect(weakCardIds(next)).toEqual(['legacy']);
    expect(next.cards.legacy.ng).toBe(1);
  });
});


it('실제 확인 버튼의 채점 경로도 잘못된 리스트 구조를 거절한다', () => {
  const q = makeQuestion(CARDS.find(c => c.id === 'p5')!, CARDS);
  lessonStore.dispatch({ type: 'START', lessonId: 'code-py-1', queue: [q] });
  progressStore.dispatch({ type: 'SET_INPUT_MODE', mode: 'keyboard' });
  lessonStore.dispatch({ type: 'TYPE', text: '[1, 2, 3, 4] 3 [1, 2, 3, 4] 4' });
  check();
  expect(lessonStore.getState()!.feedback?.ok).toBe(false);
});

it('실제 조각 채점 경로는 공백 없이 출력하는 숫자를 올바르게 합친다', () => {
  const q = makeQuestion(CARDS.find(c => c.id === 'c6')!, CARDS);
  if (q.type !== 'typing') throw new Error('c6');
  lessonStore.dispatch({ type: 'START', lessonId: 'code-c-1', queue: [q] });
  progressStore.dispatch({ type: 'SET_INPUT_MODE', mode: 'tiles' });
  for (const token of ['1', '2', '3']) lessonStore.dispatch({ type: 'PICK', index: q.tiles.indexOf(token) });
  check();
  expect(lessonStore.getState()!.feedback?.ok).toBe(true);
});
