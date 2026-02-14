# SessionKey scheme

## Why
`sessionKey` is the primary key used to:
- serialize work (locks)
- scope status/ticks
- separate concurrent agents/roles safely

## Recommended format
A sessionKey SHOULD be derivable from the canonical task anchor (GitHub issue or Discord thread):

### If a GitHub issue exists (preferred)
- `gh:<owner>/<repo>#<issueNumber>`

Examples:
- `gh:JazzuLu/openclaw-ocb#12`

### If only a Discord thread exists
- `discord:<guildId>/<channelId>/<threadId>`

Example:
- `discord:1075882413852459029/1470609905713942691/1471111111111111111`

## Multi-agent / multi-model note
When multiple AIs participate (e.g. OpenCode / Claude Code / Codex / Gemini), each actor SHOULD have its own `actorId` (or equivalent) recorded in events.

The serialization key can remain task-scoped (same `sessionKey`), while events carry:
- `actorId` (who did it)
- `role` (pm/arch/uiux/dev/qa)

If strict isolation is required, use a derived sub-session:
- `<sessionKey>::actor:<actorId>`

