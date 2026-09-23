import { createVNode, flushAfterRender, renderElement, withBatch } from './lib';
import { HomePage } from './pages/HomePage';
import { IntroPage } from './pages/IntroPage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ResultPage } from './pages/ResultPage';
import { router } from './router';
import { lessonStore } from './stores/lessonStore';
import { progressStore } from './stores/progressStore';

router.addRoute('/', HomePage);
router.addRoute('/intro', IntroPage);
router.addRoute('/lesson/:id', LessonPage);
router.addRoute('/practice', LessonPage);
router.addRoute('/result', ResultPage);
router.addRoute('*', NotFoundPage);

let lastPath: string | undefined;

export const render = withBatch(() => {
  const root = document.getElementById('app');
  if (!root) return;
  const Page = router.target ?? NotFoundPage;
  // 화면이 바뀌면 이전 화면과 비교하지 않고 새로 그린다 (다른 화면끼리 diff는 의미가 없다)
  const path = router.route?.path;
  if (path !== lastPath) {
    root.textContent = '';
    window.scrollTo(0, 0);
    lastPath = path;
  }
  renderElement(createVNode(Page, null), root);
  flushAfterRender();
});

export function initRender() {
  router.subscribe(render);
  lessonStore.subscribe(render);
  progressStore.subscribe(render);
}
