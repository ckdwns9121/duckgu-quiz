// @vitest-environment node
import { vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import pushHandler from '../../api/push';
import cronHandler from '../../api/cron/daily-quiz';
import { isSubscription } from '../../server/push';

const blobs = vi.hoisted(() => new Map<string, { body: string; etag: string }>());
vi.mock('@vercel/blob', () => {
  class BlobPreconditionFailedError extends Error {}
  class BlobNotFoundError extends Error {}
  return { BlobPreconditionFailedError, BlobNotFoundError,
    get: vi.fn(async (path: string) => {
      const row = blobs.get(path);
      return row ? { statusCode: 200, stream: new Blob([row.body]).stream(), blob: { etag: row.etag } } : null;
    }),
    put: vi.fn(async (path: string, body: string, options: { ifMatch?: string }) => {
      const row = blobs.get(path);
      if (row && options.ifMatch !== row.etag) throw new BlobPreconditionFailedError();
      const etag = String(Number(row?.etag ?? 0) + 1);
      blobs.set(path, { body, etag }); return { etag };
    }),
    list: vi.fn(async () => ({ blobs: [...blobs.keys()].map((pathname) => ({ pathname })), hasMore: false })),
    del: vi.fn(async (path: string) => { blobs.delete(path); }),
  };
});
vi.mock('web-push', () => ({ default: { setVapidDetails: vi.fn(), sendNotification: vi.fn(async () => ({})) } }));

const subscription = { endpoint: 'https://fcm.googleapis.com/fcm/send/test-device', keys: {
  p256dh: Buffer.concat([Buffer.from([4]), Buffer.alloc(64, 7)]).toString('base64url'), auth: Buffer.alloc(16, 9).toString('base64url'),
} };
const token = 'a'.repeat(64);
async function call(handler: typeof pushHandler, body?: unknown, headers: Record<string, string> = {}, method = 'POST') {
  let status = 200;
  let data: unknown;
  const res = { setHeader: () => res, status: (s: number) => { status = s; return res; }, json: (d: unknown) => { data = d; return res; }, end: () => res };
  const req = { method, body, headers: { host: 'duckgu.test', origin: 'https://duckgu.test', 'content-type': 'application/json', ...headers } };
  await handler(req as VercelRequest, res as unknown as VercelResponse);
  return { status, data };
}

beforeEach(() => {
  blobs.clear(); vi.clearAllMocks();
  vi.stubEnv('VAPID_PUBLIC_KEY', 'public'); vi.stubEnv('VAPID_PRIVATE_KEY', 'private');
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob'); vi.stubEnv('CRON_SECRET', 'secret');
});
afterEach(() => vi.unstubAllEnvs());

it('내부 주소·임의 외부 서버·잘못된 암호 키는 저장하거나 요청하지 않는다', () => {
  expect(isSubscription(subscription)).toBe(true);
  for (const endpoint of ['http://localhost', 'https://127.0.0.1', 'https://example.com', 'https://fcm.googleapis.com.evil.test/a', 'https://fcm.googleapis.com:444/a']) {
    expect(isSubscription({ ...subscription, endpoint })).toBe(false);
  }
  expect(isSubscription({ ...subscription, keys: { auth: 'bad', p256dh: 'bad' } })).toBe(false);
});

it('구독 소유자만 테스트·해제할 수 있고 테스트 연속 발송을 제한한다', async () => {
  expect((await call(pushHandler, { action: 'subscribe', subscription, token })).status).toBe(200);
  expect((await call(pushHandler, { action: 'unsubscribe', subscription, token: 'b'.repeat(64) })).status).toBe(403);
  expect((await call(pushHandler, { action: 'test', subscription, token })).status).toBe(200);
  expect((await call(pushHandler, { action: 'test', subscription, token })).status).toBe(429);
  expect((await call(pushHandler, { action: 'unsubscribe', subscription, token })).status).toBe(200);
  expect(blobs.size).toBe(0);
  expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
});

it('외부 사이트의 구독 변경과 인증 없는 cron을 거부하며 비밀값이 없어도 열리지 않는다', async () => {
  expect((await call(pushHandler, { action: 'subscribe', subscription, token }, { origin: 'https://evil.test' })).status).toBe(403);
  expect((await call(cronHandler, undefined, {}, 'GET')).status).toBe(401);
  vi.stubEnv('CRON_SECRET', '');
  expect((await call(cronHandler, undefined, {}, 'GET')).status).toBe(503);
  expect(webpush.sendNotification).not.toHaveBeenCalled();
});

it('예약 발송은 같은 날 중복 실행해도 한 번만 보내고 만료 구독은 삭제한다', async () => {
  await call(pushHandler, { action: 'subscribe', subscription, token });
  expect((await call(cronHandler, undefined, { authorization: 'Bearer secret' }, 'GET')).status).toBe(200);
  expect((await call(cronHandler, undefined, { authorization: 'Bearer secret' }, 'GET')).status).toBe(200);
  expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
  await call(pushHandler, { action: 'unsubscribe', subscription, token });
  await call(pushHandler, { action: 'subscribe', subscription, token });
  vi.mocked(webpush.sendNotification).mockRejectedValueOnce({ statusCode: 410 });
  await call(cronHandler, undefined, { authorization: 'Bearer secret' }, 'GET');
  expect(blobs.size).toBe(0);
});
