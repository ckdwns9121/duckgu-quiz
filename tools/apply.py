import re, sys
sys.path.insert(0, 'tools')
from content_code import CARDS as C1
from content_db import ROWS as R1
from content_net import ROWS as R2, CARDS as C2, REL
CARDS = {**C1, **C2}; ROWS = {**R1, **R2}
s = open('notes.html', encoding='utf-8').read()
miss = []
for i, html in CARDS.items():
    m = re.search(r'<article class="item" data-id="%s">.*?</article>' % re.escape(i), s, re.S)
    if not m: miss.append(i); continue
    art = m.group(0)
    new = re.sub(r'<div class="ans">.*?</div>', lambda _: '<div class="ans">' + html + '</div>', art, count=1, flags=re.S)
    s = s.replace(art, new)
for i, html in REL.items():
    m = re.search(r'<article class="item" data-id="%s">.*?</article>' % re.escape(i), s, re.S)
    if not m: miss.append(i); continue
    art = m.group(0)
    s = s.replace(art, re.sub(r'<p class="ex ans">.*?</p>', lambda _: '<p class="ex ans">' + html + '</p>', art, count=1, flags=re.S))
for i, cells in ROWS.items():
    m = re.search(r'<tr data-id="%s">(.*?)</tr>' % re.escape(i), s, re.S)
    if not m: miss.append(i); continue
    row = m.group(0); it = iter(cells); cnt = [0]
    def rep(mm):
        attrs = mm.group(1)
        if 'class="c"' in attrs or 'term' in attrs: return mm.group(0)
        cnt[0] += 1
        return '<td%s>%s</td>' % (attrs, next(it))
    new = re.sub(r'<td([^>]*)>(.*?)</td>', rep, row, flags=re.S)
    if cnt[0] != len(cells): print('count mismatch', i, cnt[0], len(cells))
    s = s.replace(row, new)
s = s.replace('<th>외우는 법</th>', '<th>예시 · 외우는 법</th>')
css = '.steps{margin:0;padding-left:1.3em;display:grid;gap:4px}\n.steps li{padding-left:2px}\n.ans p + .steps,.ans .steps + p{margin-top:2px}\n'
if '.steps{' not in s: s = s.replace('footer{', css + 'footer{', 1)
open('notes.html', 'w', encoding='utf-8').write(s)
allids = set(re.findall(r'data-id="([^"]+)"', s))
print('missing:', miss); print('not rewritten:', sorted(allids - set(CARDS) - set(ROWS) - set(REL)))
