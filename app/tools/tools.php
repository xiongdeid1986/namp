<?php
header("Content-Type:text/html,charset=utf-8");
error_reporting(E_ALL^E_NOTICE^E_WARNING);
$config = file_get_contents("./config.conf");
preg_match("/anmp_base_path\=(.+)/",$config,$a);
preg_match("/(?<=apache_server_name\=).*/",$config,$b);
/*取得apache服务*/
$apache_server_name = @$b[0];
$apache_server_name = trim($apache_server_name);

$base_path = @$a[0];
if(empty($base_path)){exit();}
$basePath = preg_replace("/anmp_base_path\=(.+)/","$1",$base_path);
$basePath = rtrim($basePath,"\\");
$basePath = rtrim($basePath,"/");
$basePath = trim($basePath);
$basePath = $basePath."\\";

$path = ".".DIRECTORY_SEPARATOR."..".DIRECTORY_SEPARATOR."php".DIRECTORY_SEPARATOR;
//$path = "D:".DIRECTORY_SEPARATOR."web_server".DIRECTORY_SEPARATOR."php".DIRECTORY_SEPARATOR;
$dirs = scandir($path,1);
unset($dirs[count($dirs) - 1]);
unset($dirs[count($dirs) - 1]);
$bat = "@echo off";
foreach($dirs as $v){
	$phpini_path = $path.$v.DIRECTORY_SEPARATOR."php.ini";
	$phpini_text = file_get_contents($phpini_path);
	$basePath = preg_replace("/\//","\\",$basePath);
	$extension_dir = $basePath."php/".$v."/ext";
	$extension_dir = preg_replace("/\//","\\",$extension_dir);
	$phpini_text = preg_replace("/\n\s*extension_dir.*/","\nextension_dir = \"{$extension_dir}\"",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_ifx\.dll)/","\n;$1",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_oci8\.dll)/","\n;$1",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_pdo_oci\.dll)/","\n;$1",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_pdo_oci8\.dll)/","\n;$1",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_snmp\.dll)/","\n;$1",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_sybase_ct\.dll)/","\n;$1",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_mongo\.dll)/","\n;$1",$phpini_text);
	$phpini_text = preg_replace("/\n\s*(extension.*?php_ibm_db2\.dll)/","\n;$1",$phpini_text);
	
	$phpini_text = preg_replace("/D\:\\\web_server\\\/",$basePath,$phpini_text);
	
	$phpini_text = preg_replace("/\n\s*max_execution_time.*/","\nmax_execution_time = 0",$phpini_text);
	$phpini_text = preg_replace("/\n\s*max_input_time.*/","\nmax_input_time = 0",$phpini_text);
	$phpini_text = preg_replace("/\n\s*post_max_size.*/","\npost_max_size = 1024M",$phpini_text);
	$phpini_text = preg_replace("/\n\s*upload_max_filesize.*/","\nupload_max_filesize = 1024M",$phpini_text);
	$phpini_text = preg_replace("/\n\s*max_file_uploads.*/","\nmax_file_uploads = 2000",$phpini_text);
	$phpini_text = preg_replace("/\n\s*max_input_vars.*/","\nmax_input_vars = 10000",$phpini_text);
	$phpini_text = preg_replace_callback("/(D\:.+)/",function($matchs){
		return preg_replace("/\//","\\",$matchs[0]);
	},$phpini_text);
	$phpini_text=iconv("gb2312","utf-8",$phpini_text);
	file_put_contents($phpini_path."bak",$phpini_text);
	
	$bat .= "\ncopy {$basePath}php\\{$v}\\php.inibak {$basePath}php\\{$v}\\php.ini /y";
}
$bat .="\nCMD";
/*生成复制PHP文件*/
file_put_contents("./copy_php_ini.bat",$bat);
/*生成安装mariadb文件*/
$install_mariadb = "@echo off
cd {$basePath}mariadb
mysqld.exe --install-manual \"mysql\" 
mysqld.exe --initialize
net start mysql";
file_put_contents("./install_mysql.bat",$install_mariadb);

/*生成安装apache文件*/
$install_apache = '@echo off
echo test_apache
D:
cd '.$basePath.'Apache24\bin
httpd -k install -n "httpd"';
file_put_contents("./install_apache.bat",$install_apache);

/*写入重写Nginx*/
$re_start_nginx = "rem 获取管理员权限
>nul 2>&1 \"%SYSTEMROOT%\system32\cacls.exe\" \"%SYSTEMROOT%\system32\config\system\"
if '%errorlevel%' NEQ '0' (
goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\getadmin.vbs\"
echo UAC.ShellExecute \"%~s0\", \"\", \"\", \"runas\", 1 >> \"%temp%\getadmin.vbs\"
\"%temp%\getadmin.vbs\"
exit /B
:gotAdmin
if exist \"%temp%\getadmin.vbs\" ( del \"%temp%\getadmin.vbs\" )
pushd \"%CD%\"
CD /D \"%~dp0\"
net stop {$apache_server_name}
cd {$basePath}Nginx
echo  (＝^ω^＝)开始重启Nginx
taskkill /F /IM nginx.exe > nul
taskkill /F /IM php-cgi.exe > nul
{$basePath}tools\RunHiddenConsole {$basePath}php\php-5.2.17\php-cgi.exe -b 127.0.0.1:9052 -c {$basePath}php\php-5.2.17\php.ini
{$basePath}tools\RunHiddenConsole {$basePath}php\php53n\php-cgi.exe -b 127.0.0.1:9053 -c {$basePath}php\php53n\php.ini
{$basePath}tools\RunHiddenConsole {$basePath}php\php54n\php-cgi.exe -b 127.0.0.1:9054 -c {$basePath}php\php54n\php.ini
{$basePath}tools\RunHiddenConsole {$basePath}php\php55n\php-cgi.exe -b 127.0.0.1:9055 -c {$basePath}php\php55n\php.ini
{$basePath}tools\RunHiddenConsole {$basePath}php\php-5.6.27-nts\php-cgi.exe -b 127.0.0.1:9056 -c {$basePath}php\php-5.6.27-nts\php.ini
{$basePath}tools\RunHiddenConsole {$basePath}php\php-7.0.12-nts\php-cgi.exe -b 127.0.0.1:9070 -c {$basePath}php\php-7.0.12-nts\php.ini
{$basePath}tools\RunHiddenConsole {$basePath}php\php-7.1.4-nts\php-cgi.exe -b 127.0.0.1:9070 -c {$basePath}php\php-7.1.4-nts\php.ini
start nginx.exe
echo  (＝^ω^＝)重启结束
cmd";
file_put_contents("./re_nginx.bat",$re_start_nginx);


/*重启Nginx*/
$re_nginx = "rem 获取管理员权限
>nul 2>&1 \"%SYSTEMROOT%\system32\cacls.exe\" \"%SYSTEMROOT%\system32\config\system\"
if '%errorlevel%' NEQ '0' (
goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\getadmin.vbs\"
echo UAC.ShellExecute \"%~s0\", \"\", \"\", \"runas\", 1 >> \"%temp%\getadmin.vbs\"
\"%temp%\getadmin.vbs\"
exit /B
:gotAdmin
if exist \"%temp%\getadmin.vbs\" ( del \"%temp%\getadmin.vbs\" )
pushd \"%CD%\"
CD /D \"%~dp0\"
net stop {$apache_server_name}
cd {$basePath}Nginx
echo  (＝^ω^＝)开始重启Nginx
taskkill /F /IM nginx.exe > nul
start nginx.exe
echo  (＝^ω^＝)重启结束
cmd";
file_put_contents("./reload_nginx.bat",$re_start_nginx);

/*重启apache*/
$re_nginx = "rem 获取管理员权限
>nul 2>&1 \"%SYSTEMROOT%\system32\cacls.exe\" \"%SYSTEMROOT%\system32\config\system\"
if '%errorlevel%' NEQ '0' (
goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\getadmin.vbs\"
echo UAC.ShellExecute \"%~s0\", \"\", \"\", \"runas\", 1 >> \"%temp%\getadmin.vbs\"
\"%temp%\getadmin.vbs\"
exit /B
:gotAdmin
if exist \"%temp%\getadmin.vbs\" ( del \"%temp%\getadmin.vbs\" )
pushd \"%CD%\"
CD /D \"%~dp0\"
echo  (＝^ω^＝)开始重启apache
taskkill /F /IM nginx.exe > nul
net stop {$apache_server_name}
net start {$apache_server_name}
echo  (＝^ω^＝)重启结束
cmd";
file_put_contents("./re_apache.bat",$re_start_nginx);