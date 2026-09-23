import type { Question } from '../domain/types';
import { createVNode } from '../lib';
import { check, pickTile, selectChoice, setInputMode, showHint, typeAnswer, unpickTile, usesTiles } from '../services/lessonService';
import type { LessonSession } from '../stores/lessonStore';
import { BulbIcon } from './Icons';
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
      <Hints q={q} session={session} />
      {q.type === 'choice' && <Choices q={q} session={session} />}
      {q.type === 'build' && <TileBoard tiles={q.tiles} session={session} />}
      {q.type === 'typing' && usesTiles() && (
        <div style="display:grid;gap:10px">
          <TileBoard tiles={q.tiles} session={session} />
          {!session.feedback && <button className="mode-switch" type="button" onClick={() => setInputMode('keyboard')}>키보드로 직접 쓰기</button>}
        </div>
      )}
      {q.type === 'typing' && !usesTiles() && (
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
          {!session.feedback && <button className="mode-switch" type="button" onClick={() => setInputMode('tiles')}>조각 눌러서 풀기</button>}
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
  if (card.kind === 'build') return <p className="q-term">{card.title}</p>;
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

/** 힌트 보기: 누를 때마다 한 단계씩 연다. 채점 뒤에는 해설이 나오므로 숨긴다 */
const Hints = ({ q, session }: { q: Question; session: LessonSession }) => {
  const hints = q.card.hints;
  if (!hints.length || session.feedback || (q.type === 'recall' && session.recallShown)) return null;
  const shown = hints.slice(0, session.hintsShown);
  const left = hints.length - session.hintsShown;
  return (
    <div className="hints">
      {shown.map((html, i) => (
        <div className="hint-card">
          <span className="hint-tag"><BulbIcon />힌트 {i + 1}</span>
          <div innerHTML={html} />
        </div>
      ))}
      {left > 0 && (
        <button className="hint-btn" type="button" onClick={showHint}>
          <BulbIcon />{session.hintsShown === 0 ? '힌트 보기' : '힌트 더 보기'}
          {hints.length > 1 && <span className="n">{session.hintsShown + 1}/{hints.length}</span>}
        </button>
      )}
    </div>
  );
};

/**
 * 답 조각: 아래 조각을 누르면 위 답 줄에 순서대로 쌓이고, 답 줄의 조각을 누르면 다시 빠진다.
 * 키보드가 안 올라와서 폰에서 화면이 밀리지 않는다.
 */
const TileBoard = ({ tiles, session }: { tiles: string[]; session: LessonSession }) => {
  const graded = Boolean(session.feedback);
  return (
    <div className="tiles-board">
      <div className="tile-line" aria-label="내가 만든 답">
        {session.picked.length === 0 && <span className="tile-placeholder">아래 조각을 순서대로 눌러 보세요</span>}
        {session.picked.map((tileIndex, position) => (
          <button className="tile" type="button" disabled={graded} onClick={() => unpickTile(position)}>{tiles[tileIndex]}</button>
        ))}
      </div>
      <div className="tile-bank">
        {tiles.map((tile, i) => {
          const used = session.picked.includes(i);
          return (
            <button className={`tile${used ? ' used' : ''}`} type="button" disabled={used || graded} aria-hidden={used ? 'true' : null} onClick={() => pickTile(i)}>
              {tile}
            </button>
          );
        })}
      </div>
    </div>
  );
};
