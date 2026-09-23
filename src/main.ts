import './styles.css';
import { initRender } from './render';
import { router } from './router';
import { answer, check, continueLesson, selectChoice, unpickTile, usesTiles } from './services/lessonService';
import { resizeRiveMascots } from './components/riveMascot';
import { setupInstall } from './services/install';
import { setupViewport } from './services/viewport';
import { currentQuestion, lessonStore } from './stores/lessonStore';

/** 레슨 키보드 단축키: 1~4 보기 선택, Enter 확인·계속 */
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    const s = lessonStore.getState();
    const onLesson = router.route?.path === '/lesson/:id' || router.route?.path === '/practice';
    if (!s || !onLesson || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (s.feedback) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        continueLesson();
      }
      return;
    }
    const q = currentQuestion(s);
    if (q.type === 'choice' && /^[1-4]$/.test(e.key)) selectChoice(Number(e.key) - 1);
    if (q.type === 'choice' && e.key === 'Enter') check();
    const tileMode = q.type === 'build' || (q.type === 'typing' && usesTiles());
    if (tileMode && e.key === 'Enter') check();
    // 조각 문제: 백스페이스로 마지막 조각 빼기
    if (tileMode && e.key === 'Backspace' && s.picked.length) {
      e.preventDefault();
      unpickTile(s.picked.length - 1);
    }
    if (q.type === 'recall' && s.recallShown && e.key === 'ArrowLeft') answer(false);
    if (q.type === 'recall' && s.recallShown && e.key === 'ArrowRight') answer(true);
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

setupInstall();
setupViewport();
initRender();
setupKeyboard();
window.addEventListener('resize', resizeRiveMascots);
registerServiceWorker();
router.start();
