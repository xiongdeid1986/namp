const readline = require('readline');
const fs = require('fs');
const child_process = require('child_process');
var function_global = require("./function.global/function.global.js");
var echo_info = function_global.echo_info;
var step = function_global.step;
var comfm = function_global.comfm;
var path = require('path');
echo_info('\033[2J');
console.log("-------------------------------------------------------------".info);
console.log("集成系统...(Node.js)".info);
console.log("*".info);
console.log("*".info);
console.log("-Apache,Nginx,MariaDB,php5.2-php7.1,Redis,Node.js,Mongodb----".info);
console.log("*".info);
console.log("*".info);
console.log("动点世纪:www.ddweb.com.cn @血狼 内部使用版本".info);
console.log("-------------------------------------------------------------".info);
process.stdin.setEncoding('utf8');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
step(1);
rl.question('设置Apache服务名,将被安装到系统服务 -> Enter回车默认 httpd : '.info, (apache_server_name) => {
    if(!apache_server_name){
    apache_server_name = 'httpd';
    }
    if(!/[a-zA-Z]/.test(apache_server_name)){
        console.log('你输入的服务名不是全英文,已经自动默认为"httpd"'.red);
        apache_server_name = 'httpd';
    }
    comfm(`您设置的Apache服务器名为: ${apache_server_name}`);
    step(2);
    var base_path = path.resolve(__dirname,'../../..')+'/';
    base_path = base_path.replace(/\\/g,'/');
    var app_base_path = base_path+'app/';/*基本路径*/
    function_global.set_default_path(base_path,rl,function(apache_path,nginx_path){
        step(3);
        var default_www_root = 'D:/www_root/';
        rl.question('设置网站目录 默认 '.info+default_www_root.info+' : '.info, (default_wwwroot) => {
            if(!default_wwwroot){
                default_wwwroot = default_www_root;
            }
            comfm(`您设置的网站存放路径为: ${default_wwwroot}`);
            function_global.check_path(default_wwwroot,function(exists){
                if(!exists){
                    fs.mkdirSync(default_wwwroot);
                }
                console.log("----------------最终基本信息(＝^ω^＝)--------------------------".yellow);
                console.log(`Apache服务器名为    -->-->->   ${apache_server_name}`.yellow);
                console.log(`基本路径            -->-->->   ${app_base_path}`.yellow);
                console.log(`设置网站目录默认     -->-->->   ${default_wwwroot}`.yellow);
                /*解压并配置php*/
                function_global.unzip_set_software("php",'./../../php/',[
                    'php-5.2.17',
                    'php-5.3.29-nts',
                    'php-5.4.45',
                    'php-5.4.45-nts',
                    'php-5.6.27-nts',
                    'php-7.0.12-nts',
                    'php-7.1.4',
                    'php-7.1.4-nts',
                    'php53',
                    'php53n',
                    'php54',
                    'php54n',
                    'php55',
                    'php55n',
                    'tmp'],app_base_path,base_path,function(){
                    console.log("开始设置 php ●-●".rainbow);
                    function_global.set_php_ini(app_base_path);

                });

                /*解压并配置 mariadb */
                function_global.unzip_set_software("mariadb",'./../../',['mariadb'],app_base_path,base_path,function(zip_version){
                    console.log("开始设置 mariadb ●-●".rainbow);
                    /*安装 mariadb */
                    var instll_command = `cd ${app_base_path}mariadb/bin/\n`+
                        `${app_base_path}mariadb/bin/mysqld.exe --install-manual "mysql"`;
                    function_global.set_mariadb(app_base_path,base_path,function(){
                        function_global.spawn(instll_command,"instll_command",function(){
                            console.log("mariadb 安装执行完毕  ●-●  ........".info);
                        });
                        console.log(instll_command);
                    });
                });

                return;
                /*关闭输入*/
                var spawn = child_process.spawn;
                /*安装apache服务*/
                console.log("正在安装apache服务 请稍候...~".info);
                install_apache = spawn(`${apache_path}httpd`, [`-k install -n ${apache_server_name}`]);

                /*
                *
                *
    `SC QUERY ${server_name} > NUL  \n` +
    `IF ERRORLEVEL 1060 GOTO install\n` +
    `GOTO noInstall\n` +
    `:install\n` +
    `cd %ApachePath%\n` +
    `httpd -k install -n ${server_name}\n` +
    `echo *apache 安装成功,服务名 --^> ${server_name} (．．) \n` +
    `:noInstall\n` +
    `echo *apache 已经安装过,服务名 --^> ${server_name} (．．) `;
    */
                install_apache.stdout.on('data', function (data) {
                    console.log(`apache 服务${apache_server_name}安装成功:\n`.info + data);
                });
                install_apache.stderr.on('data', function (data) {
                    console.log(`apache 服务${apache_server_name}已经存在:\n`.red + data);
                });
                /*替换apache配置文件*/
                function_global.set_apache_conf(app_base_path,default_wwwroot);
                /*替换php配置*/

                /*替换Nginx配置*/
                function_global.set_nginx_conf(app_base_path,default_wwwroot);


                fs.exists(`${app_base_path}php/tmp`,function(exists){
                    if(!exists){
                        /*解压php*/
                        var unzip_php = new adm_zip(`${app_base_path}tools/core_software/php.zip`);
                        console.log("正在解压php 请稍候...~".info);
                        unzip_php.extractAllTo(`${app_base_path}`, /*overwrite*/true);
                    }else{
                        console.log("php 已经解压...~".info);
                    }
                });
                /*安装redis*/
                console.log("正在安装redis服务 请稍候...~".info);
                install_redis = spawn(`${app_base_path}redis/redis-server`, [`--service-install ${app_base_path}redis/redis.windows.conf`]);
                install_redis.stdout.on('data', function (data) {
                    console.log(`redis 服务安装成功:\n`.info + data);
                });
                install_redis.stderr.on('data', function (data) {
                    console.log(`redis 服务已经存在:\n`.red + data);
                });

                rl.close();
            });
        });
    });
});


