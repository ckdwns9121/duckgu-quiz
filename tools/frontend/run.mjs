import { CASES } from './cases.mjs';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const out = {};
for (const [id, code] of Object.entries(CASES)) {
  const file = join(tmpdir(), `${id}.js`);
  writeFileSync(file, code);
  out[id] = execFileSync('node', [file]).toString().trim().split('\n').join(' ');
  console.log(id.padEnd(16), '→', out[id]);
}
writeFileSync(new URL('./answers.json', import.meta.url), JSON.stringify(out, null, 1));
