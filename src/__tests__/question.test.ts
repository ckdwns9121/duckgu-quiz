import { CARDS } from '../domain/content';
import { isTypedAnswerCorrect, makeQuestion, numberVariants } from '../domain/question';
import type { Card } from '../domain/types';

const byId = (id: string) => CARDS.find((c) => c.id === id) as Card;

describe('직접 입력 채점', () => {
  it('띄어쓰기와 따옴표는 무시한다', () => {
    expect(isTypedAnswerCorrect('7  5 7', '7 5 7')).toBe(true);
    expect(isTypedAnswerCorrect("'ell' o He", 'ell o He')).toBe(true);
  });
  it('쉼표와 괄호를 빼고 써도 정답으로 본다', () => {
    expect(isTypedAnswerCorrect('2 3 4 5', '[2, 3] [4, 5]')).toBe(true);
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
      const q = makeQuestion(byId('n-tcp'), CARDS);
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
      c.hints.forEach((h) => expect(squash(h)).not.toContain(squash((c as { answer: string }).answer)));
    });
  });
  it('용어 문제 힌트에는 용어 이름이 가려져 있다', () => {
    CARDS.filter((c) => c.kind === 'term').forEach((c) => {
      const term = (c as { term: string }).term;
      if (term.length >= 2) c.hints.forEach((h) => expect(h).not.toContain(term));
    });
  });
});
