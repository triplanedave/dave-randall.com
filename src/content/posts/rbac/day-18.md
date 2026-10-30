---
title: RBAC keeps expanding
series: rbac-20-days
day: 18
week: 4
date: 2026-11-04
summary: Intune RBAC isn't finished. New permissions arrive, built-in roles change, and Intune roles now reach Copilot and automation. Your design needs a maintenance plan, not just a launch.
diagram: /images/rbac/day-18.png
diagramAlt: "A 2026 timeline of Intune RBAC changes. March: Scoped permissions opt-in preview. May: Intune RBAC roles get access to Copilot in Intune. June: Multi Admin Approval enforces on Microsoft Graph automation. July: a dedicated permission for zero-touch enrollment. Also recent: Managed Home Screen permissions added to built-in roles. Below, the takeaway: built-in roles change under you, custom roles only have what you put in them, so review both every release cycle."
---

Back on Day 2, I told the story of why Intune built its own RBAC model, and promised to come back to where it's headed. Today is that day.

## RBAC is a moving target

Here's just some of what changed in Intune RBAC in 2026, all from Microsoft's What's new and Learn pages:

| When | Change | Why it matters |
|---|---|---|
| March | **Scoped permissions** opt-in preview (Day 7, Day 14) | How permissions combine across assignments is changing, and will become the default |
| May | **Intune RBAC roles get access to Copilot in Intune** | Built-in and custom Intune roles automatically get Security Copilot *contributor* access; Intune Administrator gets *owner* |
| June | **Multi Admin Approval enforces on Graph automation** (Day 17) | App-authenticated scripts now need approval for protected changes |
| July | **Dedicated permission for zero-touch enrollment** | Previously tied to **Update app sync**; now you can grant it on its own |
| Recent | **Managed Home Screen** remote tasks in built-in roles | Help Desk Operator and School Administrator gained new permissions without you doing anything |

That's not a complaint. Most of these are exactly what customers asked for. But each one is a reason your RBAC design from January isn't quite the design you have today.

## Built-in vs. custom: they drift differently

- **Built-in roles change under you.** When Microsoft adds a permission to Help Desk Operator, every admin with that role gets it. Usually that's helpful. Occasionally it's more than you want a persona to have.
- **Custom roles only have what you put in them.** When a new permission ships, your custom roles don't get it. If your help desk suddenly can't do something new, that's usually why.

Either way, the fix is the same: **review on a schedule**, not when something breaks.

## Your maintenance plan

1. **Watch What's new in Intune** for anything tagged role-based access control, and for new features (each new feature tends to bring new permissions).
2. **Diff the permission list.** Microsoft's custom role permission list on Learn is the reference; my [permission reference](/rbac/permission-reference/) tracks it, plus permissions that show up in live tenants before they're documented.
3. **Re-check your built-in role users** against their persona cards (Day 12) when built-in roles change.
4. **Update your custom roles** deliberately when a new permission matches a persona's task list.
5. **Re-run the Permissions Assessment Report** after big assignment changes, until Scoped permissions is on.

## The bigger picture

When we built Intune RBAC, the Entra roles of the day couldn't do what customers needed, so Intune built its own model. Entra is far more capable now, and RBAC is spreading across the Microsoft cloud: Intune roles now reach Copilot, MAA reaches automation, and PIM for Groups lets Entra govern *when* Intune roles apply.

What that means for design today: **build on the pieces that will last.** Persona-based roles, clean groups, paired scope groups and tags, and just-in-time access are good design no matter how the underlying RBAC models evolve. A tenant built that way will adapt. A tenant where everyone has Intune Administrator will just carry the same problem forward.

## Try it

Open **Tenant administration** › **Roles** › **Monitor** › **My permissions** and read your own list top to bottom. Is there anything there you didn't know you had?

Tomorrow: audit and automate, how to know your RBAC is still what you designed.

## Further reading

- [What's new in Microsoft Intune](https://learn.microsoft.com/en-us/intune/whats-new/), Microsoft Learn
- [Microsoft Intune built-in roles reference](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/ref-built-in-roles), Microsoft Learn
- [Create a custom role in Intune](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/create-custom-role) (the full permission list), Microsoft Learn
- [Microsoft Copilot in Intune](https://learn.microsoft.com/en-us/intune/copilot/), Microsoft Learn
- [Intune RBAC permission reference](/rbac/permission-reference/), dave-randall.com
