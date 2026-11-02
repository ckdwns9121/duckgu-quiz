import { createHash, timingSafeEqual } from 'node:crypto';
import { BlobNotFoundError, get, put, del } from '@vercel/blob';
import webpush from 'web-push';

export interface Subscription { endpoint: string; keys: { p256dh: string; auth: string } }
export interface Device { subscription: Subscription; tokenHash: string; lastTestAt?: number; lastSentDate?: string }
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const devicePath = (endpoint: string) => `push/devices/${hash(endpoint)}.json`;
export const ownsDevice = (device: Device, token: string) => timingSafeEqual(Buffer.from(device.tokenHash, 'hex'), Buffer.from(hash(token), 'hex'));

export function isSubscription(value: unknown): value is Subscription {
  const s = value as Subscription;
  if (typeof s?.endpoint !== 'string' || s.endpoint.length > 1500 || typeof s.keys?.p256dh !== 'string' || typeof s.keys?.auth !== 'string') return false;
  try {
    const u = new URL(s.endpoint);
    const allowed = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'];
    if (u.protocol !== 'https:' || u.port || u.username || u.password || u.hash || !allowed.includes(u.hostname)) return false;
    const validKey = (v: string, bytes: number) => /^[\w-]+$/.test(v) && Buffer.from(v, 'base64url').length === bytes;
    return validKey(s.keys.p256dh, 65) && Buffer.from(s.keys.p256dh, 'base64url')[0] === 4 && validKey(s.keys.auth, 16);
  } catch { return false; }
}

export async function readDevice(path: string) {
  try {
    const result = await get(path, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return { value: JSON.parse(await new Response(result.stream).text()) as Device, etag: result.blob.etag };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

export const saveDevice = (path: string, value: Device, etag?: string) => put(path, JSON.stringify(value), {
  access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60,
  ...(etag ? { ifMatch: etag } : {}),
});
export const deleteDevice = (path: string) => del(path);

export async function sendPush(subscription: Subscription, payload: { title: string; body: string; url: string; tag: string }) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error('Missing VAPID configuration');
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? 'https://duckgu-quiz.vercel.app', publicKey, privateKey);
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 21600, timeout: 10000 });
    return 'sent' as const;
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return 'gone' as const;
    throw error;
  }
}
