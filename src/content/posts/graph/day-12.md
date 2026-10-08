---
title: Tenant-to-tenant diffing
series: graph-19-days
day: 12
week: 3
date: 2026-01-20
summary: Baseline drift across tenants is one of the fastest ways configuration risk creeps in. Detect it with disciplined queries and regular comparisons.
---

One of the fastest ways configuration risk creeps in? **Baseline drift across tenants.**

If you manage multiple Intune tenants (prod, test, subsidiaries, partners), consistency matters just as much as correctness.

## The pattern

1. Pull the same resource set from each tenant: policies, apps, devices.
2. Use `$select` to normalize the payloads.
3. Compare the lists to surface what changed, what's missing, and what diverged.

This works especially well for:

- Configuration and compliance policies
- App baselines and assignments
- Script and Settings Catalog consistency

## Start simple

You don't need complex tooling to start, just disciplined Graph queries and repeatable comparisons.

- Treat one tenant as the source of truth.
- Diff regularly.
- Detect drift before it becomes an incident.

Baseline consistency = operational sanity.

You can get started with simple queries in [Graph Explorer](https://aka.ms/ge), one of my top five Graph API tools. Day 6 shows the export-and-normalize pattern in detail.

## Further reading

- [Customize Microsoft Graph responses with query parameters](https://learn.microsoft.com/en-us/graph/query-parameters), Microsoft Learn
