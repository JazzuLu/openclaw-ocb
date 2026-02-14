import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();
const tmp = path.join(repoRoot, 'tmp-gh-verify');
await fs.rm(tmp, { recursive: true, force: true });
await fs.mkdir(tmp, { recursive: true });

const ocb = path.join(repoRoot, 'bin', 'ocb.js');
const gha = path.join(repoRoot, 'scripts', 'gh-anchor.js');

execFileSync('node', [ocb, 'init'], { cwd: tmp, stdio: 'inherit' });
execFileSync('node', [ocb, 'run', '--objective', 'gh dryrun', '--sessionKey', 'gh:owner/repo#1', '--actorId', 'local:verify'], { cwd: tmp, stdio: 'inherit' });
execFileSync('node', [ocb, 'tick', '--sessionKey', 'gh:owner/repo#1', '--actorId', 'local:verify'], { cwd: tmp, stdio: 'inherit' });

// dry run: ensure issue + post latest update
execFileSync('node', [gha, 'ensure-issue', '--repo', 'owner/repo', '--sessionKey', 'gh:owner/repo#1', '--title', 'DRY', '--dryRun'], { cwd: tmp, stdio: 'inherit' });
execFileSync('node', [gha, 'post-latest-update', '--repo', 'owner/repo', '--sessionKey', 'gh:owner/repo#1', '--dryRun'], { cwd: tmp, stdio: 'inherit' });

const mapPath = path.join(tmp, '.ocb', 'gh-map.json');
const map = JSON.parse(await fs.readFile(mapPath, 'utf8'));
if (!map.anchors['gh:owner/repo#1']) throw new Error('missing anchor');
if (Object.keys(map.comments).length !== 1) throw new Error('expected 1 comment mapping');

console.log('ok: dryrun github anchor flow');
