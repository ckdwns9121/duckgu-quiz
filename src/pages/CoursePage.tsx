import { COURSE_BY_ID } from '../domain/content';
import { isUnlocked } from '../domain/lessons';
import { afterRender, createVNode } from '../lib';
import { HeartIcon } from '../components/Icons';
import { InstallBanner, IosInstallGuide } from '../components/InstallBanner';
import { UnitSection } from '../components/LessonPath';
import { TopBar } from '../components/TopBar';
import { router } from '../router';
import { courseWeakIds, startPractice } from '../services/lessonService';
import { progressStore } from '../stores/progressStore';

let scrolledFor: string | null = null;

/** 코스 하나의 레슨 지도 (/course/:id) */
export const CoursePage = () => {
  const progress = progressStore.getState();
  const course = COURSE_BY_ID.get(router.params.id ?? '');
  if (!progress.introSeen) {
    afterRender(() => router.push('/intro', { replace: true }));
    return <div />;
  }
  if (!course) {
    afterRender(() => router.push('/', { replace: true }));
    return <div />;
  }
  if (progress.course !== course.id) afterRender(() => progressStore.dispatch({ type: 'SET_COURSE', course: course.id }));

  const { done } = progress;
  const firstCurrent = course.lessons.find((l) => isUnlocked(l, done) && !done[l.id])?.id ?? null;
  const weak = progress.course === course.id ? courseWeakIds().length : 0;

  // 지도를 열 때마다 지금 할 레슨이 화면 가운데 오게 스크롤
  if (scrolledFor !== course.id) {
    afterRender(() => {
      document.querySelector('.node-wrap.current')?.scrollIntoView({ block: 'center' });
      scrolledFor = course.id;
    });
  }

  return (
    <section className="screen">
      <TopBar course={course} />
      <main className="col path">
        <InstallBanner />
        {course.units.map((unit, i) => (
          <UnitSection
            unit={unit} index={i} lessons={course.lessons.filter((l) => l.unit.id === unit.id)} done={done}
            firstCurrentId={firstCurrent} notesHref={`${import.meta.env.BASE_URL}${course.notes}#${unit.id}`}
          />
        ))}
      </main>
      {weak > 0 && (
        <button className="btn blue practice" type="button" onClick={startPractice}>
          <HeartIcon /><span>약점 복습 {weak}</span>
        </button>
      )}
      <IosInstallGuide />
    </section>
  );
};

/** 레슨을 끝내고 돌아오면 다시 현재 레슨으로 스크롤한다 */
export const resetHomeScroll = () => {
  scrolledFor = null;
};
