import { createVNode } from '../lib';
import { closeIosGuide, dismissInstall, requestInstall } from '../services/install';
import { installStore, shouldShowInstall } from '../stores/installStore';
import { CloseIcon } from './Icons';

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
);

const PlusSquareIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="2" />
    <path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
);

/** 레슨 지도 위의 "홈 화면에 설치" 배너 */
export const InstallBanner = () => {
  const s = installStore.getState();
  if (!shouldShowInstall(s)) return null;
  return (
    <div className="install-banner">
      <img src={`${import.meta.env.BASE_URL}icons/icon-192.png?v=duck1`} alt="" width="48" height="48" />
      <div className="txt">
        <b>홈 화면에 설치하기</b>
        <span>앱처럼 바로 열리고, 인터넷 없이도 풀 수 있어요.</span>
      </div>
      <button className="btn blue install-btn" type="button" onClick={() => void requestInstall()}>설치</button>
      <button className="x install-x" type="button" aria-label="설치 안내 닫기" onClick={dismissInstall}><CloseIcon /></button>
    </div>
  );
};

/** 아이폰 전용 안내: 설치 API가 없어서 공유 버튼 위치를 알려 준다 */
export const IosInstallGuide = () => {
  const { iosGuideOpen } = installStore.getState();
  return (
    <div>
      {iosGuideOpen && <div className="sheet-shade" onClick={closeIosGuide} />}
      <div className={`sheet ios-guide${iosGuideOpen ? ' show' : ''}`} role="dialog" aria-label="아이폰에 설치하는 방법">
        <div className="col">
          <b className="ios-title">아이폰에 설치하는 방법</b>
          <ol className="ios-steps">
            <li><span className="ico"><ShareIcon /></span><span>Safari 아래쪽 <b>공유 버튼</b>을 눌러요</span></li>
            <li><span className="ico"><PlusSquareIcon /></span><span>목록을 내려 <b>홈 화면에 추가</b>를 눌러요</span></li>
            <li><span className="ico ok">추가</span><span>오른쪽 위 <b>추가</b>를 누르면 끝!</span></li>
          </ol>
          <p className="hint">카카오톡 안에서 열었다면 먼저 메뉴에서 <b>다른 브라우저로 열기</b> → Safari를 골라 주세요.</p>
          <button className="btn" type="button" onClick={closeIosGuide}>알겠어요</button>
        </div>
      </div>
    </div>
  );
};
