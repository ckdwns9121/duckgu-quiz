import type { Question } from '../domain/types';
import { createVNode } from '../lib';
import { answer, check, showRecall } from '../services/lessonService';
import type { LessonSession } from '../stores/lessonStore';

/** 화면 아래 고정 버튼 줄 */
export const CheckBar = ({ q, session }: { q: Question; session: LessonSession }) => {
  if (q.type === 'recall') {
    return (
      <div className="check-bar">
        {session.recallShown
          ? (
            <div className="col two">
              <button className="btn red" type="button" onClick={() => answer(false)}>몰랐어요</button>
              <button className="btn" type="button" onClick={() => answer(true)}>알았어요</button>
            </div>
          )
          : <div className="col one"><button className="btn blue" type="button" onClick={showRecall}>답 확인하기</button></div>}
      </div>
    );
  }
  const ready = q.type === 'choice' ? session.selected !== null : session.typed.trim() !== '';
  return (
    <div className="check-bar">
      <div className="col">
        <button className="btn ghost skip" type="button" onClick={() => answer(false)}>모르겠어요</button>
        <button className="btn" id="check-btn" type="button" disabled={!ready} onClick={check}>확인</button>
      </div>
    </div>
  );
};
