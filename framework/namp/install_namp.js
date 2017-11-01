/*安装namp环境 众多windows DOC 命令*/
const fs = require("fs")
const software_config = require(`./software_config.js`)

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
        console.log(softJson)
    });
}
command_install();
exports.command_install = command_install