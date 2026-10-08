---
title: "Compliance state: $expand vs. follow-up calls"
series: graph-19-days
day: 8
week: 2
date: 2026-01-14
summary: How compliance policies map to device state and per-setting state, and when to pull it all in one call versus chaining requests.
---

Today's topic is a core Intune reporting pattern: how compliance policies map to **device state** and then to **per-setting state**, and how to retrieve that data cleanly with Microsoft Graph.

## 1. The relationship: policy → device state → setting state

When a compliance policy is assigned, Intune evaluates each device and generates:

- A `deviceCompliancePolicyState` per policy
- A set of `settingStates` for each setting in that policy

This is the hierarchy you'll read through Graph:

```text
deviceManagement
└─ managedDevices
   └─ deviceCompliancePolicyStates
      └─ settingStates
```

## 2. `$expand` vs. follow-up calls

**Option A: `$expand` for single-call clarity.** Useful when you want the complete policy and state payload for each device in one shot, and can tolerate the larger response.

```http
GET /deviceManagement/managedDevices/{id}?$expand=deviceCompliancePolicyStates($expand=settingStates)
```

- **Pros:** simple, fewer round trips
- **Cons:** bigger payload, may hit filtering limitations

**Option B: follow-up calls for performance.** Query only what you need, then drill into details as required.

```http
GET /deviceManagement/managedDevices?$select=id,deviceName,complianceState,operatingSystem
GET /deviceManagement/managedDevices/{id}/deviceCompliancePolicyStates
GET /deviceManagement/managedDevices/{id}/deviceCompliancePolicyStates/{policyId}/settingStates
```

- **Pros:** faster, tighter payloads, better for automation at scale
- **Cons:** more request chaining

## 3. When to use which

- Choose **`$expand`** for reports, debugging, and one-off investigations.
- Choose **follow-up calls** for automations, dashboards, and large-tenant workflows where you need predictable performance.

## 4. Why this matters

Compliance data drives Conditional Access decisions and operational insight. Mapping these objects correctly gives you:

- Accurate device posture
- Clear insight into which setting is failing
- Repeatable automation patterns across tenants

## Further reading

- [Customize Microsoft Graph responses with query parameters](https://learn.microsoft.com/en-us/graph/query-parameters), Microsoft Learn
