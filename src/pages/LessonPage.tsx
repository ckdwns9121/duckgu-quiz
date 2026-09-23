import { afterRender, createVNode } from '../lib';
import { CheckBar } from '../components/CheckBar';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { CloseIcon, HeartIcon } from '../components/Icons';
import { QuestionView } from '../components/QuestionView';
import { router } from '../router';
import { quitLesson, startLesson, startPractice } from '../services/lessonService';
import { prefersAutoFocus } from '../services/viewport';
import { currentQuestion, lessonStore } from '../stores/lessonStore';

let lastQuestionKey = '';

/** /lesson/:id 와 /practice 가 같이 쓰는 레슨 화면 */
export const LessonPage = () => {
  const isPractice = router.route?.path === '/practice';
  const lessonId = router.params.id ?? null;
  const session = lessonStore.getState();

  // 주소로 바로 들어왔거나 새로고침했으면 레슨을 새로 시작한다
  if (!session || session.outcome || (!isPractice && session.lessonId !== lessonId) || (isPractice && session.lessonId !== null)) {
    afterRender(() => (isPractice ? startPractice() : startLesson(lessonId!)));
    return <p className="center-msg">레슨을 준비하는 중…</p>;
  }

  const q = currentQuestion(session);
  const key = `${session.total}-${session.queue.length}-${q.card.id}-${session.lives}`;
  // 새 문제가 뜨면 입력칸에 바로 커서를 둔다 (PC만. 폰은 누를 때 키보드가 뜨게 둔다)
  if (q.type === 'typing' && !session.feedback && key !== lastQuestionKey && prefersAutoFocus()) {
    afterRender(() => (document.getElementById('answer') as HTMLInputElement | null)?.focus({ preventScroll: true }));
  }
  if (session.feedback) afterRender(() => document.getElementById('continue-btn')?.focus({ preventScroll: true }));
  lastQuestionKey = key;

  return (
    <section className="screen lesson-screen">
      <div className="col lesson-top">
        <button className="x" type="button" aria-label="레슨 그만하기" onClick={quitLesson}><CloseIcon /></button>
        <div className="pbar"><i style={`width:${(session.solved / session.total) * 100}%`} /></div>
        <span className="lives"><HeartIcon /><span>{session.lives}</span></span>
      </div>
      <QuestionView q={q} session={session} />
      <CheckBar q={q} session={session} />
      <FeedbackSheet session={session} />
    </section>
  );
};
