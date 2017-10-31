const fs = require('fs')
const unzip = require('unzip');
const path = require('path');
const software_save_base_path = path.resolve(__dirname,"..")+"/static/software/".replace(/\\/,"/")//软件存放的基本路径
const software_unzip_base_path = path.resolve(__dirname,"..")+"/app".replace(/\\/,"/")//解压的基本路径

/*取得软件总类别*/
function getAllType(all_soft,callback){
    var all =[]
    for(var p in all_soft){
        all.push(p);
    }
    if(callback){
        callback(all);
    }
    return all;
}
/*解压并安装软件*/
exports._unzip = function(all_soft,callback,debug){/*需要解压的所有 软件版本*/
    var all_type = getAllType(all_soft);
    (function enter_softwareType(i){
        var softPath = all_type[i];
        console.log(softPath);
        console.log(software_save_base_path);
        console.log(software_unzip_base_path);

    })(0);
    return
    (function unzip_software(i){
        /*如果文件不存在,先创建文件.*/
        fs.exists(unzip_path,function(exists){
            if(!exists){
                fs.mkdir(unzip_path,function(e){
                    if(e){
                        console.log(e);
                    }
                    unzip_software(i);
                });
            }else{
                if(exists_path){/*如果存在则不必重复解压..*/
                    console.log(unzip_name.rainbow+" ●-●>--> 已经被解压 (((m -_-)m ".info);
                    callback(zip_version);
                    return;
                }else{
                    var suffix = ".zip";
                    var zip_name = zip_version[i]+suffix;
                    var extract = unzip.Extract({ path: unzip_path});
                    extract.on('error', function(err) {
                        console.log("error++++++++++++++++++++++");
                        console.log(err);
                        //解压异常处理
                    });
                    extract.on('finish', function() {
                        n++;/*每个完成的计数器*/
                        var plan = "解压完成["+n+"/"+zip_version.length+"]";
                        console.log(unzip_name.rainbow+" ●-●>--> ".info + zip_name.red+" ~~~~".info + plan.info+"~~~~ (＝^ω^＝)".info);
                        if(n == zip_version.length){
                            console.log(unzip_name.rainbow+" ●-●>--> 全部解压完毕 (((m -_-)m ".info);
                            callback(zip_version);
                        }
                        /*解压完成处理*/
                    });
                    var zip_path = './../core_software/'+zip_name;
                    fs.exists(zip_path,function(exists){
                        if(!exists){
                            var exists_text = ' ●-●>-->' + zip_path + ' 文件不存在~~~ ';
                            console.log(exists_text.red);
                        }
                    });
                    fs.createReadStream(zip_path).pipe(extract);
                    i++;
                    if(i < zip_version.length){
                        unzip_software(i);
                    }
                }
            }
        });
    })(0);
}
