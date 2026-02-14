import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

function sh(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
}

const tmp = path.join(process.cwd(), 'tmp-verify');
await fs.rm(tmp, { recursive: true, force: true });
await fs.mkdir(tmp, { recursive: true });

console.log('== init ==');
console.log(sh(`node ${path.join(process.cwd(), 'bin/ocb.js')} init`));

console.log('== run ==');
process.chdir(tmp);
console.log(sh(`node ${path.join(process.cwd(), '..', 'bin/ocb.js')} init`));
console.log(sh(`node ${path.join(process.cwd(), '..', 'bin/ocb.js')} run --objective "slice1 verify" --actorId "local:verify"`));

console.log('== tick ==');
console.log(sh(`node ${path.join(process.cwd(), '..', 'bin/ocb.js')} tick`));

console.log('== status ==');
console.log(sh(`node ${path.join(process.cwd(), '..', 'bin/ocb.js')} status`));

console.log('== events tail ==');
const ev = await fs.readFile(path.join(tmp, '.ocb', 'events.jsonl'), 'utf8');
console.log(ev.split(/\r?\n/).filter(Boolean).slice(-3).join('\n'));

