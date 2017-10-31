/*软件版本信息配置文件*/
const base_dir = require("path").resolve(__dirname,"..");
const version = require(`${base_dir}/static/software/software_config`);
exports.get = function ( name, callback ){
    var j;
    if(typeof name == 'function' || name instanceof  Function){
        callback = name;
        j = version;
    }else{
        j = version[name]
    }
    if(callback){
        callback(j)
    }
};