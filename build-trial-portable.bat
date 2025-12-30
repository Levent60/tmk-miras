@echo off
REM Trial Portable EXE build script (batch)
cd /d "%~dp0"
echo Cleaning...
rmdir /s /q dist dist-trial-portable 2>nul

echo Copying .env.trial to .env...
copy /y .env.trial .env >nul

echo Setting package.json for portable build...
powershell -NoProfile -Command ^
  "$pkg = Get-Content package.json | ConvertFrom-Json; " ^
  "$pkg.build.win.target = 'portable'; " ^
  "$pkg.build.artifactName = 'TKM Miras Hesaplayıcı Trial Portable ${version}.exe'; " ^
  "$pkg | ConvertTo-Json | Set-Content package.json"

echo Building portable EXE...
call npm run build 2>&1

echo Renaming dist to dist-trial-portable...
if exist dist (
  if exist dist-trial-portable rmdir /s /q dist-trial-portable
  ren dist dist-trial-portable
)

echo Restoring package.json...
powershell -NoProfile -Command ^
  "$pkg = Get-Content package.json | ConvertFrom-Json; " ^
  "$pkg.build.win.target = 'nsis'; " ^
  "if ($pkg.build | Get-Member -Name artifactName) { $pkg.build.PSObject.Properties.Remove('artifactName') } " ^
  "$pkg | ConvertTo-Json | Set-Content package.json"

echo Done!
