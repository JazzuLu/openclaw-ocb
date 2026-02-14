import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

function keyToFilename(key) {
  return crypto.createHash('sha256').update(key).digest('hex') + '.lock';
}

export async function withLock({ locksDir, key, timeoutMs = 30_000 }, fn) {
  const lockPath = path.join(locksDir, keyToFilename(key));
  const start = Date.now();

  while (true) {
    try {
      const fh = await fs.open(lockPath, 'wx');
      try {
        await fh.writeFile(String(process.pid));
      } finally {
        await fh.close();
      }
      break;
    } catch (err) {
      if (err?.code !== 'EEXIST') throw err;
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Lock timeout after ${timeoutMs}ms: ${lockPath}`);
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  try {
    return await fn();
  } finally {
    // best-effort unlock
    await fs.unlink(lockPath).catch(() => {});
  }
}
