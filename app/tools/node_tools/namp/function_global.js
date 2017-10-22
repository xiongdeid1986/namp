const colors = require('colors');
const fs = require('fs');
const child_process = require('child_process');
const path = require('path')
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';
const unzip = require('unzip');
const url = require('url')
colors.setTheme({silly: 'rainbow', input: 'grey', verbose: 'cyan', prompt: 'red', info: 'green', data: 'blue', help: 'cyan', warn: 'yellow', debug: 'magenta', error: 'red'});
/*输出一个信息*/
var base_distance = "./../../../";
exports.echo_info = function(text,n){
    if(!n) {n = 9999;}
    switch (n){case 0:console.log(text.info);break;case 1:console.log(text.red);break;case 2:console.log(text.rainbow);break;
    case 3:console.log(text.grey);break;case 4:console.log(text.cyan);break;case 5:console.log(text.blue);break;case 6:console.log(text.cyan);break;
    case 7:console.log(text.yellow);break;case 8:console.log(text.magenta);break;default:console.log(text);break;}
}

exports.is_install = function(namp_config,callback){
    fs.readFile(namp_config,function(e,config){
        if(e){
            console.log(e)
        }
        config=config.toString()
        try{
            config = JSON.parse(config)
        }catch(e){
            config = {}
        }
        /*没有配置文件,还没有安装*/
        if(config == {} || !("install" in config) || !("apache" in config)  || !("nginx" in config) || !("mariadb" in config) || !("redis" in config) ){/*初始安装*/
            callback(false,config)
        }else{/*已经安装*/
            callback(true,config)
        }
    })
}
/*递归创建一个路径*/
function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            if( callback ){
                callback();
            }
        } else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}
exports.mkdirs = mkdirs;
/*创建一组路径*/
exports.all_mkdir = function(complete,callback){
    (function complete_mk(i){
        var p = complete[i];
        mkdirs(p,function(){
            i++;
            if(i<complete.length){
                complete_mk(i);
            }else{
                callback();
            }
        });
    })(0);
}
exports.create_config = function create_config(init,callback){
    var mongodb_data = init.mongodb_data
    var mysql_data = init.mysql_data
    var www_root = init.www_root
    var mariadb_password = init.mariadb_password
    var mariadb_user = init.mariadb_user
    var mariadb_port = init.mariadb_port
    var http_port = init.http_port
    var web_server = init.web_server
}
/*检查路径*/
exports.check_path_all = function check_path_all(pashJson,callback){
/*格式  [{name":"mongodb_data","path":init.mongodb_data.replace(/\:.+/,'')]*/
    var r = {};
    var n = 0;
    var is_ok = true;
    (function _check_path_all(i){
        var p = pashJson[i];
        fs.exists(p.path,function(exist){
            if (!exist){
                r[p.name] = {
                    "info":false,
                    "status":"danger"
                }
                is_ok = false;
                n++;
            }else{
                r[p.name] = {
                    "info":true,
                    "status":"success"
                }
                n++;
            }
            if(n == pashJson.length){
                callback(is_ok,r);
            }
            i++;
            if(i<pashJson.length){
                _check_path_all(i);
            }
        })
    })(0);
}


/*将数字转成中文*/
function SectionToChinese(section){
    var chnNumChar = ["零","一","二","三","四","五","六","七","八","九"];
    var chnUnitChar = ["","十","百","千"];
    var strIns = '', chnStr = '';
    var unitPos = 0;
    var zero = true;
    while(section > 0){
        var v = section % 10;
        if(v === 0){
            if(!zero){
                zero = true;
                chnStr = chnNumChar[v] + chnStr;
            }
        }else{
            zero = false;
            strIns = chnNumChar[v];
            strIns += chnUnitChar[unitPos];
            chnStr = strIns + chnStr;
        }
        unitPos++;
        section = Math.floor(section / 10);
    }
    return chnStr;
}
/*输入步骤*/
exports.step =function(step,text,second_text){
    if(!step) step = 1;
    step = parseInt(step);
    step = '第'+SectionToChinese(step)+'步';
    console.log("*".info);
    console.log("*".info);
    console.log('-----------------'.info+step.rainbow+'------------└(^o^)┘-------------------'.info);
    if(text){
        console.log(text.yellow);
    }
    if(second_text){
        console.log(second_text.yellow);
    }
    console.log("*".info);
    console.log("*".info);
}
exports.comfm = function(text,second_text){
    console.log(text.red);
    if(second_text){
        console.log(second_text.red);
    }
    console.log("*".info);
    console.log("*".info);
}
exports.getConfig = function(callback){
    fs.readFile(`${base_distance}config.json`,function(e,data){
        if(e){
            console.log(e);
            callback(e,null);
            return;
        }else{
            data = data.toString();
            data = data.replace(/\\/g,"/");
            if(typeof data == 'object'){
                var j = data;
            }else{
                var j = JSON.parse(data);
            }
            callback(null,j);
        }
    });
}

/*设置默认路径*/
exports.set_default_path = function set_default_path(base_path,rl,callback){
    rl.question('本系统默认安装在 '.info+base_path.red+' 如果不是该目录,请重新输入完整路径 : '.info, (oneself_path) => {
        if(!oneself_path){
            oneself_path = base_path+'app/';
        }
        var apache_path = oneself_path+'apache/bin/';
        var nginx_path = oneself_path+'Nginx/';
        console.log(`当前的路径是 : ${base_path}`.red);
        fs.exists(apache_path,function(exists){
            if(!exists){
                console.log(`Apache 路径 --> : ${oneself_path} 不存在 (. .)`.red);
                console.log('-----------------请重新输入------------└(^o^)┘--------------'.red);
                set_default_path(path,rl,callback);
            }else{
                fs.exists(nginx_path,function(exists2){
                    if(!exists2){
                        console.log(`Nginx 路径 --> : ${oneself_path} 不存在 (. .)`.red);
                        console.log('-----------------请重新输入------------└(^o^)┘--------------'.red);
                        set_default_path(path,rl,callback);
                    }else{
                        callback(apache_path,nginx_path);
                    }
                })
            }
        });
    });
}
/*检查路径...*/
exports.check_path = function(path,callback){
    fs.exists(path,function(exists){
        callback(exists);
    });
}

/*设置apacheconf文件*/
exports.set_apache_conf = function(app_base_path,www_root,base_path,callback){
    var apache_base  = app_base_path+'apache/';
    var template_path = "./template/";
    var apache_conf_path = template_path+'apache/conf/';
    var conf_path = apache_base+'conf/';
    var apache_confs = ["httpd.conf",
    "extra/httpd-vhosts.conf",
    "extra/httpd-php-fcgid53.conf",
    "extra/httpd-php-fcgid54.conf",
    "extra/httpd-php-fcgid55.conf",
    "extra/httpd-php-fcgid56.conf",
    "extra/httpd-php-fcgid70.conf",
    "extra/httpd-php-fcgid71.conf",
    "extra/httpd-php-sapi52.conf",
    "extra/httpd-php-sapi53.conf",
    "extra/httpd-php-sapi54.conf",
    "extra/httpd-php-sapi55.conf",
    "extra/httpd-php-sapi71.conf"];
    var n = 0;
    (function Replace_conf(i){
        var config_name = apache_confs[i];
        var config_path = apache_conf_path+config_name;
        var save_path = conf_path+config_name;
        fs.readFile(config_path,'utf8',function(e,data){
            if(!e){
                data = data.toString();
                data = data.replace(/\%base\_path\%/g,base_path);
                data = data.replace(/\%www\_root\%/g,www_root);
                data = data.replace(/\%app\_base\_path\%/g,app_base_path);
                fs.writeFile(save_path,data,function(e){
                    if(e){
                        console.log("apache 配置文件失败.".red);
                    }else{
                        n++;
                        console.log("apache ".info+config_name.info+" 配置文件设置完毕.".info);
                        if(n == apache_confs.length){
                            console.log("Apache 全部配置完毕 ●-●  ".info);
                            callback();
                        }
                    }
                    i++;
                    if(i<apache_confs.length){
                        Replace_conf(i);
                    }
                });
            }
        });
    })(0);
}

/*设置PHP*/
exports.set_php_ini = function(app_base_path,callback){
    /*设置php.ini*/
    var template_path = "./template/";
    var template_file_path = template_path+"php/";
    fs.readdir(template_file_path,function(e,folder){
        if(!e){
            (function read_write(i){
                var file_name = folder[i];
                var read_path = template_path+'php/'+file_name+'/php.ini';
                var save_path = app_base_path+'php/'+file_name+'/php.ini';
                fs.readFile(read_path,'utf8',function(e,data){
                    if(!e){
                        data = data.toString();
                        data = data.replace(/\%app\_path\%/g,app_base_path);
                        data = data.replace(/\%php\_version\%/g,file_name);
                        fs.writeFile(save_path,data,function(e){
                            if(e){
                                console.log(e+"php 配置文件失败.".red);
                            }else{
                                console.log("php ".info+file_name.info+" 设置完毕.".info);
                            }
                            i++;
                            if(i<folder.length){
                                read_write(i);
                            }else{
                                callback();
                            }
                        });
                    }else{
                        console.log(e);
                    }
                });
            })(0);
        }
    });
}
/*设置Nginx*/
exports.set_nginx_conf = function(app_base_path,www_root,callback){
    /*设置 nginx*/
    var save_base_path = app_base_path+'nginx/';
    var vhost_base_path = save_base_path+'conf/vhost/';
    fs.readdir(vhost_base_path,function(e,folders){
        (function delete_nginx_vhost(i){
            var vhost_name = folders[i];
            var vhost_path = save_base_path+'conf/vhost/'+vhost_name;
            fs.unlink(vhost_path,function(e){
                i++;
                if(i<folders.length){
                    delete_nginx_vhost(i);
                }else{
                    var template_path = "./template/";
                    var template_file_path = template_path+"nginx/";
                    var folder = ["conf/nginx.conf",
                        "conf/vhost/default.conf",
                        "conf/vhost/localhost.conf"];
                    (function read_write(i){
                        var file_name = folder[i];
                        var read_path = template_file_path+file_name;
                        var save_path = save_base_path+file_name;
                        fs.readFile(read_path,'utf8',function(e,data){
                            if(e){
                                console.log(e);
                            }
                            data = data.toString();
                            data = data.replace(/\%app\_path\%/g,app_base_path);
                            data = data.replace(/\%www\_root\%/g,www_root);
                            fs.writeFile(save_path,data,function(e){
                                if(e){
                                    console.log("nginx 配置文件失败.".red);
                                }else{
                                    console.log("nginx ".info+file_name.info+" 配置完毕.".info);
                                }
                                i++;
                                if(i<folder.length){
                                    read_write(i);
                                }else{
                                    /*清空nginx log*/
                                    fs.writeFile(save_base_path+'logs/error.log',"",function(e){
                                        if(e){
                                            console.log(e);
                                        }
                                        fs.writeFile(save_base_path+'logs/access.log',"",function(e){
                                            if(e){
                                                console.log(e);
                                            }
                                            console.log(" ●-● nginx 初始化成功~  ●-● ".info);
                                            callback();
                                        })
                                    });
                                }
                            });
                        });
                    })(0);
                }
            });
        })(0);
    });
}

/*解压并安装软件*/
exports.unzip_set_software = function(unzip_name,unzip_path,zip_version,app_base_path,base_path,callback,exists_path){/*需要解压的所有 软件版本*/
    console.log("----------------开始解压 [".info+unzip_name.info+"] (＝^ω^＝)--------------------------".info);
    var n=0;
    (function unzip_software(i){
        /*如果文件不存在,先创建文件.*/
        fs.exists(unzip_path,function(exists){
            if(!exists){
                fs.mkdir(unzip_path,function(e){
                    if(e){
                        console.log(e);
                    }
                    unzip_software(i);
                });
            }else{
                if(exists_path){/*如果存在则不必重复解压..*/
                    console.log(unzip_name.rainbow+" ●-●>--> 已经被解压 (((m -_-)m ".info);
                    callback(zip_version);
                    return;
                }else{
                    var suffix = ".zip";
                    var zip_name = zip_version[i]+suffix;
                    var extract = unzip.Extract({ path: unzip_path});
                    extract.on('error', function(err) {
                        console.log("error++++++++++++++++++++++");
                        console.log(err);
                        //解压异常处理
                    });
                    extract.on('finish', function() {
                        n++;/*每个完成的计数器*/
                        var plan = "解压完成["+n+"/"+zip_version.length+"]";
                        console.log(unzip_name.rainbow+" ●-●>--> ".info + zip_name.red+" ~~~~".info + plan.info+"~~~~ (＝^ω^＝)".info);
                        if(n == zip_version.length){
                            console.log(unzip_name.rainbow+" ●-●>--> 全部解压完毕 (((m -_-)m ".info);
                            callback(zip_version);
                        }
                        //解压完成处理
                    });
                    var zip_path = './../core_software/'+zip_name;
                    fs.exists(zip_path,function(exists){
                        if(!exists){
                            var exists_text = ' ●-●>-->' + zip_path + ' 文件不存在~~~ ';
                            console.log(exists_text.red);
                        }
                    });
                    fs.createReadStream(zip_path).pipe(extract);
                    i++;
                    if(i < zip_version.length){
                        unzip_software(i);
                    }
                }
            }
        });
    })(0);
}

/*安装mariadb*/
exports.set_mariadb = function(app_base_path,base_path,default_mariadb_data,callback){
    var mariadb_path = app_base_path+'mariadb/data/';
    console.log("●-●配置并安装 MariaDB (原MySQL) ●-●".info);
    var template_path = "./template/";
    var mariadb_template_path = template_path+'mariadb/my.ini';
    fs.readFile(mariadb_template_path,'utf8',function(e,data){
        if(e){
            console.log(e);
        }else{
            data = data.toString();
            data = data.replace(/\%mariadb\_path\%/g,app_base_path+'mariadb');
            data = data.replace(/\%mariadb\_data\_path\%/g,default_mariadb_data);
            fs.writeFile(app_base_path+'/mariadb/my.ini',data,function(e){
                if(e){
                    console.log(e);
                }
                callback();
                return;
            })
        }
    });
    return;
    /*以下代码废弃*/;
    var mysql_data = base_path+'mysql_data/';
    (function copy_folder(mariadb_path,mysql_data,n){
        fs.readdir(mariadb_path,function(e,files){
            if(e){
                console.log(e);
            }else{
                (function copy_mysql(i){
                    var file_path = mariadb_path+files[i];
                    var mariadb_file_name = files[i];
                    var len = files.length;
                    fs.stat(file_path,function(e,stats){
                        if(stats.isDirectory()){
                            fs.exists(mysql_data+mariadb_file_name,function(exists){
                                if(!exists){
                                    fs.mkdir(mysql_data+mariadb_file_name,function(e){
                                        if(e){
                                            console.log(e);
                                        }
                                    });
                                }
                                n++;
                                copy_folder(mariadb_path+mariadb_file_name+'/',mysql_data+mariadb_file_name+'/',n);
                            });
                        }else{
                            var to_file = mysql_data+mariadb_file_name;
                            fs.readFile(file_path,function(e,d){
                                if(e){
                                    console.log(e);
                                }else{
                                    fs.writeFile(to_file,d,function(e){
                                        //if(!e){
                                            //console.log('mysql 数据库复制成功'.info);
                                        //}
                                        if(i == len && n == 2){
                                            console.log("●-●配置并安装 MariaDB (原MySQL) ●-●".info);
                                            var template_path = "./template/";
                                            var mariadb_template_path = template_path+'mariadb/my.ini';
                                            fs.readFile(mariadb_template_path,'utf8',function(e,data){
                                                if(e){
                                                    console.log(e);
                                                }else{
                                                    data = data.toString();
                                                    data = data.replace(/\%mariadb\_path\%/g,app_base_path+'mariadb');
                                                    data = data.replace(/\%mariadb\_data\_path\%/g,base_path+'mysql_data');
                                                    fs.writeFile(app_base_path+'/mariadb/my.ini',data,function(e){
                                                        if(e){
                                                            console.log(e);
                                                        }
                                                        callback();
                                                        return;
                                                    })
                                                }
                                            })
                                        }
                                    });
                                }
                            });
                        }
                        i++;
                        if(i < files.length){
                            copy_mysql(i);
                        }
                    });
                })(0);
            }
        });
    })(mariadb_path,mysql_data,0);
}
exports.get_drive = function get_drive(callback){
    spawn([`wmic logicaldisk where "drivetype=3" get freespace,name`],function(result) {
        result = result.replace(/\r/g, '')
        result = result.replace(/\n\n/g, "\n")
        result = result.replace(/\n$/g, "")
        result = result.split("\n")
        result = Array.prototype.slice.call(result)
        if (result[0] && /Name.*/.test(result[0])) {
            result.splice(0, 1)
        }
        var d = {};
        result.forEach( (drive) => {
            drive = drive.replace(/^\s*?|\s*$/g, "");
            drive = drive.replace(/\s\s/g, " ");
            drive = drive.replace(/\s\s/g, " ");
            var a = drive.split(" ");
            var b = a[0] ? a[0] : 0;
                a = a[1] ? a[1] : "";
            if(a ) {
                a = a.replace(/[^a-zA-Z]/g, '');
                b = parseInt(b);
            }
            if(b > 0){
                d[a] = Math.floor((b/1024/1024/1024) * 100) / 100;
            }
        });
        callback(d);
    })
}
/*执行一组 spawn 命令*/
function spawn(command,callback/*服务名,用于判断该服务是否已经被安装*/,debug){
    (function execCommand(i){
        var command_text = command[i];
        var command_exec = child_process.exec(command_text,{ encoding: binaryEncoding },function(err,standard_output,standard_error){
            /*必须转码为 gbk*/
            var success =  iconv.decode(new Buffer(standard_output, binaryEncoding), encoding);
            var fail =  iconv.decode(new Buffer(standard_error, binaryEncoding), encoding);
            var command_result = success || fail;
            if(success && debug){
                console.log("success: =>".red + success.red);
            }
            if(fail && debug){
                console.log("fail: =>".yellow + fail.yellow + " 命令行 => ".red+command_text.red);
            }
            i++;
            if(i < command.length){
                execCommand(i);
            }else{
                command_exec.stdin.end();   // stop the input pipe, in order to run in windows xp
                command_exec.on('close', function() {
                    if(callback){
                        callback(command_result);
                    }
                });
                if(callback){
                    callback(command_result);
                }
            }
        });
    })(0);
}
exports.spawn = spawn

exports.save_command = function(command_text,command_name,base_path,path,icon_number,is_admin,callback){
    var path = base_path+'app/tools/'+path;
    var command_title = '^*动点世纪科技(www.ddweb.com.cn) NAMP--^>'+command_name;
    command_text = 'title '+command_title+"\r\n"+
        'echo ^*\r\n'+
        'echo ^*\r\n'+
        'echo -----------------------------└(^o^)┘-------------------\r\n' +
        'echo '+command_title+' \r\n' +
        'echo ^*\r\n'+
        'echo ^*\r\n'+
        'echo ^*\r\n'+
        command_text;
    var admin_command = '@echo off\r\n'+
        '>nul 2>&1 "%SYSTEMROOT%\\system32\\cacls.exe" "%SYSTEMROOT%\\system32\\config\\system"\r\n' +
        'if \'%errorlevel%\' NEQ \'0\' (\r\n' +
        'goto UACPrompt\n' +
        ') else ( goto gotAdmin )\r\n' +
        ':UACPrompt\r\n' +
        'echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"\r\n' +
        'echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"\r\n' +
        '"%temp%\\getadmin.vbs"\r\n' +
        'exit /B\r\n' +
        ':gotAdmin\r\n' +
        'if exist "%temp%\\getadmin.vbs" ( del "%temp%\\getadmin.vbs" )\r\n' +
        'pushd "%CD%"\r\n' +
        'CD /D "%~dp0"\r\n';
    if(is_admin){
        command_text = admin_command+command_text;
    }
    command_text += '\r\ncmd';
    command_text = iconv.encode(command_text, 'gbk');
    fs.writeFile(path,command_text,function(e){
        if(e){
            console.log(e);
        }
        var success = "生成"+command_name+"成功 -_-";
        console.log(success.info);
        var url_file = `${base_path}${command_name}.url`;
        create_link(path,url_file,icon_number,function(){
            callback();
        });

    });
}
function create_link(path,url_file,icon_number,callback){
    child_process.exec(`echo [InternetShortcut]>>"${url_file}"`,function(err,standard_output,standard_error){
        child_process.exec(`echo URL="${path}">>"${url_file}"`,function(err,standard_output,standard_error){
            child_process.exec(`echo IconIndex=${icon_number}>>"${url_file}"`,function(err,standard_output,standard_error){
                child_process.exec(`echo IconFile=%SystemRoot%/system32/SHELL32.dll>>"${url_file}"`,function(err,standard_output,standard_error){
                    if(callback){
                        callback();
                    }
                });
            });
        });
    });
}
exports.create_link = create_link;

/*查询系统是否有该服务*/
function is_server(server_name,callback){
    child_process.exec(`SC QUERY "${server_name}"`,{ encoding: binaryEncoding },function(err,standard_output,standard_error){
        let result = standard_output + standard_error ;
        result = iconv.decode(new Buffer(result, binaryEncoding), encoding);
        if(/^[\s\r\n]*SERVICE\_NAME\:\s*[a-zA-Z0-9]/.test(result)){
            var is_server = 0;
        }else{
            var is_server = 1;
        }
        callback(is_server);
    });
}
exports.is_server = is_server;
/*查询服务是否运行*/
exports.server_is_run = function(server_name,callback){
    /*0运行中 1未运行 2没有安装
    * */
    is_server(server_name,function(is_server){
        if(!is_server){
            var is_run = 2;/*没有安装该服务*/
            callback(is_run);
        }else{
            child_process.exec(`SC QUERY "${server_name}"`,{ encoding: binaryEncoding },function(err,standard_output,standard_error){
                let result = standard_output + standard_error ;
                result = iconv.decode(new Buffer(result, binaryEncoding), encoding);
                console.log(result);
                if(/\s*STATE\s*\:\s*[0-9]*\sSTOPPED*/.test(result)){
                    var is_run = 1;
                }else{
                    var is_run = 0;
                }
                callback(is_run);
            });
        }
    });
}
//module.exports = function_global;
