import { createVNode } from '../lib';

export type Mood = 'idle' | 'happy' | 'sad' | 'cheer';

/**
 * 캐릭터 "덕구" (러버덕).
 * SVG(+CSS 애니메이션)를 기본으로 그리고, 위에 얹은 캔버스에 Rive(public/rive/duck.riv)가 준비되면
 * 그쪽으로 바꿔 보여 준다 (riveMascot.ts). 부위 좌표는 scripts/mascot-parts.mjs와 같다. className은 고정하고 표정은 data-mood로만 바꾼다:
 * 가상 DOM이 className을 다시 쓰면 Rive가 붙인 rive-ready 표시가 지워지기 때문이다.
 */
export const Mascot = ({ mood = 'idle' }: { mood?: Mood }) => (
  <div className="mascot-host" data-mood={mood}>
    <MascotSvg mood={mood} />
    <canvas className="mascot-rive" aria-hidden="true" />
  </div>
);

const MascotSvg = ({ mood }: { mood: Mood }) => (
  <svg className={`mascot ${mood}`} viewBox="0 0 120 124" aria-hidden="true">
    <ellipse cx="60" cy="118" rx="36" ry="5" fill="#000" opacity=".08" />
    <g className="body">
      <path d="M60 60c-26 0-44 12-44 30 0 15 18 22 44 22s44-7 44-22c0-18-18-30-44-30z" fill="#FFD43B" />
      <path d="M18 94c4 11 20 18 42 18s38-7 42-18c-8 8-22 12-42 12s-34-4-42-12z" fill="#F5B700" />
      <ellipse cx="60" cy="94" rx="24" ry="12" fill="#FFE98A" />
      <circle cx="60" cy="48" r="30" fill="#FFD43B" />
      <path d="M40 30c6-8 16-12 26-11-12 3-20 10-24 20-2-3-3-6-2-9z" fill="#FFF3B0" />
      <path d="M58 18c-2-6 3-11 9-9-3 1-5 4-4 7 3-2 7-1 8 2-4-1-8 0-13 0z" fill="#F5B700" />
      <circle cx="36" cy="60" r="5.5" fill="#FF9FB0" />
      <circle cx="84" cy="60" r="5.5" fill="#FF9FB0" />
      <path className="arm-l" d="M30 70c-12 0-20 8-21 18 6 3 16 1 23-6z" fill="#F5B700" />
      <path className="arm-r" d="M90 70c12 0 20 8 21 18-6 3-16 1-23-6z" fill="#F5B700" />
      <g className="eyes-open">
        <g className="blink"><ellipse cx="46" cy="46" rx="5.5" ry="7" fill="#23324A" /><circle cx="48" cy="43.5" r="2.2" fill="#fff" /></g>
        <g className="blink"><ellipse cx="74" cy="46" rx="5.5" ry="7" fill="#23324A" /><circle cx="76" cy="43.5" r="2.2" fill="#fff" /></g>
      </g>
      <g className="eyes-happy" fill="none" stroke="#23324A" stroke-width="3.5" stroke-linecap="round">
        <path d="M40 48q6-8 12 0" /><path d="M68 48q6-8 12 0" />
      </g>
      <g className="mouth-smile">
        <path d="M45 57c5-6 25-6 30 0-2 8-9 11-15 11s-13-3-15-11z" fill="#FF8A3D" />
        <path d="M49 60q11 6 22 0" fill="none" stroke="#D9621E" stroke-width="2" stroke-linecap="round" />
      </g>
      <g className="mouth-sad">
        <path d="M45 58c5-6 25-6 30 0-2 8-9 11-15 11s-13-3-15-11z" fill="#FF8A3D" />
        <path d="M49 64q11-5 22 0" fill="none" stroke="#D9621E" stroke-width="2" stroke-linecap="round" />
      </g>
      <path className="tear" d="M38 52q-3 6 0 8 3-2 0-8z" fill="#7CC8FF" />
    </g>
  </svg>
);
