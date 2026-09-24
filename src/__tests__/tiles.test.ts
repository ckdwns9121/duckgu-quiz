import { CARDS } from '../domain/content';
import { answerTokens, decoyTokens, isBuildCorrect, isTypedAnswerCorrect, makeQuestion } from '../domain/question';
import type { AnswerCard, BuildCard } from '../domain/types';
import { lessonReducer } from '../stores/lessonStore';

describe('출력값 답 조각', () => {
  it('띄어쓰기가 있으면 칸마다, 없으면 한 글자씩 나눈다', () => {
    expect(answerTokens('7 5 7')).toEqual(['7', '5', '7']);
    expect(answerTokens('3345')).toEqual(['3', '3', '4', '5']);
  });

  it('가짜 조각은 정답 조각과 겹치지 않는다', () => {
    const tokens = ['7', '5', '7'];
    decoyTokens(tokens).forEach((d) => expect(tokens).not.toContain(d));
    expect(decoyTokens(['true', 'false']).every((d) => d !== 'true' && d !== 'false')).toBe(true);
  });

  it('코드 문제는 모두 조각만으로 정답을 만들 수 있다', () => {
    CARDS.filter((c): c is AnswerCard => c.kind === 'answer').forEach((card) => {
      const q = makeQuestion(card, CARDS);
      if (q.type !== 'typing') return;
      const pool = [...q.tiles];
      const picked = answerTokens(card.answer).map((t) => {
        const i = pool.indexOf(t);
        expect(i, `${card.id}: 조각 "${t}"이 없음`).toBeGreaterThan(-1);
        pool.splice(i, 1);
        return t;
      });
      expect(isTypedAnswerCorrect(picked.join(' '), q.correct), card.id).toBe(true);
    });
  });
});

describe('조각으로 만들기 문제', () => {
  const builds = CARDS.filter((c): c is BuildCard => c.kind === 'build');

  it('정보처리기사 23문제·프론트엔드 4문제가 있고, 조각에 정답이 모두 들어 있다', () => {
    expect(builds.filter((c) => !c.unit.startsWith('fe-'))).toHaveLength(23);
    expect(builds.filter((c) => c.unit.startsWith('fe-'))).toHaveLength(4);
    builds.forEach((card) => {
      const q = makeQuestion(card, CARDS);
      expect(q.type).toBe('build');
      if (q.type !== 'build') return;
      expect(q.tiles).toHaveLength(card.tokens.length + card.decoys.length);
      card.tokens.forEach((t) => expect(q.tiles).toContain(t));
    });
  });

  it('순서가 하나라도 다르면 오답', () => {
    const osi = builds.find((c) => c.id === 'b-osi')!;
    expect(isBuildCorrect(osi.tokens, osi.tokens)).toBe(true);
    const swapped = [...osi.tokens];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    expect(isBuildCorrect(swapped, osi.tokens)).toBe(false);
    expect(isBuildCorrect(osi.tokens.slice(0, -1), osi.tokens)).toBe(false);
  });
});

describe('조각 고르기 상태', () => {
  it('같은 조각은 두 번 못 고르고, 답 줄에서 누르면 빠진다', () => {
    const card = CARDS.find((c) => c.id === 'b-3way')!;
    let s = lessonReducer(null, { type: 'START', lessonId: 'net-1', queue: [makeQuestion(card, CARDS)] })!;
    s = lessonReducer(s, { type: 'PICK', index: 2 })!;
    s = lessonReducer(s, { type: 'PICK', index: 2 })!;
    s = lessonReducer(s, { type: 'PICK', index: 0 })!;
    expect(s.picked).toEqual([2, 0]);
    s = lessonReducer(s, { type: 'UNPICK', position: 0 })!;
    expect(s.picked).toEqual([0]);
  });
});

describe('순서 맞추기 조각', () => {
  it('순서 맞추기에는 안 쓰는 조각이 없다 (나온 조각을 전부 쓰면 된다)', () => {
    CARDS.filter((c): c is BuildCard => c.kind === 'build' && c.mode === 'order').forEach((c) => {
      expect(c.decoys, c.id).toEqual([]);
    });
  });
});
