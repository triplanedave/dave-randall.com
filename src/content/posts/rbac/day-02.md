---
title: Two permission planes
series: rbac-20-days
day: 2
week: 1
date: 2026-10-13
summary: Is Intune Administrator an Intune role? It isn't. It's a Microsoft Entra role, and that difference matters a lot.
linkedin: https://lnkd.in/p/g8C2mXgU
diagram: /images/rbac/day-02.png
diagramAlt: "Two stacked bands. Top: Microsoft Entra roles, privileged, tenant-wide, can't be scoped: Global Administrator, Intune Administrator, Security Administrator, Global Reader. Bottom: Intune RBAC roles, recommended, granular, can be scoped: Help Desk Operator, Application Manager, Policy and Profile Manager, your custom roles. A callout notes Intune Administrator appears as Intune Service Administrator in Graph and PowerShell."
---

Is Intune Administrator an Intune role? **It isn't. It's a Microsoft Entra role!** That difference matters a lot.

There are two ways someone can get access to Intune, and they behave very differently.

## Plane 1: Microsoft Entra roles

Global Administrator, Intune Administrator, Security Administrator, Global Reader, and others. These are **tenant-wide** roles. Global Administrator and Intune Administrator both get full permissions across all your Intune data and can call any Intune remote action. Both are classified as privileged roles, and neither can be limited to part of your Intune data, devices, or users.

Intune RBAC is an extension of Microsoft Entra ID RBAC, and several Entra roles carry permissions inside Intune:

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

Help Desk Operator, Application Manager, Policy and Profile Manager, custom roles, and others. These are **granular**. You choose exactly which permissions they include, and you can limit which users and devices they apply to. That second part, scoping, is what Week 2 is about.

## My recommendation

Use Intune RBAC roles for everyday administration, and avoid using Entra roles for Intune work. This applies to organizations of all sizes. Microsoft's guidance says the same, and adds specifics:

- **Don't use Global Administrator for Intune work.** A few features still require it (some mobile threat defense connectors, for example). Grant it for that task, then remove it.
- **Don't use Intune Administrator for routine work either.** It's narrower than Global Administrator but still far more than almost any daily task needs. When it is required, make it time-bound. Week 4 covers doing that with Privileged Identity Management (PIM).

## Two things that confuse people

**Same role, two names.** In the Entra admin center the role is *Intune Administrator*. In Microsoft Graph and PowerShell it shows up as *Intune Service Administrator*. If you're auditing role holders with a script, search for both names.

**Some of "Intune" is really Entra.** Users, Groups, and Conditional Access in the Intune console are actually Entra objects. Those stay governed by Entra, even when you're working in Intune, so Entra admins with the right roles can manage them regardless of your Intune RBAC design.

## Quick check for today

How many people in your tenant are assigned **Intune Administrator** or **Global Administrator**? Is every one of them justified?

1. In the Microsoft Entra admin center, go to **Roles & admins** and open each role to see its assignments.
2. Then go to **Entra ID** > **Identity Secure Score**. Two of its recommendations are aimed squarely at this: **Use least privileged administrative roles** and **Designate more than one Global Administrator**. They'll point you to accounts holding more privilege than they need.

Tomorrow: the built-in Intune roles, and which job each one is designed for.

<aside class="history" aria-labelledby="why-two-permission-planes">

<p class="history-tag">History lesson</p>

## Why two permission planes?

When Intune was still **Windows Intune**, from roughly 2010 to 2014, it had a simple permissions model with three roles: **Read Only Operator**, **Full Administrator**, and **Help Desk Operator**. That's it!

### Borrowing a role from Azure AD

We wanted to align with the administrative roles being defined in Azure Active Directory (AAD). AAD was still in its early stages, but we wanted to be forward-thinking. Other Microsoft teams were building roles in AAD, and they typically named them as "service" roles: a role you assign to the person who administers that service. That's why the original Intune role was called **Intune Service Administrator**. It was the person managing the Intune service, in contrast to AAD's own native roles, which didn't carry the "service" label.

Remember the Full Administrator? Instead of rebuilding it inside Intune, we decided to use the new Intune Service Administrator role as the Full Administrator. **That was the start of the two permission planes.** Entra later dropped "Service" from the display name, and today the role is simply **Intune Administrator**, though Intune Service Administrator is still the name you'll see in Graph and PowerShell.

### Learning from Configuration Manager

Customers were frustrated with the fixed permissions of those three roles. Configuration Manager (SCCM at the time) had a much richer role-based access control model, and it was the natural comparison. So we used it as our model, and that effort became the Intune RBAC you use today.

- **Read Only Operator** and **Help Desk Operator** carried over as built-in roles.
- **Intune Service Administrator** stayed in AAD, with full permissions to Intune plus the permissions needed to manage AAD users and groups. The intent was to make life easy for customers with a single Intune admin: one role with everything they needed.

### Why "Assign" is its own permission

We defined a set of built-in roles, and create, read, update, and delete (CRUD) permissions for each resource category. Because assigning a resource is a more impactful change, **Assign** became a separate permission instead of being folded into Create and Update. The same logic applied to **remote tasks**: rather than making them part of Update on devices, we split them out. Other non-CRUD permissions have been added over time for similar reasons.

### Why not build it all in AAD?

At the time, AAD didn't offer granular permissions for roles or the ability to customize them. Customers who had used (and liked) Configuration Manager RBAC told us that was a requirement. Intune also needed to define new resources and permissions on its own release schedule. So we let the AAD role manage everything in Intune, and built the granular role, permission, and resource model inside Intune itself.

Custom roles didn't exist at all in the original Windows Intune, or in the early AAD roles. But with our own resources, permissions, and API for managing RBAC, we could build a full RBAC system.

### And today?

So there you have it. But needs and technology change. Entra (formerly AAD) is far more flexible now, and customers are increasingly frustrated with the separate, bespoke RBAC models across Microsoft's admin portals and services. In [Week 4](/rbac/#rbac-20-days), I'll come back to this and what it means for how you design Intune RBAC today.

</aside>

## Further reading

- [Microsoft Entra roles with Intune access](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview#microsoft-entra-roles-with-intune-access), Microsoft Learn
- [Privileged roles and permissions in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/privileged-roles-permissions), Microsoft Learn
- [What is the Identity Secure Score?](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-identity-secure-score), Microsoft Learn
