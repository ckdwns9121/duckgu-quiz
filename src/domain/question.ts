import type { AnswerCard, Card, Question, TermCard } from './types';

export type Rng = () => number;

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const uniq = <T>(items: T[]) => [...new Set(items)];

/** 정답과 다른 보기를 n개 뽑는다 */
function distractors(pool: string[], correct: string, n: number, rng: Rng): string[] {
  return shuffle(uniq(pool.filter((x) => x && x !== correct)), rng).slice(0, n);
}

/** 한글 답인데 비슷한 용어가 없을 때 쓰는 보기 */
const CUSTOM_OPTIONS: Record<string, string[]> = {
  s7: ['80만 포함', '90만 포함', '둘 다 포함 안 됨'],
  s8: ['DESC (내림차순)', '입력한 순서 그대로', '무작위 순서'],
};

/** "차수 4, 카디널리티 5" 같은 답은 숫자를 바꿔 헷갈리는 보기를 만든다 */
export function numberVariants(answer: string): string[] {
  const nums = answer.match(/-?\d+/g) ?? [];
  const out: string[] = [];
  if (nums.length >= 2) {
    const reversed = [...nums].reverse();
    let i = 0;
    out.push(answer.replace(/-?\d+/g, () => reversed[i++]));
  }
  nums.forEach((n) => {
    out.push(answer.replace(n, String(Number(n) + 1)));
    out.push(answer.replace(n, String(Number(n) - 1)));
  });
  return uniq(out.filter((x) => x !== answer));
}

const escapeText = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

/** 카드 한 장을 문제 하나로 바꾼다. 같은 카드도 부를 때마다 보기 순서와 방향이 달라진다 */
export function makeQuestion(card: Card, all: Card[], rng: Rng = Math.random): Question {
  switch (card.kind) {
    case 'term':
      return termQuestion(card, all, rng);
    case 'rel': {
      const names = all.filter((c) => c.kind === 'rel').map((c) => (c as { title: string }).title);
      return {
        type: 'choice', card, label: '관계 고르기', say: '이 선 모양은 어떤 관계일까?',
        promptHtml: card.svg.replace('<svg ', '<svg class="rel" '),
        options: shuffle([card.title, ...distractors(names, card.title, 3, rng)], rng), correct: card.title,
      };
    }
    case 'answer':
      return answerQuestion(card, all, rng);
    case 'recall':
      return { type: 'recall', card, label: '떠올려 보기', say: '머릿속으로 답을 떠올린 다음 확인해 봐.' };
  }
}

function termQuestion(card: TermCard, all: Card[], rng: Rng): Question {
  const terms = all.filter((c): c is TermCard => c.kind === 'term');
  const sameTable = terms.filter((c) => c.table === card.table);
  const pool = sameTable.length >= 4 ? sameTable : terms.filter((c) => c.unit === card.unit);
  // 설명 안에 용어 이름이 그대로 들어 있으면 "용어 고르기"는 답이 보이므로 "뜻 고르기"만 낸다
  const leaks = card.meaning.includes(card.term) || card.meaning.length < 4;

  if (leaks || rng() < 0.6) {
    const name = `<b>${escapeText(card.term)}</b>${card.sub ? ` (${escapeText(card.sub)})` : ''}`;
    return {
      type: 'choice', card, label: '뜻 고르기', say: `${name}의 뜻은 뭘까?`,
      options: shuffle([card.meaning, ...distractors(pool.map((c) => c.meaning), card.meaning, 3, rng)], rng),
      correct: card.meaning,
    };
  }
  return {
    type: 'choice', card, label: '용어 고르기', say: `이 설명에 맞는 ${card.col === '기호' ? '기호' : '용어'}는?`,
    prompt: card.meaning,
    options: shuffle([card.term, ...distractors(pool.map((c) => c.term), card.term, 3, rng)], rng),
    correct: card.term,
  };
}

function answerQuestion(card: AnswerCard, all: Card[], rng: Rng): Question {
  if (!/[가-힣]/.test(card.answer)) {
    return { type: 'typing', card, label: '직접 써 보기', say: '실행 결과를 <b>그대로</b> 써 봐!', correct: card.answer };
  }
  let wrong = CUSTOM_OPTIONS[card.id];
  if (!wrong) {
    const lastWord = card.answer.split(' ').pop() ?? '';
    const similar = all
      .filter((c): c is TermCard => c.kind === 'term' && c.unit === card.unit && c.term.includes(lastWord))
      .map((c) => c.term);
    wrong = similar.length >= 3 ? distractors(similar, card.answer, 3, rng) : numberVariants(card.answer).slice(0, 3);
  }
  return {
    type: 'choice', card, label: '정답 고르기', say: card.q || '정답은?',
    options: shuffle([card.answer, ...wrong.slice(0, 3)], rng), correct: card.answer,
  };
}

/** 띄어쓰기·따옴표·끝 마침표는 무시한다. 쉼표와 괄호까지 빼고 같아도 정답으로 본다 */
const normalize = (s: string) => s.toLowerCase().replace(/[\s'"`]/g, '').replace(/[.。]$/, '');
const loose = (s: string) => normalize(s).replace(/[,[\]{}()]/g, '');

export function isTypedAnswerCorrect(input: string, correct: string): boolean {
  if (normalize(input) === normalize(correct)) return true;
  return loose(input) !== '' && loose(input) === loose(correct);
}
