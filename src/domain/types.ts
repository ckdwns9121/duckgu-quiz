export type UnitId = 'code-c' | 'code-java' | 'code-py' | 'code-sql' | 'db' | 'net' | 'sec' | 'uml';

interface BaseCard {
  id: string;
  unit: UnitId;
  /** 한 단계씩 여는 힌트 (정답은 가려져 있다) */
  hints: string[];
}

export interface TermPart {
  label: string;
  html: string;
  hint: boolean;
}

/** 노트의 표 한 줄: 용어와 뜻 */
export interface TermCard extends BaseCard {
  kind: 'term';
  table: string;
  col: string;
  term: string;
  sub: string;
  meaning: string;
  parts: TermPart[];
}

/** 출력값처럼 정답이 하나로 떨어지는 카드 */
export interface AnswerCard extends BaseCard {
  kind: 'answer';
  title: string;
  pre: string;
  q: string;
  answer: string;
  explain: string;
}

/** UML 관계선 그림 카드 */
export interface RelCard extends BaseCard {
  kind: 'rel';
  title: string;
  svg: string;
  explain: string;
}

/** 정답이 한 줄로 안 떨어져 스스로 확인하는 개념 카드 */
export interface RecallCard extends BaseCard {
  kind: 'recall';
  title: string;
  pre: string;
  q: string;
  mnemo: string;
  explain: string;
}

export type Card = TermCard | AnswerCard | RelCard | RecallCard;

export type Question =
  | { type: 'choice'; card: Card; label: string; say: string; prompt?: string; promptHtml?: string; options: string[]; correct: string }
  | { type: 'typing'; card: AnswerCard; label: string; say: string; correct: string }
  | { type: 'recall'; card: RecallCard; label: string; say: string };

export interface Unit {
  id: UnitId;
  name: string;
  color: string;
  dark: string;
}

export interface Lesson {
  id: string;
  unit: Unit;
  n: number;
  cardIds: string[];
}
