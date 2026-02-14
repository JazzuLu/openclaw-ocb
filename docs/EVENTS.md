# Events schema (v1)

OCB uses an append-only JSONL event stream at:
- `./.ocb/events.jsonl`

Each line is one JSON object.

## Base fields (common)
- `v` (number): schema version. Currently `1`.
- `ts` (string): ISO timestamp.
- `type` (string): event type.
- `repoRoot` (string): absolute path to repo root.
- `sessionKey` (string, optional): task scope key.
- `actorId` (string, optional): which AI/tool instance emitted the event.

## Event types

### `ocb_inited`
Emitted when `.ocb/` is created (first-time init).

Example:
```json
{"v":1,"ts":"2026-02-14T00:00:00.000Z","type":"ocb_inited","repoRoot":"/abs/path/to/repo"}
```

### `run_requested`
Represents a user/system request to start/continue work under a given objective.

Required fields:
- `objective` (string)

Optional fields:
- `role` (string): pm/arch/uiux/dev/qa/etc

Example:
```json
{
  "v": 1,
  "ts": "2026-02-14T00:00:00.000Z",
  "type": "run_requested",
  "repoRoot": "/abs/path/to/repo",
  "sessionKey": "gh:owner/repo#12",
  "actorId": "local:pancras@mba",
  "role": "pm",
  "objective": "Make core+tick runnable"
}
```

### `iteration_update`
A bounded progress update produced by a tick.

Required fields:
- `update.objective` (string)
- `update.decisions` (array of strings)
- `update.changes` (array of strings) — evidence links: commit/PR/doc
- `update.next` (array of strings)
- `update.risks` (array of strings)

Example:
```json
{
  "v": 1,
  "ts": "2026-02-14T00:00:00.000Z",
  "type": "iteration_update",
  "repoRoot": "/abs/path/to/repo",
  "sessionKey": "gh:owner/repo#12",
  "actorId": "local:pancras@mba",
  "update": {
    "objective": "Make core+tick runnable",
    "decisions": ["Defer Discord UX until core+tick is verified"],
    "changes": ["commit: 912ff98"],
    "next": ["Add actorId to events"],
    "risks": []
  }
}
```

## Compatibility
- This document is intentionally minimal for v1.
- New event types should be added without breaking older parsers.
