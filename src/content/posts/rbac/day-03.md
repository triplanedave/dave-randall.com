---
title: Match the role to the job
series: rbac-20-days
day: 3
week: 1
date: 2026-10-14
summary: Intune ships nine built-in roles, each designed for a job. Here's what each one is for, and what to watch for.
diagram: /images/rbac/day-03.png
diagramAlt: "Five personas mapped to built-in roles: Help desk to Help Desk Operator, App packager to Application Manager, Security analyst to Endpoint Security Manager, Auditor to Read Only Operator, RBAC owner to Intune Role Administrator, which is highlighted with a lock and labeled Protect this role."
---

Built-in roles are the same in every tenant, and Microsoft maintains their permissions for you. They're the fastest way to stop handing out Intune Administrator.

## The nine built-in roles

| Role | Built for | Worth knowing |
|---|---|---|
| **Help Desk Operator** | Remote tasks on users and devices; assigning apps and policies | Includes **Wipe** and **Retire**. If your tier 1 shouldn't wipe devices, this role is too broad as-is. |
| **Application Manager** | Managing mobile and managed apps; reading device info and configuration profiles | Can assign apps, so it can put software on devices in its scope. |
| **Policy and Profile Manager** | Compliance policies, configuration profiles, Apple enrollment, corporate device identifiers, security baselines | Can assign configuration and compliance, which shapes every device in scope. |
| **Endpoint Security Manager** | Security baselines, device compliance, Conditional Access, Microsoft Defender for Endpoint | The natural home for your security team instead of Intune Administrator. |
| **Endpoint Privilege Manager** | Endpoint Privilege Management (EPM) policies | Controls who can run elevated on managed devices. |
| **Endpoint Privilege Reader** | Viewing EPM policies | Read-only counterpart to the above. |
| **Read Only Operator** | Viewing users, devices, enrollment, configuration, and apps | Not *purely* read-only: it includes the **Get FileVault key** remote task. More on Day 5. |
| **School Administrator** | Apps, settings, and devices in Intune for Education | Includes remote lock, restart, and retire for its groups. |
| **Intune Role Administrator** | Managing custom roles and assigning built-in roles | The only Intune role that can assign permissions to other admins. |

If you have Windows 365, you'll also see **Cloud PC Administrator** and **Cloud PC Reader**, which cover the Cloud PC area of the admin center.

## Protect Intune Role Administrator

Whoever holds Intune Role Administrator can grant themselves, or anyone else, any Intune permission. Treat it like a privileged role even though it lives inside Intune: keep the group small, require phishing-resistant MFA, and consider making membership just-in-time (Week 4).

## Built-in roles can't be edited

You can't change a built-in role's description, type, or permissions. When one is close but too broad, **duplicate it** and trim the copy:

1. In the Intune admin center, go to **Tenant administration** > **Roles** > **All roles**.
2. Select the role's checkbox, then select **Duplicate**.
3. Give the copy a clear name, like *Help Desk – Tier 1 (no wipe)*, and remove what it doesn't need.

Week 3 goes deeper on custom role design.

## Further reading

- [Built-in role permissions for Microsoft Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/ref-built-in-roles), Microsoft Learn
- [Create a custom role in Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/create-custom-role), Microsoft Learn
