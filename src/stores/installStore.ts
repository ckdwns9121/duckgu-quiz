import { createStorage, createStore } from '../lib';

export interface InstallState {
  /** 브라우저가 설치 창을 띄울 수 있게 해 줬는지 (Chrome·Edge·안드로이드) */
  canPrompt: boolean;
  /** 아이폰·아이패드: 설치 API가 없어 안내 화면으로 대신한다 */
  isIos: boolean;
  /** 이미 설치된 앱으로 열었거나 방금 설치했는지 */
  installed: boolean;
  /** 사용자가 배너를 닫았는지 (저장) */
  dismissed: boolean;
  iosGuideOpen: boolean;
}

export type InstallAction =
  | { type: 'PROMPT_READY' }
  | { type: 'PROMPT_USED' }
  | { type: 'INSTALLED' }
  | { type: 'DISMISS' }
  | { type: 'IOS_GUIDE'; open: boolean };

const dismissStorage = createStorage<boolean>('jcq-install-dismissed');

const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) || (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function installReducer(state: InstallState, action: InstallAction): InstallState {
  switch (action.type) {
    case 'PROMPT_READY':
      return state.canPrompt ? state : { ...state, canPrompt: true };
    case 'PROMPT_USED':
      return { ...state, canPrompt: false };
    case 'INSTALLED':
      return { ...state, installed: true, canPrompt: false, iosGuideOpen: false };
    case 'DISMISS':
      return { ...state, dismissed: true, iosGuideOpen: false };
    case 'IOS_GUIDE':
      return { ...state, iosGuideOpen: action.open };
    default:
      return state;
  }
}

export const installStore = createStore(installReducer, {
  canPrompt: false,
  isIos: isIosDevice(),
  installed: isStandalone(),
  dismissed: dismissStorage.get() === true,
  iosGuideOpen: false,
});
installStore.subscribe(() => {
  if (installStore.getState().dismissed) dismissStorage.set(true);
});

/** 설치 배너를 보여 줄지: 설치 안 했고, 닫지 않았고, 설치할 방법이 있을 때 */
export const shouldShowInstall = (s: InstallState) => !s.installed && !s.dismissed && (s.canPrompt || s.isIos);
