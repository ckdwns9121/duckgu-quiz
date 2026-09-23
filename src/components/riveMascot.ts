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
const instances = new Map<HTMLElement, Entry>();

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

function applyMood(entry: Entry, mood: Mood, canvas?: HTMLCanvasElement | null) {
  if (!entry.ready || entry.mood === mood) return;
  if (canvas && fitCanvas(canvas)) entry.rive.resizeToCanvas();
  const inputs = entry.rive.stateMachineInputs(STATE_MACHINE) ?? [];
  const input = (name: string) => inputs.find((i) => i.name === name);
  const cheer = input('cheer');
  if (cheer) cheer.value = mood === 'cheer';
  if (mood === 'happy') input('happy')?.fire();
  if (mood === 'sad') input('sad')?.fire();
  entry.mood = mood;
}

type Entry = { rive: RiveInstance; mood: Mood | null; ready: boolean; observer: ResizeObserver };

/**
 * 캔버스 픽셀 크기를 화면에 보이는 크기 × 기기 배율로 맞춘다.
 * 안 맞추면 캔버스가 기본 크기(300×150, 가로로 긴 모양)로 남아서, 그 위에 그린 캐릭터가
 * 세로로 긴 칸에 억지로 끼워지며 홀쭉하게 찌그러진다 (아이폰 홈 화면 앱에서 실제로 생긴 문제).
 * 크기를 못 읽으면(아직 화면에 안 나왔으면) false를 돌려준다.
 */
function fitCanvas(canvas: HTMLCanvasElement): boolean {
  // getBoundingClientRect는 부모의 확대·축소 애니메이션(해설 시트의 등장 효과 등)까지 반영해서
  // 잠깐 작아진 크기로 재 버린다. 그러면 작은 그림을 늘려 보여 줘서 캐릭터가 흐릿하게 깨진다.
  // clientWidth/Height는 애니메이션과 상관없는 실제 칸 크기다.
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width < 1 || height < 1) return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return true;
}

async function attach(host: HTMLElement) {
  const canvas = host.querySelector('canvas');
  const mod = await loadRuntime();
  if (!mod || !canvas || !host.isConnected || instances.has(host)) return;
  fitCanvas(canvas);

  const entry = { mood: null, ready: false } as unknown as Entry;
  // 칸 크기가 바뀌거나 늦게 잡히면(화면 전환, 회전, 홈 화면 앱 첫 실행) 캔버스를 다시 맞추고 다시 그린다
  entry.observer = new ResizeObserver(() => {
    if (fitCanvas(canvas) && entry.ready) entry.rive.resizeToCanvas();
  });
  entry.observer.observe(canvas);

  entry.rive = new mod.Rive({
    src: SRC,
    canvas,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new mod.Layout({ fit: mod.Fit.Contain, alignment: mod.Alignment.BottomCenter }),
    // 장식이라 클릭을 가로챌 필요가 없다
    shouldDisableRiveListeners: true,
    onLoad: () => {
      fitCanvas(canvas);
      entry.rive.resizeToCanvas();
      entry.ready = true;
      host.classList.add('rive-ready');
      applyMood(entry, (host.dataset.mood as Mood) ?? 'idle');
    },
    onLoadError: () => {
      entry.observer.disconnect();
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
      entry.observer.disconnect();
      entry.rive.cleanup();
      instances.delete(host);
    }
  }
  document.querySelectorAll<HTMLElement>('.mascot-host').forEach((host) => {
    const entry = instances.get(host);
    if (entry) applyMood(entry, (host.dataset.mood as Mood) ?? 'idle', host.querySelector('canvas'));
    else void attach(host);
  });
}

/** 화면 크기가 바뀌면 캔버스 해상도를 다시 맞춘다 (ResizeObserver를 못 쓰는 경우를 위한 보조) */
export function resizeRiveMascots() {
  instances.forEach((entry, host) => {
    const canvas = host.querySelector('canvas');
    if (canvas && fitCanvas(canvas) && entry.ready) entry.rive.resizeToCanvas();
  });
}
