#!/usr/bin/env node
import { init, run, status, tick, cancel, formatStatus } from '../src/core.js';
import { waitForEvent } from '../src/wait.js';

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

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  try {
    if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
      console.log(`ocb <command> [--flags]\n\nCommands:\n  init\n  run --objective <text> [--sessionKey <k>] [--role <r>] [--actorId <a>]\n  tick [--sessionKey <k>] [--actorId <a>]\n  status [--sessionKey <k>]\n`);
      process.exit(0);
    }

    if (cmd === 'init') {
      const r = await init();
      console.log(`inited: ${r.ocbDir}`);
      return;
    }

    if (cmd === 'run') {
      await run({
        cwd: process.cwd(),
        sessionKey: args.sessionKey ?? 'default',
        role: args.role ?? 'pm',
        actorId: args.actorId ?? undefined,
        objective: args.objective
      });
      console.log('ok');
      return;
    }

    if (cmd === 'tick') {
      await tick({ cwd: process.cwd(), sessionKey: args.sessionKey ?? 'default', actorId: args.actorId ?? undefined });
      console.log('ok');
      return;
    }

    if (cmd === 'cancel') {
      await cancel({
        cwd: process.cwd(),
        sessionKey: args.sessionKey ?? 'default',
        actorId: args.actorId ?? undefined,
        reason: args.reason ?? 'cancel requested'
      });
      console.log('ok');
      return;
    }

    if (cmd === 'wait') {
      const type = args.type;
      if (!type || typeof type !== 'string') throw new Error('Missing --type');
      const st = await status({ cwd: process.cwd(), sessionKey: args.sessionKey ?? 'default' });
      const sinceTs = new Date().toISOString();
      const ev = await waitForEvent({
        eventsPath: st.eventsPath,
        sinceTs,
        timeoutMs: args.timeoutMs ? Number(args.timeoutMs) : 30_000,
        predicate: (e) => e.type === type && (e.sessionKey === (args.sessionKey ?? 'default') || !e.sessionKey)
      });
      console.log(JSON.stringify(ev, null, 2));
      return;
    }

    if (cmd === 'status') {
      const s = await status({ cwd: process.cwd(), sessionKey: args.sessionKey ?? 'default' });
      console.log(formatStatus(s));
      return;
    }

    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  } catch (err) {
    console.error(err?.stack || String(err));
    process.exit(1);
  }
}

main();
