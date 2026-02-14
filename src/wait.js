import fs from 'node:fs/promises';

export async function waitForEvent({ eventsPath, predicate, timeoutMs = 30_000, pollMs = 250, sinceTs }) {
  const start = Date.now();

  while (true) {
    const txt = await fs.readFile(eventsPath, 'utf8').catch(() => '');
    const lines = txt.split(/\r?\n/).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      const e = JSON.parse(lines[i]);
      if (sinceTs && e.ts && e.ts <= sinceTs) break;
      if (predicate(e)) return e;
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error(`wait timeout after ${timeoutMs}ms`);
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
}
