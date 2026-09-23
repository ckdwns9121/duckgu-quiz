// 캐릭터 덕구를 Rive 파일(public/rive/duck.riv)로 만든다. Rive 에디터 없이 rive-mcp-server로 바이너리를 직접 쓴다.
// 실행: pnpm build:riv  (공식 Rive 런타임으로 불러와 상태 머신까지 검증하고 미리보기 PNG를 남긴다)
// 부위별 SVG → Rive 벡터, 4가지 동작, 상태 머신
import { writeFileSync, mkdirSync } from 'node:fs';
import { DUCK, SHADOW } from './mascot-parts.mjs';
const D = new URL('../node_modules/rive-mcp-server/dist/', import.meta.url).pathname;
const [{ createRiv }, { importSvg }, { RiveHost }, { PAGE_SCRIPT }, { encodeGif }] = await Promise.all([
  import(D + 'rivWriter.js'), import(D + 'svgImport.js'), import(D + 'riveHost.js'), import(D + 'pageScript.js'), import(D + 'gif.js'),
]);
const OUT = process.argv[2] ?? new URL('../public/rive/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const S = 2; // 원본 120x124를 2배로

// ---- 부위별 그림: scripts/mascot-parts.mjs ----
const svg = (inner) => `<svg viewBox="0 0 120 124" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
const PARTS = DUCK;

// 앱의 SVG(120x124)를 2배 한 크기 위에, 폴짝 뛸 때 머리가 잘리지 않게 위쪽 여유 40px을 더 둔다
const TOP = 40;
const W = 240, H = 248 + TOP;
const FEET = [W / 2, TOP + 112 * S]; // 몸 그룹 기준점 = 발바닥 가운데 (눌렸다 펴질 때 발이 바닥에 붙어 있게)

const scene = {
  artboard: { name: 'Duck', width: W, height: H },
  groups: [{ id: 'body', x: FEET[0], y: FEET[1], scaleX: S, scaleY: S }],
  shapes: [{ id: 'shadow', type: 'ellipse', x: FEET[0], y: TOP + SHADOW.cy * S, width: SHADOW.rx * 2 * S, height: SHADOW.ry * 2 * S, z: 1, opacity: 0.08, fill: { color: '#000000' } }],
  animations: [],
};
for (const [id, part] of Object.entries(PARTS)) {
  const frag = importSvg(svg(part.svg), { idPrefix: `${id}_` });
  if (frag.warnings.length) console.log(id, 'warnings:', frag.warnings.join('; '));
  const [px, py] = part.pivot;
  // 부위 그룹은 몸(발바닥 기준) 안에서 자기 기준점에 놓는다 → 팔은 어깨, 눈은 눈 높이를 축으로 돈다
  scene.groups.push({ id, parent: 'body', x: px - 60, y: py - 112, opacity: ['eyesHappy', 'mouthSad', 'tear'].includes(id) ? 0 : 1 });
  frag.shapes.forEach((s, i) => scene.shapes.push({ ...s, x: s.x - px, y: s.y - py, parent: id, z: part.z + i }));
}

// ---- 동작 ----
const FPS = 60;
const k = (frame, value, easing) => (easing ? { frame, value, easing } : { frame, value });
const hold = (target, property, value) => ({ target, property, keyframes: [k(0, value)] });
/** 모든 동작의 첫 프레임에 표정을 명시한다: 다른 상태에서 넘어와도 이전 표정이 남지 않게 */
const face = ({ happy = false, sad = false }) => [
  hold('eyesOpen', 'opacity', happy ? 0 : 1),
  hold('eyesHappy', 'opacity', happy ? 1 : 0),
  hold('mouthSmile', 'opacity', sad ? 0 : 1),
  hold('mouthSad', 'opacity', sad ? 1 : 0),
];
// 날개 회전: 왼쪽 날개는 +가 위로(파닥), -가 아래로(처짐). 오른쪽은 반대
const armsRest = [hold('armL', 'rotation', 0), hold('armR', 'rotation', 0)];
const Y = FEET[1];

scene.animations.push({
  name: 'idle', duration: 156, fps: FPS, loop: 'loop',
  tracks: [
    ...face({}), ...armsRest, hold('tear', 'opacity', 0), hold('body', 'y', Y), hold('body', 'rotation', 0),
    { target: 'body', property: 'scaleY', keyframes: [k(0, S), k(78, S * 0.97, 'ease-in-out'), k(156, S, 'ease-in-out')] },
    { target: 'body', property: 'scaleX', keyframes: [k(0, S), k(78, S * 1.03, 'ease-in-out'), k(156, S, 'ease-in-out')] },
    { target: 'eyesOpen', property: 'scaleY', keyframes: [k(0, 1), k(140, 1), k(146, 0.1, 'ease-in'), k(152, 1, 'ease-out'), k(156, 1)] },
  ],
});
scene.animations.push({
  name: 'happy', duration: 60, fps: FPS, loop: 'oneShot',
  tracks: [
    ...face({ happy: true }), hold('tear', 'opacity', 0), hold('body', 'rotation', 0), hold('eyesOpen', 'scaleY', 1),
    { target: 'armL', property: 'rotation', keyframes: [k(0, 0), k(6, 30, 'ease-out'), k(12, 0, 'ease-in'), k(18, 30, 'ease-out'), k(24, 0, 'ease-in'), k(30, 24, 'ease-out'), k(38, 0, 'ease-in')] },
    { target: 'armR', property: 'rotation', keyframes: [k(0, 0), k(6, -30, 'ease-out'), k(12, 0, 'ease-in'), k(18, -30, 'ease-out'), k(24, 0, 'ease-in'), k(30, -24, 'ease-out'), k(38, 0, 'ease-in')] },
    { target: 'body', property: 'y', keyframes: [k(0, Y), k(12, Y - 34, 'ease-out'), k(22, Y, 'ease-in'), k(32, Y - 16, 'ease-out'), k(40, Y, 'ease-in'), k(60, Y)] },
    { target: 'body', property: 'scaleY', keyframes: [k(0, S * 0.9), k(8, S * 1.08, 'ease-out'), k(22, S * 0.88, 'ease-in'), k(28, S * 1.04, 'ease-out'), k(40, S * 0.94, 'ease-in'), k(48, S, 'ease-out')] },
    { target: 'body', property: 'scaleX', keyframes: [k(0, S * 1.1), k(8, S * 0.94, 'ease-out'), k(22, S * 1.12, 'ease-in'), k(28, S * 0.97, 'ease-out'), k(40, S * 1.05, 'ease-in'), k(48, S, 'ease-out')] },
  ],
});
scene.animations.push({
  name: 'sad', duration: 90, fps: FPS, loop: 'oneShot',
  tracks: [
    ...face({ sad: true }), hold('eyesOpen', 'scaleY', 0.8), hold('body', 'y', Y),
    { target: 'armL', property: 'rotation', keyframes: [k(0, 0), k(18, -22, 'emphasized-decel'), k(90, -22)] },
    { target: 'armR', property: 'rotation', keyframes: [k(0, 0), k(18, 22, 'emphasized-decel'), k(90, 22)] },
    { target: 'body', property: 'scaleY', keyframes: [k(0, S), k(18, S * 0.92, 'emphasized-decel'), k(90, S * 0.92)] },
    { target: 'body', property: 'scaleX', keyframes: [k(0, S), k(18, S * 1.06, 'emphasized-decel'), k(90, S * 1.06)] },
    { target: 'body', property: 'rotation', keyframes: [k(0, 0), k(20, -4, 'ease-out'), k(50, 3, 'ease-in-out'), k(90, 0, 'ease-in-out')] },
    { target: 'tear', property: 'opacity', keyframes: [k(0, 0), k(14, 1, 'ease-out'), k(70, 1), k(90, 0, 'ease-in')] },
    { target: 'tear', property: 'y', keyframes: [k(0, 56 - 112), k(14, 56 - 112), k(90, 56 - 112 + 12, 'ease-in')] },
  ],
});
scene.animations.push({
  name: 'cheer', duration: 34, fps: FPS, loop: 'loop',
  tracks: [
    ...face({ happy: true }), hold('tear', 'opacity', 0), hold('body', 'rotation', 0), hold('eyesOpen', 'scaleY', 1),
    { target: 'body', property: 'y', keyframes: [k(0, Y), k(10, Y - 30, 'ease-out'), k(20, Y, 'ease-in'), k(34, Y)] },
    { target: 'body', property: 'scaleY', keyframes: [k(0, S * 0.92), k(8, S * 1.06, 'ease-out'), k(20, S * 0.9, 'ease-in'), k(27, S, 'ease-out'), k(34, S * 0.92)] },
    { target: 'body', property: 'scaleX', keyframes: [k(0, S * 1.08), k(8, S * 0.96, 'ease-out'), k(20, S * 1.1, 'ease-in'), k(27, S, 'ease-out'), k(34, S * 1.08)] },
    { target: 'armL', property: 'rotation', keyframes: [k(0, 0), k(17, 38, 'ease-in-out'), k(34, 0, 'ease-in-out')] },
    { target: 'armR', property: 'rotation', keyframes: [k(0, 0), k(17, -38, 'ease-in-out'), k(34, 0, 'ease-in-out')] },
  ],
});

// ---- 상태 머신: 앱은 happy/sad 트리거를 당기고, 완료 화면에서 cheer를 켠다 ----
scene.stateMachine = {
  name: 'Mascot',
  inputs: [{ name: 'happy', type: 'trigger' }, { name: 'sad', type: 'trigger' }, { name: 'cheer', type: 'bool', initial: false }],
  states: [
    { name: 'idle', animation: 'idle' }, { name: 'happy', animation: 'happy' },
    { name: 'sad', animation: 'sad' }, { name: 'cheer', animation: 'cheer' },
  ],
  transitions: [
    { from: 'entry', to: 'idle' },
    { from: 'any', to: 'happy', condition: { input: 'happy' }, durationMs: 80 },
    { from: 'any', to: 'sad', condition: { input: 'sad' }, durationMs: 80 },
    { from: 'happy', to: 'idle', exitTimeMs: 1000, durationMs: 150 },
    { from: 'sad', to: 'idle', exitTimeMs: 1500, durationMs: 200 },
    { from: 'idle', to: 'cheer', condition: { input: 'cheer', value: true }, durationMs: 100 },
    { from: 'cheer', to: 'idle', condition: { input: 'cheer', value: false }, durationMs: 150 },
  ],
};

const { bytes, warnings } = createRiv(scene);
if (warnings.length) console.log('create warnings:', warnings.join('; '));
writeFileSync(`${OUT}/duck.riv`, Buffer.from(bytes));
console.log('duck.riv', bytes.length, 'bytes');

// ---- 공식 런타임으로 검증 + 미리보기 GIF ----
const host = new RiveHost(PAGE_SCRIPT);
const buf = Buffer.from(bytes);
const info = await host.inspect(buf);
const ab = info.artboards[0];
console.log('animations:', ab.animations.map((a) => `${a.name}(${a.duration ?? ''})`).join(', '));
console.log('state machines:', JSON.stringify(ab.stateMachines));
for (const name of ['idle', 'happy', 'sad', 'cheer']) {
  const fps = 30, secs = name === 'idle' ? 2.6 : name === 'cheer' ? 1.2 : name === 'happy' ? 1.1 : 1.6;
  const r = await host.renderFrames(buf, { animation: name, startTime: 0, frameCount: Math.round(secs * fps), fps, width: W, height: H, format: 'png', background: '#FFFFFF' });
  mkdirSync('docs/rive-preview', { recursive: true });
  writeFileSync(`docs/rive-preview/duck-${name}.png`, Buffer.from(r.frames[Math.round(r.frames.length * 0.3)], 'base64'));
}
const play = await host.playStateMachine(buf, { stateMachine: 'Mascot', steps: [
  { advance: 0.3 }, { input: 'happy', advance: 0.2, capture: true }, { advance: 1.2 },
  { input: 'sad', advance: 0.4, capture: true }, { advance: 1.6 },
  { input: 'cheer', value: true, advance: 0.3, capture: true }, { input: 'cheer', value: false, advance: 0.5 },
] });
console.log('SM report:', JSON.stringify(play.report.map((r) => ({ s: r.step, applied: r.applied, changed: r.statesChanged }))));
await host.close();
