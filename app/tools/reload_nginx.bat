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
title ^*�������ͿƼ�(www.ddweb.com.cn) NAMP--^>Nginx���ع���
echo ^*
echo ^*
echo -----------------------------��(^o^)��-------------------
echo ^*�������ͿƼ�(www.ddweb.com.cn) NAMP--^>Nginx���ع��� 
echo ^*
echo ^*
echo ^*
cd D:/web_server/app/nginx
nginx -s reload
echo ��������Nginx���óɹ�

cmd