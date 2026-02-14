# OCB Slice 1 (Core + Tick Runnable) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make OCB “core + tick” runnable end-to-end with `.ocb/`, `events.jsonl`, serialization locks, and CLI commands (`init/run/tick/status`).

**Architecture:** A tiny channel-agnostic core writes an append-only JSONL event stream in `./.ocb/events.jsonl`. A CLI appends and reads events. A lock file in `./.ocb/locks/` serializes operations per `(repoRoot, sessionKey)`.

**Tech Stack:** Node.js (ESM), filesystem JSONL, minimal CLI (no dependencies).

---

## Repo layout (current)
- `src/` core implementation
- `bin/ocb.js` CLI
- `scripts/verify-slice1.js` end-to-end verification

## Task 1: Ensure `.ocb/` structure exists

**Files:**
- Modify: `src/core.js`

**Step 1: Add/confirm `init()` creates `.ocb/` and `.ocb/locks/`**

**Step 2: Verify**
Run: `node bin/ocb.js init`
Expected: prints `inited: <path>/.ocb`

**Step 3: Commit**
Run:
```bash
git add src/core.js
git commit -m "feat(slice1): init creates .ocb structure"
```

## Task 2: Append-only event stream

**Files:**
- Modify: `src/events.js`

**Step 1: Ensure `appendEvent()` writes one JSON per line**

**Step 2: Verify**
Run: `node bin/ocb.js run --objective "test"`
Expected: `.ocb/events.jsonl` contains a `run_requested` event

**Step 3: Commit**
```bash
git add src/events.js
git commit -m "feat(slice1): append-only events.jsonl"
```

## Task 3: Implement minimal commands run/status/tick

**Files:**
- Modify: `src/core.js`
- Modify: `bin/ocb.js`

**Step 1: `run` appends `run_requested` event**

**Step 2: `tick` appends `iteration_update` event with required fields**

**Step 3: `status` renders objective + last update**

**Step 4: Verify end-to-end**
Run:
```bash
node bin/ocb.js init
node bin/ocb.js run --objective "slice1"
node bin/ocb.js tick
node bin/ocb.js status
```
Expected: `status` shows `objective: slice1` and `lastUpdate.next`

**Step 5: Commit**
```bash
git add src/core.js bin/ocb.js
git commit -m "feat(slice1): run/status/tick commands"
```

## Task 4: Serialization lock (AC5)

**Files:**
- Modify: `src/lock.js`
- Create: `scripts/verify-lock.js`
- Create: `docs/02-verification.md`

**Step 1: Add a test harness that runs two `tick` processes concurrently**

**Step 2: Verify it does not interleave critical section**
Run: `node scripts/verify-lock.js`
Expected:
- both processes exit 0
- `events.jsonl` contains exactly 2 new `iteration_update` events
- no errors like lock timeout

**Step 3: Document verification commands**
Write `docs/02-verification.md` with:
- `npm run verify`
- `node scripts/verify-lock.js`
- what outputs to expect

**Step 4: Commit**
```bash
git add src/lock.js scripts/verify-lock.js docs/02-verification.md
git commit -m "test(slice1): verify lock serialization"
```

## Task 5: Final verification

**Files:**
- Modify: `scripts/verify-slice1.js` (if needed)

**Step 1: Run**
`npm run verify`
Expected: prints init/run/tick/status and events tail.

**Step 2: Commit**
```bash
git add scripts/verify-slice1.js
git commit -m "test(slice1): strengthen end-to-end verification"
```
