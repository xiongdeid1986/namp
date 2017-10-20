/*版本信息*/
var version = require("./../namp/software_config")

exports.get = function (name,callback){
    if(!name){
        var j = version
    }else{
        var j = version[name]
    }
    if(callback){
        callback(j)
    }else{

    }
}