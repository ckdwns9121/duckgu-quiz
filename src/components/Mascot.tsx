import { createVNode } from '../lib';

export type Mood = 'idle' | 'happy' | 'sad' | 'cheer';

/**
 * 캐릭터 "비트". mood 클래스만 바꾸면 CSS 애니메이션이 표정과 동작을 바꾼다.
 * 나중에 직접 만든 Rive 캐릭터가 생기면 이 컴포넌트만 바꿔 끼우면 된다.
 */
export const Mascot = ({ mood = 'idle' }: { mood?: Mood }) => (
  <svg className={`mascot ${mood}`} viewBox="0 0 120 124" aria-hidden="true">
    <ellipse cx="60" cy="119" rx="34" ry="5" fill="#000" opacity=".08" />
    <g className="body">
      <path className="arm-l" d="M20 70c-10 2-15 10-13 17 4 1 10-4 15-9z" fill="#3FB5A3" />
      <path className="arm-r" d="M100 70c10 2 15 10 13 17-4 1-10-4-15-9z" fill="#3FB5A3" />
      <path d="M60 14c-4 0-6 3-6 6v6h12v-6c0-3-2-6-6-6z" fill="#3FB5A3" />
      <circle cx="60" cy="10" r="6" fill="#FFC800" />
      <path d="M60 24C30 24 16 46 16 74c0 26 18 40 44 40s44-14 44-40C104 46 90 24 60 24z" fill="#4FD1BD" />
      <path d="M60 24C30 24 16 46 16 74c0 6 1 11 3 16 6-30 22-50 55-54 10-1 19 1 26 5-7-11-21-17-40-17z" fill="#7BE3D2" opacity=".7" />
      <ellipse cx="60" cy="88" rx="26" ry="19" fill="#E9FBF7" />
      <g className="eyes-open">
        <g className="blink"><ellipse cx="44" cy="62" rx="9" ry="11" fill="#fff" /><ellipse cx="45.5" cy="64" rx="5" ry="6.5" fill="#23324A" /><circle cx="47.5" cy="61" r="2" fill="#fff" /></g>
        <g className="blink"><ellipse cx="76" cy="62" rx="9" ry="11" fill="#fff" /><ellipse cx="77.5" cy="64" rx="5" ry="6.5" fill="#23324A" /><circle cx="79.5" cy="61" r="2" fill="#fff" /></g>
      </g>
      <g className="eyes-happy" fill="none" stroke="#23324A" stroke-width="4" stroke-linecap="round">
        <path d="M36 64q8-10 16 0" /><path d="M68 64q8-10 16 0" />
      </g>
      <circle cx="34" cy="77" r="5" fill="#FF8FA3" opacity=".55" />
      <circle cx="86" cy="77" r="5" fill="#FF8FA3" opacity=".55" />
      <path className="mouth-smile" d="M51 78q9 9 18 0" fill="#23324A" />
      <path className="mouth-sad" d="M52 83q8-7 16 0" fill="none" stroke="#23324A" stroke-width="3.5" stroke-linecap="round" />
      <path className="tear" d="M38 72q-3 6 0 8 3-2 0-8z" fill="#7CC8FF" />
    </g>
  </svg>
);
