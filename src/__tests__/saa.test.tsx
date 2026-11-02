import { vi } from 'vitest';
import { COURSE_BY_ID } from '../domain/content';
import { dailyLessonIndex, koreanDate } from '../domain/daily';
import { isChoiceCorrect, makeQuestion } from '../domain/question';
import { lessonReducer } from '../stores/lessonStore';
import { createVNode, renderElement } from '../lib';
import { QuestionView } from '../components/QuestionView';
import { CheckBar } from '../components/CheckBar';
import { selectChoice } from '../services/lessonService';

vi.mock('../components/Mascot', () => ({ Mascot: () => null }));
vi.mock('../services/lessonService', () => ({ usesTiles: () => true, pickTile: vi.fn(), unpickTile: vi.fn(), selectChoice: vi.fn(), setInputMode: vi.fn(), showHint: vi.fn(), typeAnswer: vi.fn(), check: vi.fn() }));

const course = COURSE_BY_ID.get('aws-saa')!;
it('AWS-SAA 320문제를 연결하고 복수 정답 62문제를 전부 정확히 채점한다', () => {
  expect(course.cards).toHaveLength(320);
  expect(course.cards.filter((c) => c.kind === 'mcq' && c.correctAnswers)).toHaveLength(62);
  expect(new Set(course.lessons.flatMap((l) => l.cardIds)).size).toBe(320);
  for (const card of course.cards) {
    const q = makeQuestion(card, course.cards);
    if (q.type !== 'choice') throw new Error(card.id);
    const answers = q.correctAnswers ?? [q.correct];
    const selected = q.options.flatMap((o, i) => answers.includes(o) ? [i] : []);
    expect(isChoiceCorrect(q, selected.reverse()), card.id).toBe(true);
    expect(isChoiceCorrect(q, []), card.id).toBe(false);
    if (selected.length > 1) {
      expect(isChoiceCorrect(q, selected.slice(1)), card.id).toBe(false);
      expect(isChoiceCorrect(q, [selected[0], selected[0]]), card.id).toBe(false);
      const wrong = q.options.findIndex((o) => !answers.includes(o));
      expect(isChoiceCorrect(q, [wrong, ...selected.slice(1)]), card.id).toBe(false);
    }
  }
});

it('두 답을 고르기 전 확인을 막고, 선택 취소·개수 제한·다음 문제 초기화를 처리한다', () => {
  const card = course.cards.find((c) => c.kind === 'mcq' && c.correctAnswers)!;
  const q = makeQuestion(card, course.cards);
  let s = lessonReducer(null, { type: 'START', lessonId: 'saa-day-15-1', queue: [q] })!;
  const root = document.createElement('div');
  renderElement(<CheckBar q={q} session={s} />, root);
  expect(root.querySelector<HTMLButtonElement>('#check-btn')!.disabled).toBe(true);
  s = lessonReducer(s, { type: 'SELECT', index: 0 })!;
  s = lessonReducer(s, { type: 'SELECT', index: 1 })!;
  renderElement(<CheckBar q={q} session={s} />, root);
  expect(root.querySelector<HTMLButtonElement>('#check-btn')!.disabled).toBe(false);
  expect(lessonReducer(s, { type: 'SELECT', index: 2 })!.selectedChoices).toEqual([0, 1]);
  renderElement(<QuestionView q={q} session={s} />, root);
  expect(root.querySelectorAll('[aria-pressed="true"]')).toHaveLength(2);
  (root.querySelectorAll('.choice')[4] as HTMLButtonElement).click();
  expect(selectChoice).toHaveBeenCalledWith(4);
  s = lessonReducer(s, { type: 'SELECT', index: 0 })!;
  expect(s.selectedChoices).toEqual([1]);
  expect(lessonReducer(s, { type: 'SELECT', index: 9 })!.selectedChoices).toEqual([1]);
  expect(lessonReducer(s, { type: 'CLOSE_SHEET' })!.selectedChoices).toEqual([]);
});

it('서울 자정에 날짜를 바꾸고 같은 날짜에는 항상 같은 오늘의 레슨을 연다', () => {
  expect(koreanDate(new Date('2026-11-01T14:59:59Z'))).toBe('2026-11-01');
  expect(koreanDate(new Date('2026-11-01T15:00:00Z'))).toBe('2026-11-02');
  const count = course.lessons.length;
  expect(dailyLessonIndex('2026-11-03', count)).toBe((dailyLessonIndex('2026-11-02', count) + 1) % count);
  expect(() => dailyLessonIndex('bad', count)).toThrow();
});
