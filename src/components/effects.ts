/**
 * 정답·오답 순간의 동적 효과.
 * 가상 DOM 밖에서 body 위에 잠깐 덧그렸다가 치운다 (렌더 비교 대상이 아니라서 화면 갱신과 부딪치지 않는다).
 * 움직임 줄이기 설정을 켠 사용자에게는 아무것도 하지 않는다.
 */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF', '#FF9600'];

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number;
  rot: number; vr: number; color: string; life: number; shape: 'rect' | 'star';
}

// ---------- 파티클 엔진 (캔버스 하나를 같이 쓴다) ----------
let canvas: HTMLCanvasElement | null = null;
let particles: Particle[] = [];
let running = false;

function ensureCanvas() {
  if (canvas) return canvas.getContext('2d')!;
  canvas = document.createElement('canvas');
  canvas.id = 'confetti';
  document.body.appendChild(canvas);
  const dpr = devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function loop() {
  const ctx = ensureCanvas();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  for (const p of particles) {
    p.vy += 0.34; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life / 25);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === 'star') drawStar(ctx, p.size);
    else ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
    ctx.restore();
  }
  if (particles.length) requestAnimationFrame(loop);
  else {
    running = false;
    canvas?.remove();
    canvas = null;
  }
}

function emit(x: number, y: number, count: number, power: number, spread = Math.PI * 2, angle = -Math.PI / 2) {
  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const speed = power * (0.45 + Math.random() * 0.75);
    particles.push({
      x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      size: Math.random() * 6 + 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[i % COLORS.length], life: 70 + Math.random() * 50, shape: Math.random() < 0.3 ? 'star' : 'rect',
    });
  }
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}

const centerOf = (el: Element | null) => {
  if (!el) return { x: innerWidth / 2, y: innerHeight * 0.45 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** 떠오르며 사라지는 글자 ("+1", "3연속!") */
function floatText(x: number, y: number, text: string, color: string, size = 22) {
  const el = document.createElement('div');
  el.className = 'fx-float';
  el.textContent = text;
  el.style.cssText = `left:${x}px;top:${y}px;color:${color};font-size:${size}px`;
  document.body.appendChild(el);
  el.animate(
    [
      { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%,-220%) scale(1)', opacity: 0 },
    ],
    { duration: 1000, easing: 'cubic-bezier(.2,.8,.3,1)' },
  ).onfinish = () => el.remove();
}

// ---------- 공개 효과 ----------

/** 정답: 고른 보기(또는 입력칸)에서 폭죽, 진행 바 반짝임, 연속 정답이면 더 크게 */
export function celebrateCorrect(origin: Element | null, combo: number) {
  if (reduced()) return;
  const { x, y } = centerOf(origin);
  const big = combo >= 3;
  emit(x, y, big ? 60 : 28, big ? 13 : 9);
  floatText(x, y - 10, big ? `${combo}연속!` : '+1', big ? '#FF9600' : '#58CC02', big ? 30 : 24);

  const bar = document.querySelector('.pbar');
  bar?.classList.remove('glow');
  void (bar as HTMLElement | null)?.offsetWidth;
  bar?.classList.add('glow');
}

/** 오답: 하트 하나가 튀어나와 깨지며 떨어지고, 문제 화면이 좌우로 흔들린다 */
export function loseHeart() {
  if (reduced()) return;
  const icon = document.querySelector('.lives svg');
  if (icon) {
    const r = icon.getBoundingClientRect();
    const heart = document.createElement('div');
    heart.className = 'fx-heart';
    heart.innerHTML =
      '<svg viewBox="0 0 24 24"><path class="l" d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6l-1.5 4 2 2.5-1 3z"/><path class="r" d="M12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9l1-5.5-2-2.5z"/></svg>';
    heart.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
    document.body.appendChild(heart);
    heart.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(-30px,40px) scale(1.9)', opacity: 1, offset: 0.3 },
        { transform: 'translate(-60px,260px) scale(1.4) rotate(-25deg)', opacity: 0 },
      ],
      { duration: 1100, easing: 'cubic-bezier(.3,.6,.4,1)' },
    ).onfinish = () => heart.remove();
    // 0.3초쯤 커졌을 때 반으로 쪼개진다
    setTimeout(() => heart.classList.add('broken'), 330);
  }
  const lives = document.querySelector('.lives');
  lives?.classList.remove('hit-now');
  void (lives as HTMLElement | null)?.offsetWidth;
  lives?.classList.add('hit-now');

  const body = document.querySelector('.lesson-body');
  body?.classList.remove('shake');
  void (body as HTMLElement | null)?.offsetWidth;
  body?.classList.add('shake');
  navigator.vibrate?.(80);
}

/** 레슨 완료: 화면 위쪽 양옆에서 크게 터뜨린다 */
export function celebrateLesson() {
  if (reduced()) return;
  emit(innerWidth * 0.5, innerHeight * 0.35, 90, 15);
  setTimeout(() => emit(0, innerHeight * 0.55, 45, 16, 0.9, -Math.PI / 3), 250);
  setTimeout(() => emit(innerWidth, innerHeight * 0.55, 45, 16, 0.9, (-2 * Math.PI) / 3), 450);
}
