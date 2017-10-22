@echo off
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
title ^*动点世纪科技(www.ddweb.com.cn) NAMP--^>apache重启
echo ^*
echo ^*
echo -----------------------------└(^o^)┘-------------------
echo ^*动点世纪科技(www.ddweb.com.cn) NAMP--^>apache重启 
echo ^*
echo ^*
echo ^*
taskkill /F /IM nginx.exe
taskkill /F /IM php-cgi.exe
net stop httpd
net start httpd

cmd