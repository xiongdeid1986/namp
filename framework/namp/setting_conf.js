/*配置文件*/
const fs = require('fs')
exports.setting_conf = function setting_conf(resource_config_path,new_config_path,setting_type){
    return;
    fs.readFile(resource_config_path,'utf-8',function(e,data){
        if(e){
            console.log(e)
        }
        switch(setting_type){
            case "web_server":

                data = data.replace(/\%base\_path\%/g,base_path);
                data = data.replace(/\%www\_root\%/g,www_root);
                data = data.replace(/\%app\_base\_path\%/g,app_base_path);

                break;
        }
    })
    console.log(`resource_config_path => ${resource_config_path}`)
    console.log(`new_config_path => ${new_config_path}`)
    return
}