/**
 * 모바일 키보드 대응.
 *
 * iOS Safari는 입력칸에 포커스가 가면 키보드에 가리지 않게 페이지 전체를 위로 끌어올린다.
 * 그러면 상단 바와 문제가 화면 밖으로 밀려난다. 그래서 레슨 화면을 "지금 보이는 영역"
 * (visualViewport)의 높이와 위치에 맞춘 고정 박스로 만들고, 안쪽 문제 영역만 스크롤한다.
 * 키보드가 올라오면 박스가 줄어들 뿐이라 상단 바는 제자리, 확인 버튼은 키보드 바로 위에 붙는다.
 */
export function setupViewport() {
  const root = document.documentElement;
  const vv = window.visualViewport;

  const sync = () => {
    const height = vv ? vv.height : window.innerHeight;
    const top = vv ? vv.offsetTop : 0;
    root.style.setProperty('--app-h', `${Math.round(height)}px`);
    root.style.setProperty('--app-top', `${Math.round(top)}px`);
    // 키보드가 떠 있으면 아래 safe-area 여백(홈 인디케이터 자리)은 필요 없다
    root.classList.toggle('keyboard-open', window.innerHeight - height > 120);
  };

  sync();
  vv?.addEventListener('resize', sync);
  vv?.addEventListener('scroll', sync);
  window.addEventListener('resize', sync);

  // 포커스된 입력칸이 줄어든 문제 영역 안에서 보이도록 스크롤한다 (페이지가 아니라 안쪽만)
  document.addEventListener('focusin', (e) => {
    const input = e.target as HTMLElement;
    if (!input.matches?.('input, textarea')) return;
    setTimeout(() => {
      window.scrollTo(0, 0);
      input.scrollIntoView({ block: 'nearest' });
    }, 250);
  });
}

/** 터치 기기에서는 새 문제마다 키보드를 억지로 띄우지 않는다 */
export const prefersAutoFocus = () => matchMedia('(pointer: fine)').matches;
