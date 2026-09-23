import { CARD_BY_ID, CARDS, LESSON_BY_ID } from '../domain/content';
import { isBuildCorrect, isTypedAnswerCorrect, makeQuestion, shuffle } from '../domain/question';
import { dayKey, lessonXp, nextStreak, visibleStreak } from '../domain/streak';
import type { Card } from '../domain/types';
import { router } from '../router';
import { currentQuestion, lessonStore } from '../stores/lessonStore';
import { progressStore, weakCardIds } from '../stores/progressStore';
import { celebrateCorrect, celebrateLesson, loseHeart } from '../components/effects';
import { sfx } from './sfx';
import { prefersAutoFocus } from './viewport';

const PRACTICE_SIZE = 8;

function begin(lessonId: string | null, cards: Card[]) {
  // 레슨마다 문제 순서를 섞는다 (같은 레슨을 다시 해도 순서를 외워서 풀지 않게)
  lessonStore.dispatch({ type: 'START', lessonId, queue: shuffle(cards).map((card) => makeQuestion(card, CARDS)) });
}

/** 레슨 지도에서 누른 레슨 시작 */
export function startLesson(lessonId: string) {
  const lesson = LESSON_BY_ID.get(lessonId);
  if (!lesson) return router.push('/', { replace: true });
  begin(lessonId, lesson.cardIds.map((id) => CARD_BY_ID.get(id)!));
  if (router.params.id !== lessonId) router.push(`/lesson/${lessonId}`);
}

/** 마지막에 틀린 카드만 골라 복습 */
export function startPractice() {
  const ids = shuffle(weakCardIds(progressStore.getState())).slice(0, PRACTICE_SIZE);
  if (!ids.length) return router.push('/', { replace: true });
  begin(null, ids.map((id) => CARD_BY_ID.get(id)!).filter(Boolean));
  if (router.route?.path !== '/practice') router.push('/practice');
}

export const selectChoice = (index: number) => lessonStore.dispatch({ type: 'SELECT', index });
export const typeAnswer = (text: string) => lessonStore.dispatch({ type: 'TYPE', text });
export const pickTile = (index: number) => lessonStore.dispatch({ type: 'PICK', index });
export const unpickTile = (position: number) => lessonStore.dispatch({ type: 'UNPICK', position });
export const setInputMode = (mode: 'tiles' | 'keyboard') => progressStore.dispatch({ type: 'SET_INPUT_MODE', mode });

/** 출력값 문제를 조각으로 풀지. 직접 고른 적이 없으면 폰(터치)은 조각, PC는 키보드 */
export function usesTiles(): boolean {
  const { inputMode } = progressStore.getState();
  return inputMode === 'auto' ? !prefersAutoFocus() : inputMode === 'tiles';
}
export const showRecall = () => lessonStore.dispatch({ type: 'SHOW_RECALL' });
export const showHint = () => lessonStore.dispatch({ type: 'SHOW_HINT' });

/** "확인" 버튼: 고른 보기나 입력한 답을 채점한다 */
export function check() {
  const s = lessonStore.getState();
  if (!s || s.feedback) return;
  const q = currentQuestion(s);
  // 폰 키보드를 닫아야 해설 시트가 키보드에 가리지 않는다
  (document.activeElement as HTMLElement | null)?.blur?.();
  if (q.type === 'choice' && s.selected !== null) answer(q.options[s.selected] === q.correct);
  if (q.type === 'build' && s.picked.length) answer(isBuildCorrect(s.picked.map((i) => q.tiles[i]), q.answer));
  if (q.type === 'typing' && usesTiles() && s.picked.length) {
    answer(isTypedAnswerCorrect(s.picked.map((i) => q.tiles[i]).join(' '), q.correct));
  } else if (q.type === 'typing' && !usesTiles() && s.typed.trim()) answer(isTypedAnswerCorrect(s.typed, q.correct));
}

/** 채점 결과 반영. 떠올려 보기는 스스로 채점하므로 해설 시트 없이 바로 다음으로 넘어간다 */
export function answer(ok: boolean) {
  const s = lessonStore.getState();
  if (!s || s.feedback) return;
  const q = currentQuestion(s);
  // 효과를 터뜨릴 위치: 고른 보기 → 입력칸 → 버튼 순서로 찾는다 (렌더 전에 잡아 둔다)
  const origin = document.querySelector('.choice.sel') ?? document.getElementById('answer') ?? document.querySelector('.tile-line') ?? document.querySelector('.check-bar .btn:last-child');
  progressStore.dispatch({ type: 'RECORD_ANSWER', cardId: q.card.id, ok });
  if (ok) {
    sfx.correct();
    celebrateCorrect(origin, s.combo + 1);
  } else {
    sfx.wrong();
    loseHeart();
  }
  const withSheet = q.type !== 'recall';
  lessonStore.dispatch({ type: 'ANSWER', ok, retry: ok ? null : makeQuestion(q.card, CARDS), withSheet });
  if (!withSheet) proceed();
}

/** 해설 시트의 "계속" */
export function continueLesson() {
  lessonStore.dispatch({ type: 'CLOSE_SHEET' });
  proceed();
}

function proceed() {
  const s = lessonStore.getState();
  if (!s) return;
  if (s.lives <= 0) finish(false);
  else if (s.queue.length === 0) finish(true);
}

function finish(passed: boolean) {
  const s = lessonStore.getState()!;
  const firsts = Object.values(s.firstTry);
  const accuracy = firsts.length ? Math.round((firsts.filter(Boolean).length / firsts.length) * 100) : 0;
  const progress = progressStore.getState();
  let xp = 0;
  let streak = visibleStreak(progress.streak, progress.lastDay);

  if (passed) {
    xp = lessonXp({ mistakes: s.mistakes, firstClear: Boolean(s.lessonId && !progress.done[s.lessonId]) });
    streak = nextStreak(progress.streak, progress.lastDay);
    progressStore.dispatch({ type: 'COMPLETE_LESSON', lessonId: s.lessonId, xp, streak, day: dayKey() });
    sfx.complete();
    setTimeout(celebrateLesson, 150);
  }
  lessonStore.dispatch({ type: 'FINISH', outcome: { passed, xp, accuracy, streak, perfect: passed && s.mistakes === 0 } });
  router.push('/result', { replace: true });
}

export function quitLesson() {
  router.push('/');
}

export function retryLesson() {
  const s = lessonStore.getState();
  if (s?.lessonId) startLesson(s.lessonId);
  else startPractice();
}
