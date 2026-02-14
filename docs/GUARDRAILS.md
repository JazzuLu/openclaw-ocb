# Guardrails (anti-drift)

## North star
Build a **CCB-like orchestration core** that enables **high-velocity, week-long iterative development** with clear safety boundaries and auditability.

## Hard guardrail (agreed)
Until **core + tick** is runnable end-to-end, we do **NOT** bikeshed Discord UX.
- Discord work is limited to minimal adapter validation only.

## Definition of "core + tick runnable"
- Can initialize `.ocb/`
- Can append to `events.jsonl`
- Can run a single iteration step and produce an **Iteration Update** (Objective/Decisions/Changes/Next/Risks)
- Can show status from the event stream

