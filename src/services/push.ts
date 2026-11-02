import { createStore } from '../lib';

interface PushState { ready: boolean; enabled: boolean; busy: boolean; message: string; publicKey: string | null }
export const pushStore = createStore<PushState, Partial<PushState>>((state, patch) => ({ ...state, ...patch }), {
  ready: false, enabled: false, busy: false, message: '', publicKey: null,
});
let subscription: PushSubscription | null = null;
const tokenKey = 'duckgu-push-device-token';

function environmentMessage() {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
  if (/KAKAOTALK/i.test(navigator.userAgent)) return '알림을 켜려면 Safari나 Chrome에서 열어 주세요.';
  if (ios && !standalone) return '아이폰은 Safari에서 홈 화면에 추가한 뒤, 설치한 앱에서 알림을 켜 주세요.';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return '이 브라우저는 푸시 알림을 지원하지 않아요.';
  return '';
}

export async function setupPush() {
  const message = environmentMessage();
  if (message) { pushStore.dispatch({ ready: true, message }); return; }
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api/push`, { cache: 'no-store' });
    const config = await response.json();
    if (!response.ok || !config.configured) throw new Error('아침 알림은 Vercel 앱에서 사용할 수 있어요.');
    const reg = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' });
    await navigator.serviceWorker.ready;
    subscription = await reg.pushManager.getSubscription();
    pushStore.dispatch({ ready: true, enabled: Boolean(subscription), publicKey: config.publicKey });
    // 서버 구독이 지워졌거나 브라우저 저장소만 남은 경우에도 같은 기기를 다시 연결한다.
    if (subscription && localStorage.getItem(tokenKey)) await request('subscribe');
  } catch (error) {
    pushStore.dispatch({ ready: true, message: error instanceof Error ? error.message : '알림 설정을 불러오지 못했어요.' });
  }
}

async function request(action: 'subscribe' | 'unsubscribe' | 'test') {
  const token = localStorage.getItem(tokenKey);
  if (!subscription || !token) throw new Error('이 기기에서 아침 알림을 다시 켜 주세요.');
  const response = await fetch(`${import.meta.env.BASE_URL}api/push`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, subscription: subscription.toJSON(), token }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? '알림 요청을 처리하지 못했어요.');
}

async function run(action: () => Promise<void>) {
  if (pushStore.getState().busy) return;
  pushStore.dispatch({ busy: true, message: '' });
  try { await action(); }
  catch (error) { pushStore.dispatch({ message: error instanceof Error ? error.message : '잠시 뒤 다시 시도해 주세요.' }); }
  finally { pushStore.dispatch({ busy: false }); }
}

export const enablePush = () => run(async () => {
  // 권한 요청은 사용자가 누른 이벤트 안에서 바로 시작해야 iOS에서도 표시된다.
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('알림이 허용되지 않았어요. 브라우저 설정에서 알림을 허용해 주세요.');
  const reg = await navigator.serviceWorker.ready;
  const publicKey = pushStore.getState().publicKey!;
  if (!localStorage.getItem(tokenKey)) {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) => v.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(tokenKey, token);
    // 저장소를 지운 뒤 기존 브라우저 구독만 남았다면 새로운 구독으로 연결한다.
    if (subscription) { await subscription.unsubscribe(); subscription = null; }
  }
  const bytes = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(publicKey.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
  subscription ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
  await request('subscribe');
  pushStore.dispatch({ enabled: true, message: '매일 오전 8시쯤 AWS-SAA 퀴즈를 보내 드릴게요.' });
});

export const disablePush = () => run(async () => {
  if (localStorage.getItem(tokenKey)) await request('unsubscribe');
  if (subscription && !await subscription.unsubscribe()) throw new Error('기기의 알림 구독을 해제하지 못했어요. 다시 시도해 주세요.');
  subscription = null;
  pushStore.dispatch({ enabled: false, message: '이 기기의 아침 알림을 껐어요.' });
});

export const testPush = () => run(async () => {
  await request('test');
  pushStore.dispatch({ message: '테스트 알림을 보냈어요. 기기의 알림창을 확인해 주세요.' });
});
