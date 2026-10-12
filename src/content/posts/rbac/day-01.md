---
title: How many of your admins have only the permissions they need?
series: rbac-20-days
day: 1
week: 1
date: 2026-10-12
summary: If you had to stop and check, you're not alone. That's why this series exists. Here's the four-week roadmap and who it's for.
diagram: /images/rbac/roadmap.png
diagramAlt: "Series roadmap: Week 1 Foundations, Week 2 Scoping, Week 3 Design, Week 4 Governance, building from basics to advanced."
---

Quick question: how many admins in your tenant have **only the minimum permissions** for their task?

If you had to stop and check, you're not alone. And that's exactly why I'm starting this series.

Every weekday for four weeks, I'll post one Intune role-based access control concept with a diagram. To make sure everyone gets value from the series, I'll start with the basics and build up to the most challenging aspects of RBAC. Each post is built to read in under two minutes, and each one gets a page here with the full diagram, the details, and links to Microsoft's documentation.

## The roadmap

**📘 Week 1 – Foundations: who can do what**
Entra roles vs. Intune roles, built-in roles, and how permissions are built.

**🎯 Week 2 – Scoping: where they can act**
Scope groups, scope tags, and one gotcha I'll show you how to avoid.

**🏗️ Week 3 – Design patterns: building for real organizations**
Custom roles, persona-based design, regional delegation, and how multiple role assignments really combine.

**🛡️ Week 4 – Governance: keeping it secure at scale**
Just-in-time access with PIM, Multi Admin Approval, auditing, and a reference architecture to tie it all together.

## Who this is for

**✅ Intune customers.** If your support agents, app admins, and security team all have Intune Administrator "because it was easier," this series will help you get to least privilege without breaking anyone's day. And if you're already using RBAC, it will help you optimize your roles, scopes, and assignments.

**✅ Integration partners and MSPs.** If you deliver Intune services across customer tenants, RBAC is part of your security posture and your customers' trust. We'll cover how to design delegated access that's repeatable, auditable, and defensible.

## Why it matters

Intune admins can wipe devices, push scripts, and change security policy across your whole fleet. One compromised or careless account with broad rights can do a lot of damage, quickly. Least privilege, giving each admin exactly the permissions their job needs over exactly the users and devices they're responsible for, is the thread that runs through all 20 days.

## Further reading

- [Role-based access control (RBAC) with Microsoft Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview), Microsoft Learn
