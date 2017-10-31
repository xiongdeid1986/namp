@echo off
rem 获取管理员权限
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
"%temp%\getadmin.vbs"
exit /B
:gotAdmin
if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
pushd "%CD%"
CD /D "%~dp0"
set "BasePath=%~dp0"
rem echo %BasePath%app\tools\node_tools
cd %BasePath%app\tools\node_tools
rem if exist not %basePath%\config.json echo {"base_path":"%BasePath%"}> "%basePath%\config.json"
%BasePath%app\nodejs\node.exe main.js
cmd