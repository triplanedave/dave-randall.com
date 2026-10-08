---
title: Audit logs and change intelligence
series: graph-19-days
day: 10
week: 2
date: 2026-01-16
summary: When something breaks, the first question is "what changed?" Audit events stitched into a timeline answer it.
---

When something breaks, the first question is usually: **"What changed?"**

Today is about where to pull audit and admin events, and how to turn them into a clear change timeline for root-cause analysis and governance.

## The signals are spread out

Intune and Entra audit signals live in several places: directory audit logs, Intune audit events, and the affected resources themselves. On its own, each log tells part of the story. Together, they explain how a tenant got from a known-good state to an issue.

## From logs to a timeline

With Microsoft Graph, you can query audit events over time, correlate them to Intune objects, and identify **who** made a change, **what** changed, and **when**, whether the actor was a human admin, automation, or an app.

Stitching those events into a timeline is what turns raw logs into **change intelligence**. It enables faster incident response, stronger governance reporting, and confidence in automation at scale.

Audit logs aren't just for forensics. They're your system of record for trust.

Start with:

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/auditEvents
```

## Further reading

- [List auditEvents](https://learn.microsoft.com/en-us/graph/api/intune-auditing-auditevent-list?view=graph-rest-1.0), Microsoft Learn
