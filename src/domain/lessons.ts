import type { Card, Lesson, Unit } from './types';

export const PER_LESSON = 6;

/** 유닛마다 카드를 6장씩 레슨으로 나눈다. 마지막 레슨이 3장보다 적으면 앞 레슨에 붙인다 */
export function buildLessons(units: Unit[], cards: Card[], size = PER_LESSON): Lesson[] {
  return units.flatMap((unit) => {
    const list = cards.filter((card) => card.unit === unit.id);
    const chunks: Card[][] = [];
    for (let i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
    if (chunks.length > 1 && chunks[chunks.length - 1].length < 3) {
      const last = chunks.pop()!;
      chunks[chunks.length - 1] = chunks[chunks.length - 1].concat(last);
    }
    return chunks.map((chunk, i) => ({ id: `${unit.id}-${i + 1}`, unit, n: i + 1, cardIds: chunk.map((c) => c.id) }));
  });
}

/** 첫 레슨은 항상 열려 있고, 그 뒤는 바로 앞 레슨을 끝내야 열린다 */
export function isUnlocked(lesson: Lesson, done: Record<string, boolean>): boolean {
  return lesson.n === 1 || Boolean(done[`${lesson.unit.id}-${lesson.n - 1}`]);
}
