---
title: "OData basics: the 7 operators that matter"
series: graph-19-days
day: 3
week: 1
date: 2026-01-07
summary: OData is the query language baked into Microsoft Graph. Mastering it is the difference between pulling everything and pulling exactly what you need.
---

If you've ever wondered how to make your Graph queries fast and precise, the answer is **OData**. It's the query language baked into Microsoft Graph, and mastering it is the difference between pulling everything and pulling exactly what you need.

## The big 7

| Operator | What it does |
|---|---|
| `$select` | Choose only the properties you need (reduces payload size) |
| `$filter` | Narrow results, e.g. `operatingSystem eq 'Windows' and complianceState eq 'compliant'` |
| `$orderby` | Sort results, e.g. by `lastSyncDateTime` |
| `$top` | Limit results per page |
| `$count` | Get the total item count (with `$count=true`) |
| `$expand` | Include related entities in one call |
| `$search` | Keyword search across supported fields |

Support for each operator varies by resource, so check the "Optional query parameters" section of the specific API you're calling.

## Why this matters

Efficient queries mean faster scripts, fewer throttling issues, and cleaner automation pipelines.

## Example: an OData query for Intune

The ten most recently synced Windows devices that aren't compliant, with just the fields you need:

```http
GET https://graph.microsoft.com/beta/deviceManagement/managedDevices
  ?$select=id,deviceName,operatingSystem,complianceState
  &$filter=operatingSystem eq 'Windows' and complianceState ne 'compliant'
  &$orderby=lastSyncDateTime desc
  &$top=10
```

(Line breaks added for readability. Send it as one line.)

## Further reading

- [Customize Microsoft Graph responses with query parameters](https://learn.microsoft.com/en-us/graph/query-parameters), Microsoft Learn
