/*配置安装后的初始文件*/
const path = require("path");
const config_base_path = `${path.resolve(__dirname, "..").replace(/\\\\/g, "/")}/`;
const config_path = `${config_base_path}config.json`;
const fs = require("fs");

function set(json,callback,debug){
    if(!json){
        console.log("request resource JSON");
        return;
    }
    get(function(config_json){
        for(var p in json){
            config_json[p] = json[p];
        }
        if(debug) console.log(config_json);
        let save_config_json;
        try{
            save_config_json = JSON.stringify(config_json);
        }catch(err){
            console.log(err);
            save_config_json = config_json;
        }
        fs.writeFile(config_path,save_config_json,function(e){
            if(e)console.log(e);
            if(callback)callback(config_json);
        });
    });
}
function get(callback,debug){
    fs.readFile(config_path,"utf-8",function(e,data){
        data = data.toString();
        try{
            data = JSON.parse(data);
        }catch(err){
            console.log(err);
            data = { "install" : false };
        }
        if(e)console.log(e);
        if(debug)console.log(data);
        if(callback)callback(data);
    });
}

exports.get = get;
exports.set = set;
exports.create = set;