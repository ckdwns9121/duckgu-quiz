import { createVNode } from '../lib';
import { router } from '../router';
import { disablePush, enablePush, pushStore, testPush } from '../services/push';

export const DailyQuiz = () => {
  const s = pushStore.getState();
  return <section className="daily-quiz" aria-label="AWS-SAA 아침 퀴즈">
    <b>덕구랑 매일 AWS-SAA</b>
    <p>매일 다른 레슨을 풀고, 틀린 문제는 다시 확인해요.</p>
    <button className="btn blue" type="button" onClick={() => router.push('/daily')}>오늘의 퀴즈 풀기</button>
    <p className="hint">한국 시간 오전 8시쯤 · 이 기기에서 알림 받기</p>
    {s.publicKey && <div className="daily-actions">
      <button className="btn" type="button" disabled={s.busy || !s.ready} onClick={s.enabled ? testPush : enablePush}>{s.busy ? '처리 중…' : s.enabled ? '테스트 알림 보내기' : '아침 알림 켜기'}</button>
      {s.enabled && <button className="btn ghost" type="button" disabled={s.busy} onClick={disablePush}>알림 끄기</button>}
    </div>}
    {s.message && <p className="hint" role="status">{s.message}</p>}
    {!s.ready && <p className="hint">알림 설정 확인 중…</p>}
  </section>;
};
