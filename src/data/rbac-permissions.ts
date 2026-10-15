// Intune custom role permissions.
// `ms` is Microsoft's description, verbatim from "Create a custom role in Intune"
// (learn.microsoft.com, page updated 2026-08-24). Don't edit `ms` except to resync with Learn.
// `note` is Dave's plain-language expansion: what the action really touches and what can go wrong.
// `tier`: 'never' = don't grant by default (small, named, just-in-time group only);
//         'high'  = changes devices or users at scale, or exposes data; grant deliberately and scope it.

export type Tier = 'never' | 'high';
export interface Perm { action: string; ms: string; note?: string; tier?: Tier }
export interface Category { name: string; summary: string; perms: Perm[] }

const p = (action: string, ms: string, note?: string, tier?: Tier): Perm => ({ action, ms, note, tier });

export const sourceUpdated = '2026-08-24';
export const sourceUrl = 'https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/create-custom-role';

export const categories: Category[] = [
  {
    name: 'Admin tasks',
    summary: `The admin center's list of items waiting for an administrator to act on.`,
    perms: [
      p('Create', `Allows creation of new device management administrative tasks`),
      p('Delete', `Allows deletion of device management administrative tasks`, `Removes the task for every admin, so work someone still needed to do can disappear from the queue.`),
      p('Read', `Allows read access to device management administrative tasks`),
      p('Update', `Allows updating of device management administrative task properties and status`, `Changing a task's status (for example, marking it complete) changes it for everyone. Treat this as "can close out other people's work."`),
    ],
  },
  {
    name: 'Android Enterprise',
    summary: `The tenant's binding to Google's Managed Google Play and the Android Enterprise enrollment setup.`,
    perms: [
      p('Enrollment time device membership assignment for Android Enterprise', `Allows Intune to assign devices to Microsoft Entra ID groups during enrollment.`, `Lets an admin configure enrollment so new devices land in Entra groups automatically, and those groups drive which apps and policies the devices get.`),
      p('Read', `View the Android Enterprise configuration used to sync applications with the Managed Google Play store or view the Android Enterprise enrollment prerequisites and enrollment profiles.`),
      p('Update app sync', `Manage or change the Managed Google Play configuration used to sync applications with the Managed Google Play store, or sync the apps you approved from the store with Intune.`),
      p('Update enrollment profiles', `Manage or change Android Enterprise Device Owner enrollment profiles used to enroll devices.`, `Enrollment profiles (and their tokens and QR codes) decide how new corporate Android devices enroll. A changed or leaked profile affects every device enrolled with it afterward.`, 'high'),
      p('Update onboarding', `Manage or change the Android Enterprise binding to Managed Google Play and other account-wide configurations.`, `This is the tenant-wide link to Google. Unbinding or rebinding it disrupts Android Enterprise management and app delivery for every Android device.`, 'never'),
      p('Manage zero touch enrollment', `Manage or change the connection to Google's Zero-Touch Enrollment (ZTE) portal.`, `Controls how factory-fresh devices bought through zero-touch resellers enroll. A wrong change affects every new device out of the box.`, 'high'),
    ],
  },
  {
    name: 'Android FOTA',
    summary: `Firmware over-the-air updates for supported Android devices.`,
    perms: [
      p('Assign', `Assign Android firmware over-the-air (FOTA) deployments to Microsoft Entra security groups.`, `Assigning a firmware deployment is what actually pushes new firmware to devices. Firmware can't easily be rolled back.`, 'high'),
      p('Create', `Create and manage all aspects of Android firmware over-the-air (FOTA) deployments.`),
      p('Delete', `Delete and cancel pending Android firmware over-the-air (FOTA) deployments and delete deployment history.`, `Also deletes deployment history, which removes the record of what firmware went where.`),
      p('Read', `View Android firmware over-the-air (FOTA) deployments, including history and reporting.`),
      p('Update', `Change existing Android firmware over-the-air (FOTA) deployments and cancel firmware deployments.`, `Changes to a deployment that's already assigned take effect on its targeted devices.`, 'high'),
    ],
  },
  {
    name: 'App Control for Business',
    summary: `Endpoint security profiles that decide which apps and code are allowed to run on Windows devices.`,
    perms: [
      p('Assign', `Assign App Control for Business profiles to Microsoft Entra security groups.`, `An app control policy on the wrong devices can stop line-of-business apps, or even Windows components, from running. Pilot first.`, 'high'),
      p('Create', `Create new App Control for Business profiles.`, `Creating a profile has no effect until it's assigned, which makes Create a safe permission to give policy authors who don't deploy.`),
      p('Delete', `Delete App Control for Business profiles.`, `Deleting an assigned profile removes that app control protection from every device it targeted.`, 'high'),
      p('Read', `Read App Control for Business profiles.`, `Shows exactly which apps and publishers you allow, which is useful to an attacker planning around your controls.`),
      p('Update', `Update App Control for Business profiles.`, `Edits to an assigned profile go to devices right away. One rule change can block or allow software across the fleet.`, 'high'),
      p('View Reports', `Generate, view, or export reports for App Control for Business profiles.`),
    ],
  },
  {
    name: 'Attack Surface Reduction',
    summary: `Endpoint security profiles for ASR rules, exploit protection, device control, and similar hardening.`,
    perms: [
      p('Assign', `Assign Attack Surface Reduction (ASR) profiles to Microsoft Entra security groups.`, `ASR rules in block mode can break legitimate apps and macros. Assign deliberately, starting in audit mode.`, 'high'),
      p('Create', `Create new Attack Surface Reduction (ASR) profiles.`, `No effect until assigned.`),
      p('Delete', `Delete Attack Surface Reduction (ASR) profiles.`, `Deleting an assigned profile quietly removes hardening from every device it targeted.`, 'high'),
      p('Read', `Read Attack Surface Reduction (ASR) profiles.`),
      p('Update', `Update Attack Surface Reduction (ASR) profiles.`, `Flipping a rule from audit to block (or back) changes protection on every assigned device.`, 'high'),
      p('View Reports', `Generate, view, or export reports for Attack Surface Reduction (ASR) profiles.`),
    ],
  },
  {
    name: 'Audit data',
    summary: `Intune's audit log: who changed what, and when.`,
    perms: [
      p('Read', `View all Intune audit data for this tenant.`, `Read-only, but it's all audit data for the tenant regardless of scope tags, including admin names and every change. Good for auditors; not needed by most operators.`),
    ],
  },
  {
    name: 'Certificate Connector',
    summary: `The on-premises connectors that let Intune issue SCEP and PKCS certificates from your CA.`,
    perms: [
      p('Modify', `Add, remove, or modify certificate connectors required to support certificate issuance.`, `Removing or misconfiguring a connector stops certificate issuance and renewal, which can take down Wi-Fi, VPN, and email authentication as certificates expire.`, 'never'),
      p('Read', `View certificate connectors required to support certificate issuance.`),
    ],
  },
  {
    name: 'Chrome Enterprise',
    summary: `The connection between Intune and Google's Chrome Enterprise for ChromeOS devices.`,
    perms: [
      p('Delete connection settings', `Delete the organization's Chrome Enterprise connection settings.`, `Disconnects ChromeOS reporting and actions from Intune for the whole tenant.`, 'never'),
      p('Read', `View the organization's Chrome Enterprise connection settings and device details for Chrome OS devices.`),
      p('Update connection settings', `Manage or change the organization's Chrome Enterprise connection settings.`, undefined, 'high'),
    ],
  },
  {
    name: 'Cloud attached devices',
    summary: `Configuration Manager devices attached to Intune (tenant attach), and the actions you can take on them from the Intune admin center.`,
    perms: [
      p('Enroll Now', `Enrolls an eligible CM device into comanagement.`, `Changes how the device is managed. Workloads move to Intune according to your co-management settings.`, 'high'),
      p('Run CMPivot query', `Will hide or show the CMPivot blade.`, `CMPivot runs live queries against devices: files, registry, services, installed software. It's read-only, but very detailed and real-time.`),
      p('Run script', `Will hide or show the Run script action in the Scripts blade.`, `Runs Configuration Manager scripts on devices from the cloud console. Script execution is effectively administrator access to the device.`, 'never'),
      p('Take application actions', `Will hide or show the actions available in the Applications blade.`, `Lets an admin install or uninstall applications on Configuration Manager devices from Intune.`, 'high'),
      p('View applications', `Will hide or show the Applications blade.`),
      p('View client details', `Will hide or show the Client details blade.`),
      p('View collections', `Will hide or show the Collections blade.`),
      p('View resource explorer', `Will hide or show the Resource explorer blade.`, `Resource explorer shows full hardware and software inventory for a device.`),
      p('View scripts', `Will hide or show the Scripts blade.`),
      p('View software updates', `Will hide or show the Software updates blade.`),
      p('View timeline', `Will hide or show the Timeline blade.`),
    ],
  },
  {
    name: 'Cloud PKI',
    summary: `Microsoft Cloud PKI: certificate authorities hosted by Microsoft that issue device and user certificates through Intune.`,
    perms: [
      p('Create certificate authorities (CAs)', `Create certificate authorities (CAs)`, `A new CA becomes a source of certificates your devices and services may trust for Wi-Fi, VPN, and app authentication. Creating CAs is a PKI design decision, not an operational task.`, 'never'),
      p('Disable and reenable CAs', `Disable and reenable CAs`, `A disabled CA stops issuing and renewing certificates. Anything that depends on them (Wi-Fi, VPN, certificate-based sign-in) starts failing as certificates expire.`, 'never'),
      p('Read CAs', `Read CAs and the leaf certificates issued by them`, `Shows your CA hierarchy and every certificate issued from it, including which users and devices hold them.`),
      p('Revoke issued leaf certificates', `Revoke issued leaf certificates`, `Revoking a certificate immediately breaks whatever that device or user was authenticating with it. That's the right call for a lost device, and an outage if done to the wrong ones.`, 'high'),
    ],
  },
  {
    name: 'Corporate device identifiers',
    summary: `IMEI and serial number lists that mark devices as corporate-owned when they enroll.`,
    perms: [
      p('Create', `Create new corporate device identifiers or import a CSV file containing a list of corporate device identifiers.`, `Devices on this list enroll as corporate-owned. That changes what Intune can collect and do (for example, full app inventory) and can let devices past enrollment restrictions that block personal devices.`, 'high'),
      p('Delete', `Delete IMEI or serial numbers used as corporate device identifiers.`),
      p('Read', `View the IMEI or serial numbers used as corporate device identifiers.`),
      p('Update', `Change IMEI or serial numbers used as corporate device identifiers.`, undefined, 'high'),
    ],
  },
  {
    name: 'Customization',
    summary: `Company Portal branding and support information.`,
    perms: [
      p('Assign', `Assign customization options for the Company Portal.`, `Targets a branding profile to groups. Low risk, but it does control the contact details and links users see when they need help.`),
      p('Create', `Create customization options for the Company Portal.`),
      p('Delete', `Delete customization options for the Company Portal.`),
      p('Read', `Read customization options for the Company Portal.`),
      p('Update', `Update customization options for the Company Portal.`, `Includes the IT contact and support links users see. Someone could point users at the wrong help desk or a phishing site, so don't treat this as cosmetic.`),
    ],
  },
  {
    name: 'Deployment Plans',
    summary: `Reusable ring-based rollout templates (public preview). A plan defines the rings (groups, filters, exclude groups) and the wait between them. A deployment then runs a plan for one specific app or policy.`,
    perms: [
      p('Create', `Create Deployment Plans`, `A plan contains no app or policy, so creating one deploys nothing by itself. It does decide which groups get each wave, and in what order, for every rollout that uses it.`),
      p('Delete', `Delete Deployment Plans`, `Removes the template your team uses for staged rollouts. Expect people to fall back to assigning everyone at once.`),
      p('Read', `Read Deployment Plans`),
      p('Update', `Update Deployment Plans`, `Plans are shared templates. Changing a plan's rings, groups, or timing (for example, making "All devices" the first ring instead of the last) changes how fast and how wide every future rollout built on it goes.`, 'high'),
    ],
  },
  {
    name: 'Derived Credentials',
    summary: `The derived credential issuer that puts smart card (PIV/CAC) credentials on mobile devices.`,
    perms: [
      p('Modify', `Configure the Derived Credentials for your Microsoft Intune tenant.`, `Changing the issuer affects every user who signs in or signs email with a derived credential on mobile. Changing providers typically means users have to re-enroll.`, 'never'),
      p('Read', `View the Derived Credentials for your Microsoft Intune tenant.`),
    ],
  },
  {
    name: 'Device compliance policies',
    summary: `Compliance policies, plus Exchange ActiveSync connectors and Exchange on-premises access.`,
    perms: [
      p('Assign', `Assign device compliance policies to Microsoft Entra security groups, and assign Exchange on-premises access to Microsoft Entra security groups.`, `With Conditional Access, compliance decides who can reach company resources. Assigning a strict policy to the wrong group can lock users out.`, 'high'),
      p('Create', `Create new device compliance policies.`, `No effect until assigned.`),
      p('Delete', `Delete device compliance policies or delete Exchange ActiveSync connectors.`, `Deleting an assigned policy changes compliance results for its devices. Deleting an Exchange connector affects on-premises mail access control.`, 'high'),
      p('Read', `View device compliance policies and the list of Exchange Active Sync Connectors, or view the settings for Exchange on-premises access.`),
      p('Update', `Change device compliance policies, Exchange ActiveSync connectors, and Exchange on-premises access settings.`, `One tightened rule (for example, minimum OS version) can mark thousands of devices noncompliant at their next check-in.`, 'high'),
      p('View reports', `View, generate, and export device compliance reports.`),
    ],
  },
  {
    name: 'Device configurations',
    summary: `Configuration profiles, including the Settings Catalog. Despite the name, this category also covers enrollment restrictions.`,
    perms: [
      p('Assign', `Assign device configuration profiles or assign device enrollment restrictions to Microsoft Entra security groups.`, `This is where configuration actually reaches devices. It also covers enrollment restrictions, which decide who can enroll at all.`, 'high'),
      p('Create', `Create new device configuration profiles, or create new device enrollment restrictions.`, `No effect until assigned.`),
      p('Delete', `Delete device configuration profiles, or delete device enrollment restrictions.`, `Deleting an assigned profile removes its settings from devices (depending on the setting, they may revert or stay as-is). Deleting an enrollment restriction can open enrollment to devices you meant to block.`, 'high'),
      p('Read', `View device configuration profiles, or view device enrollment restrictions.`),
      p('Update', `Change device configuration profiles, or change device enrollment restrictions.`, `Edits to an assigned profile go to every targeted device at its next check-in.`, 'high'),
      p('Update Windows Backup and Restore', `Change Windows Backup and Restore settings.`, `A tenant-wide setting that controls whether users can restore their Windows backup during device setup.`),
      p('View Reports', `View, generate, and export device configuration reports.`),
    ],
  },
  {
    name: 'Device enrollment managers',
    summary: `Device enrollment manager (DEM) accounts, which can enroll large numbers of devices.`,
    perms: [
      p('Read', `View the list of device enrollment manager accounts.`),
      p('Update', `Create new device enrollment manager accounts, or delete device enrollment manager accounts.`, `A DEM account can enroll far more devices than a normal user. Creating one is effectively creating a bulk-enrollment identity, so keep the list short and reviewed.`, 'never'),
    ],
  },
  {
    name: 'Endpoint Analytics',
    summary: `Endpoint analytics scores, baselines, and settings.`,
    perms: [
      p('Create', `Create new baselines and edit endpoint analytics settings.`, `Note that Create, Update, and Delete all include editing endpoint analytics settings.`),
      p('Delete', `Edit endpoint analytics settings and delete baselines.`),
      p('Read', `View endpoint analytics scores and performance reports.`),
      p('Update', `Edit endpoint analytics settings and baselines.`),
    ],
  },
  {
    name: 'Endpoint Detection and Response',
    summary: `Endpoint security profiles that onboard devices to Microsoft Defender for Endpoint EDR.`,
    perms: [
      p('Assign', `Assign Endpoint Detection and Response (EDR) profiles to Microsoft Entra security groups.`, `EDR profiles control onboarding to Defender for Endpoint. Assigning the wrong profile can take devices out of EDR coverage.`, 'high'),
      p('Create', `Create new Endpoint Detection and Response (EDR) profiles.`, `No effect until assigned.`),
      p('Delete', `Delete Endpoint Detection and Response (EDR) profiles.`, undefined, 'high'),
      p('Read', `Read Endpoint Detection and Response (EDR) profiles.`),
      p('Update', `Update Endpoint Detection and Response (EDR) profiles.`, `Changes to an assigned profile affect your detection coverage. Security team only.`, 'high'),
      p('View Reports', `Generate, view, or export reports for Endpoint Detection and Response (EDR) profiles.`),
    ],
  },
  {
    name: 'Endpoint Privilege Management Elevation Requests',
    summary: `Support-approved elevation requests from users who need to run something as administrator.`,
    perms: [
      p('Modify elevation requests', `Allows administrators to approve, deny, or revoke Endpoint Privilege Management (EPM) support approved requests from end users.`, `Approving a request lets a standard user run that file with administrator rights. The approver is the security control, so pick approvers who will actually check what they're approving.`, 'high'),
      p('View elevation requests', `Allows administrators to view Endpoint Privilege Management (EPM) support approved requests.`),
    ],
  },
  {
    name: 'Endpoint Privilege Management Policy Authoring',
    summary: `EPM policies and elevation rules that decide what standard users may run with administrator rights.`,
    perms: [
      p('Assign', `Allows administrators to assign Endpoint Privilege Management (EPM) policies.`, `Assigning an elevation rule grants admin-level execution for that file to everyone in the group.`, 'high'),
      p('Create', `Allows administrators to create Endpoint Privilege Management (EPM) policies.`, `No effect until assigned.`),
      p('Delete', `Allows administrators to delete Endpoint Privilege Management (EPM) policies.`, `Users who relied on a deleted elevation rule lose the ability to run that tool as admin.`),
      p('Read', `Allows administrators to read Endpoint Privilege Management (EPM) policies.`),
      p('Update', `Allows administrators to update Endpoint Privilege Management (EPM) policies.`, `A loosened rule (for example, matching on file name instead of hash or publisher) can let users elevate things you never intended.`, 'high'),
      p('View Reports', `Allows administrators to view Endpoint Privilege Management (EPM) reports.`),
    ],
  },
  {
    name: 'Endpoint protection reports',
    summary: `Endpoint protection reporting.`,
    perms: [
      p('Read', `View endpoint protection reports.`),
    ],
  },
  {
    name: 'Enrollment programs',
    summary: `Automated enrollment: Apple Automated Device Enrollment (ADE), Apple School Manager, Apple Configurator, and Windows Autopilot.`,
    perms: [
      p('Assign profile', `Assign profiles for Automated Device Enrollment, Apple School Manager, Apple Business Manager, Apple Configurator, or Windows Autopilot.`, `The profile decides the device's setup experience and how it's managed from first boot (for example, supervision, user affinity, and Autopilot mode).`, 'high'),
      p('Create device', `Import Apple devices for Apple Configurator.`),
      p('Create profile', `Create new profiles for the Automated Device Enrollment, Apple School Manager, Apple Configurator, or Windows Autopilot.`),
      p('Create token', `Download the Apple Automated Device Enrollment or Apple School Manager token .pem file.`, `This downloads the public key you upload to Apple Business or School Manager when you set up or renew a token. It's a setup step, not an everyday task.`),
      p('Delete device', `Delete Apple devices for the Automated Device Enrollment, Apple School Manager, or Apple Configurator`),
      p('Delete profile', `Delete profiles for the Automated Device Enrollment, Apple School Manager, Apple Configurator, or Windows Autopilot.`, undefined, 'high'),
      p('Delete token', `Delete Apple Automated Device Enrollment or Apple School Manager token .pem files.`, `Deleting a token breaks the link to Apple Business or School Manager, and with it automated enrollment for every device behind that token.`, 'never'),
      p('Enrollment time device membership assignment', `Allows Intune to assign devices to Entra ID groups during enrollment.`, `Lets an admin set enrollment to drop devices into Entra groups automatically, and those groups drive apps and policy.`),
      p('Read device', `View Apple devices for the Automated Device Enrollment, Apple School Manager, Apple Configurator, or Windows Autopilot devices.`),
      p('Read profile', `View profiles for the Automated Device Enrollment, Apple School Manager, Apple Configurator, or Windows Autopilot.`),
      p('Read token', `View the Apple Automated Device Enrollment or Apple School Manager token status.`),
      p('Release Apple devices', `Release Apple ADE (automated device enrollment) enrolled devices from Apple Business or School Manager and Intune`, `Releasing removes the device from your organization's Apple Business or School Manager, so it can no longer be enrolled automatically as yours. Getting it back generally means re-adding it through Apple Configurator or a reseller.`, 'never'),
      p('Rotate macOS admin password', `Rotate local admin account password for macOS devices enrolled through Apple's automated device enrollment`),
      p('Sync device', `Initiate the Sync command for Windows Autopilot devices.`),
      p('Update profile', `Manage profiles for the Automated Device Enrollment, Apple School Manager, Apple Configurator, or Windows Autopilot.`, `Changes apply to devices that enroll with the profile afterward.`, 'high'),
      p('Update token', `Upload the Apple Device Enrollment or Apple School Manager token and sync Apple Automated Device Enrollment or Apple School Manager devices.`, `Uploading the wrong token can connect Intune to a different Apple Business or School Manager account.`, 'high'),
      p('View macOS admin password', `View local admin account password for macOS devices enrolled through Apple's automated device enrollment`, `A local admin password gives full control of that Mac.`, 'never'),
    ],
  },
  {
    name: 'Filters',
    summary: `Assignment filters that narrow which devices an app or policy assignment applies to.`,
    perms: [
      p('Create', `Create new filter. Learn more https://go.microsoft.com/fwlink/?linkid=2135625`),
      p('Delete', `Delete filters. Learn more https://go.microsoft.com/fwlink/?linkid=2135625`),
      p('Read', `View filters. Learn more https://go.microsoft.com/fwlink/?linkid=2135625`),
      p('Update', `Edit filters. Learn more https://go.microsoft.com/fwlink/?linkid=2135625`, `The sleeper permission. Editing a filter changes the target of every assignment that uses it, across apps and policies, without touching any of those assignments.`, 'high'),
    ],
  },
  {
    name: 'Intune data warehouse',
    summary: `The Intune Data Warehouse, used by Power BI and other reporting tools.`,
    perms: [
      p('Read', `View all data and reports from the data warehouse. Data can be used by Power BI or other reporting services.`, `Read-only, but tenant-wide bulk data about users, devices, and apps. Treat it like an export of your inventory.`),
    ],
  },
  {
    name: 'Managed apps',
    summary: `App protection policies (MAM): data protection inside apps, with or without device enrollment.`,
    perms: [
      p('Assign', `Assign application protection policies to Microsoft Entra security groups.`, `App protection controls copy/paste, save-as, PIN requirements and more in apps like Outlook and Teams. A wrong assignment can block users or leave data unprotected.`, 'high'),
      p('Create', `Create new application protection policies.`),
      p('Delete', `Delete application protection policies.`, `Removes data protection from apps for every user in scope.`, 'high'),
      p('Read', `View application protection policies and status.`),
      p('Update', `Change application protection policies, or delete pending wipe requests for protected apps.`, `Note the second half: Update can cancel a pending app wipe, for example one issued for a departing employee.`, 'high'),
      p('Wipe', `Create a wipe request to selectively remove company data from a protected app.`, `Removes company data from the app on that user's device. It doesn't touch personal data, but the user loses company mail and files in that app until they sign in again.`, 'high'),
    ],
  },
  {
    name: 'Managed Device Cleanup Rules',
    summary: `Rules that automatically remove devices that haven't checked in for a set time.`,
    perms: [
      p('Update', `Change the managed device cleanup rules.`, `An aggressive rule removes device records automatically, including devices that are just offline for a while, such as on leave or in storage.`, 'high'),
    ],
  },
  {
    name: 'Managed Device Cleanup Settings',
    summary: `Settings for automatic cleanup of inactive devices.`,
    perms: [
      p('Update', `Change the managed device cleanup settings.`, `Same risk as cleanup rules: device records get removed automatically.`, 'high'),
    ],
  },
  {
    name: 'Managed devices',
    summary: `The device records themselves: properties, ownership, primary user, and inventory.`,
    perms: [
      p('Delete', `Delete Intune managed devices. Deleted devices can no longer be managed by Intune, and the device can no longer access company resources. Company data may be wiped from the device if a user tries to check in after it's deleted.`, `Read Microsoft's description twice. This is irreversible from the console, and the user typically has to re-enroll.`, 'never'),
      p('Query', `Allows Intune to query a managed device for the purposes of retrieving detailed inventory information, device state, or other properties of a managed device from the device itself.`, `Live, on-demand queries against the device itself (device query), not just the last inventory snapshot.`),
      p('Read', `View Intune managed devices.`),
      p('Read Bios Password', `Read BIOS password for devices with managed BIOS and firmware configuration.`, `The BIOS password protects firmware settings like boot order and Secure Boot. Anyone holding it can change them.`, 'never'),
      p('Set primary user', `Choose, change, or remove the primary user of a managed device. This permission must be used in combination with the managed devices read and update permissions.`, `The primary user drives user-targeted apps and policies, and who sees the device in Company Portal. Changing it can move a device's apps and access to someone else.`),
      p('Update', `Change settings or ownership properties of a managed device. This permission doesn't enable remote actions for devices. To perform remote actions on the device, grant one or more of the Remote Task permissions.`, `Includes switching ownership between personal and corporate, which changes what Intune collects from the device (corporate devices report full app inventory, for example).`),
      p('View reports', `Generate, view, or export reports for managed devices.`),
    ],
  },
  {
    name: 'Managed Google Play',
    summary: `Settings for syncing Managed Google Play apps into Intune.`,
    perms: [
      p('Modify', `Modify the settings for synchronizing Managed Google Play apps with Microsoft Intune.`, undefined, 'high'),
      p('Read', `View the settings for synchronizing Managed Google Play apps with Microsoft Intune.`),
    ],
  },
  {
    name: 'Microsoft Defender ATP',
    summary: `The connection between Intune and Microsoft Defender for Endpoint (formerly Defender ATP).`,
    perms: [
      p('Read', `View the connection between Microsoft Intune and Microsoft Defender ATP.`),
    ],
  },
  {
    name: 'Microsoft Store For Business',
    summary: `Legacy: sync settings for the retired Microsoft Store for Business.`,
    perms: [
      p('Modify', `Modify the settings for synchronizing Microsoft Store for Business apps with Microsoft Intune.`, `Microsoft Store for Business has been retired. There's little reason to grant this in a new role.`),
      p('Read', `View the settings for synchronizing Microsoft Store for Business apps with Microsoft Intune.`),
    ],
  },
  {
    name: 'Microsoft Tunnel Gateway',
    summary: `Microsoft Tunnel VPN gateway servers and sites.`,
    perms: [
      p('Create', `Create Microsoft Tunnel Gateway server configurations and sites. Server configurations include settings for IP address ranges, DNS servers, ports, and split tunneling rules. Sites are logical groupings of multiple servers that support Microsoft Tunnel.`),
      p('Delete', `Delete Microsoft Tunnel Gateway server configurations and sites. Server configurations include settings for IP address ranges, DNS servers, ports, and split tunneling rules. Sites are logical groupings of multiple servers that support Microsoft Tunnel.`, `Mobile users connected through that site lose VPN access to internal resources.`, 'never'),
      p('Read', `View Microsoft Tunnel Gateway server configurations and sites. Server configurations include settings for IP address ranges, DNS servers, ports, and split tunneling rules. Sites are logical groupings of multiple servers that support Microsoft Tunnel.`, `Shows internal IP ranges, DNS servers, and routing rules. That's network reconnaissance data, so limit it to network admins.`),
      p('Update', `Update Microsoft Tunnel Gateway server configurations and sites. Server configurations include settings for IP address ranges, DNS servers, ports, and split tunneling rules. Sites are logical groupings of multiple servers that support Microsoft Tunnel.`, `Changing split tunneling or DNS can silently send traffic that should stay inside the tunnel out to the internet, or the reverse.`, 'high'),
    ],
  },
  {
    name: 'Mobile apps',
    summary: `Apps you deploy through Intune (Win32, Store, line-of-business, web links), plus VPP tokens and app categories.`,
    perms: [
      p('Assign', `Assign mobile applications or eBooks to Microsoft Entra security groups.`, `Assign as Required installs software on every targeted device, and Uninstall removes it. This is software deployment to your fleet.`, 'high'),
      p('Create', `Add new mobile applications to Intune such as store apps, line-of-business apps, web-links, or built-in apps. You can also add books purchased through the Apple Volume Purchase Program or add eBook categories. You can set up iOS VPP Tokens, Windows Symantec certificates, Windows side loading keys, app categories, or the Android for Work connection. See the note following this table regarding Apple Volume Purchase Program (VPP) apps.`, `Uploading a package isn't deploying it. But a Win32 app is a script or installer that runs as SYSTEM once assigned, so know who's packaging.`),
      p('Delete', `Delete mobile applications such as store apps, line-of-business apps, web-links, or built-in apps. You can also delete books purchased through the Apple Volume Purchase Program or delete eBook categories. You can delete iOS VPP Tokens, Windows Symantec certificates, Windows side loading keys, app categories, or the Android for Work connection. See the note following this table regarding Apple Volume Purchase Program (VPP) apps.`, `Also covers deleting VPP tokens, which affects licensing for every app bought through that token.`, 'high'),
      p('Read', `View mobile applications such as store apps, line-of-business apps, web-links, or built-in apps. You can also view books purchased through the Apple Volume Purchase Program or add eBook categories. You can view iOS VPP Tokens, Windows Symantec certificates, Windows side loading keys, app categories, or the Android for Work connection. See the note following this table regarding Apple Volume Purchase Program (VPP) apps.`),
      p('Relate', `Create relationships with other managed apps using Dependencies and Supersedence features.`, `Supersedence can uninstall the app it replaces, and dependencies install extra apps automatically. Relationships change what lands on devices without touching any assignment.`, 'high'),
      p('Update', `Manage mobile applications such as store apps, line-of-business apps, web-links, or built-in apps. You can also manage books purchased through the Apple Volume Purchase Program or add eBook categories. You can manage iOS VPP Tokens, Windows Symantec certificates, Windows side loading keys, app categories, or the Android for Work connection. The Mobile Applications Create permission may be required for certain application update scenarios. See the note following this table regarding Apple Volume Purchase Program (VPP) apps.`, `Swapping the package or detection rules on an already-assigned app changes what installs on every targeted device.`, 'high'),
    ],
  },
  {
    name: 'Mobile Threat Defense',
    summary: `Connectors to Mobile Threat Defense partners, whose risk signals can feed compliance.`,
    perms: [
      p('Modify', `Add, remove, or modify the Mobile Threat Defense connectors between Intune and your chosen MTD vendors`, `MTD risk levels can drive compliance and Conditional Access. Removing a connector, or changing how unresponsive partners are treated, changes who gets access.`, 'never'),
      p('Read', `View the Mobile Threat Defense connectors between Intune and your chosen MTD vendors`),
    ],
  },
  {
    name: 'Multi Admin Approval',
    summary: `Multi Admin Approval: the two-person rule for sensitive changes like scripts, apps, wipes, and RBAC changes.`,
    perms: [
      p('Approval for Multi Admin Approval', `Approve or reject approval requests for Multi Admin Approval configuration.`, `Approvers are the second person in the two-person rule. Never put the same people in both the requester and approver groups.`, 'high'),
      p('Create access policy', `Create access policies for Multi Admin Approval.`),
      p('Delete access policy', `Delete access policies for Multi Admin Approval.`, `Deleting a policy removes the approval requirement for that resource type. It's the off switch for your two-person rule.`, 'never'),
      p('Read access policy', `Read access policies for Multi Admin Approval.`),
      p('Update access policy', `Update access policies for Multi Admin Approval.`, `Changing the approver group changes who can say yes to protected changes.`, 'never'),
    ],
  },
  {
    name: 'Operating System Recovery Configurations',
    summary: `Operating system recovery profiles.`,
    perms: [
      p('Assign Profiles', `Assign Operating System Recovery profiles.`, `Recovery settings decide how devices behave when they fail to start, so assign them with the same care as other device configuration.`, 'high'),
      p('Create Profiles', `Create Operating System Recovery profiles.`, `No effect until assigned.`),
      p('Delete Profiles', `Delete Operating System Recovery profiles.`),
      p('Read Profiles', `Read Operating System Recovery profiles.`),
      p('Update Profiles', `Update Operating System Recovery profiles.`, `Changes to an assigned profile reach its devices.`),
    ],
  },
  {
    name: 'Organization',
    summary: `Tenant-wide settings such as device categories and Exchange connectors, plus the Scoped permissions setting.`,
    perms: [
      p('Create', `Create tenant settings such as device categories and Exchange connectors.`),
      p('Delete', `Delete tenant settings such as device categories and Exchange Connectors.`, `Device categories are often used for dynamic groups. Deleting one can change group membership and with it app and policy targeting.`, 'high'),
      p('Read', `View tenant settings such as device categories and Exchange Connectors. This permission is required to activate all enrollment workflows. Also allows viewing the Scoped permissions setting and running the Permissions Assessment Report.`, `Most enrollment-related roles need this one.`),
      p('Update', `Manage tenant settings, device categories, and Exchange Connectors. Also allows enabling the Scoped permissions setting.`, `Tenant-wide by definition, and it includes turning on Scoped permissions, which changes how every RBAC assignment in the tenant is evaluated.`, 'never'),
    ],
  },
  {
    name: 'Organizational Messages',
    summary: `Messages shown to users on Windows (for example, in the taskbar or Get Started app).`,
    perms: [
      p('Assign', `Assign organizational messages.`, `These messages appear to users as coming from IT. In the wrong hands that's a phishing channel, so review messages before they're assigned.`, 'high'),
      p('Create', `Create and assign organizational messages.`, `Per Microsoft's description, Create also allows assigning, so Create alone is enough to send a message.`, 'high'),
      p('Delete', `Delete organizational messages.`),
      p('Read', `Read organizational messages.`),
      p('Update', `Cancel organizational messages.`, `Despite the name, Update means cancel.`),
      p('Update organizational message control', `Enable or block organizational messages directly from Microsoft, while allowing admin messages to display.`, `A tenant-wide switch for messages that come from Microsoft rather than your admins.`),
    ],
  },
  {
    name: 'Partner Device Management',
    summary: `The Jamf compliance connector for macOS devices managed by Jamf Pro.`,
    perms: [
      p('Modify', `Configure the Compliance Connector for Jamf.`, `Jamf-managed Macs get their compliance state through this connector. Breaking it affects their Conditional Access.`, 'high'),
      p('Read', `View the Compliance Connector for Jamf.`),
    ],
  },
  {
    name: 'Policy Sets',
    summary: `Bundles of apps, policies, and profiles assigned together.`,
    perms: [
      p('Assign', `Assign Policy Sets to Microsoft Entra security groups.`, `One assignment deploys everything in the set: apps, configuration, compliance. It may be broader than the permissions you'd grant for each item separately.`, 'high'),
      p('Create', `Create a new Policy Set.`),
      p('Delete', `Delete Policy Sets.`),
      p('Read', `View Policy Sets.`),
      p('Update', `Change a Policy Set, or add items to a Policy Set.`, `Adding an item to a set that's already assigned deploys that item to the set's groups.`, 'high'),
    ],
  },
  {
    name: 'Quiet Time policies',
    summary: `Quiet time policies that silence work app notifications outside working hours.`,
    perms: [
      p('Assign', `Assign quiet time policies to Microsoft Entra security groups.`, `Low risk to devices, but a wide or wrongly timed assignment means people don't see work notifications when they expect to.`),
      p('Create', `Create new quiet time policies.`),
      p('Delete', `Delete quiet time policies.`),
      p('Read', `View device quiet time policies.`),
      p('Update', `Change quiet time policies.`, `Changes to an assigned policy change notification hours for everyone in scope.`),
      p('View Reports', `View, generate, and export quiet time policy reports.`),
    ],
  },
  {
    name: 'Remote assistance connectors',
    summary: `The TeamViewer connector and Remote Help tenant settings.`,
    perms: [
      p('Read', `View the status of the TeamViewer connector and remote help. This permission isn't required to initiate remote assistance requests for devices.`),
      p('Update', `Manage the state of the TeamViewer connector and remote help. This permission also requires the Remote assistance connectors > Read permission to view the status of the TeamViewer connector and remote help.`, `This is the tenant switch for remote control tools. Enabling a connector opens a remote-access path into user devices.`, 'high'),
      p('View reports', `View, generate and export remote help sessions and monitor reports.`),
    ],
  },
  {
    name: 'Remote Help app',
    summary: `What a helper can do in a Remote Help session.`,
    perms: [
      p('Elevation', `For Windows devices, elevation allows the helper to enter UAC credentials when prompted on the sharer's device when remote help is enabled. Enabling elevation also allows the helper to view and control the sharer's device when the sharer grants the helper access.`, `The helper can approve administrator prompts on the user's device, so they're effectively a local admin for the session.`, 'high'),
      p('Take full control', `Take full control allows the helper to view and control the sharer's device when Remote Help is enabled for all platforms we support.`, undefined, 'high'),
      p('Android unattended control', `Allows the helper to connect to Android devices without requiring the sharer to accept the connection each time. This capability requires the Android device to be enrolled in Intune as a dedicated device. Assign this permission explicitly and scope it to the specific devices that can receive unattended support.`, `No one on the device has to say yes. Microsoft itself says to scope it tightly.`, 'never'),
      p('Windows unattended control remote sign-in', `Allows the helper to start an unattended remote sign-in session to a targeted, physical, corporate-owned Windows device without requiring the sharer to accept the connection each time. Assign this permission explicitly and scope it to the specific devices that can receive unattended support.`, `Remote sign-in to a Windows PC with no user present to approve or watch. Grant it only to a named group, scoped to specific devices, ideally just-in-time.`, 'never'),
      p('View screen', `View screen allows the helper to view the sharer's device when Remote Help is enabled for all platforms we support.`, `View-only, but helpers see whatever is on the screen, including email, chats, and documents.`),
    ],
  },
  {
    name: 'Remote tasks',
    summary: `Individual actions you can trigger on a device. Each one is granted separately, so grant only the ones each job needs.`,
    perms: [
      p('Bypass activation lock', `Remove the Activation Lock from supervised devices without requiring the user's Apple ID and password. This may be required if a user leaves the company and returns the device; without the user's Apple ID and password, there's no way to reactivate the device. Or, you need to reassign some devices to a different department during a device refresh in your organization. You can only reassign devices that don't have Activation Lock enabled. You must also have the Managed Device > Read permission to view devices in the Azure portal before initiating this remote task.`, `Activation Lock is Apple's anti-theft protection. Bypassing it is right when reassigning a returned device, and also exactly what a thief would want.`, 'never'),
      p('Change assignments', `Allows IT Admin to initiate a change assignments action. Action allows the selection of assigned applications and configuration to be removed from a device. Additionally, previously removed applications and configuration to be restored on the device.`, `Removes assigned apps and configuration from one device, including security configuration. It's a per-device exception that bypasses your group targeting.`, 'high'),
      p('Clean PC', `Initiate a Fresh start device action. This action removes any apps that are installed on a Windows 10 PC that's running the Creators Update. Then, it automatically updates the PC to the latest version of Windows.`, `Removes every installed app from the PC. The user can be offline for hours while it rebuilds.`, 'never'),
      p('Collect diagnostics', `Collect device diagnostics`, `Uploads logs and diagnostic files from the device. Low risk, but diagnostics can contain user and system details, so treat the files as sensitive.`),
      p('Disable lost mode', `Turn off lost mode for an iOS or ChromeOS device.`),
      p('Enable lost mode', `Initiate lost mode on lost or stolen iOS or ChromeOS devices. This mode lets you enter a message and a phone number that appears on the lock screen of the device. To use lost mode, the device must be a corporate-owned iOS device that is in supervised mode.`, `Locks the device and shows your message until lost mode is turned off.`, 'high'),
      p('Enable Windows IntuneAgent', `Enable Windows Intune agent.`),
      p('Get FileVault key.', `Get Mac FileVault key.`, `The FileVault recovery key decrypts that Mac's disk. It's included in the built-in Read Only Operator role, so check who has that role.`, 'never'),
      p('Indicates remote device action to initiate Mobile Device Management (MDM) attestation if device is capable for it.', `Indicates remote device action to initiate Mobile Device Management (MDM) attestation if device is capable for it.`, `Asks the device to prove its identity and integrity (for example, through the TPM) to Intune. A health check, low risk.`),
      p('Initiate Configuration Manager action', `Initiate a remote action on a device managed by Configuration Manager.`, `What this can do depends on the Configuration Manager action selected, so treat it like the most powerful of them.`, 'high'),
      p('Locate device', `View the location of a lost or stolen corporate-owned device on a map. Can locate supervised iOS/iPadOS devices, Android dedicated devices (COSU), and Windows devices.`, `A device's location is usually a person's location. Use it for lost or stolen devices, and make sure your privacy policy and HR know it's possible.`, 'high'),
      p('Manage shared device users', `Sign out the user with the current session on a shared device. This action doesn't delete users from a shared device, it only forces the user with a current session to be logged out.`),
      p('Offboard', `Offboard the devices associated with a user, when the user is leaving the organization.`, `Acts on every device associated with the user at once. Confirm exactly what your offboarding flow does before granting it.`, 'high'),
      p('Offer remote assistance', `Initiate a remote assistance session with a user's device by using a remote assistance provider. The remote assistance option for your provider must be enabled for your tenant.`),
      p('Play sound to locate lost devices', `Play a sound to locate lost Android dedicated devices, or iOS devices placed in MDM lost mode.`),
      p('Reboot now', `Initiates a device restart. This causes the device you choose to be restarted. The device owner isn't automatically notified of the restart, and they might lose work.`),
      p('Recover MDM Key', `Initiate Mobile Device Management (MDM) certificate's private key recovery with TPM attestation`, `A repair action for the device's management certificate. Useful for support engineers, rarely needed day to day.`),
      p('Remote lock', `The Remote lock device action locks the device. To unlock the device, the device owner enters their passcode. You can remotely lock devices that have a PIN or password set. Devices that don't have a PIN or password can't be remotely locked.`),
      p('Remove Device Firmware Configuration Interface Management.', `Allows admin to initiate removal of device from Device Firmware Configuration Interface management before deleting the Intune and Autopilot records.`, `DFCI locks down firmware settings like boot from USB. Removing it hands firmware control back to whoever has the device.`, 'never'),
      p('Reset passcode', `Initiates a forced removal of the passcode, and requires the device user to set a new passcode. Supported on iOS devices, and certain later versions of Android and Android for work. Not supported on older Android versions, macOS, or Windows.`, `Removes the passcode until the user sets a new one, so the device is unprotected in between. Verify who's asking before you use it.`, 'high'),
      p('Restore Managed Home Screen', `Manually restore Managed Home Screen on Android Enterprise devices to return them to kiosk mode from a temporarily suspended state. Complements the temporary suspend action for complete kiosk mode management.`),
      p('Retire', `Initiates a retire action for a device. Also called remove company data. The Remove company data action removes managed app data (where applicable), settings, and email profiles that were assigned by using Intune. The device is removed from Intune management. This happens the next time the device checks in and receives the remote Remove company data action. Remove company data leaves the user's personal data on the device. For ChromeOS devices, this starts a deprovision action.`, `Personal data stays, but the device leaves management and loses company apps, email, and settings.`, 'never'),
      p('Revoke App Licenses', `Revokes any iOS VPP application licenses that have been associated with the device.`),
      p('Rotate BitLockerKeys (preview)', `Initiates a key rotation for BitLocker Recovery Passwords on the device.`, `Rotation is a security improvement: the old recovery password stops working. It doesn't reveal the new one.`),
      p('Rotate FileVault key.', `Rotate Mac FileVault key.`, `Rotation invalidates the old recovery key, which is good hygiene after a key has been viewed.`),
      p('Rotate Local Admin Password', `Initiates a manual rotation for the local admin password on the device`, `Rotates the Windows LAPS password. Low risk on its own, and a good habit after a password has been used.`),
      p('Rotate macOS recovery lock password', `Rotate the recovery lock password for macOS devices`),
      p('Run Pause Configuration Refresh', `Initiate On Demand pause configuration refresh`, `Pauses Windows configuration refresh, which normally puts drifted settings back. Useful for troubleshooting, but while it's paused, local changes to managed settings stick.`, 'high'),
      p('Run Remediation', `Initiate On Demand Proactive Remediation`, `Runs a remediation script on the device right now. Script execution on demand is powerful even when the script itself was approved.`, 'high'),
      p('Send custom notifications', `Allows admin to send customized notifications to devices. Devices receive notifications in Company Portal.`, `The message comes from your trusted IT channel, which makes it ideal for phishing if misused.`, 'high'),
      p('Set device name', `Set or change the name of a device.`, `Device names often drive dynamic groups, scripts, and naming conventions, so renames can have side effects.`),
      p('Shut down', `Initiates a shutdown of the device, and will automatically close all applications and running services and leave the device in a powered-off state.`, `Someone has to physically turn the device back on.`),
      p('Sync devices.', `Initiates a sync operation on the device and forces the selected device to immediately check in with Intune. When a device checks in, it immediately receives any pending actions or policies that have been assigned to it.`, `Safe and useful. A great first permission for tier 1.`),
      p('Temporarily suspend Managed Home Screen', `Remotely suspend Managed Home Screen on Android Enterprise devices in kiosk mode, allowing temporary access to the default launcher experience. Supports automatic restoration after a configured time period without requiring user interaction or PIN sharing.`, `Takes a kiosk device out of kiosk mode for a while, so whoever is holding it gets the normal launcher.`),
      p('Update cellular data plan', `Activate the data plan for cellular iOS/iPadOS devices that support eSIM.`),
      p('Update device account', `Allows changing the device account associated with Surface Hub devices, and set authentication options such as password rotation.`),
      p('View macOS recovery lock password', `View the recovery lock password in the Recovery Keys blade of macOS devices`, `Recovery Lock protects macOS Recovery, where someone could reinstall or wipe the Mac. The password is a key to that door.`, 'never'),
      p('Windows Defender', `Initiates a Windows Defender signature update.`, `Safe and helpful.`),
      p('Wipe', `Initiates a wipe of the device. Also called a "factory reset." The Factory reset action restores a device to its factory default settings. The user data is kept or wiped depending on whether or not you choose the Retain enrollment state and user account checkbox. For ChromeOS devices, this starts either a wipe or a factory reset (Powerwash) action.`, `The most destructive action in Intune. It's included in the built-in Help Desk Operator role, so check who has that role. Protect it with Multi Admin Approval.`, 'never'),
    ],
  },
  {
    name: 'Roles',
    summary: `Intune RBAC itself: roles and role assignments.`,
    perms: [
      p('Assign', `Assign Intune built-in or custom roles to Microsoft Entra security groups`, `Whoever can assign roles can give anyone, including themselves, any permission on this page.`, 'never'),
      p('Create', `Create new Intune custom roles. Built-in roles are created by Intune automatically.`, `On its own, creating a role grants nothing. Combined with Assign or Update, it's full control.`, 'never'),
      p('Delete', `Delete a custom Intune role. You can't delete built-in roles.`, `Deleting a role in use removes those admins' access immediately.`, 'never'),
      p('Read', `View permissions, role assignments, member groups, and scope groups for any built-in or custom Intune role.`, `Read-only, but it's a map of who can do what. Fine for auditors.`),
      p('Update', `Update custom role permissions and role assignments for built-in or custom roles. Role assignments define the administrators and end user scope for the role.`, `Editing a role's permissions changes access for everyone assigned it, and editing an assignment changes who has it and over what. Protect with Multi Admin Approval.`, 'never'),
    ],
  },
  {
    name: 'Security baselines',
    summary: `Microsoft's recommended security configuration baselines for Windows, Edge, Defender, and more.`,
    perms: [
      p('Assign', `Assign Security Baseline profiles to Microsoft Entra security groups.`, `Baselines contain hundreds of settings. Assigning one broadly without testing is a classic source of help desk tickets.`, 'high'),
      p('Create', `Create new Security Baseline profiles.`, `No effect until assigned.`),
      p('Delete', `Delete Security Baseline profiles.`, `Removes that baseline's protection from every device it targeted.`, 'high'),
      p('Read', `View Security Baseline profiles or profiles reporting or Template reporting for all Security Baseline workspace.`),
      p('Update', `Update Security Baseline profiles.`, `Edits to an assigned baseline reach every targeted device.`, 'high'),
    ],
  },
  {
    name: 'Security tasks',
    summary: `Remediation tasks that your security team sends to IT through the Defender for Endpoint integration.`,
    perms: [
      p('Read', `View security tasks.`),
      p('Update', `Update security tasks.`, `Lets IT accept, reject, or complete tasks from the security team, so this is the hand-off point between the two teams.`),
    ],
  },
  {
    name: 'ServiceNow',
    summary: `The ServiceNow connector that shows incidents in the Intune troubleshooting experience.`,
    perms: [
      p('Update Connector', `Update ServiceNow connection.`, `Connects your tenant to a ServiceNow instance with stored credentials. Integration owners only.`, 'high'),
      p('View Incidents', `View incidents from ServiceNow.`, `Shows ServiceNow incident details inside Intune. Incidents can contain personal information about users.`),
    ],
  },
  {
    name: 'Telecom expenses',
    summary: `Deprecated: the telecom expense management partner connector.`,
    perms: [
      p('Read', `View settings and status of telecom expense partner connector. The telecom expense partner connector feature was deprecated and this permission is no longer supported after June 2025.`, `Deprecated. Remove it from custom roles.`),
      p('Update', `Modify or activate telecom expense management partner connector. The telecom expense partner connector feature is deprecated and this permission is no longer supported after June, 2025.`, `Deprecated. Remove it from custom roles.`),
    ],
  },
  {
    name: 'Tenant attached recommendations',
    summary: `Recommendations for Configuration Manager sites attached to Intune.`,
    perms: [
      p('Read', `View Tenant attached recommendations. Recommendations are methods to improve site health and device management experience.`),
    ],
  },
  {
    name: 'Terms and conditions',
    summary: `Terms users must accept before enrolling or accessing Company Portal.`,
    perms: [
      p('Assign', `Assign terms and conditions to Microsoft Entra security groups.`, `Users in scope must accept the terms to continue, so a new assignment can interrupt enrollment.`),
      p('Create', `Create new terms and conditions.`),
      p('Delete', `Delete an existing terms and conditions.`, `Your record of who accepted what may matter for legal or compliance reasons. Check with legal before deleting.`),
      p('Read', `View terms and conditions.`),
      p('Update', `Manage existing terms and conditions but not assignments.`, `Changing the text, and especially issuing a new version, can require every user to accept again.`),
    ],
  },
  {
    name: 'Windows Enterprise Certificate',
    summary: `The code-signing certificate used to distribute line-of-business apps to Windows devices.`,
    perms: [
      p('Modify', `Add, remove, or modify the code-signing certificate used to distribute line-of-business apps to your managed Windows devices.`, `Control of a code-signing certificate means control over what your devices will trust and install as your company's software.`, 'never'),
      p('Read', `View the code-signing certificate used to distribute line-of-business apps to your managed Windows devices.`),
    ],
  },
];
