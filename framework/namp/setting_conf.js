/*配置文件*/
const fs = require('fs')
const path = require('path')
const app_base_path = (path.resolve(__dirname,"../../")+'/app/').replace(/\\/g,"/")
var start_ini,www_root
/*test*/
var test_confs = require('./../test/confs')
var test_install_ini = require('./../test/test_install_ini')
setting_conf_dispose(test_confs,test_install_ini,null,null)

function setting_conf_dispose(all_confs,install_ini,socket,callback){
    start_ini = install_ini
    www_root = (install_ini.www_root+'/').replace(/\\/g,"/")
    if(socket){
        socket.emit("install_status",{
            "step":"setting_conf",
            "info_type":"success",
            "info":`开始配置环境`
        })
    }
    var conf_type_arr = []
    for(var p1 in all_confs){
        conf_type_arr.push(p1)
    }
    (function config_type(i){
        var config_type = conf_type_arr[i]
        var confs = all_confs[config_type]
        var conf_arr = []
        for(var p in confs){
            conf_arr.push(p)
        }
        (function config_arr(j){
            var conf = conf_arr[j]
            var conf_end_arr = confs[conf]
            (function start_setting_conf(k){
                var tmp_path = conf_end_arr[k]
                console.log(tmp_path)
            })(0)
        })(0)
    })(0)
    return
    for(var p1 in all_confs){
        var conf1 = all_confs[p1]//p1 == web_server
        for(var p2 in conf1){
            var conf2 = conf1[p2]//p2 == apache
            for(var i = 0;i<conf2.length;i++){
                var tmp_path = conf2[i]
                if('new' in tmp_path && 'source' in tmp_path){
                    var new_path = tmp_path.new
                    var source_path = tmp_path.source
                    fs.exists(source_path,function(exists){
                        if(exists){
                            console.log(source_path)
                            fs.readFile(source_path,'utf-8',function(e,data){
                                if(e){
                                    console.log(e)
                                }
                                switch(p1){
                                    case "web_server":
                                        data = data.replace(/\%www\_root\%/g,www_root);
                                        data = data.replace(/\%app\_base\_path\%/g,app_base_path);
                                        break;
                                }
                            })
                        }
                    })
                }
            }
        }
    }
}
exports.setting_conf = setting_conf_dispose

