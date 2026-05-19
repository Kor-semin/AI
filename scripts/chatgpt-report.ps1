#requires -Version 5.1
<#
.SYNOPSIS
  Sensora 작업 완료 후 빌드·선택적 커밋·push·ChatGPT 보고용 요약 클립보드 복사를 수행합니다.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/chatgpt-report.ps1 `
    -TaskName "랜딩 사용 흐름 신뢰 문구 수정" `
    -Files "lib/i18n.ts" `
    -Summary "landing.flow.footnote 신뢰 문구 반영" `
    -CommitMessage "polish: clarify landing flow trust footnote" `
    -Push
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

    [switch] $Push
)

$ErrorActionPreference = 'Stop'
$ExpectedRoot = 'C:\Ai\customer-manager-clean'

function Write-Step {
    param([string] $Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Exit-WithError {
    param([string] $Message)
    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

# 1. 작업 경로 확인
$currentRoot = (Resolve-Path -LiteralPath (Get-Location)).Path
if ($currentRoot -ne $ExpectedRoot) {
    Exit-WithError "작업 경로가 $ExpectedRoot 가 아닙니다. 현재: $currentRoot"
}

Write-Step "작업 경로 확인: $currentRoot"

# 2. git status
Write-Step "git status"
git status
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "git status 실행에 실패했습니다."
}

# 3. npm run build
Write-Step "npm run build"
npm run build
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "npm run build 실패. 커밋을 중단합니다."
}
$buildResult = '성공'
Write-Host "npm run build: $buildResult" -ForegroundColor Green

# 4. 지정 파일만 git add (git add . 금지)
$normalizedFiles = @(
    foreach ($file in $Files) {
        $trimmed = $file.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }
        $trimmed
    }
) | Select-Object -Unique

if ($normalizedFiles.Count -eq 0) {
    Exit-WithError "-Files에 추가할 파일이 없습니다."
}

Write-Step "git add (지정 파일만)"
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

# 5. 커밋
$stagedChanges = git diff --cached --name-only
if ([string]::IsNullOrWhiteSpace($stagedChanges)) {
    Write-Host ""
    Write-Host "커밋할 변경이 없습니다." -ForegroundColor Yellow
    exit 0
}

Write-Step "git commit"
git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "git commit 실패."
}

# 6. push (옵션)
$pushStatus = '미실행'
if ($Push) {
    Write-Step "git push"
    git push
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "git push 실패."
    }
    $pushStatus = '완료'
}

# 7. 커밋 SHA
$commitSha = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($commitSha)) {
    Exit-WithError "git rev-parse HEAD 실패."
}

$vercelSha = if ($Push) { $commitSha } else { 'push 후 확인 필요' }
$filesLine = ($normalizedFiles -join ', ')

# 8–9. ChatGPT 보고용 요약 생성 및 클립보드 복사
$report = @"
[ChatGPT 보고용 요약]

작업명: $TaskName
수정 파일: $filesLine
핵심 변경: $Summary
npm run build 결과: $buildResult
커밋 메시지: $CommitMessage
커밋 SHA: $commitSha
push 여부: $pushStatus
Vercel 확인 SHA: $vercelSha
대표 확인 필요: Production 화면에서 해당 변경 사항 반영 여부 확인
남은 이슈: 워킹트리에 요청 범위 외 변경이 남아 있을 수 있음
다음 작업 추천: Production 데스크톱·모바일 QA
"@

Set-Clipboard -Value $report

# 10. 완료 메시지
Write-Host ""
Write-Host $report
Write-Host ""
Write-Host "ChatGPT 보고용 요약을 클립보드에 복사했습니다." -ForegroundColor Green
