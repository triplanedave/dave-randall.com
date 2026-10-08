---
title: Apps and assignments (Win32, Store, LOB)
series: graph-19-days
day: 9
week: 2
date: 2026-01-15
summary: App inventory, versions, and assignments are the foundation of safe app updates at scale.
---

This is one of the most real-world-critical pieces of Intune automation: understanding **what apps are deployed**, **what versions are out there**, and **how assignments drive** safe, large-scale updates.

## 1. Reading your app inventory

Use the `/deviceAppManagement/mobileApps` family of endpoints to enumerate Win32, Store, and LOB apps. Key things to pull:

- App type (Win32 vs. Store vs. LOB)
- Versions published
- Assignments and delivery intent (Required, Available, Uninstall)
- Detection rules and dependencies for Win32 apps

These are the foundation for any automation that needs to answer: *What apps do I have? Who has them? And in what version?*

## 2. Checking assignments and effective intent

Assignments determine install and uninstall behavior on devices. Conflicts do happen, and Intune applies well-defined conflict rules. For example, Required usually wins over Available, and Uninstall applies when explicitly targeted.

Reading assignments programmatically helps you:

- Validate that the right rings and groups are targeted
- Detect conflicting assignments before they reach production
- Prepare safe rollout waves

## 3. Safe update flows at scale

For large fleets, updating a Win32 or LOB app isn't just "swap the binary." Safe flows typically include:

- Version pinning and checking current installed versions
- Phased rollout rings mapped to Entra groups
- Monitoring install success and failure through the app install status APIs
- Fallback handling when app detection or applicability fails
- Cleanup of superseded or deprecated app objects

Enterprise App Management (EAM) and Store-based delivery can simplify this, but Win32 flows still dominate for in-house apps and complex installers.

To be honest, app management is one of the more challenging areas to automate in Intune. It may deserve its own deep dive here in the future.

## 4. Why this matters

When you automate the app lifecycle with Graph:

- You prevent fleet fragmentation (mixed app versions across devices)
- You reduce outages caused by bad updates
- You gain full visibility into app posture before releasing changes

App inventory + assignments + safe update patterns = a stable, predictable software ecosystem.

## Further reading

- [win32LobApp resource type](https://learn.microsoft.com/en-us/graph/api/resources/intune-apps-win32lobapp?view=graph-rest-1.0), Microsoft Learn
- [Working with Intune in Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/resources/intune-graph-overview?view=graph-rest-1.0), Microsoft Learn
