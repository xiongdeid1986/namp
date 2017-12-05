/*安装namp环境 众多windows DOC 命令*/
const fs = require("fs");
const software_config = require(`./software_config.js`);
const command = require(`./command.js`);
const path = require("path");
const app_base_path = (path.resolve(__dirname,"../../")+'/app/').replace(/\\/g,"/");
const config = require(`./config.js`);

exports.is_install = function(callback){
    config.get(function(config){
        var IsInstall = true;/*没有配置文件,还没有安装*/
        if(config == {} || !("install" in config) || !("apache" in config)  || !("nginx" in config) || !("mariadb" in config) || !("redis" in config) && config['install'] == true ){/*初始安装*/
            IsInstall = false;
        }
        if(callback) callback(IsInstall,config);
    });
}
function command_install(socket,fn){
    software_config.get(function(softJson){
        var soft_type_arr = [];
        for(var p in softJson){
            soft_type_arr.push(p);
        }
        (function dispose_soft_type(i){
            var soft_type = soft_type_arr[i];
            var softs = softJson[soft_type].softs;
            var soft_arr = [];
            for(var p2 in softs){
                soft_arr.push(p2);
            }
            (function dispose_soft_arr(j){
                var soft = soft_arr[j],
                 soft_info = softs[soft],
                 command_arr = [],
                 folder_name = soft_info.folder_name,
                 server_name = soft_info.server_name,
                 this_path = `${app_base_path}${soft_type}/${folder_name}/`.replace(/\//g,'\\'),
                 soft_command = {},//本软件命令合集
                 install_command = [],//安装命令合集
                 uninstall_command = [],//卸载命令合集
                 start_command = [],//开始命令合集
                 stop_command = [],//停止命令合集
                 restart_command = [],//重启命令合集
                 reload_command = [],//重载命令合集
                 windows_path = "";//是否添加到windows path
                if("command" in soft_info){
                    soft_command = soft_info.command;
                    if("install" in soft_command){
                        install_command = soft_command.install;
                    }
                    if("uninstall" in soft_command){
                        uninstall_command = soft_command.uninstall;
                    }
                    if("start" in soft_command){
                        start_command = soft_command.start;
                    }
                    if("stop" in soft_command){
                        stop_command = soft_command.stop;
                    }
                    if("restart" in soft_command){
                        restart_command = soft_command.restart;
                    }
                    if("reload" in soft_command){
                        reload_command = soft_command.reload;
                    }
                    if("windows_path" in soft_command){
                        windows_path = soft_command.windows_path;
                    }
                }
                for(var u=0;u<install_command.length;u++){
                    //command_arr.push(install_command[u].replace(/\%this_path\%/g,this_path).replace(/\%server_name\%/g,server_name));
                }
                for(var u=0;u<uninstall_command.length;u++){
                    command_arr.push(uninstall_command[u].replace(/\%this_path\%/g,this_path).replace(/\%server_name\%/g,server_name));
                }
                command.spawn(command_arr,function(command_result){
                    console.log(`execute finish! ${command_result}`);
                },true/*debug*/);
                //var save_command_path = `${app_base_path}tools/bat_tools/install_command.bat`;
                //command.save_command(install_command_arr,save_command_path,true,function(){
                    //command.execFile(save_command_path,function(e){
                        //console.log(e)
                    //})
                //});
                //command.spawn(install_command_arr,function(command_result){
                //    console.log(`execute finish! ${command_result}`);
                //},true/*debug*/);
            })(0);
        })(0);
    });
}

exports.command_install = command_install;