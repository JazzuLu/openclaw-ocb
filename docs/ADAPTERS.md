# Adapters

OCB core is channel-agnostic. **Adapters** translate between external systems (Discord, Slack, CLI, etc.) and core commands/events.

## Adapter responsibilities

### Input → core
- Parse user intent (commands)
- Choose `sessionKey` (prefer GitHub issue anchor)
- Choose `actorId` and `role`
- Invoke core commands:
  - `run` (objective)
  - `tick` (produce Iteration Update)
  - `status` (render summary)
  - `cancel` (request cancellation)
  - `wait` (optional: wait for an event)

### Core → output
- Render a concise status/update message
- Provide evidence links (commit/PR/doc)
- Respect guardrails (avoid UX bikeshedding; focus on runnable loop)

## Minimal command surface (text)
A minimal adapter only needs to support these text commands:

- `ocb init`
- `ocb run <objective>`
- `ocb tick`
- `ocb status`
- `ocb cancel`

Optional:
- `ocb wait --type iteration_update`

## Discord adapter (v0)
For MVP, Discord integration can be "thin":
- treat each Discord thread as a task workspace
- derive `sessionKey` from GitHub issue if linked, else `discord:<guild>/<channel>/<thread>`
- reply in-thread with status/update

See also: `docs/SESSIONKEY.md`, `docs/EVENTS.md`.
