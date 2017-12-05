const child_process = require('child_process');
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';
const fs = require('fs');
const path = require("path")
const app_base_path = (path.resolve(__dirname,"../../")+'/app/').replace(/\\/g,"/");
const nircmd_path = `${app_base_path}tools/nircmd/nircmd.exe`;

/*
* 使用nircmd提权执行*/
function nircmd(command,callback,debug){
    if(typeof command == "string"){
        command = [command];
    }
    spawn(command,callback,debug);
    return;
}
exports.nircmd = nircmd;
/*
执行一组 spawn 命令*/
function exec(command,callback/*服务名,用于判断该服务是否已经被安装*/,debug){
    if(typeof command == 'string'){
        command = [command];
    }
    (function execCommand(i){
        var command_once = command[i];
        if(debug){
            console.log(command_once);
        }
        var command_exec = child_process.exec(command_once,{ encoding: binaryEncoding },function(err,standard_output,standard_error){
            /*必须转码为 gbk*/
            var success =  iconv.decode(new Buffer(standard_output, binaryEncoding), encoding);
            var fail =  iconv.decode(new Buffer(standard_error, binaryEncoding), encoding);
            var command_result = success || fail;
            if(success && debug){
                console.log("success: =>" + success);
            }
            if(fail && debug){
                console.log("fail: =>" + fail + " 命令行 => "+command_once);
            }
            i++;
            if(i < command.length){
                execCommand(i);
            }else{
                command_exec.stdin.end();   // stop the input pipe, in order to run in windows xp
                command_exec.on('close', function() {
                    if(callback){
                        callback(command_result);
                        return;
                    }
                });
                if(callback){
                    callback(command_result);
                    return;
                }
            }
        });
    })(0);
}
exports.exec = exec;

/*
执行一组 spawn 命令*/
function spawn(command,callback/*服务名,用于判断该服务是否已经被安装*/,debug,is_admin){
    if(typeof command == 'string'){
        command = [command];
    }
    (function spawnCommand(i){
        var the_command = command[i];
        var command_once_split = the_command.replace(/^\s*|\s*$/g,"").replace(/\s{2,}/g," ").split(" ");
        var command_once = command_once_split.splice(0,1)[0];
        if(debug){
            console.log(`[DEBUG] : execute command => ${command_once}+${command_once_split}`);
        }
        var spawn_execute = child_process.spawn(command_once,command_once_split);
        var out_re = "";
        spawn_execute.stdout.on('data', (data) => {
            data =  iconv.decode(new Buffer(data, binaryEncoding), encoding);
            out_re += data;
            if(debug || !callback){
                console.log(`[DEBUG] : stdout : ${data}`);
            }
        });
        spawn_execute.stderr.on('data', (data) => {
            data =  iconv.decode(new Buffer(data, binaryEncoding), encoding);
            out_re += `error:`+data;
            if(debug || !callback){
                console.log(`stderr : ${data}`);
            }
        });
        spawn_execute.on("close",(code) => {
            code = parseInt(code);
            if(code != code) code = 0;
            if(debug || !callback){
                console.log(`code:${code}`);
                console.log(out_re);
            }
            if(code == 5){
                console.log(`Insufficient administrator rights`);
                if(is_admin){
                    //如果拒绝访问,是否使用管理员模式.
                    return nircmd(the_command,callback,debug);
                }
            }
            if(callback){
                callback(out_re,);
            }
        });
    })(0);
}
exports.spawn = spawn;
/*
* */
exports.execFileSync = child_process.execFileSync;
exports.execFile = child_process.execFile;
/*
*
查询系统是否有该服务*/
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

/*

查询服务是否运行*/
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
                if(callback){
                    callback(is_run);
                }else{
                    console.log(`server run ${is_run.toString()}`)
                }
            });
        }
    });
}


//保存一个命令
exports.save_command = function(command,target_path,is_admin,callback,is_cmd){
    var command_text = "";
    if(command instanceof Array){
        for(var i = 0 ;i<command.length;i++){
            command_text+=command[i]+"\r\n";
        }
    }
    if(command instanceof String){
        command_text+=command[i]+"\r\n";
    }
    const admin_command = '@echo off\r\n'+
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
    if(is_cmd){
        command_text += '\r\ncmd';
    }
    command_text = iconv.encode(command_text, 'gbk');
    fs.writeFile(target_path,command_text,function(e){
        if(e){
            console.log(e);
        }
        if(callback){
            callback();
        }
    });
}