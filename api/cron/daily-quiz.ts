import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlobPreconditionFailedError, list } from '@vercel/blob';
import { deleteDevice, readDevice, saveDevice, sendPush } from '../../server/push.js';
import { koreanDate, dailyLessonIndex } from '../../src/domain/daily.js';
import { buildLessons } from '../../src/domain/lessons.js';
import cards from '../../src/data/cards/aws-saa.json' with { type: 'json' };
import courses from '../../src/data/courses.json' with { type: 'json' };
import type { Card } from '../../src/domain/types.js';

export const config = { maxDuration: 60 };
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).end();
  if (!process.env.CRON_SECRET) return res.status(503).json({ error: 'Cron is not configured' });
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();
  const date = koreanDate();
  const course = courses.courses.find((c) => c.id === 'aws-saa')!;
  const lessons = buildLessons(course.units, cards as Card[]);
  const lesson = lessons[dailyLessonIndex(date, lessons.length)];
  const first = cards.find((c) => c.id === lesson.cardIds[0])!;
  const payload = { title: `덕구의 AWS-SAA · 오늘 ${lesson.cardIds.length}문제`, body: first.q.slice(0, 130), url: `/daily?date=${date}`, tag: `duckgu-saa-${date}` };
  const counts = { sent: 0, gone: 0, skipped: 0, failed: 0 };
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: 'push/devices/', limit: 100, cursor });
    // shortcut: 소규모 개인 앱이라 5기기씩 전송한다. 실행 제한에 가까워지면 큐로 나눈다.
    for (let i = 0; i < page.blobs.length; i += 5) await Promise.all(page.blobs.slice(i, i + 5).map(async (blob) => {
      try {
        const stored = await readDevice(blob.pathname);
        if (!stored || stored.value.lastSentDate === date) { counts.skipped++; return; }
        // 조건부 갱신으로 같은 날짜의 동시 실행이 같은 기기에 중복 발송하지 않게 한다.
        const claimed = await saveDevice(blob.pathname, { ...stored.value, lastSentDate: date }, stored.etag);
        try {
          const status = await sendPush(stored.value.subscription, payload);
          if (status === 'gone') { await deleteDevice(blob.pathname); counts.gone++; }
          else counts.sent++;
        } catch (error) {
          // 발송 실패는 재실행할 수 있게 표시를 되돌린다. 그 사이 구독이 바뀌었다면 덮어쓰지 않는다.
          await saveDevice(blob.pathname, stored.value, claimed.etag).catch(() => {});
          throw error;
        }
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) counts.skipped++;
        else counts.failed++;
      }
    }));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return res.status(counts.failed ? 500 : 200).json({ ok: counts.failed === 0, date, ...counts });
}
