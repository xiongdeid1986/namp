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

rem ����apache ��װ������
echo -------------------------------------------------------------
echo ������װNMAP����...
echo ��������:www.ddweb.com.cn @Ѫ�� ����
echo -------------------------------------------------------------
echo ^*
echo -----------------��һ��--------------------------------------
echo ^*
echo ^*����Apache������,������װ��ϵͳ����
echo ^*
set /p apache_server_name=(1)������Apache������( ֱ��Enter�س�Ĭ�� ^=^> httpd):
if "%apache_server_name%" EQU "" set "apache_server_name=httpd"
echo ^*
echo -----------------�ڶ���--------------------------------------
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
echo anmp_base_path^=%basePath%>> "%basePath%\tools\config.conf"

echo -------------------------------------------------------------
rem ����apacheĿ¼����װ
SC QUERY %apache_server_name% > NUL  
IF ERRORLEVEL 1060 GOTO installApache
GOTO apacheNoinstall
:installApache
cd %ApachePath%
httpd -k install -n "%apache_server_name%"
echo *apache��װ�ɹ�,������ --^> %apache_server_name% (����) 
goto apacheNoinstall
:apacheNoinstall
echo *apache�Ѿ���װ��,������ --^> %apache_server_name% (����) 
rem ��װredis����
SC QUERY Redis > NUL  
IF ERRORLEVEL 1060 GOTO installRedis 
GOTO RedisNoinstall
:installRedis
cd %basePath%\redis"
redis-server --service-install redis.windows.conf
net start Redis
echo *Redis ��װ�ɹ� ������ --^> Redis (����) 
echo *redis ��װ�ɹ�,���ֶ���ӻ������� Path --^> %basePath%\redis (����) 
:RedisNoinstall
echo *redis �Ѿ���װ���� Path --^> %basePath%\redis (����) 
rem �ֶ���ӻ�������

rem ʹ��PHP�޸�INI�ļ�
cd %basePath%\tools
%basePath%\php\php-5.4.45\php %basePath%\tools\tools.php
echo *php.ini ���óɹ� --^> (����) 
set /p www_root_path=(3)������վ���·�� ^=^> �س�Ĭ�� D:\www_root):
if "%www_root_path%" EQU "" set "www_root_path=D:\www_root\"
echo %www_root_path%
if exist %www_root_path% (echo ^*��վĿ¼�Ѿ����� --^> %www_root_path% ) else (md %www_root_path%)
echo ���Ķ���װ�ɹ�˵��
echo ------^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*------
rem �����β����
rem ����php.ini
%basePath%\tools\copy_php_ini.bat
cmd
