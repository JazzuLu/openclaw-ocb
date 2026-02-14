#!/usr/bin/env node
import { init, run, status, tick, formatStatus } from '../src/core.js';

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
      console.log(`ocb <command> [--flags]\n\nCommands:\n  init\n  run --objective <text> [--sessionKey <k>] [--role <r>]\n  tick [--sessionKey <k>]\n  status [--sessionKey <k>]\n`);
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
        objective: args.objective
      });
      console.log('ok');
      return;
    }

    if (cmd === 'tick') {
      await tick({ cwd: process.cwd(), sessionKey: args.sessionKey ?? 'default' });
      console.log('ok');
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
