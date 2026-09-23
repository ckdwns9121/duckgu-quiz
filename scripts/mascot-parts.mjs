// 캐릭터 "덕구"(러버덕) 부위별 그림. Rive 파일(build-mascot-riv.mjs)과 앱 아이콘(make-icons.mjs)이 같이 쓴다.
// 앱 안의 SVG 버전은 src/components/Mascot.tsx에 같은 좌표로 들어 있다. 모양을 바꾸면 둘 다 고친다.
export const DUCK = {
  armL: { pivot: [30, 76], z: 30, svg: '<path d="M30 70c-12 0-20 8-21 18 6 3 16 1 23-6z" fill="#F5B700"/>' },
  armR: { pivot: [90, 76], z: 31, svg: '<path d="M90 70c12 0 20 8 21 18-6 3-16 1-23-6z" fill="#F5B700"/>' },
  base: { pivot: [60, 112], z: 20, svg: `
    <path d="M60 60c-26 0-44 12-44 30 0 15 18 22 44 22s44-7 44-22c0-18-18-30-44-30z" fill="#FFD43B"/>
    <path d="M18 94c4 11 20 18 42 18s38-7 42-18c-8 8-22 12-42 12s-34-4-42-12z" fill="#F5B700"/>
    <ellipse cx="60" cy="94" rx="24" ry="12" fill="#FFE98A"/>
    <circle cx="60" cy="48" r="30" fill="#FFD43B"/>
    <path d="M40 30c6-8 16-12 26-11-12 3-20 10-24 20-2-3-3-6-2-9z" fill="#FFF3B0"/>
    <path d="M58 18c-2-6 3-11 9-9-3 1-5 4-4 7 3-2 7-1 8 2-4-1-8 0-13 0z" fill="#F5B700"/>
    <circle cx="36" cy="60" r="5.5" fill="#FF9FB0"/>
    <circle cx="84" cy="60" r="5.5" fill="#FF9FB0"/>` },
  eyesOpen: { pivot: [60, 46], z: 60, svg: `
    <ellipse cx="46" cy="46" rx="5.5" ry="7" fill="#23324A"/><circle cx="48" cy="43.5" r="2.2" fill="#FFFFFF"/>
    <ellipse cx="74" cy="46" rx="5.5" ry="7" fill="#23324A"/><circle cx="76" cy="43.5" r="2.2" fill="#FFFFFF"/>` },
  eyesHappy: { pivot: [60, 46], z: 61, svg: `
    <path d="M40 48q6-8 12 0" fill="none" stroke="#23324A" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M68 48q6-8 12 0" fill="none" stroke="#23324A" stroke-width="3.5" stroke-linecap="round"/>` },
  mouthSmile: { pivot: [60, 60], z: 70, svg: `
    <path d="M45 57c5-6 25-6 30 0-2 8-9 11-15 11s-13-3-15-11z" fill="#FF8A3D"/>
    <path d="M49 60q11 6 22 0" fill="none" stroke="#D9621E" stroke-width="2" stroke-linecap="round"/>` },
  mouthSad: { pivot: [60, 61], z: 71, svg: `
    <path d="M45 58c5-6 25-6 30 0-2 8-9 11-15 11s-13-3-15-11z" fill="#FF8A3D"/>
    <path d="M49 64q11-5 22 0" fill="none" stroke="#D9621E" stroke-width="2" stroke-linecap="round"/>` },
  tear: { pivot: [38, 56], z: 80, svg: '<path d="M38 52q-3 6 0 8 3-2 0-8z" fill="#7CC8FF"/>' },
};
export const SHADOW = { cx: 60, cy: 118, rx: 36, ry: 5 };
