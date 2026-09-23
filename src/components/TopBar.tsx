import { visibleStreak, dayKey } from '../domain/streak';
import { createVNode } from '../lib';
import { progressStore } from '../stores/progressStore';
import { BoltIcon, FireIcon, SoundIcon } from './Icons';

export const TopBar = () => {
  const { streak, lastDay, xp, sound } = progressStore.getState();
  const doneToday = lastDay === dayKey();
  return (
    <header className="topbar">
      <div className="col">
        <span className="brandmini">정처기 실기</span>
        <div style="display:flex;gap:4px;align-items:center">
          <span className={`stat fire${doneToday ? '' : ' off'}`} title={doneToday ? '오늘 학습 완료' : '오늘 레슨을 하나 끝내면 불이 켜져요'}>
            <FireIcon /><span>{visibleStreak(streak, lastDay)}</span>
          </span>
          <span className="stat xp" title="총 XP"><BoltIcon /><span>{xp}</span></span>
          <button
            className={`icon-btn${sound ? ' on' : ''}`} type="button" aria-label={sound ? '효과음 끄기' : '효과음 켜기'}
            onClick={() => progressStore.dispatch({ type: 'TOGGLE_SOUND' })}
          ><SoundIcon on={sound} /></button>
        </div>
      </div>
    </header>
  );
};
