/**
 * Google Analytics 4.
 *
 * - 배포된 사이트(github.io)에서만 켠다. 개발 서버와 로컬 미리보기에서는 아무것도 보내지 않는다.
 * - 화면 이동(page_view)은 GA "향상된 측정"의 브라우저 기록 기반 페이지 변경이 SPA 라우팅을 알아서 잡는다.
 *   여기서 따로 보내면 두 번 잡히므로, 이 파일은 학습 이벤트만 보낸다.
 * - 개인을 알아볼 수 있는 값(이름, 입력한 답 등)은 보내지 않는다.
 */
const MEASUREMENT_ID = 'G-HGRWXGV0Y3';

type Params = Record<string, string | number | boolean>;
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const enabled = () => import.meta.env.PROD && location.hostname.endsWith('github.io');

export function setupAnalytics() {
  if (!enabled()) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js는 arguments 객체 그대로를 dataLayer에 넣어야 인식한다
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    // 홈 화면에 설치한 앱으로 열었는지 구분해서 볼 수 있게
    app_display_mode: matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/** 학습 이벤트. GA 보고서의 "이벤트"에서 이름별로 볼 수 있다 */
export function track(name: string, params: Params = {}) {
  if (!enabled() || !window.gtag) return;
  window.gtag('event', name, params);
}
