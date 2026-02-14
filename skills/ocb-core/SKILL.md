---
name: ocb-core
description: "OCB core CLI: init/run/tick/status for event-based orchestration (CCB-like)."
---

# OCB Core Skill

This skill provides the minimal OCB core CLI.

## Commands

Run via shell (repo root):

- Init project state dir:
  - `node bin/ocb.js init`

- Start/continue with an objective:
  - `node bin/ocb.js run --objective "..." --sessionKey "gh:owner/repo#12" --actorId "local:me"`

- One tick (emits an Iteration Update event):
  - `node bin/ocb.js tick --sessionKey "gh:owner/repo#12" --actorId "local:me"`

- Status:
  - `node bin/ocb.js status --sessionKey "gh:owner/repo#12"`

## Recommended workflow

- Read: `docs/GUARDRAILS.md`
- Start with: `docs/plans/2026-02-14-ocb-master-plan.md`
- Use session keys: `docs/SESSIONKEY.md`
- Event schema: `docs/EVENTS.md`
