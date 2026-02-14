# Install

OCB is currently a developer-oriented repo. The Hub skill packaging is in progress.

## Requirements
- Node.js >= 20
- (Optional) GitHub CLI `gh` for Phase 3 scripts

## Local install / usage

From repo root:

```bash
npm run verify
node bin/ocb.js init
node bin/ocb.js run --objective "your objective" --sessionKey "gh:owner/repo#12" --actorId "local:you"
node bin/ocb.js tick --sessionKey "gh:owner/repo#12" --actorId "local:you"
node bin/ocb.js status --sessionKey "gh:owner/repo#12"
```

## Guardrails
Until core+tick is runnable end-to-end, do not bikeshed Discord UX.
See `docs/GUARDRAILS.md`.
