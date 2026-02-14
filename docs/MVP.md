# MVP scope

## Deliverable
A repo that can evolve into an OpenClaw Hub skill pack providing:
- a CCB-like orchestration core
- at least one adapter (Discord) to drive/review work
- GitHub sink integration for issue/PR linking
- a documented high-velocity iteration loop (tick)

## Non-goals (initially)
- full Discord event mirroring (edit/delete/reaction)
- CI deep integration
- multi-user permission modeling

## First implementation slices
1) Core: event stream + job lifecycle (`run/status/wait/cancel`)
2) Local state dir: `./.ocb/` + locks
3) Discord adapter (minimal): command in thread → core run → status card reply
4) GitHub sink (minimal): create/link issues, comment results (idempotent)
5) Tick driver (heartbeat first): bounded iteration with WIP limits
