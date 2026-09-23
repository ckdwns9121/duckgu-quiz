import { buildLessons, isUnlocked } from '../domain/lessons';
import { lessonXp, nextStreak, visibleStreak } from '../domain/streak';
import { CARDS } from '../domain/content';
import { UNITS } from '../domain/units';
import { lessonReducer, MAX_LIVES } from '../stores/lessonStore';
import { makeQuestion } from '../domain/question';

describe('레슨 나누기', () => {
  const lessons = buildLessons(UNITS, CARDS);
  it('모든 카드가 정확히 한 레슨에 들어간다', () => {
    const ids = lessons.flatMap((l) => l.cardIds);
    expect(ids).toHaveLength(CARDS.length);
    expect(new Set(ids).size).toBe(CARDS.length);
  });
  it('3장 미만 자투리 레슨은 만들지 않는다', () => {
    lessons.forEach((l) => expect(l.cardIds.length).toBeGreaterThanOrEqual(3));
  });
  it('앞 레슨을 끝내야 다음 레슨이 열린다', () => {
    const [first, second] = lessons.filter((l) => l.unit.id === 'db');
    expect(isUnlocked(first, {})).toBe(true);
    expect(isUnlocked(second, {})).toBe(false);
    expect(isUnlocked(second, { [first.id]: true })).toBe(true);
  });
});

describe('스트릭과 XP', () => {
  const now = new Date(2026, 8, 23);
  it('어제 했으면 +1, 오늘 이미 했으면 그대로, 하루 빠지면 1부터', () => {
    expect(nextStreak(3, '2026-09-22', now)).toBe(4);
    expect(nextStreak(3, '2026-09-23', now)).toBe(3);
    expect(nextStreak(3, '2026-09-20', now)).toBe(1);
  });
  it('끊긴 스트릭은 0으로 보인다', () => {
    expect(visibleStreak(5, '2026-09-22', now)).toBe(5);
    expect(visibleStreak(5, '2026-09-19', now)).toBe(0);
  });
  it('만점과 첫 클리어는 보너스', () => {
    expect(lessonXp({ mistakes: 0, firstClear: true })).toBe(20);
    expect(lessonXp({ mistakes: 2, firstClear: false })).toBe(10);
  });
});

describe('레슨 진행 리듀서', () => {
  const q1 = makeQuestion(CARDS[0], CARDS);
  const q2 = makeQuestion(CARDS[1], CARDS);
  const started = lessonReducer(null, { type: 'START', lessonId: 'code-c-1', queue: [q1, q2] })!;

  it('틀리면 하트가 줄고 그 문제가 맨 뒤로 간다', () => {
    const retry = makeQuestion(CARDS[0], CARDS);
    const s = lessonReducer(started, { type: 'ANSWER', ok: false, retry, withSheet: true })!;
    expect(s.lives).toBe(MAX_LIVES - 1);
    expect(s.queue.map((q) => q.card.id)).toEqual([CARDS[1].id, CARDS[0].id]);
    expect(s.feedback?.ok).toBe(false);
    expect(s.firstTry[CARDS[0].id]).toBe(false);
  });

  it('다시 맞혀도 첫 시도 기록은 바뀌지 않는다', () => {
    let s = lessonReducer(started, { type: 'ANSWER', ok: false, retry: q1, withSheet: false })!;
    s = lessonReducer(s, { type: 'ANSWER', ok: true, retry: null, withSheet: false })!;
    s = lessonReducer(s, { type: 'ANSWER', ok: true, retry: null, withSheet: false })!;
    expect(s.queue).toHaveLength(0);
    expect(s.solved).toBe(2);
    expect(s.firstTry[CARDS[0].id]).toBe(false);
  });

  it('연속 정답 수를 세고, 틀리면 0으로 돌아간다', () => {
    let s = lessonReducer(started, { type: 'ANSWER', ok: true, retry: null, withSheet: false })!;
    expect(s.combo).toBe(1);
    s = lessonReducer(s, { type: 'ANSWER', ok: false, retry: q2, withSheet: false })!;
    expect(s.combo).toBe(0);
  });
});
