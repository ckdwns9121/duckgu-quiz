/**
 * 문제 덤프 (Node 전용이라 타입 검사에서 빼려고 .js로 둔다): 사람이 직접 읽고 검토하려고 코스의 모든 문제를 텍스트로 뽑는다.
 * 평소 테스트에서는 건너뛴다. 사용: DUMP=frontend pnpm test dump
 */
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { COURSE_BY_ID } from '../domain/content';
import { makeQuestion } from '../domain/question';

const course = process.env.DUMP;
const text = (h) => (h ?? '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function describeQ(q) {
  const c = q.card;
  const head = `[${c.id}] ${q.type} · ${text(q.say)}${c.title ? ` · ${c.title}` : ''}`;
  const code = c.pre ? `\n  코드: ${text(c.pre).slice(0, 200)}` : '';
  if (q.type === 'choice') {
    const prompt = text(q.promptHtml ?? q.prompt);
    return `${head}${prompt ? `\n  질문: ${prompt}` : ''}${code}\n  보기: ${q.options.map((o) => (o === q.correct ? `✔ ${o}` : o)).join(' | ')}`;
  }
  if (q.type === 'recall') return head;
  return `${head}${code}\n  정답: ${q.correct}\n  조각: ${q.tiles.join(' | ')}`;
}

it.skipIf(!course)('문제 덤프', () => {
  const c = COURSE_BY_ID.get(course);
  if (!c) throw new Error(`코스 없음: ${course}`);
  const lines = c.lessons.flatMap((l) => [
    `\n## ${l.id} (${l.unit.name} 레슨 ${l.n})`,
    ...l.cardIds.map((id) => describeQ(makeQuestion(c.cards.find((x) => x.id === id), c.cards))),
  ]);
  const out = join(tmpdir(), `questions-${course}.txt`);
  writeFileSync(out, lines.join('\n') + '\n');
  console.log(`문제 ${c.cards.length}개 → ${out}`);
});
