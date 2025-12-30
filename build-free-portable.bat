@echo off
REM Free Portable EXE build script (batch)
cd /d "%~dp0"
echo Cleaning...
rmdir /s /q dist dist-free-portable 2>nul

echo Copying .env.free to .env...
copy /y .env.free .env >nul

echo Setting package.json for portable build...
powershell -NoProfile -Command ^
  "$pkg = Get-Content package.json | ConvertFrom-Json; " ^
  "$pkg.build.win.target = 'portable'; " ^
  "$pkg.build.artifactName = 'TKM Miras Hesaplayıcı SERBEST Portable ${version}.exe'; " ^
  "$pkg | ConvertTo-Json | Set-Content package.json"

echo Building portable EXE...
call npm run build 2>&1

echo Renaming dist to dist-free-portable...
if exist dist (
  if exist dist-free-portable rmdir /s /q dist-free-portable
  ren dist dist-free-portable
)

echo Restoring package.json...
powershell -NoProfile -Command ^
  "$pkg = Get-Content package.json | ConvertFrom-Json; " ^
  "$pkg.build.win.target = 'nsis'; " ^
  "if ($pkg.build | Get-Member -Name artifactName) { $pkg.build.PSObject.Properties.Remove('artifactName') } " ^
  "$pkg | ConvertTo-Json | Set-Content package.json"

echo Done!
