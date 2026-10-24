// content/의 run: node | python | c 출력값을 실행해 적어 둔 정답과 비교한다.
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
      if (!['node', 'python', 'c'].includes(it.run)) continue;
      const file = join(dir, `${it.id}.${it.run === 'python' ? 'py' : 'js'}`);
      writeFileSync(file, it.code);
      // 여러 줄 출력은 띄어쓰기로 이어서 쓰는 게 앱의 정답 규칙이다
      let output;
      if (it.run === 'c') {
        const [declarations, main] = it.code.includes('// main') ? it.code.split('// main') : ['', it.code];
        const source = join(dir, `${it.id}.c`);
        const binary = join(dir, it.id);
        writeFileSync(source, `#include <stdio.h>\n#include <string.h>\n${declarations}\nint main(void) {\n${main}\nreturn 0;\n}\n`);
        execFileSync('cc', ['-std=c17', '-Wall', '-Werror=format', source, '-o', binary]);
        output = execFileSync(binary);
      } else {
        output = execFileSync(it.run === 'python' ? 'python3' : 'node', [file]);
      }
      const out = output.toString().trim().split('\n').join(' ');
      checked++;
      if (out !== it.answer) wrong.push(`${course}/${f} ${it.id}: 적힌 정답 "${it.answer}" / 실제 출력 "${out}"`);
    }
  }
}
if (wrong.length) { console.error(wrong.join('\n')); process.exit(1); }
console.log(`출력값 문제 ${checked}개: 적힌 정답과 실제 실행 결과가 모두 같다`);
