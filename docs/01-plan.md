# Plan (Slice 1: core + tick runnable)

## Slice 1 objective
Implement the minimum viable **orchestration core + tick** so we can run an end-to-end iteration loop and produce auditable outputs.

## Scope
### In
1) Project state dir: `./.ocb/`
   - `events.jsonl` (append-only)
   - `locks/` (serialization per repo+session)

2) Core commands (minimal)
- `run`: append a `run_requested` event with metadata (repo, sessionKey, role, objective)
- `status`: read `events.jsonl` and render current state summary

3) Tick skeleton (heartbeat-first)
- a function/entry that performs **one bounded tick**:
  - reads current state
  - chooses a next action placeholder (for now: emits an update only)
  - writes an **Iteration Update** event containing:
    - Objective / Decisions / Changes / Next / Risks

### Out
- Discord adapter UX
- GitHub integration (issue/PR) beyond placeholders
- full WIP governance/stuck detection (document only, implement later)

## Acceptance Criteria (AC)
- AC1: Running `ocb init` (or equivalent) creates `.ocb/` structure.
- AC2: Running `ocb run --objective "..."` appends to `.ocb/events.jsonl`.
- AC3: Running `ocb tick` appends an Iteration Update event (with required fields).
- AC4: Running `ocb status` prints a coherent summary derived from events.
- AC5: Concurrency: two concurrent ticks for same `(repo_root, sessionKey)` do not interleave (lock works).

## Implementation notes
- Event format: JSON objects, one per line.
- Prefer small, explicit schemas; avoid premature abstraction.
- Keep core channel-agnostic.

## Suggested file layout
- `packages/core/` (or `src/core/`)
- `packages/cli/` for a tiny CLI wrapper (optional in slice 1)
- `docs/` for contracts

