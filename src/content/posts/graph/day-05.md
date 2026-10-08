---
title: Assigning Graph permissions for Intune automation
series: graph-19-days
day: 5
week: 1
date: 2026-01-09
summary: Grant only what's needed, prefer delegated auth where you can, and know exactly where permissions get assigned.
---

Automating Intune with Microsoft Graph? Permissions matter. Here's how to assign the right scopes for your app registrations.

## 1. Use least privilege

- Grant only what's needed. Avoid broad scopes like `DeviceManagementConfiguration.ReadWrite.All` unless absolutely required.
- `*.Read.All` scopes are ideal for limiting risk.

## 2. Where possible, use delegated authentication

- **Delegated auth** keeps the Intune RBAC layer in play, including scope groups and scope tags. The app can only do what the signed-in admin's Intune role allows.
- **App-only auth** is good for scheduled tasks and non-interactive automation.

## 3. Assign them on the app registration

1. In the Microsoft Entra admin center, open **App registrations** and select your app.
2. Go to **API permissions** > **Add a permission** > **Microsoft Graph**.
3. Choose **Delegated** or **Application** permissions and pick the scopes.
4. Select **Grant admin consent** for your tenant.

If scope groups and scope tags are new to you, Week 2 of [20 Days of Intune RBAC](/rbac/) covers them.

## Further reading

- [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference), Microsoft Learn
