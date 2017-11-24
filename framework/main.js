const readline = require('readline');
const fs = require('fs');
var fn_global = require("./function.global/fn_global.js");
var echo_info = fn_global.echo_info;
var step = fn_global.step;
var comfm = fn_global.comfm;
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
var default_drive_primary = "D:/";
rl.question('你想将本系统安装到那个盘?? -> Enter回车默认 D: '.info, (default_drive) => {
    if(!default_drive){
        default_drive = default_drive_primary;
    }
    var apache_server_name = 'httpd';
    if(/[a-zA-Z]{1}$|[a-zA-Z]{1}[\:\：]{1}$|[a-zA-Z]{1}[\:\：]{1}[\/\\]{1}$/.test(default_drive)){
        default_drive = default_drive.substr(0,1);
        default_drive = default_drive.toUpperCase();
        default_drive+=':/';
    }else{
        console.log('你输入的盘符不正确，默认安装到D盘"'.red);
        default_drive = default_drive_primary;
    }
    try{
        fs.accessSync(default_drive,fs.F_OK);
    }catch(e){
        console.log("*".red);
        console.log("*".red);
        console.log("*".red);
        console.log('你输入的  盘符不存在 安装失败..... '.red);
        console.log("*".red);
        console.log("*".red);
        rl.close();
        return;
    }
    comfm(`将安装到: ${default_drive}`);
    step(2);
    var base_path = path.resolve(__dirname,'../../..')+'/';
    base_path = base_path.replace(/\\/g,'/');
    var app_base_path = base_path+'app/';/*基本路径*/
    fn_global.set_default_path(base_path,rl,function(apache_path,nginx_path){
        step(3);
        var default_www_root = default_drive+'www_root/';
        rl.question('设置网站目录 默认 '.info+default_www_root.info+' : '.info, (default_wwwroot) => {
            if(!default_wwwroot){
                default_wwwroot = default_www_root;
            }
            comfm(`您设置的网站存放路径为: ${default_wwwroot}`);
            fn_global.check_path(default_wwwroot,function(exists){
                if(!exists){
                    fs.mkdirSync(default_wwwroot);
                }
                console.log("----------------最终基本信息(＝^ω^＝)--------------------------".yellow);
                console.log(`Apache服务器名为    -->-->->   ${apache_server_name}`.yellow);
                console.log(`基本路径            -->-->->   ${app_base_path}`.yellow);
                console.log(`设置网站目录默认     -->-->->   ${default_wwwroot}`.yellow);

                /*替换Nginx配置*/
                fn_global.set_nginx_conf(app_base_path,default_wwwroot,function(){
                    /*解压并配置php*/
                    fn_global.unzip_set_software("php",'./../../php/',[
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
                        fn_global.set_php_ini(app_base_path,function(){
                            var php_start_command_all = [
                                `${app_base_path}tools/RunHiddenConsole ${app_base_path}php/php-5.2.17/php-cgi.exe -b 127.0.0.1:9052 -c ${app_base_path}php/php-5.2.17/php.ini`,
                                `${app_base_path}tools/RunHiddenConsole ${app_base_path}php/php53n/php-cgi.exe -b 127.0.0.1:9053 -c ${app_base_path}php/php53n/php.ini`,
                                `${app_base_path}tools/RunHiddenConsole ${app_base_path}php/php54n/php-cgi.exe -b 127.0.0.1:9054 -c ${app_base_path}php/php54n/php.ini`,
                                `${app_base_path}tools/RunHiddenConsole ${app_base_path}php/php55n/php-cgi.exe -b 127.0.0.1:9055 -c ${app_base_path}php/php55n/php.ini`,
                                `${app_base_path}tools/RunHiddenConsole ${app_base_path}php/php-5.6.27-nts/php-cgi.exe -b 127.0.0.1:9056 -c ${app_base_path}php/php-5.6.27-nts/php.ini`,
                                `${app_base_path}tools/RunHiddenConsole ${app_base_path}php/php-7.0.12-nts/php-cgi.exe -b 127.0.0.1:9070 -c ${app_base_path}php/php-7.0.12-nts/php.ini`,
                                `${app_base_path}tools/RunHiddenConsole ${app_base_path}php/php-7.1.4-nts/php-cgi.exe -b 127.0.0.1:9070 -c ${app_base_path}php/php-7.1.4-nts/php.ini`
                            ];
                                var command_text = 'net stop '+apache_server_name+'\r\n' +
                                'cd '+app_base_path+'nginx\r\n' +
                                'taskkill /F /IM nginx.exe\r\n' +
                                'taskkill /F /IM php-cgi.exe\r\n' +
                                php_start_command_all+
                                'start nginx.exe\r\n' +
                                'echo 重启Nginx结束\r\n' ;
                                fn_global.save_command(command_text,"Nginx重启工具",base_path,`re_nginx.bat`,'045',true/*取得管理员权*/,function(){
                                    var command_text2 = 'taskkill /F /IM nginx.exe\r\n' +
                                        'taskkill /F /IM php-cgi.exe\r\n' +
                                        'echo 停止Nginx成功\r\n';
                                    fn_global.save_command(command_text2,"Nginx停止工具",base_path,`stop_nginx.bat`,'221',true/*取得管理员权*/,function(){
                                        var command_text3 = 'cd '+app_base_path+'nginx\r\n' +/*重新载入Nginx*/
                                            'nginx -s reload\r\n' +
                                            'echo 重新载入Nginx配置成功\r\n';
                                        fn_global.save_command(command_text3,"Nginx重载工具",base_path,`reload_nginx.bat`,'329',true/*取得管理员权*/,function(){
                                            /* php 全部安装完成
                                            * nginx配置文件生成完毕
                                            * nginx工具生成完毕*/
                                            /*解压并配置apache服务*/
                                            fn_global.set_apache_conf(app_base_path,default_wwwroot,base_path,function(){
                                                var install_apache_command = [`${app_base_path}apache/bin/httpd -k install -n ${apache_server_name}`];
                                                fn_global.spawn(install_apache_command,function(command_all){
                                                    /*生成apache 工具*/
                                                    var re_apache = 'taskkill /F /IM nginx.exe\r\n' +
                                                    'taskkill /F /IM php-cgi.exe\r\n' +
                                                    `net stop ${apache_server_name}\r\n` +
                                                    `net start ${apache_server_name}\r\n`;
                                                    fn_global.save_command(re_apache,"apache重启",base_path,`re_apache.bat`,'329',true/*取得管理员权*/,function(){
                                                        var stop_apache = `net stop ${apache_server_name}\r\n`;
                                                        fn_global.save_command(stop_apache,"apache停止",base_path,`stop_apache.bat`,'329',true/*取得管理员权*/,function(){
                                                            fn_global.create_link(`${app_base_path}apache/conf/extra/httpd-vhosts.conf`,`${base_path}Apache网站配置文件.url`,'002',function(){
                                                                /*创建成功apache网站配置文件*/
                                                                fn_global.create_link(`${app_base_path}nginx/conf/vhost/`,`${base_path}Nginx网站配置目录.url`,'002',function(){
                                                                    /*创建成功apache网站配置文件*/

                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    })
                                });
                        });
                    },false);
                });

                /*解压并配置 mariadb */
                var mariadb_server_name = 'MySql';
                fn_global.unzip_set_software("mariadb",'./../../',['mariadb'],app_base_path,base_path,function(zip_version){
                    /*mariadb解压完毕*/
                    console.log(" mariadb解压完毕 ●-●".rainbow);
                    var default_mariadb_data = default_drive+"mysql_data/";
                    fs.mkdir(default_mariadb_data,function(e){
                        fn_global.unzip_set_software("mariadb_primary_data",default_mariadb_data,['mariadb_primary_data'],app_base_path,base_path,function(){
                            /*mariadb解压初始数据*/
                            console.log(" mariadb 初始数据解压完毕 ●-●".rainbow);
                            fn_global.set_mariadb(app_base_path,base_path,default_mariadb_data,function(){
                                console.log("开始设置 mariadb ●-●".rainbow);
                                /*安装 mariadb */
                                var instll_command = [
                                    `cd ${app_base_path}mariadb/bin/`,
                                    `${app_base_path}mariadb/bin/mysqld.exe --install-manual "${mariadb_server_name}"`,
                                    `net start mysql`
                                ];
                                fn_global.spawn(instll_command,function(command_all){
                                    var command = `net stop ${mariadb_server_name}\r\n`+
                                        `net start ${mariadb_server_name}`;
                                    fn_global.save_command(command,`${mariadb_server_name}重启工具`,base_path,`re_${mariadb_server_name}.bat`,'045',true/*取得管理员权*/,function(){

                                    });
                                });
                            });
                        },false);
                    })
                },false);


                /*安装redis
                console.log("正在安装redis服务 请稍候...~".info);
                install_redis = spawn(`${app_base_path}redis/redis-server`, [`--service-install ${app_base_path}redis/redis.windows.conf`]);
                install_redis.stdout.on('data', function (data) {
                    console.log(`redis 服务安装成功:\n`.info + data);
                });
                install_redis.stderr.on('data', function (data) {
                    console.log(`redis 服务已经存在:\n`.red + data);
                });
                */
                rl.close();
            });
        });
    });
});


