<#
.SYNOPSIS
    Least-privilege review of Intune RBAC roles based on actual admin activity.

.DESCRIPTION
    1. Pulls Intune audit events for the last N days (default 90).
    2. Groups them by admin (actor) and works out the Intune RBAC permission each
       action would have needed (e.g. "Patch DeviceConfiguration" ->
       Microsoft.Intune_DeviceConfigurations_Update, plus the implied _Read).
    3. Pulls every Intune role definition, its permissions, its role assignments,
       and expands the assignment member groups (transitively) to users.
    4. Credits each permission a role grants when one of the role's members used it.
    5. Reports, per role, which granted permissions were never used = excessive.

    The script is READ-ONLY. It makes no changes to the tenant.

.IMPORTANT CAVEATS
    * Intune audit logs record changes and remote actions only, not reads/views.
      Read-type permissions therefore can't be proven "used" from the audit log.
      They're reported separately with Confidence = Low and aren't treated as
      excessive by default. Reads that a write implies (you can't edit what you
      can't see) are counted as used.
    * There's no official Microsoft mapping from audit activityType to RBAC
      permission. The mapping in $ResourceMap / $RemoteActionMap below is a
      heuristic. Check UnmappedEvents.csv and extend the tables if needed.
    * If an admin holds several Intune roles that all grant the permission they
      used, every one of those roles is credited. The tool leans toward NOT
      flagging a permission rather than flagging one that was really needed.
    * Users holding Global Administrator or Intune Administrator in Entra ID bypass
      Intune RBAC entirely. Every such user is listed in AdminsOutsideIntuneRBAC.csv:
      active or PIM-eligible, assigned directly or through a role-assignable group,
      with or without activity, and even if they also hold Intune roles. Their activity
      still credits their Intune roles unless -ExcludeEntraAdminActivity is used.
    * Scope (scope groups / scope tags) is not evaluated. Only permissions are.

.PARAMETER DaysBack
    Number of days of audit history to analyse (1-365). Default 90.

.PARAMETER OutputPath
    Folder for the report files. Created if missing.

.PARAMETER IncludeFailedEvents
    Also count audit events whose activityResult isn't "Success".

.PARAMETER TreatReadsAsExcessive
    Also list unused Read/View permissions as excessive (low confidence).

.PARAMETER ExcludeEntraAdminActivity
    By default, activity by users who also hold Global Admin / Intune Admin in Entra ID still
    credits their Intune roles, marked "(by Entra admin)" in RolePermissionUsage.csv. If you add
    this switch, those users' activity does NOT count toward role usage. Use it to see what the
    roles would need for the non-Entra-admin members alone.

.PARAMETER SkipConnect
    Don't call Connect-MgGraph. Use this if you're already connected with the right scopes.

.EXAMPLE
    .\Get-IntuneRbacExcessPermissions.ps1 -DaysBack 90 -OutputPath C:\Temp\RbacReview

.NOTES
    Requires: Microsoft.Graph.Authentication module (Install-Module Microsoft.Graph.Authentication)
    Graph scopes (delegated): DeviceManagementApps.Read.All, DeviceManagementConfiguration.Read.All,
        DeviceManagementManagedDevices.Read.All, DeviceManagementRBAC.Read.All,
        DeviceManagementServiceConfig.Read.All, GroupMember.Read.All, RoleManagement.Read.Directory
    Optional: ImportExcel module. If present, a combined .xlsx workbook is also written.
    Compatible with Windows PowerShell 5.1 and PowerShell 7+.
#>
[CmdletBinding()]
param(
    [ValidateRange(1, 365)]
    [int]$DaysBack = 90,

    [string]$OutputPath = (Join-Path -Path (Get-Location) -ChildPath ("IntuneRbacReview_{0}" -f (Get-Date -Format 'yyyyMMdd_HHmm'))),

    [string]$TenantId,

    [switch]$IncludeFailedEvents,

    [switch]$TreatReadsAsExcessive,

    [switch]$ExcludeEntraAdminActivity,

    [switch]$SkipConnect
)

$ErrorActionPreference = 'Stop'
$BetaBase = 'https://graph.microsoft.com/beta'
$V1Base   = 'https://graph.microsoft.com/v1.0'

#region ---------------------------------------------------------------- Mapping tables (edit these)
# Maps the resource part of an audit event (activityType 2nd token + resources[].type)
# to the RESOURCE segment of an Intune permission: Microsoft.Intune_<Resource>_<Action>
# Evaluated top-down. First match wins, so put specific patterns before general ones.
# 'Perm' is a regex alternation, which absorbs naming differences between tenants/API versions.
$ResourceMap = @(
    @{ Match = 'RoleDefinition|RoleAssignment|RoleScopeTag';                                         Perm = 'Roles' }
    @{ Match = 'AssignmentFilter';                                                                   Perm = 'AssignmentFilter|AssignmentFilters|Filters' }
    @{ Match = 'PolicySet';                                                                          Perm = 'PolicySets' }
    @{ Match = 'ManagedAppPolic|ManagedAppProtection|AppProtection|TargetedManagedAppConfiguration|WindowsInformationProtection|ManagedAppRegistration|MdmWindowsInformationProtection'; Perm = 'ManagedApps' }
    @{ Match = 'MobileApp|ManagedDeviceMobileAppConfiguration|VppToken|ManagedEBook|EBook|MicrosoftStoreForBusiness'; Perm = 'MobileApps' }
    @{ Match = 'CompliancePolic|ComplianceScript|ComplianceManagementPartner|NotificationMessageTemplate|ComplianceSetting'; Perm = 'DeviceCompliancePolices|DeviceCompliancePolicies' }
    @{ Match = 'DeviceManagementIntent|SecurityBaseline|EndpointSecurity|DeviceIntent';              Perm = 'SecurityBaselines|DeviceConfigurations' }
    @{ Match = 'DeviceConfiguration|ConfigurationPolic|GroupPolicyConfiguration|GroupPolicyUploaded|DeviceManagementScript|DeviceHealthScript|DeviceShellScript|CustomAttributeShellScript|WindowsFeatureUpdate|WindowsQualityUpdate|WindowsDriverUpdate|DeviceManagementConfiguration|ResourceAccessProfile'; Perm = 'DeviceConfigurations' }
    @{ Match = 'WindowsAutopilot|DepOnboarding|EnrollmentProfile|AppleUserInitiatedEnrollment|DepIOSEnrollment|DepMacOSEnrollment'; Perm = 'EnrollmentProgramToken|EnrollmentPrograms|AppleEnrollmentProfiles' }
    @{ Match = 'ImportedDeviceIdentit|CorporateDeviceIdentifier';                                    Perm = 'CorporateDeviceIdentifiers' }
    @{ Match = 'DeviceEnrollmentManager';                                                            Perm = 'DeviceEnrollmentManagers' }
    @{ Match = 'DeviceEnrollment.*Configuration|EnrollmentConfiguration|EnrollmentRestriction|EnrollmentStatusPage'; Perm = 'Organization|DeviceEnrollment' }
    @{ Match = 'TermsAndConditions';                                                                 Perm = 'TermsAndConditions' }
    @{ Match = 'TelecomExpense';                                                                     Perm = 'TelecomExpenses' }
    @{ Match = 'AndroidManagedStore|AndroidForWork|ManagedGooglePlay';                               Perm = 'ManagedGooglePlay|AndroidForWork|Organization' }
    @{ Match = 'AndroidFota|ZebraFota';                                                              Perm = 'AndroidFota' }
    @{ Match = 'SecurityTask|DeviceAppManagementTask';                                               Perm = 'SecurityTasks' }
    @{ Match = 'ManagedDevice|WindowsManagedDevice|DetectedApp|DeviceLogCollection';                 Perm = 'ManagedDevices' }
    @{ Match = 'DeviceCategor|IntuneBrand|ExchangeConnector|MobileThreatDefense|ApplePushNotification|RemoteAssistancePartner|DeviceManagementPartner|DeviceManagement$|Organization'; Perm = 'Organization|MobileThreatDefense|RemoteAssistance|PartnerDeviceManagement' }
)

# Used when the resource type matches nothing above. Keyed on the audit event 'category'.
$CategoryFallback = @{
    'Application'          = 'MobileApps|ManagedApps'
    'Compliance'           = 'DeviceCompliancePolices|DeviceCompliancePolicies'
    'DeviceConfiguration'  = 'DeviceConfigurations'
    'DeviceIntent'         = 'SecurityBaselines|DeviceConfigurations'
    'DeviceIntentSetting'  = 'SecurityBaselines|DeviceConfigurations'
    'Device'               = 'ManagedDevices'
    'Role'                 = 'Roles'
    'Enrollment'           = 'EnrollmentProgramToken|EnrollmentPrograms|Organization|DeviceEnrollmentManagers'
    'SoftwareUpdates'      = 'DeviceConfigurations'
    'EBookManagement'      = 'MobileApps'
}

# Remote device actions: audit verb (lower-case) -> RemoteTasks_<X> regex
$RemoteActionMap = @{
    'wipe'                                 = 'Wipe'
    'retire'                               = 'Retire'
    'rebootnow'                            = 'RebootNow'
    'remotelock'                           = 'RemoteLock'
    'resetpasscode'                        = 'ResetPasscode'
    'recoverpasscode'                      = 'ResetPasscode|RecoverPasscode'
    'syncdevice'                           = 'SyncDevice'
    'shutdown'                             = 'ShutDown'
    'locatedevice'                         = 'LocateDevice'
    'bypassactivationlock'                 = 'BypassActivationLock'
    'cleanwindowsdevice'                   = 'CleanPC'
    'rotatebitlockerkeys'                  = 'RotateBitLockerKeys'
    'rotatefilevaultkey'                   = 'RotateFileVaultKey'
    'rotatelocaladminpassword'             = 'RotateLocalAdminPassword|RotateLaps'
    'windowsdefenderscan'                  = 'WindowsDefender'
    'windowsdefenderupdatesignatures'      = 'WindowsDefender'
    'createdevicelogcollectionrequest'     = 'CollectDiagnostics'
    'enablelostmode'                       = 'EnableLostMode|LostMode'
    'disablelostmode'                      = 'DisableLostMode|LostMode'
    'playlostmodesound'                    = 'PlayLostModeSound|LostMode'
    'deleteuserfromsharedappledevice'      = 'ManageSharedDeviceUsers'
    'logoutsharedappledeviceactiveuser'    = 'ManageSharedDeviceUsers'
    'requestremoteassistance'              = 'RequestRemoteAssistance'
    'initiateondemandproactiveremediation' = 'OnDemandProactiveRemediation|ProactiveRemediation|RunProactiveRemediation'
    'setdevicename'                        = 'SetDeviceName'
    'updatewindowsdeviceaccount'           = 'UpdateWindowsDeviceAccount'
    'pauseconfigurationrefresh'            = 'PauseConfigurationRefresh'
    'triggerconfigurationmanageraction'    = 'ConfigurationManagerAction'
    'changeassignments'                    = 'ChangeAssignments'
    'disableapplicationaccount'            = 'DisableApplicationAccount'
}

# Built-in Entra roles that grant full Intune rights, bypassing Intune RBAC
$EntraFullIntuneRoles = @{
    '62e90394-69f5-4237-9190-012177145e10' = 'Global Administrator'
    '3a2c62db-5318-420d-8d74-23affee5d9d5' = 'Intune Administrator'
}
#endregion

#region ---------------------------------------------------------------- Graph helpers
function Invoke-GraphWithRetry {
    param([Parameter(Mandatory)][string]$Uri, [int]$MaxRetries = 6)
    for ($attempt = 1; ; $attempt++) {
        try {
            return Invoke-MgGraphRequest -Method GET -Uri $Uri -OutputType Hashtable -ErrorAction Stop
        }
        catch {
            $status = $null
            try { $status = [int]$_.Exception.Response.StatusCode } catch { }
            if ($attempt -lt $MaxRetries -and ($status -eq 429 -or $status -ge 500)) {
                $wait = [math]::Min(60, [math]::Pow(2, $attempt))
                try {
                    $ra = $_.Exception.Response.Headers.RetryAfter.Delta.TotalSeconds
                    if ($ra) { $wait = [math]::Ceiling($ra) }
                } catch { }
                Write-Verbose "Graph throttled/failed ($status). Retry $attempt in $wait s: $Uri"
                Start-Sleep -Seconds $wait
                continue
            }
            throw
        }
    }
}

function Invoke-GraphPaged {
    param([Parameter(Mandatory)][string]$Uri)
    $results = New-Object System.Collections.Generic.List[object]
    $next = $Uri
    while ($next) {
        $resp = Invoke-GraphWithRetry -Uri $next
        if ($resp.ContainsKey('value')) {
            foreach ($item in $resp['value']) { $results.Add($item) }
            $next = $resp['@odata.nextLink']
        }
        else {
            $results.Add($resp)
            $next = $null
        }
    }
    return , ($results.ToArray())
}

function Get-Prop {
    # Null-safe nested hashtable access: Get-Prop $obj 'actor' 'userPrincipalName'
    param($Object, [string[]]$Path)
    $cur = $Object
    foreach ($p in $Path) {
        if ($null -eq $cur) { return $null }
        if ($cur -is [System.Collections.IDictionary]) { $cur = $cur[$p] } else { $cur = $cur.$p }
    }
    return $cur
}
#endregion

#region ---------------------------------------------------------------- Audit -> permission mapping
function Get-PermissionRequirement {
    <#
        Returns @{ Mapped; Resource; Verb; Primary (regex); Implied (regex[]); Label }
        for one audit "signature" (activityType + resource types + category + operationType).
    #>
    param(
        [string]$ActivityType,
        [string]$OperationType,
        [string]$Category,
        [string[]]$ResourceTypes
    )

    $parts    = ([string]$ActivityType).Trim() -split '\s+', 2
    $verbRaw  = $parts[0]
    $resRaw   = if ($parts.Count -gt 1) { $parts[1] } else { '' }
    $resString = ((@($resRaw) + @($ResourceTypes)) | Where-Object { $_ }) -join ' '
    $resString = $resString -replace '#?microsoft\.graph\.', ''

    # ---- resource
    $permResource = $null
    foreach ($entry in $ResourceMap) {
        if ($resString -match $entry.Match) { $permResource = $entry.Perm; break }
    }
    if (-not $permResource -and $Category -and $CategoryFallback.ContainsKey($Category)) {
        $permResource = $CategoryFallback[$Category]
    }
    if (-not $permResource) {
        return @{ Mapped = $false; Label = "?? ($ActivityType)" }
    }

    # ---- verb
    $v = $verbRaw.ToLowerInvariant()
    $verb = switch -Regex ($v) {
        '^(create|add|post|upload|import)$'          { 'Create'; break }
        '^(patch|update|put)$'                       { 'Update'; break }
        '^(delete|remove)$'                          { 'Delete'; break }
        '^(assign|updateassignments|setassignments)$' { 'Assign'; break }
        default                                       { $null }
    }
    if (-not $verb) {
        switch ($OperationType) {
            'Create' { $verb = 'Create' }
            'Patch'  { $verb = 'Update' }
            'Delete' { $verb = 'Delete' }
        }
    }
    # Creating/updating/deleting an *assignment* object = the Assign permission on the parent
    $isAssignmentObj = ($resString -match 'Assignment') -and ($resString -notmatch 'RoleAssignment')
    if ($isAssignmentObj -and $verb -in @('Create', 'Update', 'Delete')) { $verb = 'Assign' }
    if ($resString -match 'RoleAssignment' -and $permResource -eq 'Roles') { $verb = 'Assign' }

    $readPattern = '^Microsoft\.Intune_(' + $permResource + ')_Read$'

    if ($verb) {
        return @{
            Mapped   = $true
            Resource = $permResource
            Verb     = $verb
            Primary  = '^Microsoft\.Intune_(' + $permResource + ')_(' + $verb + ')$'
            Implied  = @($readPattern)
            Label    = "Microsoft.Intune_{0}_{1}" -f ($permResource -split '\|')[0], $verb
        }
    }

    # ---- non-CRUD action
    if ($permResource -eq 'ManagedDevices') {
        $task = if ($RemoteActionMap.ContainsKey($v)) { $RemoteActionMap[$v] } else { [regex]::Escape($verbRaw) }
        return @{
            Mapped   = $true
            Resource = 'RemoteTasks'
            Verb     = $verbRaw
            Primary  = '^Microsoft\.Intune_RemoteTasks_(' + $task + ')$'
            Implied  = @('^Microsoft\.Intune_ManagedDevices_Read$')
            Label    = "Microsoft.Intune_RemoteTasks_{0}" -f ($task -split '\|')[0]
        }
    }

    # Any other action, e.g. ManagedApps 'wipe'. Try <Resource>_<Action> directly.
    return @{
        Mapped   = $true
        Resource = $permResource
        Verb     = $verbRaw
        Primary  = '^Microsoft\.Intune_(' + $permResource + ')_(' + [regex]::Escape($verbRaw) + ')$'
        Implied  = @($readPattern)
        Label    = "Microsoft.Intune_{0}_{1}" -f ($permResource -split '\|')[0], $verbRaw
    }
}

function Get-PermissionKind {
    param([string]$Permission)
    $action = ($Permission -split '_')[-1]
    if ($action -match '^(Read|ViewReports|View.*)$') { return 'Read' }
    if ($Permission -match '_RemoteTasks_')            { return 'RemoteAction' }
    return 'Write'
}
#endregion

#region ---------------------------------------------------------------- Connect
if (-not $SkipConnect) {
    if (-not (Get-Module -ListAvailable -Name Microsoft.Graph.Authentication)) {
        throw "Microsoft.Graph.Authentication module not found. Run: Install-Module Microsoft.Graph.Authentication -Scope CurrentUser"
    }
    $scopes = @(
        'DeviceManagementApps.Read.All'
        'DeviceManagementConfiguration.Read.All'
        'DeviceManagementManagedDevices.Read.All'
        'DeviceManagementRBAC.Read.All'
        'DeviceManagementServiceConfig.Read.All'
        'GroupMember.Read.All'
        'RoleManagement.Read.Directory'
    )
    $connectParams = @{ Scopes = $scopes; NoWelcome = $true }
    if ($TenantId) { $connectParams.TenantId = $TenantId }
    Connect-MgGraph @connectParams
}
if (-not (Test-Path $OutputPath)) { New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null }
#endregion

#region ---------------------------------------------------------------- 1. Audit events
$since = (Get-Date).ToUniversalTime().AddDays(-$DaysBack).ToString('yyyy-MM-ddTHH:mm:ssZ')
Write-Host "[1/5] Reading Intune audit events since $since ..." -ForegroundColor Cyan

$auditUri = "$BetaBase/deviceManagement/auditEvents?`$filter=activityDateTime ge $since"
try {
    $auditEvents = Invoke-GraphPaged -Uri $auditUri
}
catch {
    Write-Warning "Server-side date filter failed ($($_.Exception.Message)). Falling back to client-side filtering."
    $sinceDt = [datetime]::Parse($since).ToUniversalTime()
    $auditEvents = (Invoke-GraphPaged -Uri "$BetaBase/deviceManagement/auditEvents") |
        Where-Object { [datetime]$_['activityDateTime'] -ge $sinceDt }
}
Write-Host "      $(@($auditEvents).Count) audit events retrieved."

if (-not $IncludeFailedEvents) {
    $auditEvents = @($auditEvents | Where-Object { [string]$_['activityResult'] -match '^(Success|)$' })
    Write-Host "      $($auditEvents.Count) successful events kept (use -IncludeFailedEvents to keep all)."
}

# Collapse to unique signatures per admin. This keeps the permission matching fast.
$signatures   = @{}   # key -> signature object
$appActors    = @{}   # service principals / apps seen in the log
foreach ($e in $auditEvents) {
    $upn    = [string](Get-Prop $e 'actor', 'userPrincipalName')
    $userId = [string](Get-Prop $e 'actor', 'userId')
    if (-not $upn -and -not $userId) {
        $app = [string](Get-Prop $e 'actor', 'applicationDisplayName')
        if (-not $app) { $app = [string](Get-Prop $e 'actor', 'servicePrincipalName') }
        if (-not $app) { $app = '(unknown actor)' }
        if (-not $appActors.ContainsKey($app)) { $appActors[$app] = 0 }
        $appActors[$app]++
        continue
    }
    $resTypes = @($e['resources'] | ForEach-Object { if ($_) { [string]$_['type'] } } | Where-Object { $_ } | Sort-Object -Unique)
    $key = '{0}|{1}|{2}|{3}|{4}' -f $userId, $e['activityType'], $e['activityOperationType'], $e['category'], ($resTypes -join ',')
    $ts  = [datetime]$e['activityDateTime']
    if (-not $signatures.ContainsKey($key)) {
        $signatures[$key] = [pscustomobject]@{
            UserId        = $userId
            UPN           = $upn
            ActivityType  = [string]$e['activityType']
            OperationType = [string]$e['activityOperationType']
            Category      = [string]$e['category']
            ResourceTypes = $resTypes
            Count         = 0
            FirstSeen     = $ts
            LastSeen      = $ts
            SampleTarget  = [string](Get-Prop @($e['resources'])[0] 'displayName')
        }
    }
    $s = $signatures[$key]
    $s.Count++
    if ($ts -lt $s.FirstSeen) { $s.FirstSeen = $ts }
    if ($ts -gt $s.LastSeen)  { $s.LastSeen = $ts }
    if (-not $s.UPN -and $upn) { $s.UPN = $upn }
}
$activeAdminIds = @($signatures.Values | Select-Object -ExpandProperty UserId -Unique)
Write-Host "      $($signatures.Count) unique activity signatures from $($activeAdminIds.Count) admins."
#endregion

#region ---------------------------------------------------------------- 2. Roles, permissions, assignments
Write-Host "[2/5] Reading Intune role definitions and assignments ..." -ForegroundColor Cyan
$roles = @{}           # roleId -> info
$groupCache = @{}      # groupId -> list of @{Id;UPN}
$userRoles = @{}       # userId -> HashSet of roleIds
$userUpn   = @{}       # userId -> UPN

function Get-GroupUsers {
    param([string]$GroupId)
    if ($groupCache.ContainsKey($GroupId)) { return $groupCache[$GroupId] }
    $users = New-Object System.Collections.Generic.List[object]
    try {
        $members = Invoke-GraphPaged -Uri "$V1Base/groups/$GroupId/transitiveMembers?`$select=id,userPrincipalName"
        foreach ($m in $members) {
            if ([string]$m['@odata.type'] -eq '#microsoft.graph.user') {
                $users.Add(@{ Id = [string]$m['id']; UPN = [string]$m['userPrincipalName'] })
            }
        }
    }
    catch { Write-Warning "Could not expand group $GroupId : $($_.Exception.Message)" }
    $groupCache[$GroupId] = $users
    return $users
}

$roleDefList = Invoke-GraphPaged -Uri "$BetaBase/deviceManagement/roleDefinitions"
foreach ($rdStub in $roleDefList) {
    $rd = Invoke-GraphWithRetry -Uri "$BetaBase/deviceManagement/roleDefinitions/$($rdStub['id'])"
    $perms = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($rp in @($rd['rolePermissions'])) {
        if (-not $rp) { continue }
        foreach ($ra in @($rp['resourceActions'])) {
            if ($ra) { foreach ($a in @($ra['allowedResourceActions'])) { if ($a) { [void]$perms.Add([string]$a) } } }
        }
        foreach ($a in @($rp['actions'])) { if ($a) { [void]$perms.Add([string]$a) } }
    }

    $info = [pscustomobject]@{
        Id          = [string]$rd['id']
        Name        = [string]$rd['displayName']
        IsBuiltIn   = [bool]($rd['isBuiltIn'] -or $rd['isBuiltInRoleDefinition'])
        Permissions = @($perms | Sort-Object)
        Assignments = New-Object System.Collections.Generic.List[object]
        MemberIds   = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    }

    $assignStubs = @()
    try { $assignStubs = Invoke-GraphPaged -Uri "$BetaBase/deviceManagement/roleDefinitions/$($info.Id)/roleAssignments" }
    catch { Write-Warning "Could not list assignments for role '$($info.Name)': $($_.Exception.Message)" }

    foreach ($as in $assignStubs) {
        $full = $as
        try { $full = Invoke-GraphWithRetry -Uri "$BetaBase/deviceManagement/roleAssignments/$($as['id'])" } catch { }
        $memberGroups = @($full['members']) | Where-Object { $_ }
        $info.Assignments.Add([pscustomobject]@{ Name = [string]$full['displayName']; Groups = $memberGroups })
        foreach ($g in $memberGroups) {
            foreach ($u in (Get-GroupUsers -GroupId $g)) {
                [void]$info.MemberIds.Add($u.Id)
                if (-not $userRoles.ContainsKey($u.Id)) {
                    $userRoles[$u.Id] = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
                }
                [void]$userRoles[$u.Id].Add($info.Id)
                $userUpn[$u.Id] = $u.UPN
            }
        }
    }
    $roles[$info.Id] = $info
    Write-Host ("      {0,-45} perms: {1,3}  assignments: {2}  members: {3}" -f $info.Name, $info.Permissions.Count, $info.Assignments.Count, $info.MemberIds.Count)
}
#endregion

#region ---------------------------------------------------------------- 3. Entra roles that bypass Intune RBAC
Write-Host "[3/5] Checking Entra ID roles that bypass Intune RBAC ..." -ForegroundColor Cyan
# Uses the unified role management API so we catch:
#   * direct user assignments
#   * assignments to role-assignable GROUPS (expanded to users)
#   * PIM-eligible assignments (needs Entra ID P2; skipped with a warning if unavailable)
$entraAdmins = @{}   # userId -> HashSet of labels, e.g. "Global Administrator [Active, via group X]"

function Add-EntraAdmin {
    param([string]$UserId, [string]$Upn, [string]$Label)
    if (-not $entraAdmins.ContainsKey($UserId)) {
        $entraAdmins[$UserId] = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    }
    [void]$entraAdmins[$UserId].Add($Label)
    if ($Upn) { $userUpn[$UserId] = $Upn }
}

$entraSources = [ordered]@{
    'Active'   = 'roleManagement/directory/roleAssignments'
    'Eligible' = 'roleManagement/directory/roleEligibilitySchedules'
}
foreach ($tpl in $EntraFullIntuneRoles.Keys) {
    $roleName = $EntraFullIntuneRoles[$tpl]
    foreach ($state in $entraSources.Keys) {
        $uri = "$V1Base/$($entraSources[$state])?`$filter=roleDefinitionId eq '$tpl'&`$expand=principal"
        try { $items = Invoke-GraphPaged -Uri $uri }
        catch {
            Write-Warning "Could not read $state assignments for $roleName ($($_.Exception.Message)). $(if ($state -eq 'Eligible') { 'PIM-eligible admins will not be detected.' })"
            continue
        }
        foreach ($a in $items) {
            $p = $a['principal']
            if (-not $p) { continue }
            $ptype = [string]$p['@odata.type']
            if ($ptype -eq '#microsoft.graph.user') {
                Add-EntraAdmin -UserId ([string]$p['id']) -Upn ([string]$p['userPrincipalName']) -Label "$roleName [$state]"
            }
            elseif ($ptype -eq '#microsoft.graph.group') {
                foreach ($u in (Get-GroupUsers -GroupId ([string]$p['id']))) {
                    Add-EntraAdmin -UserId $u.Id -Upn $u.UPN -Label "$roleName [$state, via group $($p['displayName'])]"
                }
            }
        }
    }
}
function Get-EntraAdminLabel { param([string]$UserId) if ($entraAdmins.ContainsKey($UserId)) { (@($entraAdmins[$UserId]) | Sort-Object) -join '; ' } }
Write-Host "      $($entraAdmins.Count) users hold Global Admin / Intune Admin in Entra ID (active or PIM-eligible, direct or via group)."
#endregion

#region ---------------------------------------------------------------- 4. Match activity to permissions
Write-Host "[4/5] Mapping admin activity to required permissions ..." -ForegroundColor Cyan

# roleId -> permission -> usage record
$usage = @{}
foreach ($r in $roles.Values) { $usage[$r.Id] = @{} }

$activityRows  = New-Object System.Collections.Generic.List[object]
$unmappedRows  = New-Object System.Collections.Generic.List[object]
$actorStats    = @{}   # userId -> per-admin coverage stats (all admins with activity)

function Add-Usage {
    param($RoleId, $Permission, $Sig, [string]$How)
    $bucket = $usage[$RoleId]
    if (-not $bucket.ContainsKey($Permission)) {
        $bucket[$Permission] = [pscustomobject]@{
            EventCount = 0
            UsedHow    = New-Object 'System.Collections.Generic.HashSet[string]'
            UsedBy     = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
            Activities = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
        }
    }
    $rec = $bucket[$Permission]
    $rec.EventCount += $Sig.Count
    [void]$rec.UsedHow.Add($How)
    [void]$rec.UsedBy.Add($(if ($Sig.UPN) { $Sig.UPN } else { $Sig.UserId }))
    [void]$rec.Activities.Add($Sig.ActivityType)
}

foreach ($sig in $signatures.Values) {
    $admin = if ($sig.UPN) { $sig.UPN } else { $sig.UserId }
    $req = Get-PermissionRequirement -ActivityType $sig.ActivityType -OperationType $sig.OperationType `
                                     -Category $sig.Category -ResourceTypes $sig.ResourceTypes
    $myRoles = @()
    if ($userRoles.ContainsKey($sig.UserId)) { $myRoles = @($userRoles[$sig.UserId]) }

    if (-not $req.Mapped) {
        $unmappedRows.Add([pscustomobject]@{
            Admin = $admin; ActivityType = $sig.ActivityType; OperationType = $sig.OperationType
            Category = $sig.Category; ResourceTypes = ($sig.ResourceTypes -join ', '); Count = $sig.Count
            Note = 'Add a pattern to $ResourceMap or $CategoryFallback'
        })
    }

    $isEntraAdmin = $entraAdmins.ContainsKey($sig.UserId)
    $howSuffix    = if ($isEntraAdmin) { ' (by Entra admin)' } else { '' }
    $creditRoles  = -not ($isEntraAdmin -and $ExcludeEntraAdminActivity)

    $coveredBy = New-Object System.Collections.Generic.List[string]
    $matchedPerms = New-Object System.Collections.Generic.List[string]
    if ($req.Mapped) {
        foreach ($rid in $myRoles) {
            $role = $roles[$rid]
            foreach ($p in $role.Permissions) {
                if ($p -match $req.Primary) {
                    if ($creditRoles) { Add-Usage -RoleId $rid -Permission $p -Sig $sig -How "Direct$howSuffix" }
                    $coveredBy.Add($role.Name); $matchedPerms.Add($p)
                }
                elseif ($creditRoles) {
                    foreach ($ip in $req.Implied) {
                        if ($p -match $ip) { Add-Usage -RoleId $rid -Permission $p -Sig $sig -How "ImpliedRead$howSuffix"; break }
                    }
                }
            }
        }
    }

    $covered = $coveredBy.Count -gt 0
    $status =
        if (-not $req.Mapped)               { 'Unmapped activity' }
        elseif ($covered -and $isEntraAdmin) { 'Covered by Intune RBAC (user ALSO holds Entra admin role)' }
        elseif ($covered)                   { 'Covered by Intune RBAC' }
        elseif ($isEntraAdmin)              { 'Only possible via Entra admin role' }
        elseif ($myRoles.Count -eq 0)       { 'No Intune role - Entra role not detected (check PIM history / custom Entra roles)' }
        else                                { 'Not matched to any assigned permission (check mapping)' }

    if (-not $actorStats.ContainsKey($sig.UserId)) {
        $actorStats[$sig.UserId] = [pscustomobject]@{
            Admin = $admin; TotalEvents = 0; CoveredEvents = 0; UncoveredEvents = 0; UnmappedEvents = 0
            UncoveredActivities = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
        }
    }
    $st = $actorStats[$sig.UserId]
    $st.TotalEvents += $sig.Count
    if (-not $req.Mapped) { $st.UnmappedEvents += $sig.Count }
    elseif ($covered)     { $st.CoveredEvents  += $sig.Count }
    else {
        $st.UncoveredEvents += $sig.Count
        [void]$st.UncoveredActivities.Add($sig.ActivityType)
    }

    $activityRows.Add([pscustomobject]@{
        Admin              = $admin
        ActivityType       = $sig.ActivityType
        Category           = $sig.Category
        ResourceTypes      = ($sig.ResourceTypes -join ', ')
        EventCount         = $sig.Count
        FirstSeen          = $sig.FirstSeen
        LastSeen           = $sig.LastSeen
        ExampleTarget      = $sig.SampleTarget
        RequiredPermission = $req.Label
        MatchedPermission  = (($matchedPerms | Sort-Object -Unique) -join '; ')
        GrantedByRoles     = (($coveredBy | Sort-Object -Unique) -join '; ')
        Status             = $status
    })
}
#endregion

#region ---------------------------------------------------------------- 5. Build reports
Write-Host "[5/5] Building reports ..." -ForegroundColor Cyan
$permUsageRows = New-Object System.Collections.Generic.List[object]
$excessRows    = New-Object System.Collections.Generic.List[object]
$summaryRows   = New-Object System.Collections.Generic.List[object]

foreach ($role in ($roles.Values | Sort-Object Name)) {
    $members       = @($role.MemberIds)
    $activeMembers = @($members | Where-Object { $_ -in $activeAdminIds })
    $memberUpns    = ($members | ForEach-Object { if ($userUpn[$_]) { $userUpn[$_] } else { $_ } }) -join '; '

    $usedCount = 0; $excessHigh = 0; $excessRead = 0
    foreach ($p in $role.Permissions) {
        $kind = Get-PermissionKind $p
        $rec  = $usage[$role.Id][$p]
        $used = [bool]$rec

        $permUsageRows.Add([pscustomobject]@{
            Role       = $role.Name
            IsBuiltIn  = $role.IsBuiltIn
            Permission = $p
            Kind       = $kind
            Used       = $(if ($used) { 'Yes' } else { 'No' })
            UsedHow    = $(if ($used) { ($rec.UsedHow -join ', ') } else { '' })
            EventCount = $(if ($used) { $rec.EventCount } else { 0 })
            UsedBy     = $(if ($used) { ($rec.UsedBy -join '; ') } else { '' })
            Activities = $(if ($used) { (@($rec.Activities) | Select-Object -First 10) -join '; ' } else { '' })
        })

        if ($used) { $usedCount++; continue }

        # ---- unused -> excessive?
        if ($members.Count -eq 0) {
            $confidence = 'N/A'
            $reason     = 'Role has no assigned members'
        }
        elseif ($activeMembers.Count -eq 0) {
            $confidence = 'Medium'
            $reason     = "None of the $($members.Count) member(s) made any audited change in $DaysBack days"
        }
        elseif ($kind -eq 'Read') {
            $confidence = 'Low'
            $reason     = 'Reads/views are not written to the Intune audit log, so usage cannot be proven'
        }
        else {
            $confidence = 'High'
            $reason     = "Not used by any of $($activeMembers.Count) active member(s) in $DaysBack days"
        }

        if ($kind -eq 'Read') { $excessRead++ } else { $excessHigh++ }
        if ($kind -eq 'Read' -and -not $TreatReadsAsExcessive -and $members.Count -gt 0) { continue }

        $excessRows.Add([pscustomobject]@{
            Role            = $role.Name
            IsBuiltIn       = $role.IsBuiltIn
            Permission      = $p
            Kind            = $kind
            Confidence      = $confidence
            Reason          = $reason
            Members         = $members.Count
            ActiveMembers   = $activeMembers.Count
            Recommendation  = $(if ($members.Count -eq 0) { 'Delete or ignore the unassigned role' }
                                elseif ($role.IsBuiltIn) { 'Built-in role cannot be edited: replace with a custom role without this permission' }
                                else { 'Remove permission from custom role' })
        })
    }

    $summaryRows.Add([pscustomobject]@{
        Role                     = $role.Name
        IsBuiltIn                = $role.IsBuiltIn
        Assignments              = $role.Assignments.Count
        Members                  = $members.Count
        ActiveMembers            = $activeMembers.Count
        PermissionsGranted       = $role.Permissions.Count
        PermissionsUsed          = $usedCount
        UnusedWriteAndActions    = $excessHigh
        UnusedReads_Unverifiable = $excessRead
        PercentUsed              = $(if ($role.Permissions.Count) { [math]::Round(100 * $usedCount / $role.Permissions.Count, 1) } else { 0 })
        MemberUPNs               = $memberUpns
    })
}

# Every Entra Global/Intune admin (with or without activity), plus anyone whose activity
# wasn't covered by an Intune RBAC permission.
$outsideIds = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
foreach ($id in $entraAdmins.Keys) { [void]$outsideIds.Add($id) }
foreach ($id in $actorStats.Keys)  { if ($actorStats[$id].UncoveredEvents -gt 0) { [void]$outsideIds.Add($id) } }

$outsideRows = foreach ($id in $outsideIds) {
    $st          = $actorStats[$id]
    $entraLabel  = Get-EntraAdminLabel $id
    $intuneNames = if ($userRoles.ContainsKey($id)) { (@($userRoles[$id]) | ForEach-Object { $roles[$_].Name } | Sort-Object) -join '; ' } else { '' }
    $total     = if ($st) { $st.TotalEvents } else { 0 }
    $coveredN  = if ($st) { $st.CoveredEvents } else { 0 }
    $uncovered = if ($st) { $st.UncoveredEvents } else { 0 }

    $finding =
        if ($entraLabel -and $total -eq 0) {
            "Holds Entra admin role but made no audited Intune changes in $DaysBack days. Review whether the role is needed."
        }
        elseif ($entraLabel -and $uncovered -eq 0 -and $intuneNames) {
            'Holds Entra admin role, but all mapped activity is already granted by their Intune roles. The Entra role is redundant for Intune work.'
        }
        elseif ($entraLabel -and $uncovered -gt 0) {
            'Some activity was only possible through the Entra admin role. Add those permissions to an Intune role before removing the Entra role.'
        }
        elseif ($entraLabel) {
            'Holds Entra admin role. Activity seen was unmapped only. Check UnmappedEvents.csv.'
        }
        else {
            'Activity not granted by any assigned Intune permission. Possible causes: a mapping gap, a custom Entra role, or a role removed during the window.'
        }

    [pscustomobject]@{
        Admin                     = $(if ($st) { $st.Admin } elseif ($userUpn[$id]) { $userUpn[$id] } else { $id })
        EntraAdminRoles           = $entraLabel
        IntuneRoles               = $intuneNames
        TotalEvents               = $total
        EventsCoveredByIntuneRBAC = $coveredN
        EventsNotCovered          = $uncovered
        UnmappedEvents            = $(if ($st) { $st.UnmappedEvents } else { 0 })
        ActivitiesNotCovered      = $(if ($st) { (@($st.UncoveredActivities) | Select-Object -First 15) -join '; ' } else { '' })
        Finding                   = $finding
    }
}
$outsideRows = @($outsideRows | Sort-Object @{e = { -not $_.EntraAdminRoles } }, Admin)
$appRows = $appActors.GetEnumerator() | ForEach-Object { [pscustomobject]@{ AppOrServicePrincipal = $_.Key; EventCount = $_.Value } }

# ---- write files
$files = [ordered]@{
    'RoleSummary'                = $summaryRows.ToArray()
    'ExcessivePermissionsByRole' = $excessRows | Sort-Object Role, @{e = { switch ($_.Confidence) { 'High' { 0 } 'Medium' { 1 } 'Low' { 2 } default { 3 } } } }, Permission
    'RolePermissionUsage'        = $permUsageRows.ToArray()
    'AdminActivity'              = $activityRows | Sort-Object Admin, ActivityType
    'AdminsOutsideIntuneRBAC'    = $outsideRows
    'UnmappedEvents'             = $unmappedRows | Sort-Object Count -Descending
    'AppActors'                  = $appRows
}
foreach ($name in $files.Keys) {
    $path = Join-Path $OutputPath "$name.csv"
    @($files[$name]) | Export-Csv -Path $path -NoTypeInformation -Encoding UTF8
}

if (Get-Module -ListAvailable -Name ImportExcel) {
    $xlsx = Join-Path $OutputPath 'IntuneRbacReview.xlsx'
    foreach ($name in $files.Keys) {
        if (@($files[$name]).Count -gt 0) {
            @($files[$name]) | Export-Excel -Path $xlsx -WorksheetName $name -AutoSize -FreezeTopRow -BoldTopRow -AutoFilter
        }
    }
    Write-Host "      Excel workbook: $xlsx" -ForegroundColor Green
}

# ---- console output
Write-Host ""
Write-Host "==================== ROLE SUMMARY ====================" -ForegroundColor Yellow
$summaryRows | Sort-Object UnusedWriteAndActions -Descending |
    Format-Table Role, IsBuiltIn, Members, ActiveMembers, PermissionsGranted, PermissionsUsed, UnusedWriteAndActions, UnusedReads_Unverifiable -AutoSize | Out-String -Width 250 | Write-Host

Write-Host "============ EXCESSIVE PERMISSIONS BY ROLE ============" -ForegroundColor Yellow
foreach ($grp in ($excessRows | Where-Object { $_.Confidence -ne 'N/A' } | Group-Object Role)) {
    Write-Host ""
    Write-Host ("{0}  ({1} unused)" -f $grp.Name, $grp.Count) -ForegroundColor White
    $grp.Group | Format-Table Permission, Kind, Confidence -AutoSize -HideTableHeaders | Out-String -Width 250 | Write-Host
}
$unassigned = @($summaryRows | Where-Object { $_.Members -eq 0 })
if ($unassigned.Count) {
    Write-Host "Roles with no members (all permissions unused): $(($unassigned.Role) -join ', ')" -ForegroundColor DarkGray
}
if (@($outsideRows).Count) {
    $nEntra = @($outsideRows | Where-Object { $_.EntraAdminRoles }).Count
    Write-Host ""
    Write-Warning "$($outsideRows.Count) admin(s) listed in AdminsOutsideIntuneRBAC.csv ($nEntra hold Global/Intune Admin in Entra ID; the rest had activity not granted by Intune RBAC)."
}
if ($unmappedRows.Count) {
    Write-Warning "$($unmappedRows.Count) activity type(s) could not be mapped to a permission. See UnmappedEvents.csv and extend `$ResourceMap."
}
Write-Host ""
Write-Host "Reports written to: $OutputPath" -ForegroundColor Green
#endregion
