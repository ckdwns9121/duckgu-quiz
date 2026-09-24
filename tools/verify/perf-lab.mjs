import http from 'node:http';
import { chromium } from 'playwright';
// 실제 HTTP 서버 (Playwright route를 쓰면 브라우저 캐시가 꺼져서 직접 띄운다)
const log = [];
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/data.js') {
    log.push(`${req.url} If-None-Match=${req.headers['if-none-match'] ?? '-'}`);
    if (req.headers['if-none-match'] === '"v1"') { res.writeHead(304, { ETag: '"v1"', 'Cache-Control': 'no-cache' }); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'text/javascript', ETag: '"v1"', 'Cache-Control': 'no-cache' });
    return res.end('window.loaded = (window.loaded||0) + 1; document.title = "ran " + window.loaded;');
  }
  if (u.pathname.startsWith('/img/')) { log.push(`img ${u.pathname}`); res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'); }
  if (u.pathname === '/lazy.html') {
    const imgs = Array.from({ length: 30 }, (_, i) => `<img loading="lazy" width="300" height="300" src="/img/${i}.svg">`).join('');
    res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(`<!doctype html><div style="height:3000px">위 내용</div>${imgs}`);
  }
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><script src="/data.js"></script><p>page</p>');
});
await new Promise((r) => server.listen(4399, r));
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext(); const p = await ctx.newPage();
p.on('response', (r) => { if (r.url().endsWith('/data.js')) log.push(`browser saw status ${r.status()} fromCache=${r.fromServiceWorker() ? 'sw' : ''}`); });
await p.goto('http://localhost:4399/'); await p.waitForTimeout(200);
await p.goto('http://localhost:4399/'); await p.waitForTimeout(200);
console.log('ETAG ', log.join(' | '), '| title:', await p.title());
log.length = 0;
await p.setViewportSize({ width: 800, height: 600 });
await p.goto('http://localhost:4399/lazy.html'); await p.waitForTimeout(500);
const before = log.filter((l) => l.startsWith('img')).length;
await p.evaluate(() => window.scrollTo(0, 3000)); await p.waitForTimeout(800);
const after = log.filter((l) => l.startsWith('img')).length;
console.log(`LAZY images requested on load: ${before}/30, after scrolling to them: ${after}/30`);
await b.close(); server.close();
