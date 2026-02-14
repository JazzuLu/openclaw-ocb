# Workflow (OCB)

## What we are building
OCB = a **CCB-like orchestration core** + **adapters** (Discord/GitHub/others) packaged as **OpenClaw Hub skills**.

Primary goal: enable OpenClaw to run **high-velocity iterative repo work** safely and auditably ("one week of continuous iteration").

## Two places where “Superpowers (SP)” matters

### 1) For us (repo builders)
We use SP as the development operating system:
- brainstorm → plan → execute → verify
- parallelize with sub-agents where possible
- evidence-based completion (tests/logs/links)

### 2) For users (people adopting the skills)
We recommend SP as the usage discipline, similar to CCB:
- standard command vocabulary
- consistent task lifecycle
- predictable state + logs

## Core concepts

### Core is channel-agnostic
- The core does NOT depend on Discord.
- Adapters translate between external events (Discord/GitHub/etc) and core events.

### Single source of truth protocol
- Core emits/consumes an append-only event stream (planned: `events.jsonl`).
- Adapters render state from events (job cards, summaries) and send user commands back to core.

### Project state directory
- Each repo has a local state dir: `./.ocb/` (locks, history, logs, caches).

## High-velocity iteration loop (the “one-week grind”)

### Roles OpenClaw plays
Within one continuous program, OpenClaw can instantiate multiple roles:
- PM: pick next work from backlog, enforce WIP limits
- Architect: propose plan & tradeoffs, keep interfaces stable
- UI/UX: turn goals into screens/flows
- FE/BE devs: implement slices
- QA: verify, reproduce bugs, define acceptance criteria
- Release manager: cut PRs, track CI, prepare changelog

### What OCB adds on top of raw OpenClaw
- **Serialization/locks**: keep runs consistent per repo/session.
- **WIP governance**: cap open PRs/issues in flight.
- **Stuck detection**: detect no-progress ticks.
- **Safety modes**:
  - safe: changes require explicit approval
  - assist: local iteration + push allowed; merge/close requires approval
  - yolo: fully autonomous (still with hard security boundaries)

### Tick driver
A periodic tick (heartbeat/cron) triggers:
- status scan
- pick next task
- run a bounded iteration step
- post structured updates

