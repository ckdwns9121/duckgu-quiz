import { createVNode } from '../lib';
import { continueLesson } from '../services/lessonService';
import type { LessonSession } from '../stores/lessonStore';
import { Mascot } from './Mascot';

const PRAISE = ['정답이에요!', '좋아요!', '완벽해요!', '잘했어요!'];

/**
 * 채점 뒤 아래에서 올라오는 해설 시트.
 * 항상 DOM에 두고 show 클래스만 바꿔야 올라오는 전환 애니메이션이 보인다.
 */
export const FeedbackSheet = ({ session }: { session: LessonSession }) => {
  const fb = session.feedback;
  const q = fb?.question;
  const correct = q && q.type !== 'recall' ? q.correct : '';
  const title = fb ? (fb.ok ? PRAISE[session.solved % PRAISE.length] : '아쉬워요') : '';
  return (
    <div>
      {fb && <div className="sheet-shade" />}
      <div className={`sheet${fb ? ` show ${fb.ok ? 'ok' : 'ng'}` : ''}`} role="status" aria-live="polite">
        <div className="col">
          <div className="head">
            <div className="m"><Mascot mood={fb ? (fb.ok ? 'happy' : 'sad') : 'idle'} /></div>
            <b>{title}</b>
          </div>
          {fb && !fb.ok && <p className="correct">정답: <code>{correct}</code></p>}
          <div className="explain" innerHTML={q ? q.card.kind === 'term' ? termExplain(q.card.parts) : q.card.explain : ''} />
          <button className={`btn${fb && !fb.ok ? ' red' : ''}`} id="continue-btn" type="button" onClick={continueLesson}>계속</button>
        </div>
      </div>
    </div>
  );
};

const termExplain = (parts: { label: string; html: string; hint: boolean }[]) =>
  `<dl>${parts.map((p) => `<dt>${p.label}</dt><dd${p.hint ? ' class="hint"' : ''}>${p.html}</dd>`).join('')}</dl>`;
