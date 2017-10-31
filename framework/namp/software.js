const fs = require('fs')
const unzip = require('unzip');
const path = require('path');
const framework_path = path.resolve(__dirname,"..").replace(/\\/g,"/")
const software_save_base_path = (framework_path+"/static/software/").replace(/\\/g,"/")//软件存放的基本路径
const software_unzip_base_path = (path.resolve(framework_path,"..")+"/app/").replace(/\\/g,"/")//解压的基本路径


var all_soft_count = 0
var soft_count = 0
var all_confs = {}
var be_zip = []
/*解压并安装软件*/
exports._unzip = function(all_soft,socket,callback,debug){/*需要解压的所有 软件版本*/
    var soft_group = []
    var soft_unzip_count = {} //软件解压计数器
    for(var p in all_soft) {
        soft_unzip_count[p] = 0
        soft_group.push(p)
    }
    //分组解压
    (function unzip_group(number){
        var p = soft_group[number]
        all_confs[p] = {}//软件解压后用于返回配置文件
        var tmp_base_path = `${software_save_base_path}${p}`
        var all_soft2 = all_soft[p].softs
        var softsArr = []
        for (var p2 in all_soft2) {
            softsArr.push(p2)
            /*`${tmp_base_path}${soft_info.path}${soft_info.file_name}`
            * unzip_software(tmp_base_path,soft_info, function () {
              console.log("解压完成");
            })
            */
        }
        socket.emit('install_status',{
            "step":"unzip",
            "info_type":"success",
            "info":"准备解压系统软件."
        })
        //开始解压
        unzip_software(all_soft,tmp_base_path,softsArr,p,socket,0,soft_unzip_count,function(){
            number++
            if(number<soft_group.length){
                unzip_group(number)
            }else{
                callback(all_confs);
            }
        });
    })(0)
}
/*开始解压*/
function unzip_software(all_soft,tmp_base_path,softsArr,p,socket,i,soft_unzip_count,fn){
    all_soft_count++
    var soft_name = softsArr[i]
    all_confs[p][soft_name]={} //软件解压完毕后用于返回所有配置文件
    var the_softs = all_soft[p].softs
    var soft_info = the_softs[soft_name]
    var unzip_file = `${tmp_base_path}${soft_info.path}${soft_info.file_name}`//获取软件的绝对地址
    var unzip_path = `${software_unzip_base_path}${p}/`//获取软件的解压地址

    //收集配置文件
    var confs = soft_info.conf
    for(var tmpi = 0;tmpi<confs.length;tmpi++){
        var tmpconfig = confs[tmpi]
        all_confs[p][soft_name]['new'] = `${unzip_path}${soft_info.folder_name}/${tmpconfig}`
        all_confs[p][soft_name]['source'] = `${framework_path}/template/${p}/${soft_name}/${tmpconfig}`
    }

    if(!fs.existsSync(unzip_path)){
        try{
            fs.mkdirSync(unzip_path)
            socket.emit('install_status',{
                "step":"unzip",
                "info_type":"success",
                "info":`创建 ${unzip_path} 成功!`
            })
        }catch(e){
            socket.emit('install_status',{
                "step":"unzip",
                "info_type":"danger",
                "info":`创建 ${unzip_path} 失败, 尝试创建上级目录!`
            })
            fs.mkdirSync(path.resolve(unzip_path,".."))
            fs.mkdirSync(unzip_path)
        }
    }
    var extract = unzip.Extract({ path: unzip_path});
    be_zip.push(soft_info.folder_name)
    extract.on('error', function(err) {
        soft_count++
        soft_unzip_count[p]++
        socket.emit('install_status',{
            "step":"unzip",
            "info_type":"danger",
            "info":`解压错误 ${err} `
        })//解压异常处理
    });
    extract.on('finish', function() {
        soft_count++
        soft_unzip_count[p]++
        be_zip = be_zip.join(',').split(soft_info.folder_name+',').join('').split(",")
        socket.emit('install_status',{
            "step":"unzip",
            "info_type":"success",
            "info":`${all_soft[p].description}[${soft_info.folder_name}]解压成功 all=> ${soft_count}/${all_soft_count} , gorup=> ${soft_unzip_count[p]}/${softsArr.length}`
        })//解压异常处理
        console.log(`unzip => ${soft_info.folder_name}`)
        if(softsArr.length == soft_count){
            console.log(`${p} ok!`)
        }
    });
    if(fs.existsSync(unzip_file)){
        fs.createReadStream(unzip_file).pipe(extract);
    }else{
        soft_count++
        socket.emit('install_status',{
            "step":"unzip",
            "info_type":"danger",
            "info":`软件包不存在 ${soft_info.file_name} !`
        })
    }
    i++;
    if(i < softsArr.length){
        unzip_software(all_soft,tmp_base_path,softsArr,p,socket,i,fn);
    }
    if(i == softsArr.length){
        if(fn){
            fn()
        }
    }
    /*如果文件不存在,先创建文件.*/
}
