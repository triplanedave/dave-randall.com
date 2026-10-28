---
title: Scope Tag Deep Dive
series: rbac-20-days
week: 2
date: 2026-10-28
summary: Everything Week 2 touched on about scope tags in one place, from the basics and Microsoft's documented limitations to the Default tag, no tag, and scoped permissions.
---

## What scope tags are

Scope tags are admin-defined labels that filter which Intune objects an admin sees in the console. They are a filter, not a security feature: what an admin is allowed to do comes from the role and its Scope Groups, while scope tags only narrow the results that admin is shown. Together they let you split one Intune tenant among regional, departmental, or business-unit IT teams without giving everyone the whole console.

Scope tags are never assigned to admins directly. Instead, you put a scope tag on objects (policies, profiles, apps, devices, roles) and in a role assignment. That way, an admin sees an object when their role assignment has a scope tag that matches a tag on the object.

### Where scope tags fit in Intune RBAC

Every Intune role assignment combines a role with three settings. Scope tags are the third.

| Part of the assignment | Question it answers | Seattle example |
| --- | --- | --- |
| Role (built-in or custom) | What actions can the admin take? | Policy and Profile Manager |
| Members (Admin Groups) | Who are the admins? | Security group *Seattle IT admins* |
| Scope Groups | Which users and devices can they manage and target? | Security group *Seattle users* |
| Scope Tags | Which Intune objects can they see? | Tag *Seattle* |

A tag added to a role's own Properties controls who can see that role. To be honest, this is probably one of the more confusing aspects of scope tags. When you're creating a role, you can assign a scope tag to the role. Often, you're thinking ahead to what objects admins with that role are able to see and so the natural tendency is to give the role a scope tag for what the admins assigned to this role should see. Unfortunately, that's the wrong approach. Instead, the scope tag for the role is how you differentiate which roles can be managed between all the administrators who are managing roles (e.g. your RBAC admins). Now, unless your company is a large company with many roles and many admins, the likelihood of needing a scope tag for a role is pretty low.

However, worldwide companies with IT departments in multiple regions, or financial services organizations with member firms with largely autonomous IT can use this capability to ensure that only the local IT can manage the roles and permissions for their region/department/member firm.

By comparison, a scope tag added to a role assignment limits which policies, apps, and devices the assignment's admins can see.

### What can carry a scope tag

The rule of thumb: an object type supports tags when a tenant can hold several of them, such as apps, configuration profiles, compliance policies, scripts, and role assignments. For most objects the setting lives under **Properties › Scope Tags**. Devices get tags through the groups you assign to the tag itself. A handful of object types are exceptions; see [Documented limitations](#documented-limitations) below.

## How scope tags work in practice

There are four steps to setting up scope tags. Create the tag, add it to a role assignment, tag the objects, and tag the devices. You can do this all through the Microsoft Intune admin center. Of course, there are corresponding Graph APIs that can do these steps also, but if you're getting started with scope tags, or are unfamiliar with Graph API automation, stick to the console.

1. **Create the tag.** Go to **Tenant administration › Roles › Scope Tags › Create**. Give it a name and optional description.
   - On the **Assignments** page, pick the groups whose devices should automatically receive this tag. Devices in more than one tagged group get every matching tag.
2. **Add the tag to a role assignment.** Go to **Tenant administration › Roles › All roles ›** a role **› Assignments › Assign**. Set Admin Groups, then Scope Groups (specific groups, All users, or All devices), then pick the scope tags.
3. **Tag the objects.** Open a policy, profile, or app and go to **Properties › Scope Tags › Edit**. Pick the tags that should make it visible.
4. **Check the result.** Under **Tenant administration › Roles › Monitor**, the **My permissions**, **Roles by permission**, and **Admin permissions** views show what an account can actually do.

### Visibility rules

- An admin sees an object when at least one of their assignment's tags matches one of the object's tags.
- When an admin creates an object, Intune stamps it with all of that admin's scope tags automatically.
- An admin can only hand out tags that are in their own role assignments, and can only target groups listed in their own Scope Groups.
- Permissions are additive across assignments for the same object type: Read from one role plus Read/write from another gives Read/write, assuming both target the same tags.
- Permissions for one object type never carry over to another. Read on policies grants nothing on apps.
- Assign permissions and their tags apply only to objects in that assignment's Scope Groups. Create, Read, Update, and Delete apply across all objects of that type in any of the admin's assignments.

### Example

A Seattle office admin should manage only Seattle profiles and devices. You create a *Seattle* tag, give the *Seattle IT admins* group a Policy and Profile Manager assignment scoped to the *Seattle users* group with the *Seattle* tag, then tag the Seattle profiles and devices. Those admins now see Seattle-tagged objects and nothing else that the role would otherwise expose.

## Documented limitations

Microsoft's documented limits and caveats for scope tags fall into five groups, below. All come from Microsoft Learn pages last updated April 16, 2026.

### Hard limits

| Limit | Value |
| --- | --- |
| Scope tags per role | 100 maximum |
| Scope tags per object | 100 maximum |
| Scope tags on an object, when your role has a tag | At least 1 required; you can't remove the last one |

### Objects that don't support scope tags

These object types can't be tagged at all:

- Corp Device Identifiers
- Windows Autopilot Devices
- Device compliance locations
- Jamf devices

Volume Purchase Program (VPP) apps and ebooks can't be tagged on their own. They inherit the tags of the VPP token they belong to.

### Who can manage tags

- Creating, updating, or deleting scope tags requires one of the following roles: the Microsoft Entra **Intune Administrator** role, a privileged role, the **Global Administrator** role, a privileged role, the **Intune Role Administrator** built-in role, or an Intune role with CRUD permissions on the Roles category.
- Admins who have a tag in their own role assignment can't edit or delete that tag from the master list.
- An admin can only assign tags that are already in their own role assignments.
- An admin can only target groups listed in their own Scope Groups. An exclude group on a policy or app assignment must be nested in, or listed as, one of the RBAC assignment's scope groups.

### Where scope tags don't apply

- **Microsoft Entra roles bypass them.** Intune RBAC doesn't govern Entra roles, so Global Administrators and Intune Administrators (called Intune Service Administrator in Graph and PowerShell) see and manage everything regardless of tags.
- **Admins with no tags see everything** their permissions allow. A role assignment with no tag behaves as if it held every tag.
- **Users, Groups, and Conditional Access** live in Microsoft Entra, so their visibility follows Entra permissions rather than Intune scope tags.

### Behavior to watch for

- **Automatic device tagging overwrites manual tags.** Tags applied through a scope tag's group assignment replace tags set by hand on those devices.
- **The Scope tags page can be hidden.** Some policy types don't show it until the tenant has at least one custom tag besides the default tag.
- **Permissions can merge across assignments.** By default, permissions for the same resource are unioned across an admin's role assignments, which can leave admins over-permissioned on objects with other tags. Microsoft introduced the fix, Scoped permissions, and its Permissions Assessment Report as an opt-in public preview in March 2026. See [Scoped permissions](#scoped-permissions) below for how to assess and fix it.
- **Mixed tags can hide devices.** When an admin's assignments have no tags or different tags, they may see only devices in some tags rather than all devices.

## Default scope tag

If you never create scope tags, Intune still uses a scope tag for most all objects - the one called "Default". As the name suggests, it's added by default to objects. But the Default tag is not added to role assignments.

## No scope tag

Notice the text on the Scope Tag page when creating an assignment: "when an administrator has no scope tags in any of their roles, all objects are visible including those with scope tags." This is yet another opportunity to over-permission your administrators if you're not careful.

## Scoped permissions

Scoped permissions is a fix to a problem that's existed since scope tags were introduced. A little background on the problem first. Let's assume you have two role assignments and two roles - one role has read only permissions, the other role has CRUD read/write permissions. Each role has a role assignment that each have different scope tags. For our example, let's say you have HQ and Branch Office scope tags. HQ has the read only role assignment, Branch Office has the read/write assignment. Your goal is to allow branch office admins to see managed apps tagged Branch Office, but only Read (and not update) any tagged with HQ. Unfortunately in this scenario, permissions for a resource across role assignments are unioned together. That means that Branch Office admins have CRUD permissions on any apps tagged HQ.

Yes, this is as bad as it sounds. You thought you were doing the right thing, but Intune joined the permissions across two scope tagged items, and now your admins are over-permissioned.

So, how do you fix it?

First, you have to assess your situation. Run the Permissions Assessment Report - found in Roles › Settings. If you don't have any rows returned in the report, you're lucky! You don't have any unioned permissions.

If you have any rows, they represent unioned permissions for any of the Resources listed for admins who are a member of the Group listed for that row.

Reading from left to right, think "For any administrators in \<Group\>, they are in a role assignment for \<Role\>, and \<Role\>. The second role assignment has scope tag \<Scope Tag\>. For the \<Resource\>, the admins now have \<Old Permissions\> for any resources with \<Scope Tag\>. After you enable the Scoped Permissions button, the admins will only have \<New permissions\> for any resources with \<Scope tag\>"

Before you flip that toggle, know that enabling Scoped permissions is a one-way change: once it's on, you can't turn it off. Review the report, adjust role assignments where needed, and let affected admins know their permissions are about to shrink.

## Further reading

- [Use role-based access control (RBAC) and scope tags for distributed IT](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/scope-tags), Microsoft Learn
- [Role-based access control (RBAC) with Microsoft Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview), Microsoft Learn
