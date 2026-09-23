import rawCards from '../data/cards.json';
import { buildLessons } from './lessons';
import type { Card } from './types';
import { UNITS } from './units';

export const CARDS = rawCards as Card[];
export const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));
export const LESSONS = buildLessons(UNITS, CARDS);
export const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));
