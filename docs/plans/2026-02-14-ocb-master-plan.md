# OCB Master Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an OpenClaw Hub skill pack (OCB) that provides a CCB-like orchestration core enabling week-long, high-velocity iterative repo development with safety boundaries and auditability.

**Architecture:** A channel-agnostic core maintains append-only `events.jsonl` in `./.ocb/` and provides lifecycle commands (`run/status/wait/cancel`) plus a tick driver (heartbeat/cron). Adapters (Discord first) translate user intent into core commands and render job cards/updates. GitHub acts as the canonical task anchor and evidence sink.

**Tech Stack:** Node.js (ESM), minimal CLI, JSONL event log, filesystem locks, OpenClaw skills wrappers, optional Discord + GitHub integrations.

---

## Phase 1 — Core + Tick (Slice 1) (DONE)
Reference: `docs/plans/2026-02-14-ocb-slice1-core-tick.md`

## Phase 2 — Event schema + actor model

### Task 2.1: Formalize event schema docs
**Files:**
- Create: `docs/EVENTS.md`

**Steps:**
1) Document event types used so far (`ocb_inited`, `run_requested`, `iteration_update`)
2) Add required fields, optional fields, and examples
3) Commit: `docs: add event schema`

### Task 2.2: Add `actorId` to events
**Files:**
- Modify: `src/events.js`
- Modify: `bin/ocb.js`

**Steps:**
1) Add `--actorId` flag to CLI (default: `local:<username>@<hostname>` or `unknown`)
2) Ensure `appendEvent()` includes `actorId` when provided
3) Update verify scripts to include actorId
4) Commit: `feat: record actorId in events`

## Phase 3 — GitHub task anchor (minimal sink)

### Task 3.1: Decide canonical anchor mapping
**Files:**
- Modify: `docs/SESSIONKEY.md`
- Create: `docs/GITHUB.md`

**Steps:**
1) Define: `sessionKey = gh:<owner>/<repo>#<issue>` once issue exists
2) Define commands to create/link issue (initially manual)
3) Commit: `docs: add github anchor notes`

### Task 3.2: Minimal GH integration script (non-skill)
**Files:**
- Create: `scripts/gh-anchor.js`

**Steps:**
1) Implement: create issue + return URL/number using `gh issue create --json`
2) Implement: comment Iteration Update to issue
3) Add idempotency via local mapping file under `.ocb/` (e.g. `.ocb/gh-map.json`)
4) Commit: `feat: add minimal github anchor scripts`

## Phase 4 — OpenClaw Hub skill packaging (v0)

### Task 4.1: Add a minimal skill wrapper
**Files:**
- Create: `skills/ocb-core/SKILL.md`
- Create: `skills/ocb-core/run.sh` (or node entry)

**Steps:**
1) Provide documented usage: `ocb init/run/tick/status`
2) Ensure skill installs/validates prerequisites (node)
3) Commit: `feat: add ocb-core skill wrapper`

### Task 4.2: Add docs for Hub users
**Files:**
- Create: `docs/INSTALL.md`
- Create: `docs/QUICKSTART.md`

**Steps:**
1) Document installation and recommended workflow (SP)
2) Document how to start a week-long iteration program
3) Commit: `docs: add install + quickstart`

## Phase 5 — Discord adapter (minimal)

### Task 5.1: Adapter contract doc
**Files:**
- Create: `docs/ADAPTERS.md`

**Steps:**
1) Define adapter responsibilities: input commands -> core; render status/update
2) Define minimal Discord commands (text commands, not full UX)
3) Commit: `docs: add adapter contract`

### Task 5.2: Discord adapter (skeleton)
**Files:**
- Create: `packages/discord-adapter/` (or `src/adapters/discord/`)

**Steps:**
1) Read messages -> parse `ocb` commands
2) Invoke core functions
3) Reply with status/update
4) Commit: `feat: add minimal discord adapter`

## Phase 6 — Tick governance (WIP/stuck/safety)

### Task 6.1: Implement WIP limits
**Files:**
- Create: `src/governance/wip.js`
- Modify: `src/core.js`

**Steps:**
1) Add config file under `.ocb/config.json`
2) Enforce max open PRs/issues per sessionKey
3) Emit governance events
4) Commit: `feat: enforce wip limits`

### Task 6.2: Implement stuck detection
**Files:**
- Create: `src/governance/stuck.js`

**Steps:**
1) Define “progress” as commit OR patch diff OR issue/PR movement
2) Track ticks with no progress
3) Emit `stuck_detected` event
4) Commit: `feat: add stuck detection`

### Task 6.3: Implement safety modes
**Files:**
- Create: `src/safety/modes.js`
- Modify: `src/core.js`

**Steps:**
1) safe/assist/yolo config
2) Gate destructive operations (merge/close/release)
3) Emit `approval_required` events when blocked
4) Commit: `feat: implement safety mode gating`

