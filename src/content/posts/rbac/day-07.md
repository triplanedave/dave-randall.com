---
title: Scope tags explained
series: rbac-20-days
day: 7
week: 2
date: 2026-10-20
summary: Roles decide what admins can do. Scope tags decide which objects they can see. Same console, two admins, two very different views.
diagram: /images/rbac/day-07.png
diagramAlt: "Four Intune objects with scope tags: Seattle Wi-Fi tagged Seattle, Paris VPN tagged Paris, Teams app tagged Seattle and Paris, and Security baseline tagged Default. The Seattle admin, whose assignment has the Seattle tag, sees Seattle Wi-Fi and the Teams app. The Paris admin sees Paris VPN and the Teams app. Neither sees the Default-tagged baseline."
---

Microsoft sums it up in two sentences: **roles determine what access admins have to which objects. Scope tags determine which objects admins can see.**

## How scope tags work

A scope tag is a label. You put it in two places:

1. **On a role assignment** (the **Scope (Tags)** page of the assignment wizard).
2. **On Intune objects:** configuration profiles, compliance policies, apps, devices, role assignments, and more. For most objects, you'll find it under **Properties** › **Scope (Tags)**.

An admin sees an object only if the object carries one of the tags in the admin's role assignment.

## A worked example

Microsoft's own example: a Seattle office admin with the **Policy and Profile Manager** role.

1. Create a scope tag called **Seattle** (**Tenant administration** › **Roles** › **Scope (Tags)** › **Create**).
2. Assign the role with members = `Seattle IT admins`, scope groups = `Seattle users`, scope tags = **Seattle**.
3. Add the **Seattle** tag to the policies and profiles that admin should manage.
4. Add the **Seattle** tag to the Seattle devices (more on that tomorrow).

Now the Seattle admin opens the same admin center as everyone else, but sees only Seattle's objects. An object can carry several tags, so a shared app tagged **Seattle** and **Paris** shows up for both offices.

## Rules worth knowing

- **New objects inherit the creator's tags.** When an admin creates an object, all of the scope tags in their assignment are added to it automatically.
- **You can only hand out tags you have.** Admins can assign only scope tags that are in their own role assignments.
- **At least one tag stays on.** If you have a scope tag in your role, you can't remove every tag from an object.
- **Up to 100 tags** per role and per object.
- **Some objects don't support tags:** corporate device identifiers, Windows Autopilot device records, device compliance locations, and Jamf devices.
- **VPP apps and ebooks inherit the tags of their VPP token.**
- **Entra roles ignore tags.** Intune Administrator has full access no matter what. (Day 2's two permission planes again.)
- **Creating, renaming, or deleting tags requires the Entra Intune Administrator role.** It's a good candidate for just-in-time access (Week 4).

## Try it

Go to **Tenant administration** › **Roles** › **Scope (Tags)**. If the only tag listed is **Default**, nobody in your tenant is scoped by visibility yet, and every admin with an Intune role can see every object their permissions cover.

Tomorrow: getting tags onto devices, which works differently from policies.

## Further reading

- [Use RBAC and scope tags for distributed IT](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/scope-tags), Microsoft Learn
