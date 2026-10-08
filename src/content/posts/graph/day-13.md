---
title: Bulk, safe updates at scale
series: graph-19-days
day: 13
week: 3
date: 2026-01-21
summary: Updating Intune at scale isn't hard. Updating it safely is the real challenge.
---

Updating Intune at scale isn't hard. **Updating it safely** is the real challenge.

When you're touching thousands (or millions) of objects, the difference between success and an outage comes down to patterns, not tooling.

## What works

- ✅ Staged rollouts instead of big-bang changes
- ✅ Canary tenants or rings to validate assumptions early
- ✅ Rollback plans designed *before* the change ships

## Under real-world conditions

All of this has to operate under reality:

- Throttling
- `Retry-After`
- Partial failures

The goal isn't speed. It's **controlled convergence**.

If your update logic can be safely retried, paused, rolled back, and resumed under load, you're building for the enterprise. Day 4 covers the retry and backoff piece.

## Further reading

- [Microsoft Graph throttling guidance](https://learn.microsoft.com/en-us/graph/throttling), Microsoft Learn
