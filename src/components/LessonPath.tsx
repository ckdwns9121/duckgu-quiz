import { isUnlocked } from '../domain/lessons';
import type { Lesson, Unit } from '../domain/types';
import { createVNode } from '../lib';
import { startLesson } from '../services/lessonService';
import { CheckIcon, LockIcon, StarIcon, TrophyIcon } from './Icons';
import { Mascot } from './Mascot';

// 노드를 좌우로 흔들어 길처럼 보이게 한다
const ZIGZAG = [0, 44, 70, 44, 0, -44, -70, -44];

interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  isLast: boolean;
  done: boolean;
  open: boolean;
  current: boolean;
  showStart: boolean;
}

const LessonNode = ({ lesson, index, isLast, done, open, current, showStart }: LessonNodeProps) => {
  const x = ZIGZAG[index % ZIGZAG.length];
  const label = `${lesson.unit.name} 레슨 ${lesson.n}${done ? ' 완료' : open ? '' : ' 잠김'}`;
  return (
    <div className={`node-wrap${current ? ' current' : ''}`} style={`transform:translateX(${x}px)`} data-lesson={lesson.id}>
      {showStart && <span className="start-tip">시작</span>}
      <button
        className={`node${done ? ' done' : open ? '' : ' locked'}`} type="button" aria-label={label}
        onClick={() => open && startLesson(lesson.id)}
      >
        {done ? <CheckIcon /> : !open ? <LockIcon /> : isLast ? <TrophyIcon /> : <StarIcon />}
      </button>
      {showStart && <div className={`path-mascot ${x > 0 ? 'left' : 'right'}`}><Mascot /></div>}
    </div>
  );
};

interface UnitSectionProps {
  unit: Unit;
  index: number;
  lessons: Lesson[];
  done: Record<string, boolean>;
  firstCurrentId: string | null;
  notesHref: string;
}

export const UnitSection = ({ unit, index, lessons, done, firstCurrentId, notesHref }: UnitSectionProps) => {
  const doneCount = lessons.filter((l) => done[l.id]).length;
  const currentId = lessons.find((l) => isUnlocked(l, done) && !done[l.id])?.id;
  return (
    <section className="unit" style={`--uc:${unit.color};--ud:${unit.dark}`}>
      <div className="unit-head">
        <div className="t">
          <small>유닛 {index + 1} · {doneCount}/{lessons.length} 완료</small>
          <b>{unit.name}</b>
        </div>
        <a href={notesHref}>노트</a>
      </div>
      <div className="nodes">
        {lessons.map((lesson, i) => (
          <LessonNode
            lesson={lesson} index={i} isLast={i === lessons.length - 1}
            done={Boolean(done[lesson.id])} open={isUnlocked(lesson, done)}
            current={lesson.id === currentId} showStart={lesson.id === firstCurrentId}
          />
        ))}
      </div>
    </section>
  );
};
