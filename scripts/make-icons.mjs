// 앱 아이콘(public/icons/*.png)을 캐릭터 덕구로 그려 낸다.
// 실행: npx -y -p playwright node scripts/make-icons.mjs  (로컬에 Chrome 필요)
import { chromium } from 'playwright';
import { DUCK } from './mascot-parts.mjs';
const OUT = new URL('../public/icons/', import.meta.url).pathname;
// 앱 안의 덕구와 같은 부위(scripts/mascot-parts.mjs)를 z 순서대로 겹친다. 아이콘은 웃는 얼굴로
const order = ['base', 'armL', 'armR', 'eyesOpen', 'mouthSmile'];
const bit = `<svg viewBox="4 4 112 112" xmlns="http://www.w3.org/2000/svg">${order.map((id) => DUCK[id].svg).join('')}</svg>`;
const page = (size, { scale, radius, bg }) => `<!doctype html><html><head><style>
html,body{margin:0}body{width:${size}px;height:${size}px;background:transparent}
.i{width:100%;height:100%;border-radius:${radius}px;overflow:hidden;position:relative;display:grid;place-items:center;
  background:${bg}}
.i::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 30% 22%,rgba(255,255,255,.55),transparent 55%)}
.i::after{content:"";position:absolute;left:50%;bottom:${size*((1-scale)/2-0.035)}px;width:${size*scale*0.62}px;height:${size*0.05}px;transform:translateX(-50%);border-radius:50%;background:rgba(0,70,120,.2)}
svg{position:relative;z-index:1;width:${size*scale}px;height:auto;margin-top:${size*0.02}px;filter:drop-shadow(0 ${size*0.012}px 0 rgba(0,0,0,.08))}
</style></head><body><div class="i">${bit}</div></body></html>`;
// 노란 오리가 잘 보이게 물빛 하늘색 배경
const BG = 'linear-gradient(160deg,#9BE3FF 0%,#4CC3F7 55%,#1CA3E8 100%)';
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
