import { CARDS } from '../domain/content';
import { isTypedAnswerCorrect, makeQuestion, numberVariants } from '../domain/question';
import type { Card } from '../domain/types';

const byId = (id: string) => CARDS.find((c) => c.id === id) as Card;

describe('직접 입력 채점', () => {
  it('공백 폭과 구분자 주변 공백은 허용한다', () => {
    expect(isTypedAnswerCorrect('7  5 7', '7 5 7')).toBe(true);
    expect(isTypedAnswerCorrect('[2,3]  [4, 5]', '[2, 3] [4, 5]')).toBe(true);
  });
  it('구조와 값 경계를 생략하면 오답이다', () => {
    expect(isTypedAnswerCorrect('2 3 4 5', '[2, 3] [4, 5]')).toBe(false);
  });
  it('중첩 구조·대소문자·숫자 경계를 보존한다', () => {
    expect(isTypedAnswerCorrect('[1, 2, 3, 4] 3 [1, 2, 3, 4] 4', '[1, 2, [3, 4]] 3 [1, 2, 3, 4] 4')).toBe(false);
    expect(isTypedAnswerCorrect('ell o he', 'ell o He')).toBe(false);
    expect(isTypedAnswerCorrect('11 2', '1 12')).toBe(false);
    expect(isTypedAnswerCorrect('123', '1 2 3')).toBe(false);
    expect(isTypedAnswerCorrect('3.5', '35')).toBe(false);
  });
  it('숫자가 다르면 오답', () => {
    expect(isTypedAnswerCorrect('7 5 6', '7 5 7')).toBe(false);
    expect(isTypedAnswerCorrect('   ', '1')).toBe(false);
  });
});

describe('문제 만들기', () => {
  it('출력값 카드는 직접 입력 문제가 된다', () => {
    const q = makeQuestion(byId('c1'), CARDS);
    expect(q.type).toBe('typing');
  });

  it('용어 카드는 정답이 들어 있는 4지선다가 된다', () => {
    for (let i = 0; i < 20; i++) {
      const q = makeQuestion(byId('d-rel'), CARDS);
      expect(q.type).toBe('choice');
      if (q.type !== 'choice') return;
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.correct);
    }
  });

  it('한글 정답은 비슷한 용어로 보기를 만든다 (개체 무결성 → 다른 무결성)', () => {
    const q = makeQuestion(byId('d-q2'), CARDS);
    expect(q.type).toBe('choice');
    if (q.type !== 'choice') return;
    expect(q.correct).toBe('개체 무결성');
    q.options.filter((o) => o !== q.correct).forEach((o) => expect(o).toContain('무결성'));
  });

  it('모든 카드가 문제로 바뀐다', () => {
    CARDS.forEach((card) => {
      const q = makeQuestion(card, CARDS);
      if (q.type === 'choice') {
        expect(q.options).toContain(q.correct);
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  it('숫자 답은 숫자를 바꾼 보기를 만든다', () => {
    const v = numberVariants('차수 4, 카디널리티 5');
    expect(v).toContain('차수 5, 카디널리티 4');
    expect(v).not.toContain('차수 4, 카디널리티 5');
  });
});

describe('힌트', () => {
  it('코드 문제 힌트에는 정답이 통째로 나오지 않는다', () => {
    const squash = (t: string) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[\s'"`,[\]{}()]/g, '');
    CARDS.filter((c) => c.kind === 'answer').forEach((c) => {
      const answer = squash((c as { answer: string }).answer);
      // 한두 글자 답("B", "1")은 아무 줄에나 들어 있을 수 있어서 긴 답만 검사한다
      if (answer.length > 3) c.hints.forEach((h) => expect(squash(h)).not.toContain(answer));
    });
  });
  it('코드 문제 대부분에 힌트가 있다', () => {
    const answers = CARDS.filter((c) => c.kind === 'answer');
    expect(answers.filter((c) => c.hints.length > 0).length).toBeGreaterThanOrEqual(answers.length - 3);
  });
  it('용어 문제 힌트에는 용어 이름이 가려져 있다', () => {
    CARDS.filter((c) => c.kind === 'term').forEach((c) => {
      const term = (c as { term: string }).term;
      if (term.length >= 2) c.hints.forEach((h) => expect(h).not.toContain(term));
    });
  });
});
