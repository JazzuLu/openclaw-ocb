import path from 'node:path';

export function getRepoRoot(cwd = process.cwd()) {
  return cwd;
}

export function getOcbDir(repoRoot) {
  return path.join(repoRoot, '.ocb');
}

export function getEventsPath(repoRoot) {
  return path.join(getOcbDir(repoRoot), 'events.jsonl');
}

export function getLocksDir(repoRoot) {
  return path.join(getOcbDir(repoRoot), 'locks');
}
