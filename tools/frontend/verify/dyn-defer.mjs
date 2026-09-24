import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }); const ctx = await b.newContext(); const p = await ctx.newPage();
await ctx.route('http://lab.test/**', async (route) => { const u = new URL(route.request().url()); await new Promise((r) => setTimeout(r, Number(u.searchParams.get('d') || 0)));
  if (u.pathname.endsWith('.js')) return route.fulfill({ contentType: 'text/javascript', body: `L.push('${u.searchParams.get('n')}')` });
  return route.fulfill({ contentType: 'text/html', body: `<!doctype html><script>window.L=[];for (const [n,d] of [['one',300],['two',0]]) { const s=document.createElement('script'); s.src='/'+n+'.js?n='+n+'&d='+d; s.defer=true; document.head.append(s); }</script>` }); });
await p.goto('http://lab.test/'); await p.waitForTimeout(800); console.log('dynamic + defer=true →', (await p.evaluate(() => L)).join(' | '));
await b.close();
