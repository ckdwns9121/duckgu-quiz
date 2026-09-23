import { progressStore } from '../stores/progressStore';

// 효과음 파일 없이 Web Audio로 짧은 소리를 합성한다
let ctx: AudioContext | null = null;

function tone(freq: number, delay: number, duration: number, type: OscillatorType = 'sine', volume = 0.18) {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {
    /* 오디오를 못 쓰는 환경이면 소리 없이 진행 */
  }
}

const enabled = () => progressStore.getState().sound;

export const sfx = {
  correct() {
    if (!enabled()) return;
    tone(784, 0, 0.12);
    tone(1175, 0.09, 0.22);
  },
  wrong() {
    if (!enabled()) return;
    tone(220, 0, 0.18, 'square', 0.07);
    tone(165, 0.12, 0.26, 'square', 0.07);
  },
  complete() {
    if (!enabled()) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, 'triangle', 0.16));
  },
};
