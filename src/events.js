import fs from 'node:fs/promises';

export async function appendEvent(eventsPath, event) {
  const line = JSON.stringify({
    v: 1,
    ts: new Date().toISOString(),
    ...event
  });
  await fs.appendFile(eventsPath, line + '\n', 'utf8');
}

export async function readEvents(eventsPath, { limit = 5000 } = {}) {
  // naive read for MVP
  const txt = await fs.readFile(eventsPath, 'utf8');
  const lines = txt.split(/\r?\n/).filter(Boolean);
  const sliced = lines.slice(Math.max(0, lines.length - limit));
  return sliced.map((l) => JSON.parse(l));
}
