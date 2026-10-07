---
title: Two permission planes
series: rbac-20-days
day: 2
week: 1
date: 2026-10-13
summary: Intune Administrator isn't an Intune role. Knowing which plane a permission comes from tells you how far it reaches.
diagram: /images/rbac/day-02.png
diagramAlt: "Two stacked bands. Top: Microsoft Entra roles, privileged, tenant-wide, can't be scoped: Global Administrator, Intune Administrator, Security Administrator, Global Reader. Bottom: Intune RBAC roles, recommended, granular, can be scoped: Help Desk Operator, Application Manager, Policy and Profile Manager, your custom roles. A callout notes Intune Administrator appears as Intune Service Administrator in Graph and PowerShell."
---

There are two ways someone can get access to Intune, and they behave very differently.

## Plane 1: Microsoft Entra roles

Intune RBAC is an extension of Microsoft Entra ID RBAC, and several Entra roles carry permissions inside Intune. These roles are **tenant-wide**: you can't limit them to some of your users or devices.

| Entra role | Intune data | Intune audit data |
|---|---|---|
| Global Administrator | Read/write | Read/write |
| Intune Administrator | Read/write | Read/write |
| Security Administrator | Read only (full admin for the Endpoint security node) | Read only |
| Security Operator | Read only | Read only |
| Security Reader | Read only | Read only |
| Global Reader | Read only | Read only |
| Helpdesk Administrator | Read only | Read only |
| Compliance Administrator | None | Read only |
| Compliance Data Administrator | None | Read only |
| Reports Reader | None | Read only |
| Conditional Access Administrator | None | None |

Source: Microsoft Learn's RBAC overview. Most of these are classified as **privileged roles** in Entra.

## Plane 2: Intune RBAC roles

Intune's own roles, built-in or custom, are **granular**. You choose exactly which permissions a role includes, and when you assign it you choose which users and devices it applies to. That second part, scoping, is what Week 2 is about.

## What Microsoft recommends

Use Intune RBAC roles for day-to-day administration, and avoid using Entra roles that have Intune access. Specifically:

- **Don't use Global Administrator for Intune work.** A few features still require it (some mobile threat defense connectors, for example). Grant it for that task, then remove it.
- **Don't use Intune Administrator for routine work either.** It's narrower than Global Administrator but still far more than almost any daily task needs. When it is required, make it time-bound. Week 4 covers doing that with Privileged Identity Management (PIM).

## Two things that trip people up

**Same role, two names.** In the Entra admin center the role is *Intune Administrator*. In Microsoft Graph and PowerShell it appears as *Intune Service Administrator*. If you're auditing role holders with a script, search for both names.

**Some of "Intune" is really Entra.** Users, Groups, and Conditional Access in the Intune admin center are direct extensions of Microsoft Entra. Those objects live in Entra, so Entra admins with the right roles can manage them too, regardless of your Intune RBAC design.

## Try it

In the Microsoft Entra admin center, go to **Roles & admins**, open **Intune Administrator**, and look at the assignments. For each name, ask: does this person need tenant-wide read/write to everything in Intune, every day?

## Further reading

- [Microsoft Entra roles with Intune access](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview#microsoft-entra-roles-with-intune-access), Microsoft Learn
- [Privileged roles and permissions in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/privileged-roles-permissions), Microsoft Learn
