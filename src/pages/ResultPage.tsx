import { LESSON_BY_ID } from '../domain/content';
import { afterRender, createVNode } from '../lib';
import { confetti } from '../components/confetti';
import { Mascot } from '../components/Mascot';
import { router } from '../router';
import { retryLesson } from '../services/lessonService';
import { lessonStore } from '../stores/lessonStore';
import { resetHomeScroll } from './HomePage';

const goHome = () => {
  resetHomeScroll();
  router.push('/');
};

export const ResultPage = () => {
  const session = lessonStore.getState();
  const outcome = session?.outcome;
  if (!session || !outcome) {
    afterRender(() => router.push('/', { replace: true }));
    return <div />;
  }
  if (outcome.passed && !session.celebrated) {
    afterRender(() => {
      confetti();
      lessonStore.dispatch({ type: 'CELEBRATED' });
    });
  }
  const lesson = session.lessonId ? LESSON_BY_ID.get(session.lessonId) : null;
  const subtitle = outcome.passed
    ? lesson ? `${lesson.unit.name} · 레슨 ${lesson.n}` : '약점 복습'
    : '틀린 카드는 약점 복습에 모였어요. 해설 보고 다시 도전해 봐요!';

  return (
    <section className="screen">
      <div className={`col result${outcome.passed ? '' : ' fail'}`}>
        <div className="m"><Mascot mood={outcome.passed ? 'cheer' : 'sad'} /></div>
        <h2>{outcome.passed ? (outcome.perfect ? '완벽한 레슨!' : '레슨 완료!') : '하트를 다 썼어요'}</h2>
        <p style="color:var(--muted);font-weight:500">{subtitle}</p>
        <div className="tiles">
          <div className="tile" style="--tc:var(--gold)"><span>획득 XP</span><b>+{outcome.xp}</b></div>
          <div className="tile" style="--tc:var(--green)"><span>정확도</span><b>{outcome.accuracy}%</b></div>
          <div className="tile" style="--tc:var(--orange)"><span>연속 학습</span><b>{outcome.streak}일</b></div>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={goHome}>{outcome.passed ? '계속' : '지도로 돌아가기'}</button>
          {!outcome.passed && <button className="btn ghost" type="button" onClick={retryLesson}>다시 도전</button>}
        </div>
      </div>
    </section>
  );
};
