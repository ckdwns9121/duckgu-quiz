/**
 * 캐릭터 덕구를 Rive(public/rive/duck.riv)로 움직인다.
 *
 * Mascot 컴포넌트는 SVG를 그리고 그 위에 빈 <canvas>를 얹어 둔다. 렌더가 끝날 때마다 여기서
 * 새로 생긴 캔버스에 Rive를 붙이고, data-mood가 바뀌면 상태 머신 입력을 당긴다.
 * Rive가 준비되기 전이나 불러오지 못하면 SVG 캐릭터(CSS 애니메이션)가 그대로 보인다.
 *
 * 상태 머신 "Mascot": happy·sad 트리거, cheer 불(bool)
 */
import type { Rive as RiveInstance } from '@rive-app/canvas-lite';
import type { Mood } from './Mascot';

type RiveModule = typeof import('@rive-app/canvas-lite');

const SRC = `${import.meta.env.BASE_URL}rive/duck.riv`;
const STATE_MACHINE = 'Mascot';

let runtime: Promise<RiveModule | null> | null = null;
const instances = new Map<HTMLElement, { rive: RiveInstance; mood: Mood | null; ready: boolean }>();

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 런타임(약 40KB + wasm)은 첫 화면이 뜬 뒤에 받는다. wasm도 외부 CDN이 아니라 우리 빌드에 들어간 사본을 쓴다 */
function loadRuntime() {
  runtime ??= Promise.all([import('@rive-app/canvas-lite'), import('@rive-app/canvas-lite/rive.wasm?url')])
    .then(([mod, wasm]) => {
      mod.RuntimeLoader.setWasmUrl(wasm.default);
      return mod;
    })
    .catch(() => null);
  return runtime;
}

function applyMood(entry: { rive: RiveInstance; mood: Mood | null; ready: boolean }, mood: Mood) {
  if (!entry.ready || entry.mood === mood) return;
  const inputs = entry.rive.stateMachineInputs(STATE_MACHINE) ?? [];
  const input = (name: string) => inputs.find((i) => i.name === name);
  const cheer = input('cheer');
  if (cheer) cheer.value = mood === 'cheer';
  if (mood === 'happy') input('happy')?.fire();
  if (mood === 'sad') input('sad')?.fire();
  entry.mood = mood;
}

async function attach(host: HTMLElement) {
  const canvas = host.querySelector('canvas');
  const mod = await loadRuntime();
  if (!mod || !canvas || !host.isConnected || instances.has(host)) return;

  const entry = { rive: null as unknown as RiveInstance, mood: null as Mood | null, ready: false };
  entry.rive = new mod.Rive({
    src: SRC,
    canvas,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new mod.Layout({ fit: mod.Fit.Contain, alignment: mod.Alignment.BottomCenter }),
    // 장식이라 클릭을 가로챌 필요가 없다
    shouldDisableRiveListeners: true,
    onLoad: () => {
      entry.rive.resizeDrawingSurfaceToCanvas();
      entry.ready = true;
      host.classList.add('rive-ready');
      applyMood(entry, (host.dataset.mood as Mood) ?? 'idle');
    },
    onLoadError: () => {
      instances.delete(host);
      entry.rive.cleanup();
    },
  });
  instances.set(host, entry);
}

/** render()가 DOM 반영을 마칠 때마다 부른다 */
export function syncRiveMascots() {
  if (reducedMotion()) return;
  // 화면에서 사라진 캐릭터는 정리한다 (애니메이션 루프와 메모리를 돌려준다)
  for (const [host, entry] of instances) {
    if (!host.isConnected) {
      entry.rive.cleanup();
      instances.delete(host);
    }
  }
  document.querySelectorAll<HTMLElement>('.mascot-host').forEach((host) => {
    const entry = instances.get(host);
    if (entry) applyMood(entry, (host.dataset.mood as Mood) ?? 'idle');
    else void attach(host);
  });
}

/** 화면 크기가 바뀌면 캔버스 해상도를 다시 맞춘다 */
export function resizeRiveMascots() {
  instances.forEach((entry) => entry.ready && entry.rive.resizeDrawingSurfaceToCanvas());
}
