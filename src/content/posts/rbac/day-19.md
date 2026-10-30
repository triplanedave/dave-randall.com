---
title: Audit and automate
series: rbac-20-days
day: 19
week: 4
date: 2026-11-05
summary: A good RBAC design drifts unless you check it. Four built-in tools, plus Microsoft Graph, tell you who has what, what changed, and whether it still matches your design.
diagram: /images/rbac/day-19.png
diagramAlt: "Four ways to check Intune RBAC. Who has what: Tenant administration, Roles, Monitor, with My permissions, Roles by permission and Admin permissions. What changed: Tenant administration, Audit logs, filtered to the Role category, exportable to Azure Monitor, two years through Graph. Who should still have it: Microsoft Entra access reviews of admin groups on a recurring schedule. What would merge: the Permissions Assessment Report. Below, automate with Microsoft Graph: export role definitions and assignments with DeviceManagementRBAC.Read.All, compare against your design baseline, and alert on drift."
---

Everything we've built over 18 days starts drifting the moment you finish it. People change teams, groups pick up extra members, someone adds a permission "just for today." Today is how you catch it.

## Four questions, four tools

| Question | Where to look |
|---|---|
| **Who has what?** | **Tenant administration** › **Roles** › **Monitor** |
| **What changed?** | **Tenant administration** › **Audit logs** |
| **Who should still have it?** | Microsoft Entra **access reviews** |
| **What would merge?** | The **Permissions Assessment Report** (Day 7, Day 14) |

### Who has what: the Monitor views

Under **Roles** › **Monitor**, Intune has three views:

- **My permissions:** your own effective permissions, combined from all your assignments.
- **Roles by permission:** pick a permission and action, and see which role assignments grant it, and to which groups. *"Who can wipe devices?"* is one click.
- **Admin permissions:** pick a user and see every permission and action they have.

**Roles by permission** is the one to use in an access review. Start with **Wipe**, **Retire**, **Delete**, and **Roles › Assign**.

### What changed: audit logs

Intune audits every change: "create, update (edit), delete, assign, and remote actions all create audit events." It's on for every tenant and can't be turned off.

- Filter by **Category** › **Role** to see role and assignment changes.
- Viewing them requires **Audit data › Read** (or Intune Administrator).
- **Export** to Azure Monitor to keep them longer and alert on them, or pull **two years** of events with the Graph `auditEvents` API.
- Multi Admin Approval requests and approvals land here too (Day 17).

### Who should still have it: access reviews

Your Intune roles are only as tight as the groups they're assigned to (Day 4). Microsoft Entra **access reviews** let group owners or named reviewers confirm membership on a schedule, weekly to annually. Point them at your `RBAC-*` admin groups, and at your PIM eligible groups from Day 16. Access reviews require **Microsoft Entra ID Governance** or **Microsoft Entra Suite** (some capabilities work with Entra ID P2).

## Automate it with Microsoft Graph

The admin center is great for a look. Graph is how you check every week without thinking about it.

- **Read your RBAC as data.** `GET /deviceManagement/roleDefinitions` and each definition's `roleAssignments` return your roles and assignments. The least-privileged permission is **`DeviceManagementRBAC.Read.All`**. Read-only is all an audit script needs.
- **Keep a baseline.** Export once when your design is right, and store it in source control.
- **Diff on a schedule.** Re-export weekly and compare. A new permission on a custom role, a new assignment, or a scope tag that disappeared is worth a ticket.
- **Watch the audit stream** for role changes made outside your change process.

If you followed my *19 Days of Intune Graph* series, this is where it pays off: [Day 5](/graph/day-05/) covers assigning Graph permissions for Intune automation, and [Day 14](/graph/day-14/) covers RBAC for the automation itself.

## A review rhythm that works

- **Weekly (automated):** Graph diff against your baseline; alert on role changes in the audit log.
- **Quarterly:** access reviews on admin groups; **Roles by permission** for your high-impact actions; a look for **Default** or tagless assignments (Day 10).
- **Every release cycle:** What's new in Intune for RBAC changes (Day 18).

## Try it

Open **Roles by permission**, choose **Remote tasks** › **Wipe**, and count the groups. Then count the people in them.

Tomorrow: the capstone, a reference architecture that puts all 20 days together.

## Further reading

- [Role-based access control with Microsoft Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview) (see the monitoring views), Microsoft Learn
- [Use audit logs to track and monitor events in Microsoft Intune](https://learn.microsoft.com/en-us/intune/governance/monitor-audit-logs), Microsoft Learn
- [What are access reviews?](https://learn.microsoft.com/en-us/entra/id-governance/access-reviews-overview), Microsoft Learn
- [List roleAssignments (Microsoft Graph)](https://learn.microsoft.com/en-us/graph/api/intune-rbac-roleassignment-list), Microsoft Learn
