import path from 'node:path';
import { ensureDir, fileExists } from './fsutil.js';
import { appendEvent, readEvents } from './events.js';
import { withLock } from './lock.js';
import { getEventsPath, getLocksDir, getOcbDir, getRepoRoot } from './paths.js';

export async function init({ cwd = process.cwd() } = {}) {
  const repoRoot = getRepoRoot(cwd);
  const ocbDir = getOcbDir(repoRoot);
  const locksDir = getLocksDir(repoRoot);

  await ensureDir(ocbDir);
  await ensureDir(locksDir);

  const eventsPath = getEventsPath(repoRoot);
  if (!(await fileExists(eventsPath))) {
    await appendEvent(eventsPath, { type: 'ocb_inited', repoRoot });
  }

  return { repoRoot, ocbDir, locksDir, eventsPath };
}

export async function run({ cwd, sessionKey = 'default', role = 'pm', objective }) {
  if (!objective) throw new Error('Missing --objective');

  const { repoRoot, eventsPath, locksDir } = await init({ cwd });
  const key = `${repoRoot}::${sessionKey}`;

  return withLock({ locksDir, key }, async () => {
    await appendEvent(eventsPath, {
      type: 'run_requested',
      repoRoot,
      sessionKey,
      role,
      objective
    });
    return { ok: true };
  });
}

export async function tick({ cwd, sessionKey = 'default' }) {
  const { repoRoot, eventsPath, locksDir } = await init({ cwd });
  const key = `${repoRoot}::${sessionKey}`;

  return withLock({ locksDir, key }, async () => {
    const events = await readEvents(eventsPath).catch(() => []);
    const lastRun = [...events].reverse().find((e) => e.type === 'run_requested' && e.sessionKey === sessionKey);

    const objective = lastRun?.objective ?? 'No active objective (create one with `ocb run --objective ...`)';

    // Skeleton: for now we just emit an Iteration Update placeholder.
    await appendEvent(eventsPath, {
      type: 'iteration_update',
      repoRoot,
      sessionKey,
      update: {
        objective,
        decisions: [],
        changes: [],
        next: ['Define next actionable step'],
        risks: []
      }
    });

    return { ok: true };
  });
}

export async function status({ cwd, sessionKey = 'default' }) {
  const { repoRoot, eventsPath } = await init({ cwd });
  const events = await readEvents(eventsPath).catch(() => []);
  const filtered = events.filter((e) => e.sessionKey === sessionKey || !e.sessionKey);

  const lastRun = [...filtered].reverse().find((e) => e.type === 'run_requested');
  const lastTick = [...filtered].reverse().find((e) => e.type === 'iteration_update');

  return {
    repoRoot,
    sessionKey,
    lastObjective: lastRun?.objective ?? null,
    lastUpdate: lastTick?.update ?? null,
    eventsCount: filtered.length,
    eventsPath
  };
}

export function formatStatus(s) {
  const lines = [];
  lines.push(`repo: ${s.repoRoot}`);
  lines.push(`session: ${s.sessionKey}`);
  lines.push(`events: ${s.eventsCount}`);
  lines.push(`eventsPath: ${path.relative(process.cwd(), s.eventsPath)}`);
  lines.push(`objective: ${s.lastObjective ?? '(none)'}`);
  if (s.lastUpdate) {
    lines.push('lastUpdate:');
    lines.push(`  next: ${(s.lastUpdate.next || []).join('; ')}`);
  }
  return lines.join('\n');
}
