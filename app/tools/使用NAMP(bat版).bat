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

rem 设置apache 安装服务名
echo -------------------------------------------------------------
echo 即将安装NMAP环境...
echo 动点世纪:www.ddweb.com.cn @血狼 开发
echo -------------------------------------------------------------
echo ^*
echo -----------------第一步--------------------------------------
echo ^*
echo ^*设置Apache服务名,将被安装到系统服务
echo ^*
set /p apache_server_name=(1)请输入Apache服务名( 直接Enter回车默认 ^=^> httpd):
if "%apache_server_name%" EQU "" set "apache_server_name=httpd"
echo ^*
echo -----------------第二步--------------------------------------
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
echo anmp_base_path^=%basePath%>> "%basePath%\tools\config.conf"

echo -------------------------------------------------------------
rem 进入apache目录并安装
SC QUERY %apache_server_name% > NUL  
IF ERRORLEVEL 1060 GOTO installApache
GOTO apacheNoinstall
:installApache
cd %ApachePath%
httpd -k install -n "%apache_server_name%"
echo *apache安装成功,服务名 --^> %apache_server_name% (．．) 
goto apacheNoinstall
:apacheNoinstall
echo *apache已经安装过,服务名 --^> %apache_server_name% (．．) 
rem 安装redis服务
SC QUERY Redis > NUL  
IF ERRORLEVEL 1060 GOTO installRedis 
GOTO RedisNoinstall
:installRedis
cd %basePath%\redis"
redis-server --service-install redis.windows.conf
net start Redis
echo *Redis 安装成功 服务名 --^> Redis (．．) 
echo *redis 安装成功,请手动添加环境变量 Path --^> %basePath%\redis (．．) 
:RedisNoinstall
echo *redis 已经安装过了 Path --^> %basePath%\redis (．．) 
rem 手动添加环境变量

rem 使用PHP修改INI文件
cd %basePath%\tools
%basePath%\php\php-5.4.45\php %basePath%\tools\tools.php
echo *php.ini 配置成功 --^> (．．) 
set /p www_root_path=(3)输入网站存放路径 ^=^> 回车默认 D:\www_root):
if "%www_root_path%" EQU "" set "www_root_path=D:\www_root\"
echo %www_root_path%
if exist %www_root_path% (echo ^*网站目录已经存在 --^> %www_root_path% ) else (md %www_root_path%)
echo 请阅读安装成功说明
echo ------^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*^*------
rem 最后收尾工作
rem 复制php.ini
%basePath%\tools\copy_php_ini.bat
cmd
