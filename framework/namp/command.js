const child_process = require('child_process');
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';

/*

执行一组 spawn 命令*/
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

/*

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
