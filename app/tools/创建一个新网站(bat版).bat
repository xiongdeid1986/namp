@echo off
rem ��ȡ����ԱȨ��
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
set "basePath=%~dp0"
set "configPath=%basePath%tools\config.conf"
rem �ȶ�ȡ�����ļ�
if exist %configPath% goto getConfig
rem �����ļ�������,ֱ�ӿ�ʼNAMP��������
if not exist %configPath% goto startNAMP
:getConfig
for /f "tokens=1,2 delims==" %%i in (%configPath%) do (
	set %%i=%%j
	rem �����apache������
	if "%%i" EQU "apache_server_name" set "ApacheServerName=%%j"
	if "%%i" EQU "apache_server_name" goto checkApacheServer
)
goto getConfig
rem ���apache�����Ƿ����
:checkApacheServer
SC QUERY %ApacheServerName% > NUL  
IF ERRORLEVEL 1060 GOTO startNAMP  
GOTO CreateStart  
rem ������վ
:CreateStart
rem for /f "skip=3 tokens=4" %%i in ('sc query %apache_server_name%') do set "zt=%%i" &goto :next
rem :next
rem if /i "%zt%"=="RUNNING" (goto 1) //apache��������
rem if /i "%zt%"=="STOPPED" (goto 2) //apache����ֹͣ
echo -------------------����һ������վ--------------------------
echo ϵͳ��������  ��(^o^)�� ...
echo ��������:www.ddweb.com.cn @Ѫ�� ����
echo ^*
rem ѡ����apache����nginx ��Ϊ����
if /i "%WebServerName%" NEQ "" goto NoSetServerName
if /i "%ApcheBasePath%" NEQ "" goto NoSetServerName
if /i "%NginxBasePath%" NEQ "" goto NoSetServerName
if /i "%www_root_BasePath%" NEQ "" goto NoSetServerName
set /p servername=^(1^)ѡ�����з����� (apache^|nginx Enter�س�Ĭ��-^>nginx):
rem ����Ĭ��·��
set "ApcheBasePath=%basePath%Apache24"
set "NginxBasePath=%basePath%Nginx"
goto setwww_root_BasePath

:setwww_root_BasePath
set /p www_root_BasePath=^(2^)������վ·��(Ĭ�� D:\www_root):
if "%www_root_BasePath%" EQU "" set "www_root_BasePath=D:\www_root"
if not exist %www_root_BasePath% echo ��վĿ¼ ^=^> %www_root_BasePath% ������, �ļ���^? O(��_��)O
if not exist %www_root_BasePath% echo ���������� O(��_��)O
if not exist %www_root_BasePath% goto setwww_root_BasePath
goto defaultSetIni;

:defaultSetIni
if /i "%servername%" NEQ "apache" goto echoServerNginx
if /i "%servername%"=="apache" goto echoServerName

:echoServerNginx
set "WebServerName=nginx"
echo -------------------��������Ϣ------------------------------
echo ^*���з������� --^>  %WebServerName%
goto createApacheInit
:echoServerName
set "WebServerName=%servername%"
echo -------------------��������Ϣ------------------------------
echo ^*���з������� --^>  %WebServerName%
goto createApacheInit
rem �Ѿ��з���������ֱ��ʹ��,������������ҳ��������
:NoSetServerName
rem if exist %ApcheBasePath% echo ApcheBasePath is %ApcheBasePath%
rem if exist %NginxBasePath% echo NginxBasePath is %NginxBasePath%
rem if exist %www_root_BasePath% echo www_root_BasePath is %www_root_BasePath%
goto createApacheInit
rem if "%servername%"=="apache" goto createApacheInit
rem if "%servername%"=="nginx" goto createNginx
rem if "%servername%"=="" goto createNginx
rem ʹ��Apache������վ
:createApacheInit
echo ^*��վ����·���� --^> %www_root_BasePath%
echo ^*
echo ^*����һ���µ���վ
echo ^*
goto createApache
:createApache
set /p domain=^(3^)������һ��������:
if "%domain%" EQU "" echo ������������ O(��_��)O ��ʽ: www.xxx.com
if "%domain%" EQU "" goto createApache
echo -----------------------------------------------------------
echo ^* ( T___T ) �ǵý�������ӵ�hosts
echo ^*Hosts·�� --^> C:\Windows\System32\drivers\etc\hosts
echo ^*��Ӹ�ʽ --^> 127.0.0.1 %domain%
echo -----------------------------------------------------------
set /p phpversion=^(4^)ѡ��PHP�İ汾 --^> (52^|53^|54^|55^|56^|70^|71 �س�Ĭ��-^>70):
rem �Ƿ�����д����
set /p rewritepattern=^(5^)ѡ��һ����д����(��������)^?(Ĭ��-^>thinkphp^|):
if "%rewritepattern%" EQU "" set "rewritepattern=thinkphp" 
echo -----------------------------------------------------------
echo ^*��д������ --^> %rewritepattern%
rem û����Ϣ�����¿�ʼ
rem ����������·��
set "NginxWebPathName=%domain:.=_%
rem �������ݿ�
echo ^*�������ݿ� --^> %NginxWebPathName% (����) 
set "createsql=%NginxWebPathName%createsql"
echo CREATE DATABASE IF NOT EXISTS `%NginxWebPathName%`;>> "%ApcheBasePath%\tmp\%createsql%.sql"
net start mysql
mysql -uroot -proot < %ApcheBasePath%\tmp\%createsql%.sql

rem ��ʼ������վ
echo ^*��ʼ������վ --^> (����) 
echo #-------------------------------->> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
echo #%date:~0,10% %time:~0,8% %domain%>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
echo ^<VirtualHost ^*:80^>>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
if /i "%phpversion%"=="52" goto php52
if /i "%phpversion%"=="53" goto php53
if /i "%phpversion%"=="54" goto php54
if /i "%phpversion%"=="55" goto php55
if /i "%phpversion%"=="56" goto php56
if /i "%phpversion%"=="70" goto php70
if /i "%phpversion%"=="" goto phpDefault
if /i "%phpversion%"=="default" goto phpDefault
if /i "%phpversion%"=="71" goto php71
:php52
echo     Include conf/extra/httpd-php-sapi52.conf>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:php53
echo     Include conf/extra/httpd-php-fcgid53.conf>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:php54
echo     Include conf/extra/httpd-php-fcgid54.conf>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:php55
echo     Include conf/extra/httpd-php-fcgid55.conf>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:php56
echo     Include conf/extra/httpd-php-fcgid56.conf>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:php70
echo     Include conf/extra/httpd-php-fcgid70.conf>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:php71
echo     Include conf/extra/httpd-php-fcgid71.conf>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:phpDefault
echo     #Default PHP Version 7.0>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
goto phpgoon
:phpgoon
echo     DocumentRoot "%www_root_BasePath:\=/%/%NginxWebPathName%">> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
echo     ServerName %domain%>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
echo ^</VirtualHost^>>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf"
rem md %www_root_BasePath%\%NginxWebPathName%
rem @xcopy C:\Windows\system32\drivers\etc\hosts C:\Windows\system32\drivers\etc\hosts.bak\ /d /c /i /y
rem @echo 127.0.0.1 %vala%>> C:\Windows\System32\drivers\etc\hosts
rem echo "conteniue"
rem @copy C:\Windows\System32\drivers\etc\hosts.bak\hosts C:\Windows\System32\drivers\etc\hosts /y
rem echo "conteniue"
rem net stop httpd
rem net start httpd
rem D:
rem cd %ApcheBasePath%
rem createWeb.bat
if not exist %www_root_BasePath%\%NginxWebPathName% goto CreateWebFolderExit
:CreateWebFolderExit
D:
md %www_root_BasePath%\%NginxWebPathName%
goto ChangeHost
:ChangeHost
echo ^*���Խ�������ӵ�hosts --^> C:\Windows\system32\drivers\etc\hosts (����) 
@xcopy C:\Windows\system32\drivers\etc\hosts C:\Windows\system32\drivers\etc\hosts.bak\ /d /c /i /y
@echo 127.0.0.1 %domain%>> C:\Windows\System32\drivers\etc\hosts
rem pause > nul
@copy C:\Windows\System32\drivers\etc\hosts.bak\hosts C:\Windows\System32\drivers\etc\hosts /y
rem pause > null
rem echo Apache Web Success
rem ʹ��Nginx��������վ
:createNginx
rem echo Create Nginx Web
rem set /p domain=please_input_domain:
rem set /p NginxWebPathName=please_input_WebPath:
rem set /p phpversion=please_input_phpversion(52^|53^|54^|55^|56^|70^|71 default-^>70):
rem if not exist %www_root_BasePath%\%NginxWebPathName% goto CreateNginxWebExit
rem Nginx����վĿ¼�����ھʹ���
rem :CreateNginxWebExit
rem D:
rem md %www_root_BasePath%\%NginxWebPathName%
rem goto NextNginxA
rem :NextNginxA
if not exist %NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf goto CreateNginxWebConfExit
echo ������վ�Ѿ����� Q_Q  
rem ֱ����ת������������
goto ResetServer
rem Nginx�����ò����ھʹ���
:CreateNginxWebConfExit
rem �������滻��conf �ļ���,����ʶ��
echo #%date:~0,10% %time:~0,8%>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo	server{>> "%ApcheBasePath%\conf\extra\httpd-vhosts.conf">> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		listen	80;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		server_name	%domain%;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		root %www_root_BasePath%\%NginxWebPathName%;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
if /i "%phpversion%"=="52" goto phpN52
if /i "%phpversion%"=="53" goto phpN53
if /i "%phpversion%"=="54" goto phpN54
if /i "%phpversion%"=="55" goto phpN55
if /i "%phpversion%"=="56" goto phpN56
if /i "%phpversion%"=="70" goto phpN70
if /i "%phpversion%"=="" goto phpNDefault
if /i "%phpversion%"=="default" goto phpNDefault
if /i "%phpversion%"=="71" goto phpN71
:phpN52
echo		include php52.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpN53
echo		include php53.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpN54
echo		include php54.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpN55
echo		include php55.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpN56
echo		include php56.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpN70
echo		#Default PHP Version 7.0>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		include php70.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpN71
echo		include php71.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpNDefault
echo		#Default PHP Version 7.0;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		include php70.conf;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto phpNgoon
:phpNgoon
if /i "%rewritepattern%"=="thinkphp" goto thinkphpNrewrite
rem if /i "%rewritepattern%"=="53" goto phpN53
goto NginxGoOnA
:thinkphpNrewrite
rem Nginx ��thinkphp��д����
echo		#thinkphp��д>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		location / {>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo			if (^!-e ^$request_filename) {>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo				rewrite ^^/index.php(.^*)^$ /index.php^?s^=^$1 last;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo				rewrite ^^(.^*)$ /index.php^?s^=^$1 last;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo				break;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo			}>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		}>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
goto NginxGoOnA
:NginxGoOnA
echo		#nginx rewrite for %domain%>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		error_page 403 404 /40x.html;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		error_page 500 502 503 504 /50x.html;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		location ~ /\.ht{>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo			deny all;>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo		}>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo	}>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
echo ^*��վ�����ɹ� (����) 
goto ResetServer
:ResetServer
if "%WebServerName%"=="nginx" goto resetNginx
if "%WebServerName%"=="apache" goto resetApache
:resetNginx
rem ����Nginxǰ��ֹͣapache
echo ^*���������� --^> Nginx (����) 
for /f "skip=3 tokens=4" %%i in ('sc query "%ApacheServerName%"') do set "zt=%%i" &goto resetNginxnext
:resetNginxnext
rem ���apache�ķ���������,��ر�
if /i "%zt%"=="RUNNING" (goto resetA)
if /i "%zt%"=="STOPPED" (goto NoresetA)
:resetA
net stop %ApacheServerName%
goto NoresetA
:NoresetA
taskkill /F /IM nginx.exe > nul
cd %NginxBasePath%\
start nginx.exe
goto IsEnd
:resetApache
rem ����apacheǰ��ֹͣNginx
echo ^*���������� --^> %ApacheServerName% (����)
taskkill /F /IM nginx.exe > nul
net stop %ApacheServerName%
net start %ApacheServerName%
goto IsEnd
rem ����.
:IsEnd
rem ��ձ���
set phpversion=<nul
set domain=<nul
set rewritepattern=<nul
rem ɾ����ʱ��MYSQL�������ݿ�
del %ApcheBasePath%\tmp\%createsql%.sql
rem ���¿�ʼ
goto CreateStart
rem �ٴ�ִ��

rem ����NAMP����
:startNAMP
REM ���������ڣ���ת��exist��ǩ  
rem if not errorlevel 1 (goto exist) else goto notexist  

rem ����apache ��װ������
echo ---------------------------------------------
echo ������װNMAP����...
echo ��������:www.ddweb.com.cn @Ѫ�� ����
echo ---------------------------------------------
echo ^*
echo -----------------��һ��----------------------
echo ^*
echo ^*����Apache������,������װ��ϵͳ����
echo ^*
set /p apache_server_name=(1)������Apache������( ֱ��Enter�س�Ĭ�� ^=^> httpd):
if "%apache_server_name%" EQU "" set "apache_server_name=httpd"
echo ^*
echo -----------------�ڶ���----------------------
echo ^*
echo ^*���ñ�ϵͳ����·��,
echo ^*Ĭ���� D:\web_server ������Ǹ�Ŀ¼,����������·��.
echo ^*
:setBasePath
set /p basePath=(2)���뱾ϵͳ��·��( ֱ��Enter�س�Ĭ�� ^=^> D:\web_server):
rem �����̷�
set "drive=D:"
if "%basePath%" EQU "" set "basePath=%drive%\web_server"
rem �ж�NAMPϵͳ��Ŀ¼�Ƿ����
if exist not %basePath% echo ^*
if exist not %basePath% echo ��ϵͳ��·�� ^=^> %basePath% ������, �ļ���^? O(��_��)O
if exist not %basePath% echo ���������� ��-��
if exist not %basePath% echo ^*
if exist not %basePath% goto setBasePath
rem �ж�ApacheĿ¼�Ƿ����
set "ApachePath=%basePath%\Apache24\bin"
if exist not %ApachePath% echo ^*
if exist not %ApachePath% echo Apache·�� ^=^> %ApachePath% ������, �ļ���^? O(��_��)O
if exist not %ApachePath% echo ���������� ��-��
if exist not %ApachePath% echo ^*
if exist not %ApachePath% goto setBasePath
rem �ж�Nginx�Ƿ����
set "NginxPath=%basePath%\Nginx"
if exist not %NginxPath% echo ^*
if exist not %NginxPath% echo Nginx·�� ^=^> %NginxPath% ������, �ļ���^? O(��_��)O
if exist not %NginxPath% echo ���������� ��-��
if exist not %NginxPath% echo ^*
if exist not %NginxPath% goto setBasePath

rem д�뵽�����ļ�
echo apache_server_name^=%apache_server_name%> "%basePath%\tools\config.conf"
echo nginx_server_name^=nginx.exe>> "%basePath%\tools\config.conf"

rem ����apacheĿ¼����װ
cd %ApachePath%
httpd -k install -n "%apache_server_name%"
echo *apache��װ�ɹ�,������ --^> %apache_server_name% (����) 

rem ��װredis����
cd %basePath%redis"
redis-server --service-install redis.windows.conf
net start redis
echo *redis��װ�ɹ�,���ֶ���ӻ������� Path --^> %basePath%redis (����) 
rem �ֶ���ӻ�������
echo ���Ķ���װ�ɹ�˵��
echo ------^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*------

cmd
