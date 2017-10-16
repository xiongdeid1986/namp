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
set "basePath=%~dp0"
set "configPath=%basePath%tools\config.conf"
rem 先读取配置文件
if exist %configPath% goto getConfig
rem 配置文件不存在,直接开始NAMP环境配置
if not exist %configPath% goto startNAMP
:getConfig
for /f "tokens=1,2 delims==" %%i in (%configPath%) do (
	set %%i=%%j
	rem 如果有apache服务器
	if "%%i" EQU "apache_server_name" set "ApacheServerName=%%j"
	if "%%i" EQU "apache_server_name" goto checkApacheServer
)
goto getConfig
rem 检查apache服务是否存在
:checkApacheServer
SC QUERY %ApacheServerName% > NUL  
IF ERRORLEVEL 1060 GOTO startNAMP  
GOTO CreateStart  
rem 创建网站
:CreateStart
rem for /f "skip=3 tokens=4" %%i in ('sc query %apache_server_name%') do set "zt=%%i" &goto :next
rem :next
rem if /i "%zt%"=="RUNNING" (goto 1) //apache服务运行
rem if /i "%zt%"=="STOPPED" (goto 2) //apache服务停止
echo -------------------建立一个新网站--------------------------
echo 系统配置正常  └(^o^)┘ ...
echo 动点世纪:www.ddweb.com.cn @血狼 开发
echo ^*
rem 选择是apache还是nginx 作为服务
if /i "%WebServerName%" NEQ "" goto NoSetServerName
if /i "%ApcheBasePath%" NEQ "" goto NoSetServerName
if /i "%NginxBasePath%" NEQ "" goto NoSetServerName
if /i "%www_root_BasePath%" NEQ "" goto NoSetServerName
set /p servername=^(1^)选择运行服务器 (apache^|nginx Enter回车默认-^>nginx):
rem 设置默认路径
set "ApcheBasePath=%basePath%Apache24"
set "NginxBasePath=%basePath%Nginx"
goto setwww_root_BasePath

:setwww_root_BasePath
set /p www_root_BasePath=^(2^)设置网站路径(默认 D:\www_root):
if "%www_root_BasePath%" EQU "" set "www_root_BasePath=D:\www_root"
if not exist %www_root_BasePath% echo 网站目录 ^=^> %www_root_BasePath% 不存在, 文件呢^? O(∩_∩)O
if not exist %www_root_BasePath% echo 请重新设置 O(∩_∩)O
if not exist %www_root_BasePath% goto setwww_root_BasePath
goto defaultSetIni;

:defaultSetIni
if /i "%servername%" NEQ "apache" goto echoServerNginx
if /i "%servername%"=="apache" goto echoServerName

:echoServerNginx
set "WebServerName=nginx"
echo -------------------服务器信息------------------------------
echo ^*运行服务器是 --^>  %WebServerName%
goto createApacheInit
:echoServerName
set "WebServerName=%servername%"
echo -------------------服务器信息------------------------------
echo ^*运行服务器是 --^>  %WebServerName%
goto createApacheInit
rem 已经有服务器名由直接使用,跳过再设置网页服务器名
:NoSetServerName
rem if exist %ApcheBasePath% echo ApcheBasePath is %ApcheBasePath%
rem if exist %NginxBasePath% echo NginxBasePath is %NginxBasePath%
rem if exist %www_root_BasePath% echo www_root_BasePath is %www_root_BasePath%
goto createApacheInit
rem if "%servername%"=="apache" goto createApacheInit
rem if "%servername%"=="nginx" goto createNginx
rem if "%servername%"=="" goto createNginx
rem 使用Apache创建网站
:createApacheInit
echo ^*网站基本路径是 --^> %www_root_BasePath%
echo ^*
echo ^*创建一个新的网站
echo ^*
goto createApache
:createApache
set /p domain=^(3^)请输入一个绑定域名:
if "%domain%" EQU "" echo 请先输入域名 O(∩_∩)O 格式: www.xxx.com
if "%domain%" EQU "" goto createApache
echo -----------------------------------------------------------
echo ^* ( T___T ) 记得将域名添加到hosts
echo ^*Hosts路径 --^> C:\Windows\System32\drivers\etc\hosts
echo ^*添加格式 --^> 127.0.0.1 %domain%
echo -----------------------------------------------------------
set /p phpversion=^(4^)选择PHP的版本 --^> (52^|53^|54^|55^|56^|70^|71 回车默认-^>70):
rem 是否有重写规则
set /p rewritepattern=^(5^)选择一个重写规则(可以跳过)^?(默认-^>thinkphp^|):
if "%rewritepattern%" EQU "" set "rewritepattern=thinkphp" 
echo -----------------------------------------------------------
echo ^*重写规则是 --^> %rewritepattern%
rem 没有信息则重新开始
rem 将域名换成路径
set "NginxWebPathName=%domain:.=_%
rem 建立数据库
echo ^*建立数据库 --^> %NginxWebPathName% (．．) 
set "createsql=%NginxWebPathName%createsql"
echo CREATE DATABASE IF NOT EXISTS `%NginxWebPathName%`;>> "%ApcheBasePath%\tmp\%createsql%.sql"
net start mysql
mysql -uroot -proot < %ApcheBasePath%\tmp\%createsql%.sql

rem 开始建立网站
echo ^*开始建立网站 --^> (．．) 
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
echo ^*尝试将域名添加到hosts --^> C:\Windows\system32\drivers\etc\hosts (．．) 
@xcopy C:\Windows\system32\drivers\etc\hosts C:\Windows\system32\drivers\etc\hosts.bak\ /d /c /i /y
@echo 127.0.0.1 %domain%>> C:\Windows\System32\drivers\etc\hosts
rem pause > nul
@copy C:\Windows\System32\drivers\etc\hosts.bak\hosts C:\Windows\System32\drivers\etc\hosts /y
rem pause > null
rem echo Apache Web Success
rem 使用Nginx来创建网站
:createNginx
rem echo Create Nginx Web
rem set /p domain=please_input_domain:
rem set /p NginxWebPathName=please_input_WebPath:
rem set /p phpversion=please_input_phpversion(52^|53^|54^|55^|56^|70^|71 default-^>70):
rem if not exist %www_root_BasePath%\%NginxWebPathName% goto CreateNginxWebExit
rem Nginx的网站目录不存在就创建
rem :CreateNginxWebExit
rem D:
rem md %www_root_BasePath%\%NginxWebPathName%
rem goto NextNginxA
rem :NextNginxA
if not exist %NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf goto CreateNginxWebConfExit
echo ＊该网站已经存在 Q_Q  
rem 直接跳转到重启服务器
goto ResetServer
rem Nginx的配置不存在就创建
:CreateNginxWebConfExit
rem 将域名替换成conf 文件名,便于识别
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
rem Nginx 的thinkphp重写规则
echo		#thinkphp重写>> "%NginxBasePath%\conf\vhost\z_%NginxWebPathName%.conf"
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
echo ^*网站创建成功 (．．) 
goto ResetServer
:ResetServer
if "%WebServerName%"=="nginx" goto resetNginx
if "%WebServerName%"=="apache" goto resetApache
:resetNginx
rem 重启Nginx前先停止apache
echo ^*重启服务器 --^> Nginx (．．) 
for /f "skip=3 tokens=4" %%i in ('sc query "%ApacheServerName%"') do set "zt=%%i" &goto resetNginxnext
:resetNginxnext
rem 如果apache的服务是启动,则关闭
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
rem 重启apache前先停止Nginx
echo ^*重启服务器 --^> %ApacheServerName% (．．)
taskkill /F /IM nginx.exe > nul
net stop %ApacheServerName%
net start %ApacheServerName%
goto IsEnd
rem 结束.
:IsEnd
rem 清空变量
set phpversion=<nul
set domain=<nul
set rewritepattern=<nul
rem 删除临时的MYSQL创建数据库
del %ApcheBasePath%\tmp\%createsql%.sql
rem 重新开始
goto CreateStart
rem 再次执行

rem 开启NAMP服务
:startNAMP
REM 如果服务存在，跳转至exist标签  
rem if not errorlevel 1 (goto exist) else goto notexist  

rem 设置apache 安装服务名
echo ---------------------------------------------
echo 即将安装NMAP环境...
echo 动点世纪:www.ddweb.com.cn @血狼 开发
echo ---------------------------------------------
echo ^*
echo -----------------第一步----------------------
echo ^*
echo ^*设置Apache服务名,将被安装到系统服务
echo ^*
set /p apache_server_name=(1)请输入Apache服务名( 直接Enter回车默认 ^=^> httpd):
if "%apache_server_name%" EQU "" set "apache_server_name=httpd"
echo ^*
echo -----------------第二步----------------------
echo ^*
echo ^*设置本系统放置路径,
echo ^*默认是 D:\web_server 如果不是该目录,请输入完整路径.
echo ^*
:setBasePath
set /p basePath=(2)输入本系统的路径( 直接Enter回车默认 ^=^> D:\web_server):
rem 设置盘符
set "drive=D:"
if "%basePath%" EQU "" set "basePath=%drive%\web_server"
rem 判断NAMP系统的目录是否存在
if exist not %basePath% echo ^*
if exist not %basePath% echo 本系统的路径 ^=^> %basePath% 不存在, 文件呢^? O(∩_∩)O
if exist not %basePath% echo 请重新输入 ●-●
if exist not %basePath% echo ^*
if exist not %basePath% goto setBasePath
rem 判断Apache目录是否存在
set "ApachePath=%basePath%\Apache24\bin"
if exist not %ApachePath% echo ^*
if exist not %ApachePath% echo Apache路径 ^=^> %ApachePath% 不存在, 文件呢^? O(∩_∩)O
if exist not %ApachePath% echo 请重新输入 ●-●
if exist not %ApachePath% echo ^*
if exist not %ApachePath% goto setBasePath
rem 判断Nginx是否存在
set "NginxPath=%basePath%\Nginx"
if exist not %NginxPath% echo ^*
if exist not %NginxPath% echo Nginx路径 ^=^> %NginxPath% 不存在, 文件呢^? O(∩_∩)O
if exist not %NginxPath% echo 请重新输入 ●-●
if exist not %NginxPath% echo ^*
if exist not %NginxPath% goto setBasePath

rem 写入到配置文件
echo apache_server_name^=%apache_server_name%> "%basePath%\tools\config.conf"
echo nginx_server_name^=nginx.exe>> "%basePath%\tools\config.conf"

rem 进入apache目录并安装
cd %ApachePath%
httpd -k install -n "%apache_server_name%"
echo *apache安装成功,服务名 --^> %apache_server_name% (．．) 

rem 安装redis服务
cd %basePath%redis"
redis-server --service-install redis.windows.conf
net start redis
echo *redis安装成功,请手动添加环境变量 Path --^> %basePath%redis (．．) 
rem 手动添加环境变量
echo 请阅读安装成功说明
echo ------^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*------

cmd
