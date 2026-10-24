import { CARDS } from '../domain/content';
import { answerTokens, isBuildCorrect, isTypedAnswerCorrect, joinAnswerTiles, makeQuestion } from '../domain/question';
import type { AnswerCard, BuildCard } from '../domain/types';
import { lessonReducer } from '../stores/lessonStore';

describe('출력값 답 조각', () => {
  it('띄어쓰기가 있으면 칸마다, 없으면 한 글자씩 나눈다', () => {
    expect(answerTokens('7 5 7')).toEqual(['7', '5', '7']);
    expect(answerTokens('3345')).toEqual(['3', '3', '4', '5']);
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
      expect(isTypedAnswerCorrect(joinAnswerTiles(picked, q.correct), q.correct), card.id).toBe(true);
    });
  });
});

describe('조각으로 만들기 문제', () => {
  const builds = CARDS.filter((c): c is BuildCard => c.kind === 'build');

  it('정보처리기사 23문제·프론트엔드 6문제가 있고, 조각에 정답이 모두 들어 있다', () => {
    expect(builds.filter((c) => !c.unit.startsWith('fe-') && !c.unit.startsWith('aws-'))).toHaveLength(23);
    expect(builds.filter((c) => c.unit.startsWith('fe-'))).toHaveLength(6);
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


describe('대표 오답 조각', () => {
  it('모든 출력값 문제에서 대표 오답도 만들 수 있고 채점은 거절한다', () => {
    for (const card of CARDS) {
      if (card.kind !== 'answer') continue;
      const q = makeQuestion(card, CARDS);
      if (q.type !== 'typing') continue;
      expect(card.wrongAnswers?.length, card.id).toBeGreaterThan(0);
      for (const wrong of card.wrongAnswers ?? []) {
        const pool = [...q.tiles];
        for (const token of answerTokens(wrong)) {
          const i = pool.indexOf(token);
          expect(i, `${card.id}: ${wrong} / ${token}`).toBeGreaterThanOrEqual(0);
          pool.splice(i, 1);
        }
        expect(isTypedAnswerCorrect(wrong, card.answer), card.id).toBe(false);
      }
    }
  });
  it('부모 메서드와 static 초기화 착각을 실제로 고를 수 있다', () => {
    for (const [id, wrong] of [['j1', 'A'], ['c6', '111']]) {
      const q = makeQuestion(CARDS.find(c => c.id === id)!, CARDS);
      if (q.type !== 'typing') throw new Error(id);
      const pool = [...q.tiles];
      for (const token of answerTokens(wrong)) {
        const i = pool.indexOf(token);
        expect(i).toBeGreaterThanOrEqual(0);
        pool.splice(i, 1);
      }
    }
  });
});
