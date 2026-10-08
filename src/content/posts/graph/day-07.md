---
title: Compliance policies and state reporting
series: graph-19-days
day: 7
week: 2
date: 2026-01-13
summary: What actually happens behind the scenes when Intune evaluates compliance, and how to find out why a device is noncompliant, not just that it is.
---

When you build reporting or automation around compliance, the most important thing to understand is the relationship between a **compliance policy**, the **device**, and the policy's **evaluated state**. Every Intune compliance policy produces per-device, per-setting evaluation results, and your Graph calls should reflect that hierarchy.

## How it works

- A compliance policy defines rules: OS version, encryption, password requirements, jailbreak detection, and so on.
- Each assigned device produces a `deviceCompliancePolicyState` object.
- Each rule produces a `deviceCompliancePolicySettingState` entry.

This is where you discover **why** a device is noncompliant, not just **that** it is.

## Two ways to query it

**1. `$expand` for a single call.** Great for simple, small-scale reporting.

```http
GET https://graph.microsoft.com/v1.0/deviceManagement/deviceCompliancePolicies/{id}
  ?$expand=deviceStatuses,deviceSettingStateSummaries
```

**2. Follow-up calls for clarity and performance.** Best for large tenants and automation jobs.

```http
GET /deviceManagement/deviceCompliancePolicyStatuses
GET /deviceManagement/deviceCompliancePolicySettingStateSummaries
```

This reduces payload size and avoids accidental over-fetching, which is critical when you're running scheduled jobs or building dashboards.

## Why this matters

Clear reporting helps you pinpoint drift fast, troubleshoot issues, and build automations that trigger only when the actual failing setting needs attention, not just when a device flips to "noncompliant."

## Further reading

- [Get deviceCompliancePolicy](https://learn.microsoft.com/en-us/graph/api/intune-deviceconfig-devicecompliancepolicy-get?view=graph-rest-1.0), Microsoft Learn
