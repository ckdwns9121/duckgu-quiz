import { COURSE_BY_ID } from '../domain/content';
import { dailyLessonIndex, koreanDate } from '../domain/daily';
import { afterRender, createVNode } from '../lib';
import { startLesson } from '../services/lessonService';

export const DailyPage = () => {
  const course = COURSE_BY_ID.get('aws-saa')!;
  const query = new URLSearchParams(location.search).get('date');
  let index: number;
  try { index = dailyLessonIndex(query ?? koreanDate(), course.lessons.length); }
  catch { index = dailyLessonIndex(koreanDate(), course.lessons.length); }
  afterRender(() => startLesson(course.lessons[index].id));
  return <main className="col"><p>오늘의 AWS-SAA 퀴즈를 열고 있어요.</p></main>;
};
