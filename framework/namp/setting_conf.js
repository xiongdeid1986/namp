/*配置文件*/
const fs = require('fs')
const path = require('path')
const app_base_path = (path.resolve(__dirname,"../../")+'/app/').replace(/\\/g,"/")
const fn_global = require("./fn_global.js")
var start_ini,www_root,mysql_data,mongodb_data,mariadb_port,mongodb_port="27017"
/*test*/

//var test_confs = require('./../test/confs')
//var test_install_ini = require('./../test/test_install_ini')
//setting_conf_dispose(test_confs,test_install_ini,null,null)

function setting_conf_dispose(all_confs,install_ini,socket,callback){
    start_ini = install_ini
    www_root = (install_ini.www_root+'/').replace(/\\/g,"/")
    mysql_data = (install_ini.mysql_data+'/').replace(/\\/g,"/")
    mariadb_port = parseInt(install_ini.mariadb_port);
    mariadb_port = (mariadb_port == mariadb_port && mariadb_port != 80 && mariadb_port != 21 ) ? mariadb_port : 3306;
    mongodb_data = (install_ini.mongodb_data+'/').replace(/\\/g,"/")

    if(socket){
        socket.emit("install_status",{
            "step":"setting_conf",
            "info_type":"success",
            "info":`开始配置环境`
        })
    }
    var conf_type_arr = [];
    for(var p1 in all_confs){
        conf_type_arr.push(p1);
    }
    (function config_type_dispose(i){
        var config_type = conf_type_arr[i];
        var confs = all_confs[config_type];
        var conf_arr = [];
        for(var p in confs){
            conf_arr.push(p);
        }
        (function config_arr_dispose(j){
            var conf = conf_arr[j];
            var conf_end_arr = confs[conf];
                //console.log(`conf_end_arr.length => ${conf_end_arr.length}`)
            (function start_setting_conf(k){
                var conf_info = conf_end_arr[k];
                if(conf_info && 'new' in conf_info && 'source' in conf_info){
                    var new_path = conf_info.new;
                    var source_path = conf_info.source;
                    var folder_name = conf_info.folder_name;
                    var this_path = `${app_base_path}${config_type}/${folder_name}/`.replace(/\\/g,'/');
                    fn_global.mkdirs(source_path);
                    fs.readFile(source_path,'utf-8',function(err,data){
                        if(err){
                            console.log(err);
                        }
                        data = data.toString();
                        switch(config_type){
                            case "web_server"://网页服务器替换
                                data = data.replace(/\%app_base_path\%/g,app_base_path);
                                data = data.replace(/\%www_root\%/g,www_root);
                                break;
                            case "php"://网页服务器替换
                                data = data.replace(/\%app_path\%/g,app_base_path);
                                data = data.replace(/\%php_version\%/g,folder_name);
                                break;
                            case "database":
                                data = data.replace(/\%app_path\%/g,app_base_path);
                                data = data.replace(/\%this_path\%/g,this_path);
                                data = data.replace(/\%mariadb_data\_path\%/g,mysql_data);
                                data = data.replace(/\%mariadb_port\%/g,mariadb_port);
                                data = data.replace(/\%mongodb_port\%/g,mongodb_port);
                                data = data.replace(/\%mongodb_data_path\%/g,mongodb_data);
                                break;
                            default:
                                data = data.replace(/\%app_path\%/g,app_base_path);
                                data = data.replace(/\%this_path\%/g,this_path);
                                data = data.replace(/\%www_root\%/g,www_root);
                                break;
                        }
                        fs.writeFile(new_path,data,function(e){
                            if(e){
                                console.log(e)
                            }
                            k++
                            if(k < conf_end_arr.length){
                                start_setting_conf(k)
                            }else{
                                j++
                                if(j<conf_arr.length){
                                    config_arr_dispose(j);
                                }else{
                                    i++
                                    if(i<conf_type_arr.length){
                                        config_type_dispose(i);
                                    }else{
                                        if(socket){
                                            socket.emit("install_status",{
                                                "step":"setting_conf",
                                                "info_type":"success",
                                                "info":`环境配置完毕,准备安装环境..`
                                            })
                                        }
                                        callback();
                                    }
                                }
                            }
                        });
                    });
                }
            })(0);
        })(0);
    })(0);
}
exports.setting_conf = setting_conf_dispose

