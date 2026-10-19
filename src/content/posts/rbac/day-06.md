---
title: Members vs. scope groups
series: rbac-20-days
day: 6
week: 2
date: 2026-10-19
summary: Every role assignment answers two "who" questions. Members are the admins who act. Scope groups are the users and devices they can act on.
diagram: /images/rbac/day-06.png
diagramAlt: "A role assignment splits into two sides. Left: Members (admin groups), who acts, for example RBAC-HelpDesk-Seattle. Right: Scope groups, who they can act on, for example Seattle users and Seattle devices. Below, the three scope group options: specific groups (recommended), All users, and All devices, with warnings that the All options reach everyone and that exclude groups must sit inside the scope groups."
---

Week 2 is about **scoping**: making sure admins can only act where they're supposed to. It starts with the two "who" questions inside every role assignment.

## Two groups, two jobs

When you assign a role (**Tenant administration** › **Roles** › **All roles** › *a role* › **Assignments** › **Assign**), the wizard asks for two different kinds of groups:

| Page | Question it answers | Example |
|---|---|---|
| **Admin Groups** (members) | *Who* gets this role? | `RBAC-HelpDesk-Seattle` |
| **Scope (Groups)** | *Whose* users and devices can they manage? | `Seattle users`, `Seattle devices` |

Microsoft's wording: members of the admin groups "have permissions to manage users/devices in the Scope (Groups)." Mix those two up and you either give the wrong people the role, or give the right people the whole tenant.

## Scope groups limit where Assign works

Scope groups matter most for **Assign**. An admin can only target groups that are listed in the scope groups of their role assignment. A Seattle admin whose scope groups are `Seattle users` and `Seattle devices` can't deploy a policy to `Paris devices`, even with the Assign permission.

## The three options, and their traps

On the **Scope (Groups)** page you can choose:

- **Add groups:** specific Entra security groups. **This is the one to use.** Nested groups are supported here.
- **Add All users:** admins can manage every user.
- **Add All devices:** admins can manage every device.

Two things trip people up:

1. **All users and All devices are Intune *virtual* groups, not Entra security groups.** You can't use them as parents for other groups. Microsoft notes that if you want admins to manage both everything *and* specific Entra groups, add those groups separately. Otherwise admins won't have access to specific Entra user groups, even with *All users* in scope.
2. **Exclude groups must be in scope too.** If an admin uses an exclude group on a policy or app assignment, that group must be nested in one of their scope groups or listed as a scope group itself.

## Keep your admin groups tight

- Every member of an admin group gets everything the role grants. Only use groups whose membership you know and control.
- If your tenant allows unlicensed admins, role assignments only apply to **direct** members of the admin group. Members of nested groups don't get the role unless they have an Intune license.

## Try it

Open one of your role assignments and look at the **Scope (Groups)** page. If you see *All users* or *All devices*, ask: does this team really manage everyone, everywhere?

Tomorrow: scope tags, which control what admins can *see*.

## Further reading

- [Assign a role to an Intune administrator](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/assign-role), Microsoft Learn
- [The Intune All users and All devices groups](https://learn.microsoft.com/en-us/intune/fundamentals/tenant-administration/add-groups#the-intune-all-users-and-all-devices-groups), Microsoft Learn
