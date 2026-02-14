# Verification

## Slice 1 (core + tick runnable)

### End-to-end verify
Run:
```bash
npm run verify
```
Expected:
- init/run/tick/status complete without errors
- events tail includes `run_requested` and `iteration_update`

### Lock serialization verify (AC5)
Run:
```bash
node scripts/verify-lock.js
```
Expected:
- exits 0
- prints `ok: 2 ticks written without error`
- the temp `.ocb/events.jsonl` contains exactly 2 `iteration_update` events

