const fs = require('fs');
const unzip = require('unzip');
const path = require('path');
const framework_path = path.resolve(__dirname,"..").replace(/\\/g,"/");
const software_save_base_path = (framework_path+"/static/software/").replace(/\\/g,"/");//软件存放的基本路径
var software_unzip_base_path = (path.resolve(framework_path,"..")+"/app/").replace(/\\/g,"/");//解压的基本路径 默认的app目录
var start_ini /*安装初始数据*/,is_unzip = true,/*是否真的解压(用于测试是调试)*/all_soft_count = 0,soft_count = 0,all_confs = {},be_zip = [];
/*解压并安装软件*/
exports._unzip = function(all_soft,socket,install_ini,callback,confirm_unzip,debug){/*需要解压的所有 软件版本*/
    is_unzip = confirm_unzip
    start_ini = install_ini
    var soft_group = []
    var soft_unzip_count = {} //软件解压计数器
    for(var p in all_soft) {
        soft_unzip_count[p] = 0
        soft_group.push(p)
    }
    for(var s=0;s<soft_group.length;s++){ //取得所有软件统计
        for (var p22 in all_soft[soft_group[s]].softs) {
            all_soft_count++
        }
    }
    (function unzip_group(number){ //分组解压
        var p = soft_group[number]
        all_confs[p] = {}//软件解压后用于返回配置文件
        var tmp_base_path = `${software_save_base_path}${p}`
        var all_soft2 = all_soft[p].softs
        var softsArr = []
        for (var p2 in all_soft2) {
            softsArr.push(p2)
        }
        socket.emit('install_status',{
            "step":"unzip",
            "info_type":"success",
            "info":"准备解压系统软件."
        });//开始解压
        unzip_software(all_soft,tmp_base_path,softsArr,p,socket,0,soft_unzip_count,function(finish){
            if(finish){
                callback(all_confs);
            }else{
                number++;
                if(number<soft_group.length){
                    unzip_group(number);
                }
            }
        });
    })(0);
}
/*开始解压*/
function unzip_software(all_soft,tmp_base_path,softsArr,p,socket,i,soft_unzip_count,fn){
    var soft_name = softsArr[i]
    all_confs[p][soft_name]=[] //软件解压完毕后用于返回所有配置文件
    var the_softs = all_soft[p].softs
    var soft_info = the_softs[soft_name]
    var folder_name = soft_info.folder_name
    var unzip_file = `${tmp_base_path}${soft_info.path}${soft_info.file_name}`//获取软件的绝对地址
    var unzip_path = `${software_unzip_base_path}${p}/`//获取软件的解压地址
    //收集配置文件
    var confs = soft_info.conf
    for(var tmpi = 0;tmpi<confs.length;tmpi++){
        var tmpconfig = confs[tmpi]
        var confs_tmp_json = {
            "new":`${unzip_path}${folder_name}/${tmpconfig}`,
            "source":`${framework_path}/template/${p}/${soft_name}/${tmpconfig}`,
            "folder_name":folder_name
        }
        all_confs[p][soft_name].push(confs_tmp_json)
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
        })
        /*--------= = *解压结束* = =--------*/
        if(softsArr.length == soft_unzip_count[p] && all_soft_count == soft_count){
            console.log(`all ok from error!~~~~~~~~~~~~~~`)
        }
    });
    extract.on('finish', function() {
        soft_count++
        soft_unzip_count[p]++
        be_zip = be_zip.join(',').split(soft_info.folder_name+',').join('').split(",")
        socket.emit('install_status',{
            "step":"unzip",
            "info_type":"success",
            "info":`解压 ${all_soft[p].description} ${soft_info.folder_name} [${p}:${soft_unzip_count[p]}/${softsArr.length}|${soft_count}/${all_soft_count}]`
        })
        /*--------= = *解压结束* = =--------*/
        console.log(`unzip => ${soft_info.folder_name}`)
        if(softsArr.length == soft_unzip_count[p]){
            console.log(`${p} ok!`)
        }
        if(softsArr.length == soft_unzip_count[p] && all_soft_count == soft_count){
            console.log(`all ok  from finish!~~~~~~~~~~~~~~`)
            if(fn){
                fn(true)
            }
        }
    });
    if(fs.existsSync(unzip_file)){
        if(is_unzip){
            fs.createReadStream(unzip_file).pipe(extract);
        }
    }else{
        soft_count++
        soft_unzip_count[p]++
        socket.emit('install_status',{
            "step":"unzip",
            "info_type":"danger",
            "info":`软件包不存在 ${soft_info.file_name} !`
        })
    }
    if(p == 'database' && "data" in soft_info){//如果是数据库, 并包含初始数据库,则另外解压
        unzip_database_data(soft_info,tmp_base_path)
    }
    i++;
    if( i < softsArr.length ){
        unzip_software(all_soft,tmp_base_path,softsArr,p,socket,i,soft_unzip_count,fn);
    }else{
        if(fn){
            fn(false)
        }
    }
}
//解压数据库
function unzip_database_data(soft_info,tmp_base_path){
    var data_info = soft_info.data
    var data_path = `${tmp_base_path}${data_info.path}${data_info.file_name}`
    var target_path = ''
    switch (soft_info.folder_name){
        case "mariadb":
            target_path = `${start_ini.mysql_data}/`
            break;
        case "mongodb":
            target_path = `${start_ini.mongodb_data}/`
            break;
    }
    target_path = target_path.replace(/\/\//g,"/");
    if(!fs.existsSync(data_path)){
        fs.mkdirSync(data_path)
    }
    var extract = unzip.Extract({ path: target_path});
    extract.on('finish', function() {
        console.log(`${soft_info.folder_name} data - unzip success!`)
    })
    fs.createReadStream(data_path).pipe(extract);
}