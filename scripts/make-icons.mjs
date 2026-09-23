// 앱 아이콘(public/icons/*.png)을 캐릭터 비트로 그려 낸다.
// 실행: npx -y -p playwright node scripts/make-icons.mjs  (로컬에 Chrome 필요)
import { chromium } from 'playwright';
const OUT = new URL('../public/icons/', import.meta.url).pathname;
// 앱 안의 비트와 같은 도형. 아이콘용으로 볼터치를 조금 진하게, 눈에 반짝이를 하나 더 넣었다
const bit = `
<svg viewBox="4 0 112 118" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 70c-10 2-15 10-13 17 4 1 10-4 15-9z" fill="#3FB5A3"/>
  <path d="M100 70c10 2 15 10 13 17-4 1-10-4-15-9z" fill="#3FB5A3"/>
  <path d="M60 14c-4 0-6 3-6 6v6h12v-6c0-3-2-6-6-6z" fill="#3FB5A3"/>
  <circle cx="60" cy="10" r="6.5" fill="#FF8A3D"/>
  <circle cx="58" cy="8" r="2" fill="#fff" opacity=".7"/>
  <path d="M60 24C30 24 16 46 16 74c0 26 18 40 44 40s44-14 44-40C104 46 90 24 60 24z" fill="#4FD1BD"/>
  <path d="M60 24C30 24 16 46 16 74c0 6 1 11 3 16 6-30 22-50 55-54 10-1 19 1 26 5-7-11-21-17-40-17z" fill="#7BE3D2" opacity=".7"/>
  <ellipse cx="60" cy="88" rx="26" ry="19" fill="#E9FBF7"/>
  <ellipse cx="44" cy="62" rx="9" ry="11" fill="#fff"/><ellipse cx="45.5" cy="64" rx="5.5" ry="7" fill="#23324A"/>
  <circle cx="48" cy="60.5" r="2.4" fill="#fff"/><circle cx="43.5" cy="67.5" r="1.2" fill="#fff"/>
  <ellipse cx="76" cy="62" rx="9" ry="11" fill="#fff"/><ellipse cx="77.5" cy="64" rx="5.5" ry="7" fill="#23324A"/>
  <circle cx="80" cy="60.5" r="2.4" fill="#fff"/><circle cx="75.5" cy="67.5" r="1.2" fill="#fff"/>
  <circle cx="33" cy="77" r="5.5" fill="#FF8FA3" opacity=".75"/><circle cx="87" cy="77" r="5.5" fill="#FF8FA3" opacity=".75"/>
  <path d="M50 77q10 12 20 0z" fill="#23324A"/><path d="M54 80.5q6 4 12 0q-6 2.5-12 0z" fill="#FF7A8A"/>
</svg>`;
const page = (size, { scale, radius, bg }) => `<!doctype html><html><head><style>
html,body{margin:0}body{width:${size}px;height:${size}px;background:transparent}
.i{width:100%;height:100%;border-radius:${radius}px;overflow:hidden;position:relative;display:grid;place-items:center;
  background:${bg}}
.i::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 30% 22%,rgba(255,255,255,.55),transparent 55%)}
.i::after{content:"";position:absolute;left:50%;bottom:${size*((1-scale)/2-0.035)}px;width:${size*scale*0.62}px;height:${size*0.05}px;transform:translateX(-50%);border-radius:50%;background:rgba(160,110,0,.18)}
svg{position:relative;z-index:1;width:${size*scale}px;height:auto;margin-top:${size*0.02}px;filter:drop-shadow(0 ${size*0.012}px 0 rgba(0,0,0,.08))}
</style></head><body><div class="i">${bit}</div></body></html>`;
const BG = 'linear-gradient(160deg,#FFE066 0%,#FFC800 55%,#FFB000 100%)';
const b = await chromium.launch({ channel: 'chrome' });
const jobs = [
  ['icon-192.png', 192, { scale: 0.74, radius: 192 * 0.22, bg: BG }, true],
  ['icon-512.png', 512, { scale: 0.74, radius: 512 * 0.22, bg: BG }, true],
  ['maskable-512.png', 512, { scale: 0.56, radius: 0, bg: BG }, false],
  ['apple-touch-icon.png', 180, { scale: 0.72, radius: 0, bg: BG }, false],
  ['favicon-32.png', 32, { scale: 0.9, radius: 8, bg: BG }, true],
];
for (const [name, size, opt, transparent] of jobs) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(page(size, opt));
  await p.screenshot({ path: OUT + name, omitBackground: transparent });
  await p.close();
}
await b.close();
console.log('icons done');
