import courseConfig from '../data/courses.json';
import awsCards from '../data/cards/aws.json';
import frontendCards from '../data/cards/frontend.json';
import jeongcheogiCards from '../data/cards/jeongcheogi.json';
import { buildLessons } from './lessons';
import type { Card, Course, Lesson } from './types';

// 코스를 늘리면 content/<코스>/에 문제를 쓰고 `pnpm content`로 만든 카드를 여기 이어 준다
const CARDS_BY_COURSE: Record<string, Card[]> = {
  jeongcheogi: jeongcheogiCards as Card[],
  frontend: frontendCards as Card[],
  aws: awsCards as Card[],
};

export const COURSES: Course[] = courseConfig.courses.map((c) => {
  const cards = CARDS_BY_COURSE[c.id] ?? [];
  return { ...c, cards, lessons: buildLessons(c.units, cards) };
});
/** 아직 문제가 없는 코스. 코스 목록에 '준비 중'으로만 보인다 */
export const SOON_COURSES: { name: string; icon: string }[] = courseConfig.soon;
export const COURSE_BY_ID = new Map(COURSES.map((c) => [c.id, c]));
export const DEFAULT_COURSE = COURSES[0];

export const CARDS: Card[] = COURSES.flatMap((c) => c.cards);
export const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));
export const LESSONS: Lesson[] = COURSES.flatMap((c) => c.lessons);
export const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));

const COURSE_OF_UNIT = new Map(COURSES.flatMap((c) => c.units.map((u) => [u.id, c] as const)));
/** 카드가 속한 코스. 보기(오답)는 같은 코스 카드에서만 고른다 */
export const courseOfCard = (card: Card): Course => COURSE_OF_UNIT.get(card.unit) ?? DEFAULT_COURSE;
export const courseOfLesson = (lesson: Lesson): Course => COURSE_OF_UNIT.get(lesson.unit.id) ?? DEFAULT_COURSE;
