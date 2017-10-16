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
net stop httpd
cd D:\web_server\Nginx
echo "开始重启Nginx "
taskkill /F /IM nginx.exe > nul
taskkill /F /IM php-cgi.exe > nul
D:\web_server\tools\RunHiddenConsole D:\web_server\php\php-5.2.17\php-cgi.exe -b 127.0.0.1:9052 -c D:\web_server\php\php-5.2.17\php.ini
D:\web_server\tools\RunHiddenConsole D:\web_server\php\php53n\php-cgi.exe -b 127.0.0.1:9053 -c D:\web_server\php\php53n\php.ini
D:\web_server\tools\RunHiddenConsole D:\web_server\php\php54n\php-cgi.exe -b 127.0.0.1:9054 -c D:\web_server\php\php54n\php.ini
D:\web_server\tools\RunHiddenConsole D:\web_server\php\php55n\php-cgi.exe -b 127.0.0.1:9055 -c D:\web_server\php\php55n\php.ini
D:\web_server\tools\RunHiddenConsole D:\web_server\php\php-5.6.27-nts\php-cgi.exe -b 127.0.0.1:9056 -c D:\web_server\php\php-5.6.27-nts\php.ini
D:\web_server\tools\RunHiddenConsole D:\web_server\php\php-7.0.12-nts\php-cgi.exe -b 127.0.0.1:9070 -c D:\web_server\php\php-7.0.12-nts\php.ini
D:\web_server\tools\RunHiddenConsole D:\web_server\php\php-7.1.4-nts\php-cgi.exe -b 127.0.0.1:9070 -c D:\web_server\php\php-7.1.4-nts\php.ini
start nginx.exe
echo "重启结束 "
cmd