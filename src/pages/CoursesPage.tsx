import { COURSES, SOON_COURSES } from '../domain/content';
import type { Course } from '../domain/types';
import { afterRender, createVNode } from '../lib';
import { InstallBanner, IosInstallGuide } from '../components/InstallBanner';
import { TopBar } from '../components/TopBar';
import { router } from '../router';
import { progressStore } from '../stores/progressStore';
import { resetHomeScroll } from './CoursePage';

const open = (course: Course) => {
  resetHomeScroll();
  router.push(`/course/${course.id}`);
};

const CourseCard = ({ course, done, last }: { course: Course; done: Record<string, boolean>; last: boolean }) => {
  const total = course.lessons.length;
  const cleared = course.lessons.filter((l) => done[l.id]).length;
  const pct = total ? Math.round((cleared / total) * 100) : 0;
  return (
    <button className="course-card" type="button" style={`--cc:${course.color};--cd:${course.dark}`} onClick={() => open(course)}>
      <span className="course-badge">{course.icon}</span>
      <span className="course-body">
        <span className="course-title">
          <b>{course.name}</b>
          {last && cleared > 0 && <em>이어하기</em>}
        </span>
        <span className="course-desc">{course.desc}</span>
        <span className="course-meta">유닛 {course.units.length} · 레슨 {total} · 문제 {course.cards.length}</span>
        <span className="course-bar" aria-label={`레슨 ${total}개 중 ${cleared}개 완료`}><i style={`width:${pct}%`} /></span>
      </span>
    </button>
  );
};

/** 첫 화면: 코스 고르기 */
export const CoursesPage = () => {
  const progress = progressStore.getState();
  if (!progress.introSeen) {
    afterRender(() => router.push('/intro', { replace: true }));
    return <div />;
  }
  return (
    <section className="screen">
      <TopBar />
      <main className="col courses">
        <InstallBanner />
        <h2 className="courses-h">어떤 코스를 풀까요?</h2>
        {COURSES.map((course) => <CourseCard course={course} done={progress.done} last={course.id === progress.course} />)}
        <h3 className="courses-sub">준비 중</h3>
        <div className="soon-list">
          {SOON_COURSES.map((c) => (
            <div className="soon"><span className="course-badge">{c.icon}</span><b>{c.name}</b></div>
          ))}
        </div>
      </main>
      <IosInstallGuide />
    </section>
  );
};
