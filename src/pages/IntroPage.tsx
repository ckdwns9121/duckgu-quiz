import { createVNode } from '../lib';
import { Mascot } from '../components/Mascot';
import { router } from '../router';
import { progressStore } from '../stores/progressStore';

const start = () => {
  progressStore.dispatch({ type: 'INTRO_SEEN' });
  router.push('/', { replace: true });
};

export const IntroPage = () => (
  <section className="screen">
    <div className="col intro">
      <div className="bubble down">안녕! 나는 러버덕 <b>덕구</b>야.<br />출근길마다 한 레슨씩, 정처기도 프론트엔드도 같이 끝내 보자!</div>
      <div className="m"><Mascot mood="cheer" /></div>
      <h1>출근길 IT 퀴즈</h1>
      <div className="actions">
        <button className="btn" type="button" onClick={start}>시작하기</button>
      </div>
    </div>
  </section>
);
