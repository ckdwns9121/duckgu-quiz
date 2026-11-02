import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlobPreconditionFailedError } from '@vercel/blob';
import { deleteDevice, devicePath, hash, isSubscription, ownsDevice, readDevice, saveDevice, sendPush } from '../server/push.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const configured = Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.BLOB_READ_WRITE_TOKEN && process.env.CRON_SECRET);
  if (req.method === 'GET') return res.status(200).json({ configured, publicKey: configured ? process.env.VAPID_PUBLIC_KEY : null });
  if (req.method !== 'POST') return res.status(405).setHeader('Allow', 'GET, POST').end();
  if (!configured) return res.status(503).json({ error: '아직 알림 설정을 준비하고 있어요.' });
  // 외부 사이트가 방문자의 브라우저로 구독 변경·발송 요청을 만들지 못하게 한다.
  const origin = req.headers.origin;
  if (origin !== `https://${req.headers.host}` && origin !== `http://${req.headers.host}`) return res.status(403).json({ error: '요청한 주소를 확인해 주세요.' });
  if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).end();
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return null; } })() : req.body;
  if (!body || JSON.stringify(body).length > 5000 || !isSubscription(body.subscription) || !/^[a-f0-9]{64}$/.test(body.token ?? '') || !['subscribe', 'unsubscribe', 'test'].includes(body.action)) return res.status(400).json({ error: '알림 구독 정보가 올바르지 않아요.' });
  const path = devicePath(body.subscription.endpoint);
  try {
    const existing = await readDevice(path);
    if (existing && !ownsDevice(existing.value, body.token)) return res.status(403).json({ error: '이 기기의 구독을 다시 연결해 주세요.' });
    if (body.action === 'subscribe') {
      await saveDevice(path, { ...existing?.value, subscription: body.subscription, tokenHash: hash(body.token) }, existing?.etag);
      return res.status(200).json({ ok: true });
    }
    if (body.action === 'unsubscribe') {
      if (existing) await deleteDevice(path);
      return res.status(200).json({ ok: true });
    }
    if (!existing) return res.status(404).json({ error: '먼저 아침 알림을 켜 주세요.' });
    if (Date.now() - (existing.value.lastTestAt ?? 0) < 60000) return res.status(429).json({ error: '테스트 알림은 1분 후 다시 보낼 수 있어요.' });
    await saveDevice(path, { ...existing.value, lastTestAt: Date.now() }, existing.etag);
    const result = await sendPush(existing.value.subscription, { title: '덕구의 AWS-SAA 퀴즈', body: '알림 연결 완료! 오늘의 레슨을 풀어 볼까요?', url: '/daily', tag: 'duckgu-test' });
    if (result === 'gone') {
      await deleteDevice(path);
      return res.status(410).json({ error: '알림 구독이 만료됐어요. 다시 켜 주세요.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) return res.status(409).json({ error: '다른 요청이 처리 중이에요. 다시 시도해 주세요.' });
    console.error('push request failed', error instanceof Error ? error.name : 'UnknownError');
    return res.status(500).json({ error: '처리하지 못했어요. 잠시 뒤 다시 시도해 주세요.' });
  }
}
