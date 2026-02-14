# Quickstart (week-long iteration loop)

This is the shortest path to run an OCB-style iterative loop.

## 1) Pick a canonical task anchor
Prefer GitHub issues:
- `sessionKey = gh:<owner>/<repo>#<issueNumber>`

## 2) Initialize project state
```bash
node bin/ocb.js init
```

## 3) Declare an objective
```bash
node bin/ocb.js run --objective "Ship slice-1 core+tick" \
  --sessionKey "gh:owner/repo#12" \
  --actorId "local:pm"
```

## 4) Run one tick (repeat daily/hourly)
```bash
node bin/ocb.js tick --sessionKey "gh:owner/repo#12" --actorId "local:runner"
```

Each tick emits an `iteration_update` event with the required contract:
- Objective / Decisions / Changes / Next / Risks

## 5) Inspect status
```bash
node bin/ocb.js status --sessionKey "gh:owner/repo#12"
```

## (Optional) Mirror updates to GitHub
Dry-run first:
```bash
node scripts/gh-anchor.js ensure-issue --repo owner/repo --sessionKey "gh:owner/repo#12" --title "OCB Epic" --dryRun
node scripts/gh-anchor.js post-latest-update --repo owner/repo --sessionKey "gh:owner/repo#12" --dryRun
```

## Recommended discipline (SP)
- Brainstorm → Plan → Execute → Verify
- Every tick must produce evidence (commit/PR/doc link)
