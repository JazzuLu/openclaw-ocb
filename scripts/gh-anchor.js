#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { init, status } from '../src/core.js';
import { readEvents } from '../src/events.js';

const execFileAsync = promisify(execFile);

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      args._.push(a);
      continue;
    }
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    args[key] = val;
  }
  return args;
}

async function gh(args, opts = {}) {
  const { stdout } = await execFileAsync('gh', args, { encoding: 'utf8', ...opts });
  return stdout;
}

async function loadMap(mapPath) {
  try {
    const txt = await fs.readFile(mapPath, 'utf8');
    return JSON.parse(txt);
  } catch {
    return { version: 1, anchors: {}, comments: {} };
  }
}

async function saveMap(mapPath, map) {
  await fs.writeFile(mapPath, JSON.stringify(map, null, 2) + '\n', 'utf8');
}

function requireRepo(x) {
  if (!x || typeof x !== 'string') throw new Error('Missing --repo owner/repo');
  if (!x.includes('/')) throw new Error('Invalid --repo; expected owner/repo');
  return x;
}

async function ensureIssue({ repo, sessionKey, title, body, mapPath, dryRun }) {
  const map = await loadMap(mapPath);
  const existing = map.anchors[sessionKey];
  if (existing) return { map, anchor: existing, created: false };

  if (dryRun) {
    const fake = {
      repo,
      issueNumber: -1,
      issueUrl: `https://github.com/${repo}/issues/DRY_RUN`,
      createdAt: new Date().toISOString()
    };
    map.anchors[sessionKey] = fake;
    return { map, anchor: fake, created: true, dryRun: true };
  }

  const out = await gh([
    'issue',
    'create',
    '--repo',
    repo,
    '--title',
    title,
    '--body',
    body,
    '--json',
    'number,url'
  ]);

  const parsed = JSON.parse(out);
  const anchor = {
    repo,
    issueNumber: parsed.number,
    issueUrl: parsed.url,
    createdAt: new Date().toISOString()
  };
  map.anchors[sessionKey] = anchor;
  return { map, anchor, created: true };
}

async function postLatestIterationUpdate({ repo, issueNumber, sessionKey, eventsPath, mapPath, dryRun }) {
  const events = await readEvents(eventsPath).catch(() => []);
  const last = [...events].reverse().find((e) => e.type === 'iteration_update' && e.sessionKey === sessionKey);
  if (!last) throw new Error(`No iteration_update found for sessionKey=${sessionKey}. Run: ocb tick --sessionKey ${sessionKey}`);

  // Use timestamp as event id for MVP.
  const eventId = last.ts;

  const map = await loadMap(mapPath);
  if (map.comments[eventId]) return { map, created: false, comment: map.comments[eventId] };

  const u = last.update;
  const md = [
    `## Iteration Update (${last.ts})`,
    `**Objective:** ${u.objective}`,
    '',
    `**Decisions:**`,
    ...(u.decisions?.length ? u.decisions.map((x) => `- ${x}`) : ['- (none)']),
    '',
    `**Changes (evidence):**`,
    ...(u.changes?.length ? u.changes.map((x) => `- ${x}`) : ['- (none)']),
    '',
    `**Next:**`,
    ...(u.next?.length ? u.next.map((x) => `- ${x}`) : ['- (none)']),
    '',
    `**Risks/Questions:**`,
    ...(u.risks?.length ? u.risks.map((x) => `- ${x}`) : ['- (none)'])
  ].join('\n');

  if (dryRun) {
    const fake = {
      repo,
      issueNumber,
      commentUrl: `https://github.com/${repo}/issues/${issueNumber}#issuecomment-DRY_RUN`,
      createdAt: new Date().toISOString()
    };
    map.comments[eventId] = fake;
    return { map, created: true, dryRun: true, comment: fake, markdown: md };
  }

  const out = await gh([
    'api',
    `repos/${repo}/issues/${issueNumber}/comments`,
    '-f',
    `body=${md}`
  ]);
  const parsed = JSON.parse(out);

  const comment = {
    repo,
    issueNumber,
    commentUrl: parsed.html_url,
    createdAt: new Date().toISOString()
  };
  map.comments[eventId] = comment;
  return { map, created: true, comment };
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(`gh-anchor <command> [--flags]\n\nCommands:\n  ensure-issue --repo owner/repo --sessionKey <k> --title <t> [--body <b>] [--dryRun]\n  post-latest-update --repo owner/repo --sessionKey <k> [--dryRun]\n\nNotes:\n- Uses ./.ocb/gh-map.json for idempotency\n- Requires gh auth\n`);
    process.exit(0);
  }

  const cwd = process.cwd();
  const repo = requireRepo(args.repo);
  const sessionKey = args.sessionKey ?? 'default';
  const dryRun = Boolean(args.dryRun);

  const { eventsPath } = await init({ cwd });
  const ocbDir = path.join(cwd, '.ocb');
  const mapPath = path.join(ocbDir, 'gh-map.json');

  if (cmd === 'ensure-issue') {
    const title = args.title ?? `OCB: ${sessionKey}`;
    const body = args.body ?? `SessionKey: ${sessionKey}`;
    const { map, anchor } = await ensureIssue({ repo, sessionKey, title, body, mapPath, dryRun });
    await saveMap(mapPath, map);
    console.log(JSON.stringify(anchor, null, 2));
    return;
  }

  if (cmd === 'post-latest-update') {
    const map = await loadMap(mapPath);
    const anchor = map.anchors[sessionKey];
    if (!anchor) {
      throw new Error(`No anchor for sessionKey=${sessionKey}. Run ensure-issue first.`);
    }

    const r = await postLatestIterationUpdate({
      repo,
      issueNumber: anchor.issueNumber,
      sessionKey,
      eventsPath,
      mapPath,
      dryRun
    });
    await saveMap(mapPath, r.map);
    console.log(JSON.stringify(r.comment, null, 2));
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
