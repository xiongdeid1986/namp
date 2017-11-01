/*安装namp环境 众多windows DOC 命令*/
const fs = require("fs");
const software_config = require(`./software_config.js`);
const command = require(`./command.js`);
const path = require("path");
const app_base_path = (path.resolve(__dirname,"../../")+'/app/').replace(/\\/g,"/");

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
                var soft = soft_arr[j];
                var soft_info = softs[soft];
                var install_command_arr = []
                var folder_name = soft_info.folder_name;
                var server_name = soft_info.server_name;
                var this_path = `${app_base_path}${soft_type}/${folder_name}/`.replace(/\//g,'\\');
                for(var u=0;u<soft_info.install_command.length;u++){
                    install_command_arr.push(soft_info.install_command[u].replace(/\%this_path\%/g,this_path).replace(/\%server_name\%/g,server_name))
                }
                //var save_command_path = `${app_base_path}tools/bat_tools/install_command.bat`;
                //command.save_command(install_command_arr,save_command_path,true,function(){
                    //command.execFile(save_command_path,function(e){
                        //console.log(e)
                    //})
                //});
                command.nircmd
                command.spawn(install_command_arr,function(command_result){
                    console.log(`execute finish! ${command_result}`)
                },true/*debug*/)
            })(0);
        })(0);
        //
    });
}
command_install();
exports.command_install = command_install