#requires -Version 5.1
<#
.SYNOPSIS
  Sensora 작업 완료 후 빌드·선택적 커밋·push·ChatGPT 보고용 요약 클립보드 복사를 수행합니다.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/chatgpt-report.ps1 `
    -TaskName "랜딩 사용 흐름 신뢰 문구 수정" `
    -Files "lib/i18n.ts" `
    -Summary "landing.flow.footnote 신뢰 문구 반영" `
    -CommitMessage "polish: clarify landing flow trust footnote" `
    -Push

.EXAMPLE
  npm run report:chatgpt -- -DryRun `
    -TaskName "앱 AI 비서 첫 진입 CTA 강화" `
    -Files "app/crm/QuickAiAssistantEntry.tsx" `
    -Summary "메인 CTA 문구 변경 테스트" `
    -CommitMessage "test: verify korean report encoding"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $TaskName,

    [Parameter(Mandatory = $true)]
    [string[]] $Files,

    [Parameter(Mandatory = $true)]
    [string] $Summary,

    [Parameter(Mandatory = $true)]
    [string] $CommitMessage,

    [switch] $Push,

    [switch] $DryRun,

    [switch] $RunBuild
)

$ErrorActionPreference = 'Stop'
$ExpectedRoot = 'C:\Ai\customer-manager-clean'

function Initialize-ReportEncoding {
    $utf8 = New-Object System.Text.UTF8Encoding $false
    try {
        [Console]::InputEncoding = $utf8
        [Console]::OutputEncoding = $utf8
    }
    catch {
        # 일부 호스트에서는 InputEncoding 설정이 제한될 수 있음
        [Console]::OutputEncoding = $utf8
    }
    $OutputEncoding = $utf8
    if ($PSVersionTable.PSVersion.Major -lt 6) {
        chcp 65001 | Out-Null
    }
}

function Write-Step {
    param([string] $Message)
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Exit-WithError {
    param([string] $Message)
    Write-Host ''
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

function Set-ReportClipboard {
    param([string] $Text)
    # Windows: Set-Clipboard → WinForms → clip.exe 순으로 시도
    try {
        Set-Clipboard -Value $Text -ErrorAction Stop
        return $true
    }
    catch {
        # Set-Clipboard 미지원/실패
    }
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
        [System.Windows.Forms.Clipboard]::SetText($Text)
        return $true
    }
    catch {
        # WinForms 클립보드 실패
    }
    try {
        $Text | clip.exe
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    }
    catch {
        # clip.exe 실패
    }
    return $false
}

function Get-NormalizedFiles {
    param([string[]] $RawFiles)
    @(
        foreach ($file in $RawFiles) {
            foreach ($part in ($file -split ',')) {
                $trimmed = $part.Trim()
                if (-not [string]::IsNullOrWhiteSpace($trimmed)) {
                    $trimmed
                }
            }
        }
    ) | Select-Object -Unique
}

function Test-IsToolingOnlyChange {
    param([string[]] $Paths)
    if ($Paths.Count -eq 0) {
        return $false
    }
    foreach ($path in $Paths) {
        $normalized = ($path -replace '\\', '/').Trim().TrimStart('.', '/')
        $isTooling = $normalized -match '^(scripts/|\.github/|package\.json$|package-lock\.json$|AGENTS\.md$)'
        if (-not $isTooling) {
            return $false
        }
    }
    return $true
}

function Get-ReportFooter {
    param(
        [ValidateSet('dryrun', 'tooling', 'ui')]
        [string] $Kind,

        [string] $CommitSha,
        [bool] $DidPush
    )

    if ($Kind -eq 'dryrun') {
        return @{
            VercelSha    = '해당 없음 - DryRun'
            VerifyNeeded = '클립보드에 복사된 한글 보고서 정상 여부 확인'
            NextStep     = '실제 작업 1건에 report:chatgpt 적용 테스트'
        }
    }

    if ($Kind -eq 'tooling') {
        return @{
            VercelSha    = '해당 없음 - 스크립트/도구 작업'
            VerifyNeeded = '스크립트 실행·한글 보고서 인코딩 정상 여부 확인'
            NextStep     = '실제 UI 작업 1건에 report:chatgpt 적용'
        }
    }

    $vercelSha = if ($DidPush) { $CommitSha } else { 'push 후 확인 필요' }
    return @{
        VercelSha    = $vercelSha
        VerifyNeeded = 'Production 화면에서 해당 변경 사항 반영 여부 확인'
        NextStep     = 'Production 데스크톱·모바일 QA'
    }
}

Initialize-ReportEncoding

# 1. 작업 경로 확인
$currentRoot = (Resolve-Path -LiteralPath (Get-Location)).Path
if ($currentRoot -ne $ExpectedRoot) {
    Exit-WithError "작업 경로가 $ExpectedRoot 가 아닙니다. 현재: $currentRoot"
}

Write-Step "작업 경로 확인: $currentRoot"
if ($DryRun) {
    Write-Host "[DryRun] git add / commit / push 는 실행하지 않습니다." -ForegroundColor Yellow
}

# 2. git status
Write-Step 'git status'
git status
if ($LASTEXITCODE -ne 0) {
    Exit-WithError 'git status 실행에 실패했습니다.'
}

# 3. npm run build
$shouldBuild = (-not $DryRun) -or $RunBuild
$buildResult = '미실행 (DryRun)'

if ($shouldBuild) {
    Write-Step 'npm run build'
    npm run build
    if ($LASTEXITCODE -ne 0) {
        if ($DryRun) {
            Exit-WithError 'npm run build 실패.'
        }
        Exit-WithError 'npm run build 실패. 커밋을 중단합니다.'
    }
    $buildResult = '성공'
    Write-Host "npm run build: $buildResult" -ForegroundColor Green
}
else {
    Write-Step 'npm run build (DryRun 생략, -RunBuild 로 실행 가능)'
}

$normalizedFiles = Get-NormalizedFiles -RawFiles $Files
if ($normalizedFiles.Count -eq 0) {
    Exit-WithError '-Files에 추가할 파일이 없습니다.'
}

$pushStatus = '미실행'
$commitSha = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commitSha)) {
    Exit-WithError 'git rev-parse HEAD 실패.'
}

if (-not $DryRun) {
    Write-Step 'git add (지정 파일만)'
    foreach ($file in $normalizedFiles) {
        if (-not (Test-Path -LiteralPath $file)) {
            Exit-WithError "파일을 찾을 수 없습니다: $file"
        }
        Write-Host "  git add $file"
        git add -- $file
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "git add 실패: $file"
        }
    }

    $stagedChanges = git diff --cached --name-only
    if ([string]::IsNullOrWhiteSpace($stagedChanges)) {
        Write-Host ''
        Write-Host '커밋할 변경이 없습니다. 보고 요약만 생성합니다.' -ForegroundColor Yellow
        $pushStatus = if ($Push) { '미실행 (커밋 없음)' } else { '미실행' }
    }
    else {
        Write-Step 'git commit'
        git commit -m $CommitMessage
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError 'git commit 실패.'
        }

        $commitSha = (git rev-parse HEAD).Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commitSha)) {
            Exit-WithError 'git rev-parse HEAD 실패.'
        }

        if ($Push) {
            Write-Step 'git push'
            git push
            if ($LASTEXITCODE -ne 0) {
                Exit-WithError 'git push 실패.'
            }
            $pushStatus = '완료'
        }
    }
}
else {
    $pushStatus = '미실행 (DryRun)'
}

$reportKind = if ($DryRun) {
    'dryrun'
}
elseif (Test-IsToolingOnlyChange -Paths $normalizedFiles) {
    'tooling'
}
else {
    'ui'
}

$didPush = $Push -and -not $DryRun
$footer = Get-ReportFooter -Kind $reportKind -CommitSha $commitSha -DidPush $didPush
$filesLine = ($normalizedFiles -join ', ')
$dryRunNote = if ($DryRun) { ' (DryRun)' } else { '' }

$report = @"
[ChatGPT 보고용 요약]

작업명: $TaskName
수정 파일: $filesLine
핵심 변경: $Summary
npm run build 결과: $buildResult
커밋 메시지: $CommitMessage
커밋 SHA: $commitSha$dryRunNote
push 여부: $pushStatus
Vercel 확인 SHA: $($footer.VercelSha)
대표 확인 필요: $($footer.VerifyNeeded)
남은 이슈: 워킹트리에 요청 범위 외 변경이 남아 있을 수 있음
다음 작업 추천: $($footer.NextStep)
"@

Write-Host ''
Write-Host '--- [ChatGPT 보고용 요약] 미리보기 ---' -ForegroundColor DarkCyan
$previewLines = $report -split "`r?`n"
$previewCount = [Math]::Min(6, $previewLines.Count)
for ($i = 0; $i -lt $previewCount; $i++) {
    Write-Host $previewLines[$i]
}
if ($previewLines.Count -gt $previewCount) {
    Write-Host '...'
}
Write-Host ''
Write-Host $report
Write-Host ''

$clipboardOk = Set-ReportClipboard -Text $report
if ($clipboardOk) {
    Write-Host '(클립보드에도 복사되었습니다.)' -ForegroundColor Green
}
else {
    Write-Host '(클립보드 복사는 실패했습니다. 위 보고 내용을 직접 복사해 주세요.)' -ForegroundColor Yellow
}
