import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext();
const p = await ctx.newPage();
const out = (name, v) => console.log(name.padEnd(22), '→', Array.isArray(v) ? v.join(' | ') : v);

// 가짜 서버: 스크립트 지연을 조절해 로딩 순서를 본다
await ctx.route('http://lab.test/**', async (route) => {
  const url = new URL(route.request().url());
  const delay = Number(url.searchParams.get('d') || 0);
  await new Promise((r) => setTimeout(r, delay));
  if (url.pathname.endsWith('.js')) return route.fulfill({ contentType: 'text/javascript', body: `log('${url.searchParams.get('n')}')` });
  if (url.pathname.endsWith('.css')) return route.fulfill({ contentType: 'text/css', body: 'body{color:red}' });
  const pages = {
    '/order.html': `<!doctype html><script>window.L=[];function log(m){L.push(m)};document.addEventListener('DOMContentLoaded',()=>log('DOMContentLoaded'));addEventListener('load',()=>log('load'))</script>
      <script defer src="/a.js?n=defer1&d=300"></script><script defer src="/b.js?n=defer2&d=0"></script>
      <script async src="/c.js?n=async&d=0"></script><script>log('inline')</script><img src="/x.css?d=600">`,
    '/module.html': `<!doctype html><script>window.L=[];function log(m){L.push(m)};document.addEventListener('DOMContentLoaded',()=>log('DOMContentLoaded'))</script>
      <script type="module">log('module')</script><script>log('classic')</script>`,
    '/dyn.html': `<!doctype html><script>window.L=[];function log(m){L.push(m)};
      for (const [n,d] of [['one',300],['two',0]]) { const s=document.createElement('script'); s.src='/'+n+'.js?n='+n+'&d='+d; document.head.append(s); }</script>`,
    '/dyn2.html': `<!doctype html><script>window.L=[];function log(m){L.push(m)};
      for (const [n,d] of [['one',300],['two',0]]) { const s=document.createElement('script'); s.src='/'+n+'.js?n='+n+'&d='+d; s.async=false; document.head.append(s); }</script>`,
    '/inner.html': `<!doctype html><div id=box></div><script>window.L=[];window.box=document.getElementById('box');</script>`,
  };
  return route.fulfill({ contentType: 'text/html', body: pages[url.pathname] ?? '<!doctype html><p>x</p>' });
});

await p.goto('http://lab.test/order.html', { waitUntil: 'load' }); await p.waitForTimeout(400); out('B8 defer/async order', await p.evaluate(() => L));
await p.goto('http://lab.test/module.html', { waitUntil: 'load' }); out('B9 module deferred', await p.evaluate(() => L));
await p.goto('http://lab.test/dyn.html'); await p.waitForTimeout(800); out('B10 dynamic scripts', await p.evaluate(() => L));
await p.goto('http://lab.test/dyn2.html'); await p.waitForTimeout(800); out('B10b async=false', await p.evaluate(() => L));

// innerHTML로 넣은 script는 실행되지 않는다
await p.goto('http://lab.test/inner.html');
out('B23 innerHTML script', await p.evaluate(async () => { box.innerHTML = '<script>L.push("script ran")<\/script><img src=x onerror="L.push(\'onerror ran\')">'; await new Promise((r) => setTimeout(r, 300)); return L.length ? L : ['nothing']; }));

await p.setContent('<div id=outer><button id=btn>b</button></div><input id=inp>');
// B1 실제 마우스 클릭의 이벤트 순서
await p.evaluate(() => { window.L = []; const b = document.getElementById('btn');
  for (const t of ['pointerdown','mousedown','focus','pointerup','mouseup','click']) b.addEventListener(t, () => L.push(t)); });
await p.click('#btn'); out('B1 click sequence', await p.evaluate(() => L));

// B2 캡처·버블 순서 (target 단계 포함)
await p.setContent('<div id=outer><button id=btn>b</button></div>');
await p.evaluate(() => { window.L = []; const o = document.getElementById('outer'), b = document.getElementById('btn');
  o.addEventListener('click', () => L.push('outer bubble'));
  o.addEventListener('click', () => L.push('outer capture'), true);
  b.addEventListener('click', () => L.push('btn bubble'));
  b.addEventListener('click', () => L.push('btn capture'), true);
  document.addEventListener('click', () => L.push('document capture'), { capture: true }); });
await p.click('#btn'); out('B2 capture/bubble', await p.evaluate(() => L));

// B3 stopPropagation vs stopImmediatePropagation
for (const how of ['stopPropagation', 'stopImmediatePropagation']) {
  await p.setContent('<div id=outer><button id=btn>b</button></div>');
  await p.evaluate((how) => { window.L = []; const o = document.getElementById('outer'), b = document.getElementById('btn');
    b.addEventListener('click', (e) => { L.push('btn 1'); e[how](); });
    b.addEventListener('click', () => L.push('btn 2'));
    o.addEventListener('click', () => L.push('outer')); }, how);
  await p.click('#btn'); out('B3 ' + how, await p.evaluate(() => L));
}

// B26 같은 함수를 두 번 등록 / 익명 함수 제거
await p.setContent('<button id=btn>b</button>');
out('B26 same fn twice', await p.evaluate(() => { let n = 0; const b = document.getElementById('btn'); const f = () => n++;
  b.addEventListener('click', f); b.addEventListener('click', f); b.click(); return 'count ' + n; }));
out('B27 remove anon', await p.evaluate(() => { let n = 0; const b = document.getElementById('btn');
  b.addEventListener('click', () => n++); b.removeEventListener('click', () => n++); b.click(); return 'count ' + n; }));

// B28 focus는 버블링하지 않는다
await p.setContent('<form id=f><input id=inp></form>');
await p.evaluate(() => { window.L = []; const f = document.getElementById('f');
  f.addEventListener('focus', () => L.push('focus'));
  f.addEventListener('focusin', () => L.push('focusin')); });
await p.click('#inp'); out('B28 focus bubble', await p.evaluate(() => L));

// B6 passive 리스너의 preventDefault
out('B6 passive', await p.evaluate(() => { const d = document.body; let r;
  d.addEventListener('wheel', (e) => { e.preventDefault(); }, { passive: true });
  const e = new WheelEvent('wheel', { cancelable: true, bubbles: true }); d.dispatchEvent(e); return 'defaultPrevented ' + e.defaultPrevented; }));

// B4 MutationObserver는 마이크로태스크
out('B4 MO microtask', await p.evaluate(async () => { const L = []; const el = document.createElement('div'); document.body.append(el);
  new MutationObserver(() => L.push('mo')).observe(el, { childList: true });
  setTimeout(() => L.push('timeout'));
  el.textContent = 'x';
  Promise.resolve().then(() => L.push('then'));
  L.push('sync');
  await new Promise((r) => setTimeout(r, 50)); return L; }));

// B19 rAF는 then보다 늦고, 같은 프레임 안에서 여러 번 등록하면 한 프레임에 같이
out('B19 raf vs micro', await p.evaluate(async () => { const L = [];
  requestAnimationFrame(() => L.push('raf')); Promise.resolve().then(() => L.push('then')); L.push('sync');
  await new Promise((r) => setTimeout(r, 100)); return L; }));

// B7 storage 이벤트는 다른 탭에서만
{ const a = await ctx.newPage(), c = await ctx.newPage();
  await a.goto('http://lab.test/s.html'); await c.goto('http://lab.test/s.html');
  for (const pg of [a, c]) await pg.evaluate(() => { window.L = []; addEventListener('storage', (e) => L.push('storage ' + e.key)); });
  await a.evaluate(() => localStorage.setItem('theme', 'dark')); await a.waitForTimeout(200);
  out('B7 storage same tab', await a.evaluate(() => L.length ? L : ['none']));
  out('B7 storage other tab', await c.evaluate(() => L.length ? L : ['none'])); }

// 강제 동기 레이아웃: 스타일을 바꾸고 offsetHeight를 읽으면 그 자리에서 레이아웃
out('B5 forced layout', await p.evaluate(() => { const el = document.createElement('div'); document.body.append(el);
  el.style.height = '10px'; const a = el.offsetHeight; el.style.height = '30px'; const b = el.offsetHeight; return `${a} ${b}`; }));

await b.close();
