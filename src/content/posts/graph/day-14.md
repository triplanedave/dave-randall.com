---
title: "RBAC for automation: making least privilege real"
series: graph-19-days
day: 14
week: 3
date: 2026-01-22
summary: '"Just grant .ReadWrite.All so the script works" isn''t RBAC. It''s crossing your fingers. Here''s the model to use instead.'
---

Automation is powerful. **Over-permissioned automation is dangerous.**

One of the biggest anti-patterns I still see: *"Just grant `.ReadWrite.All` so the script works."* That's not RBAC. That's crossing your fingers.

Here's the model I recommend instead.

## 1. Start with actions, not roles

List the exact API operations your automation performs:

- Read device inventory?
- Update assignments?
- Trigger admin tasks?

RBAC should map to actions, not convenience.

## 2. Treat `.ReadWrite.All` as a last resort

If your app registration needs global write permissions, ask why. Most automation needs narrow write plus broader read, not blanket access.

## 3. Trim permissions deliberately

My default pattern:

- ✅ Read permissions for discovery and validation
- ✅ Targeted write permissions for the one thing you automate
- ❌ No cross-domain "just in case" scopes

## 4. Separate humans from automation

Human admins and service principals should never share the same roles. Automation deserves its own identity, and its own blast radius.

Least privilege isn't about slowing teams down. It's about making automation safe, auditable, and scalable.

If you're building Intune automation and still relying on broad Graph scopes, this is your sign to revisit your RBAC model. Delegated auth is king here: it keeps Intune's role-based access control in the loop (Day 5).

For the Intune side of role design, see [20 Days of Intune RBAC](/rbac/).

## Further reading

- [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference), Microsoft Learn
- [Role-based access control (RBAC) with Microsoft Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview), Microsoft Learn
