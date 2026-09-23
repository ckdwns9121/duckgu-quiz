import { installStore } from '../stores/installStore';

/** Chrome이 주는 설치 이벤트 (표준 타입 정의에 아직 없다) */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;

/**
 * 브라우저 기본 설치 안내(미니 인포바)를 막고 이벤트를 보관해 둔다.
 * 사용자가 우리 "설치하기" 버튼을 누를 때 이 이벤트로 설치 창을 띄운다.
 * 이벤트는 페이지 로드 직후 올 수 있어서 렌더보다 먼저 등록한다.
 */
export function setupInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    installStore.dispatch({ type: 'PROMPT_READY' });
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installStore.dispatch({ type: 'INSTALLED' });
  });
}

/** 설치하기 버튼: 설치 창을 띄우거나, 아이폰이면 안내 화면을 연다 */
export async function requestInstall() {
  if (deferred) {
    const event = deferred;
    deferred = null;
    installStore.dispatch({ type: 'PROMPT_USED' });
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') installStore.dispatch({ type: 'INSTALLED' });
    return;
  }
  if (installStore.getState().isIos) installStore.dispatch({ type: 'IOS_GUIDE', open: true });
}

export const dismissInstall = () => installStore.dispatch({ type: 'DISMISS' });
export const closeIosGuide = () => installStore.dispatch({ type: 'IOS_GUIDE', open: false });
