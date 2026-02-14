import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const tmp = path.join(repoRoot, 'tmp-lock-verify');
await fs.rm(tmp, { recursive: true, force: true });
await fs.mkdir(tmp, { recursive: true });

const ocb = path.join(repoRoot, 'bin', 'ocb.js');

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('error', reject);
    p.on('close', (code) => resolve({ code, out, err }));
  });
}

console.log('== init ==');
let r = await run('node', [ocb, 'init'], tmp);
if (r.code !== 0) throw new Error(r.err || r.out);

console.log('== run ==');
r = await run('node', [ocb, 'run', '--objective', 'lock verify', '--actorId', 'local:verify'], tmp);
if (r.code !== 0) throw new Error(r.err || r.out);

console.log('== concurrent ticks ==');
const t1 = run('node', [ocb, 'tick', '--sessionKey', 'default', '--actorId', 'local:verify'], tmp);
const t2 = run('node', [ocb, 'tick', '--sessionKey', 'default', '--actorId', 'local:verify'], tmp);
const res = await Promise.all([t1, t2]);

for (const [i, x] of res.entries()) {
  if (x.code !== 0) throw new Error(`tick ${i} failed: ${x.err || x.out}`);
}

const eventsPath = path.join(tmp, '.ocb', 'events.jsonl');
const txt = await fs.readFile(eventsPath, 'utf8');
const events = txt.split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));

const ticks = events.filter((e) => e.type === 'iteration_update');
if (ticks.length !== 2) {
  throw new Error(`Expected 2 iteration_update events, got ${ticks.length}`);
}

console.log('ok: 2 ticks written without error');
console.log('eventsPath:', eventsPath);
