Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$releaseDir = 'D:\UIT Student Release'
$tmpDir = 'D:\UIT Student\.tmp'
$npmCacheDir = 'D:\UIT Student\.npm-cache'
$packageJsonPath = Join-Path $projectRoot 'package.json'
$packageJsonBackup = Get-Content -Raw -LiteralPath $packageJsonPath

if (!(Test-Path -LiteralPath $tmpDir)) {
  New-Item -ItemType Directory -Path $tmpDir | Out-Null
}

if (!(Test-Path -LiteralPath $npmCacheDir)) {
  New-Item -ItemType Directory -Path $npmCacheDir | Out-Null
}

$env:TEMP = $tmpDir
$env:TMP = $tmpDir
$env:npm_config_cache = $npmCacheDir

function Get-AndroidSdkPath {
  $candidates = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA 'Android\Sdk')
  ) | Where-Object { $_ }

  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return $candidate
    }
  }

  throw 'Android SDK not found. Set ANDROID_HOME/ANDROID_SDK_ROOT or install the Android SDK.'
}

Push-Location $projectRoot
try {
  npx expo prebuild --platform android
  if ($LASTEXITCODE -ne 0) {
    throw 'expo prebuild failed.'
  }

  $sdkPath = Get-AndroidSdkPath
  $localPropertiesPath = Join-Path $projectRoot 'android\local.properties'
  $escapedSdkPath = $sdkPath -replace '\\', '\\'
  Set-Content -LiteralPath $localPropertiesPath -Value "sdk.dir=$escapedSdkPath" -NoNewline

  node .\scripts\prepare-android-release.mjs
  if ($LASTEXITCODE -ne 0) {
    throw 'prepare-android-release failed.'
  }

  Push-Location .\android
  try {
    .\gradlew.bat app:bundleRelease --no-daemon
    if ($LASTEXITCODE -ne 0) {
      throw 'Gradle bundleRelease failed.'
    }
  }
  finally {
    Pop-Location
  }

  $appJson = Get-Content -Raw .\app.json | ConvertFrom-Json
  $appName = $appJson.expo.name
  $version = $appJson.expo.version
  $versionCode = $appJson.expo.android.versionCode
  $sourceAab = Join-Path $projectRoot 'android\app\build\outputs\bundle\release\app-release.aab'

  if (!(Test-Path -LiteralPath $sourceAab)) {
    throw "AAB not found at $sourceAab"
  }

  if (!(Test-Path -LiteralPath $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir | Out-Null
  }

  $targetAab = Join-Path $releaseDir "$appName-$version-$versionCode.aab"
  Copy-Item -LiteralPath $sourceAab -Destination $targetAab -Force

  Write-Host "Release AAB exported to: $targetAab"
}
finally {
  Set-Content -LiteralPath $packageJsonPath -Value $packageJsonBackup -NoNewline
  Pop-Location
}
