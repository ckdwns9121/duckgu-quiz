// content/ 에서 run: node 로 표시한 출력값 문제의 코드를 실제로 실행해, 적어 둔 정답과 같은지 확인한다.
// 정답은 손으로 쓰지 않는다: 코드를 고치면 이 스크립트로 실행 결과를 다시 확인한다. 사용: pnpm verify:answers
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import YAML from 'yaml';

const dir = mkdtempSync(join(tmpdir(), 'quiz-answers-'));
let checked = 0;
const wrong = [];
for (const course of YAML.parse(readFileSync('content/index.yaml', 'utf8')).courses) {
  for (const f of readdirSync(`content/${course}`).filter((f) => f.endsWith('.yaml') && f !== 'course.yaml')) {
    const unit = YAML.parse(readFileSync(`content/${course}/${f}`, 'utf8'));
    for (const b of unit.blocks) for (const it of b.items ?? []) {
      if (it.run !== 'node') continue;
      const file = join(dir, `${it.id}.js`);
      writeFileSync(file, it.code);
      // 여러 줄 출력은 띄어쓰기로 이어서 쓰는 게 앱의 정답 규칙이다
      const out = execFileSync('node', [file]).toString().trim().split('\n').join(' ');
      checked++;
      if (out !== it.answer) wrong.push(`${course}/${f} ${it.id}: 적힌 정답 "${it.answer}" / 실제 출력 "${out}"`);
    }
  }
}
if (wrong.length) { console.error(wrong.join('\n')); process.exit(1); }
console.log(`출력값 문제 ${checked}개: 적힌 정답과 실제 실행 결과가 모두 같다`);
