# GitHub anchor (minimal)

## Canonical anchor
OCB prefers GitHub Issues as the canonical task anchor.

Once an issue exists, the recommended sessionKey is:
- `gh:<owner>/<repo>#<issueNumber>`

See: `docs/SESSIONKEY.md`.

## Minimal integration goal (Phase 3)
Provide a tiny script that can:
1) Create an issue for a session (epic or task)
2) Persist the mapping under `.ocb/` so it is idempotent
3) Post `iteration_update` events as issue comments (evidence sink)

## Idempotency
We keep a mapping file:
- `.ocb/gh-map.json`

Suggested structure:
```json
{
  "version": 1,
  "anchors": {
    "<sessionKey>": {
      "repo": "owner/repo",
      "issueNumber": 12,
      "issueUrl": "https://github.com/owner/repo/issues/12",
      "createdAt": "..."
    }
  },
  "comments": {
    "<eventTs-or-eventId>": {
      "repo": "owner/repo",
      "issueNumber": 12,
      "commentUrl": "...",
      "createdAt": "..."
    }
  }
}
```

## Safety
- Creating issues and posting comments are allowed in assist mode.
- Merging PRs / closing issues should require human approval.
