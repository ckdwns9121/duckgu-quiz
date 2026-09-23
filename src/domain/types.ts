export type UnitId = 'code-c' | 'code-java' | 'code-py' | 'code-sql' | 'db' | 'net' | 'sec' | 'uml' | 'swe';

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
  /** 보기에 쓰는 짧은 설명 (첫 문장, 용어 이름은 가림) */
  short: string;
  /** "RIP / OSPF / BGP"처럼 묶은 카드를 이름별로 나눈 것. 나눌 수 없으면 빈 배열 */
  segments: { label: string; text: string }[];
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

/** 조각을 순서대로 눌러 답을 만드는 카드 (순서 맞추기, 영문 풀네임, SQL 문장) */
export interface BuildCard extends BaseCard {
  kind: 'build';
  mode: 'order' | 'fullname' | 'sql';
  /** 정답을 보여 줄 때 조각 사이에 넣을 글자 (" → ", ", ", " ") */
  join: string;
  title: string;
  q: string;
  tokens: string[];
  decoys: string[];
  explain: string;
}

/** 노트에 직접 써 둔 4지선다 문제 */
export interface McqCard extends BaseCard {
  kind: 'mcq';
  title: string;
  q: string;
  pre: string;
  options: string[];
  correct: string;
  explain: string;
}

export type Card = TermCard | AnswerCard | RelCard | RecallCard | BuildCard | McqCard;

export type Question =
  | { type: 'choice'; card: Card; label: string; say: string; prompt?: string; promptHtml?: string; options: string[]; correct: string }
  /** tiles: 폰에서 키보드 대신 누르는 답 조각 (정답 조각 + 가짜 조각을 섞은 것) */
  | { type: 'typing'; card: AnswerCard; label: string; say: string; correct: string; tiles: string[] }
  | { type: 'build'; card: BuildCard; label: string; say: string; correct: string; answer: string[]; tiles: string[] }
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
