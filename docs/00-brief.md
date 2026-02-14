# Brief

## Goal
Ship an OpenClaw Hub skill pack (OCB) that provides a **CCB-like orchestration core** to run **high-velocity, week-long iterative repo work** with:
- auditability (event stream, logs, evidence)
- safety modes (safe/assist/yolo)
- WIP governance & stuck detection
- adapters (Discord first, but core remains channel-agnostic)

## Why
Raw chat-based coding easily drifts. OCB turns it into a bounded, repeatable loop (tick) with explicit outputs.

## MVP focus (first slice)
Make **core + tick runnable**:
- `events.jsonl` event stream
- `.ocb/` state dir + `locks/`
- basic commands: `run`, `status` (enough to demonstrate)
- heartbeat-driven tick skeleton that produces an **Iteration Update**

## Non-goals (for now)
- full Discord UX / workflow polish
- full CI integration
- multi-user permission modeling

