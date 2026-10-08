---
title: Configuration policies and the Settings Catalog
series: graph-19-days
day: 6
week: 2
date: 2026-01-12
summary: The Graph endpoints behind Settings Catalog policies, plus a repeatable pattern for exporting, comparing, and auditing them across tenants.
---

If you're automating Intune at scale, configuration policies and the Settings Catalog are at the heart of many workflows. Here are the Graph endpoints you need, plus a repeatable pattern for exporting, comparing, and multi-tenant auditing.

## Core endpoints you'll use

These are on the Graph **beta** endpoint.

```http
# List configuration policies
GET https://graph.microsoft.com/beta/deviceManagement/configurationPolicies

# List Settings Catalog setting definitions
GET https://graph.microsoft.com/beta/deviceManagement/configurationSettings

# Retrieve a policy's full definition, settings included
GET https://graph.microsoft.com/beta/deviceManagement/configurationPolicies/{id}?$expand=settings

# Retrieve a policy's assignments
GET https://graph.microsoft.com/beta/deviceManagement/configurationPolicies/{id}/assignments
```

## Pattern: export and compare across tenants

**1. Export policies with `$expand=settings`.** This gives you the full object: metadata plus every setting and value.

**2. Normalize the output.** Strip the noise:

- IDs
- `@odata.type`
- `lastModifiedDateTime`
- `roleScopeTagIds`

This produces stable JSON that's suitable for comparison.

**3. Compare policies across tenants.** Simple JSON diff tooling (jq, VS Code, PowerShell `Compare-Object`) shows you:

- Drift in setting values
- Platforms with missing configurations
- Differences between prod and dev tenants

**4. Generate templates for baseline automation.** Once exported and normalized, policies become:

- Golden templates
- Git-tracked JSON (configuration as code)
- Reusable import scripts for onboarding customers

## Why this matters

Configuration drift and inconsistent catalog settings are top causes of environment instability. Automating export and comparison gets you:

- Faster troubleshooting
- Trustworthy baselines
- Repeatable onboarding for new tenants
- A future-proof foundation for policy automation

## Further reading

- [List deviceManagementConfigurationPolicies (beta)](https://learn.microsoft.com/en-us/graph/api/intune-deviceconfigv2-devicemanagementconfigurationpolicy-list?view=graph-rest-beta), Microsoft Learn
- [List deviceManagementConfigurationSettingDefinitions (beta)](https://learn.microsoft.com/en-us/graph/api/intune-deviceconfigv2-devicemanagementconfigurationsettingdefinition-list?view=graph-rest-beta), Microsoft Learn
