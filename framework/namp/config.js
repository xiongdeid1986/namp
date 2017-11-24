/*配置安装后的初始文件*/
const path = require("path");
const config_base_path = `${path.resolve(__dirname, "..").replace(/\\\\/g, "/")}/`;
const config_path = `${config_base_path}config.json`;
const fs = require("fs");

function set(json,c,d){
    if(!json){
        console.log("request resource JSON");
        return;
    }
    get(function(j){
        for(var p in json){
            j[p] = json[p];
        }
        if(d) console.log(j);
        var s;
        try{
            s = JSON.stringify(j);
        }catch(err){
            console.log(err);
            s = j;
        }
        fs.writeFile(config_path,s,function(e){
            if(e)console.log(e);
            if(c)c(j);
        });
    });
}
function get(c,debug){
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
        if(c)c(data);
    });
}

exports.get = get;
exports.set = set;
exports.create = set;