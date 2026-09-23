import { LESSONS } from '../domain/content';
import { isUnlocked } from '../domain/lessons';
import { UNITS } from '../domain/units';
import { afterRender, createVNode } from '../lib';
import { HeartIcon } from '../components/Icons';
import { UnitSection } from '../components/LessonPath';
import { TopBar } from '../components/TopBar';
import { router } from '../router';
import { startPractice } from '../services/lessonService';
import { progressStore, weakCardIds } from '../stores/progressStore';

let scrolledOnce = false;

export const HomePage = () => {
  const progress = progressStore.getState();
  if (!progress.introSeen) {
    afterRender(() => router.push('/intro', { replace: true }));
    return <div />;
  }
  const { done } = progress;
  const firstCurrent = LESSONS.find((l) => isUnlocked(l, done) && !done[l.id])?.id ?? null;
  const weak = weakCardIds(progress).length;

  // 지도를 열 때마다 지금 할 레슨이 화면 가운데 오게 스크롤
  if (!scrolledOnce) {
    afterRender(() => {
      document.querySelector('.node-wrap.current')?.scrollIntoView({ block: 'center' });
      scrolledOnce = true;
    });
  }

  return (
    <section className="screen">
      <TopBar />
      <main className="col path">
        {UNITS.map((unit, i) => (
          <UnitSection
            unit={unit} index={i} lessons={LESSONS.filter((l) => l.unit.id === unit.id)} done={done}
            firstCurrentId={firstCurrent} notesHref={`${import.meta.env.BASE_URL}notes.html#${unit.id}`}
          />
        ))}
      </main>
      {weak > 0 && (
        <button className="btn blue practice" type="button" onClick={startPractice}>
          <HeartIcon /><span>약점 복습 {weak}</span>
        </button>
      )}
    </section>
  );
};

/** 레슨을 끝내고 돌아오면 다시 현재 레슨으로 스크롤한다 */
export const resetHomeScroll = () => {
  scrolledOnce = false;
};
