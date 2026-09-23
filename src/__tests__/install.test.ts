import { installReducer, shouldShowInstall, type InstallState } from '../stores/installStore';

const base: InstallState = { canPrompt: false, isIos: false, installed: false, dismissed: false, iosGuideOpen: false };

describe('설치 배너', () => {
  it('설치 창을 띄울 수 있을 때만 보인다 (안드로이드·PC)', () => {
    expect(shouldShowInstall(base)).toBe(false);
    expect(shouldShowInstall(installReducer(base, { type: 'PROMPT_READY' }))).toBe(true);
  });
  it('아이폰은 설치 API가 없어도 안내용으로 보인다', () => {
    expect(shouldShowInstall({ ...base, isIos: true })).toBe(true);
  });
  it('설치했거나 닫으면 숨긴다', () => {
    const ready = installReducer(base, { type: 'PROMPT_READY' });
    expect(shouldShowInstall(installReducer(ready, { type: 'INSTALLED' }))).toBe(false);
    expect(shouldShowInstall(installReducer(ready, { type: 'DISMISS' }))).toBe(false);
  });
});
