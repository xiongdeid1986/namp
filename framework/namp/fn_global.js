const fs = require('fs');
const child_process = require('child_process');
const path = require('path')
const iconv = require('iconv-lite');

/*递归创建一个路径*/
function mkdirs(dirname, callback) {
    (function parent_create_path(dirname2){//递归创建上级目录
        if(!fs.existsSync(dirname2)){
            fs.mkdirSync(dirname2,function(e){
                if(e){
                    var p = path.resolve(mk_path,"..");
                    parent_create_path(p);
                }
            });
        }else{
            if(callback){
                callback();
            }
        }
    })(dirname);//callback
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
