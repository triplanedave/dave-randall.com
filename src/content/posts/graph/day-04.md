---
title: Resilient calling patterns
series: graph-19-days
day: 4
week: 1
date: 2026-01-08
summary: Graph throttles to protect service health. Automation at scale has to listen for the signals and back off.
---

When you build automation at scale, resilience isn't optional. It's essential. Graph APIs, including Intune endpoints, enforce **throttling** to protect service health. If your app ignores these signals, you risk failures and a degraded experience.

## Throttling signals

- **HTTP 429** Too Many Requests
- **`Retry-After`** header (in seconds)

These signals tell you to pause and retry later, preventing overload and ensuring fairness across tenants.

## Best practice: exponential backoff

Instead of hammering the API, back off progressively. Start small, then increase the wait after each retry. This pattern improves success rates and avoids cascading failures.

```text
maxRetries = 5
delay = 2            // seconds

for attempt in 1..maxRetries:
    response = callGraphAPI()
    if response.status == 429:
        wait(response.retryAfter or delay)
        delay *= 2
    else:
        break
```

## Why this matters for Intune

Intune workloads often involve batch operations, delta queries, and pagination. Combine them with resilient retry logic to handle spikes gracefully.

Next time you script against Graph, bake in backoff logic. Your future self, and your service health, will thank you.

## Further reading

- [Microsoft Graph throttling guidance](https://learn.microsoft.com/en-us/graph/throttling), Microsoft Learn
