/**
 * 문제 품질 검사. 카드마다 문제를 여러 번 만들어 보면서
 * 답이 보이는지, 보기가 너무 긴지, 보기끼리 겹치는지, 조각이 너무 많은지를 본다.
 */
import { CARDS } from '../domain/content';
import { answerTokens, makeQuestion } from '../domain/question';
import type { Question } from '../domain/types';

const RUNS = 40;
const MAX_OPTION = 75;
const plain = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function eachQuestion(fn: (q: Question) => void) {
  for (const card of CARDS) for (let i = 0; i < RUNS; i++) fn(makeQuestion(card, CARDS));
}

describe('문제 품질', () => {
  it('스스로 채점하는 문제는 없다 (전부 앱이 채점)', () => {
    expect(CARDS.filter((c) => c.kind === 'recall').map((c) => c.id)).toEqual([]);
  });

  it('4지선다 보기는 서로 다르고, 3개 이상이고, 정답이 들어 있다', () => {
    eachQuestion((q) => {
      if (q.type !== 'choice') return;
      expect(new Set(q.options).size, q.card.id).toBe(q.options.length);
      expect(q.options.length, q.card.id).toBeGreaterThanOrEqual(3);
      expect(q.options, q.card.id).toContain(q.correct);
    });
  });

  it(`보기는 ${MAX_OPTION}자를 넘지 않는다 (폰에서 3줄 이내)`, () => {
    const long = new Set<string>();
    eachQuestion((q) => {
      if (q.type === 'choice') q.options.filter((o) => o.length > MAX_OPTION).forEach((o) => long.add(`${q.card.id}: ${o.length}자 ${o.slice(0, 30)}…`));
    });
    expect([...long]).toEqual([]);
  });

  it('뜻을 물을 때 정답 보기 안에 묻는 이름이 들어 있지 않다', () => {
    const leaks = new Set<string>();
    eachQuestion((q) => {
      if (q.type !== 'choice' || q.label !== '뜻 고르기') return;
      const asked = plain(q.say).match(/^(.*?)(?: \(.*\))?의 /)?.[1]?.trim();
      if (asked && asked.length >= 2 && q.correct.includes(asked)) leaks.add(`${q.card.id}: "${asked}"`);
    });
    expect([...leaks]).toEqual([]);
  });

  it('설명을 보고 이름을 고를 때 설명 안에 정답 이름이 들어 있지 않다', () => {
    const leaks = new Set<string>();
    eachQuestion((q) => {
      if (q.type === 'choice' && q.label === '용어 고르기' && q.prompt && q.correct.length >= 2 && q.prompt.includes(q.correct)) {
        leaks.add(`${q.card.id}: "${q.correct}"`);
      }
    });
    expect([...leaks]).toEqual([]);
  });

  it('출력값 조각은 7개를 넘지 않는다', () => {
    const many = CARDS.filter((c) => c.kind === 'answer')
      .map((c) => ({ id: c.id, n: answerTokens((c as { answer: string }).answer).length }))
      .filter((x) => x.n > 7);
    expect(many).toEqual([]);
  });

  it('조각에는 반쯤 잘린 괄호가 없다', () => {
    CARDS.filter((c) => c.kind === 'answer').forEach((c) => {
      answerTokens((c as { answer: string }).answer).forEach((t) => {
        const open = (t.match(/[[({]/g) ?? []).length;
        const close = (t.match(/[\])}]/g) ?? []).length;
        expect(open, `${c.id}: ${t}`).toBe(close);
      });
    });
  });
});
