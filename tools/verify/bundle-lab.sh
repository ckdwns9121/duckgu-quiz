#!/bin/sh
# 트리 셰이킹·코드 스플리팅 확인. 임시 폴더에서: npm i esbuild lodash lodash-es 후 sh bundle-lab.sh
set -e
mkdir -p ts && cd ts
echo "import _ from 'lodash'; console.log(_.debounce);" > a.js
echo "import { debounce } from 'lodash-es'; console.log(debounce);" > b.js
echo "import debounce from 'lodash/debounce'; console.log(debounce);" > c.js
for f in a b c; do npx esbuild $f.js --bundle --minify --format=esm --outfile=out-$f.js --log-level=error; echo "$f $(wc -c < out-$f.js) bytes"; done
# 2026-09-24 결과: a(lodash 전체) 73808, b(lodash-es) 2890, c(lodash/debounce) 3478
cat > main.js <<'JS'
document.getElementById('btn').onclick = async () => { const { drawChart } = await import('./chart.js'); drawChart(); };
JS
echo "export function drawChart() { console.log('big chart'); }" > chart.js
npx esbuild main.js --bundle --splitting --format=esm --outdir=split --log-level=error && ls split
# 결과: main.js와 chart-XXXX.js가 따로 나오고, main.js에는 chart 코드가 없다
