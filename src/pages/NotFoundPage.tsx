import { createVNode } from '../lib';
import { Mascot } from '../components/Mascot';

export const NotFoundPage = () => (
  <section className="screen">
    <div className="col intro">
      <div className="m"><Mascot mood="sad" /></div>
      <h1>길을 잃었어요</h1>
      <div className="actions"><a className="btn" href="/" data-link style="text-decoration:none;text-align:center">레슨 지도로 가기</a></div>
    </div>
  </section>
);
