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
title ^*动点世纪科技(www.ddweb.com.cn) NAMP--^>Nginx重载工具
echo ^*
echo ^*
echo -----------------------------└(^o^)┘-------------------
echo ^*动点世纪科技(www.ddweb.com.cn) NAMP--^>Nginx重载工具 
echo ^*
echo ^*
echo ^*
cd D:/web_server/app/nginx
nginx -s reload
echo 重新载入Nginx配置成功

cmd