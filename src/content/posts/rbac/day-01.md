---
title: How many people can wipe every device you manage?
series: rbac-20-days
day: 1
week: 1
date: 2026-10-12
summary: Why role-based access control is the Intune security gap hiding in plain sight, and what the next 20 days cover.
diagram: /images/rbac/roadmap.png
diagramAlt: "Series roadmap: Week 1 Foundations, Week 2 Scoping, Week 3 Design, Week 4 Governance, building from basics to advanced."
---

If you had to stop and check, you're not alone. In many tenants the honest answer is "everyone with Intune Administrator," and that list grew because it was easier than working out what each person actually needed.

That's the problem this series sets out to fix. **Role-based access control (RBAC)** in Intune lets you give each admin exactly the permissions their job needs, over exactly the users and devices they're responsible for. Microsoft calls this the principle of *least privilege*, and it runs through every post in the series.

## Why it matters now

- **The blast radius is real.** Intune admins can wipe devices, push scripts, and change security policy across your whole fleet. One compromised or careless admin account with broad rights can do a lot of damage, quickly.
- **Access keeps growing quietly.** New Intune features bring new permissions. A role that was right-sized last year may reach further today.
- **Partners carry customer trust.** If you manage Intune for customers, how you delegate access is part of your security posture, and increasingly part of what customers ask about.

## The four weeks

| Week | Theme | What you'll learn |
|---|---|---|
| 1 | **Foundations** | Entra roles vs. Intune roles, the built-in roles, and how permissions are built |
| 2 | **Scoping** | Scope groups, scope tags, and the difference that confuses almost everyone |
| 3 | **Design patterns** | Custom roles, persona-based design, regional delegation, multiple assignments, and partner access |
| 4 | **Governance** | Just-in-time access, Multi Admin Approval, auditing, and a reference architecture |

Each LinkedIn post is short enough to read in two minutes. Each page here goes further, with the full diagram, the details, and links to Microsoft's documentation.

## Who this is for

**Intune customers:** if your help desk, app team, and security team all have Intune Administrator "because it was easier," this series will help you get to least privilege without breaking anyone's day.

**Integration partners and MSPs:** if you deliver Intune services across customer tenants, we'll cover how to design delegated access that's repeatable, auditable, and defensible.

## Further reading

- [Role-based access control (RBAC) with Microsoft Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview), Microsoft Learn
