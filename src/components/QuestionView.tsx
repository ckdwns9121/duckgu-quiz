import type { Question } from '../domain/types';
import { createVNode } from '../lib';
import { check, selectChoice, typeAnswer } from '../services/lessonService';
import type { LessonSession } from '../stores/lessonStore';
import { Mascot } from './Mascot';

/** 문제 본문 (말풍선, 코드, 보기). 채점 전후 상태는 session에서 읽는다 */
export const QuestionView = ({ q, session }: { q: Question; session: LessonSession }) => {
  const retried = session.firstTry[q.card.id] === false && !session.feedback;
  return (
    <main className="col lesson-body">
      <p className="q-kind">{q.label}</p>
      {retried && <p className="hint" style="color:var(--orange);font-weight:700">아까 틀린 문제예요. 다시 도전!</p>}
      <div className="speaker">
        <div><Mascot mood="idle" /></div>
        <div className="bubble" innerHTML={q.say} />
      </div>
      <Prompt q={q} />
      {q.type === 'choice' && <Choices q={q} session={session} />}
      {q.type === 'typing' && (
        <div style="display:grid;gap:8px">
          <input
            className="answer-input" id="answer" autocomplete="off" autocapitalize="off" spellcheck="false"
            placeholder="출력값 입력" enterkeyhint="done" value={session.typed} disabled={Boolean(session.feedback)}
            onInput={(e: Event) => typeAnswer((e.target as HTMLInputElement).value)}
            onKeydown={(e: KeyboardEvent) => {
              if (e.key !== 'Enter') return;
              // 전역 단축키(Enter = 계속)가 같은 Enter를 또 처리하지 않게 막는다
              e.preventDefault();
              check();
            }}
          />
          <p className="hint">띄어쓰기와 따옴표는 신경 안 써도 돼요.</p>
        </div>
      )}
      {q.type === 'recall' && session.recallShown && <div className="explain reveal-box" innerHTML={q.card.explain} />}
    </main>
  );
};

const Prompt = ({ q }: { q: Question }) => {
  if (q.type === 'choice' && q.promptHtml) return <div style="display:grid" innerHTML={q.promptHtml} />;
  if (q.type === 'choice' && q.prompt) return <p className="q-text">{q.prompt}</p>;
  const card = q.card;
  if (card.kind === 'term' || card.kind === 'rel') return null;
  return (
    <div style="display:grid;gap:14px">
      <p className="q-term">{card.title}</p>
      {card.kind === 'recall' && card.mnemo && <span className="mnemo">{card.mnemo}</span>}
      {card.pre && <div innerHTML={card.pre} />}
      {card.kind === 'recall' && card.q && <p className="q-text" innerHTML={card.q} />}
    </div>
  );
};

const Choices = ({ q, session }: { q: Extract<Question, { type: 'choice' }>; session: LessonSession }) => {
  const graded = Boolean(session.feedback);
  return (
    <div className="choices">
      {q.options.map((option, i) => {
        const state = graded
          ? option === q.correct ? ' right' : i === session.selected ? ' wrong' : ''
          : i === session.selected ? ' sel' : '';
        return (
          <button className={`choice${state}`} type="button" disabled={graded} onClick={() => selectChoice(i)}>
            <span className="k">{i + 1}</span><span>{option}</span>
          </button>
        );
      })}
    </div>
  );
};
