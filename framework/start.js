const path = require('path')
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const express = require('express')
const web = express()
const Server = require('http').createServer(web)
const io = require('socket.io').listen(Server)
const function_global = require("./namp/function_global.js")
const version = require('./namp/version.js')
const url = require('url')
const returnAjax = require('./namp/returnAjax.js').returnAjax
const ipcMain = require('electron').ipcMain;/*主进程*/
//const string_decoder = require("string_decoder").StringDecoder;
//const StringDecoder = new string_decoder();

ipcMain.on('window-all-closed', () => {//退出
    app.quit();
});
ipcMain.on('hide-window', () => {//小化
    mainWindow.minimize();
});
ipcMain.on('show-window', () => {//最大化
    mainWindow.maximize();
});
ipcMain.on('orignal-window', () => {//还原
    mainWindow.unmaximize();
});

process.stdin.setEncoding('utf8');
start();
function start(){
    function_global.is_install('./namp/namp_config.json',function(is_install,config){
        if(!is_install){/*还没有安装*/
            var open_path = '/index/install.html'
        }else{/*已经安装*/
            var open_path = '/index/index.html'
        }
        var windowOptions = {
            width: 992,
            minWidth: 992,
            height: 725,
            minHeight: 725,
            title: app.getName(),
            frame: false
        }
        if (process.platform === 'linux') {/*设置图标*/
            windowOptions.icon = path.join(__dirname, '/index/assets/app-icon/png/512.png')
        }else if(process.platform === 'win32'){
            windowOptions.icon = path.join(__dirname, '/index/assets/app-icon/win/app.ico')
        }
        mainWindow = new BrowserWindow(windowOptions)
        mainWindow.loadURL(path.join('file://', __dirname, open_path))//主窗口
    })
}
/*取得软件版本信息*/
web.get('/get_versions',function(req,res){
    var Q = url.parse(req.url,true)
    version.get(Q.query.v,function(all){
        returnAjax(req,res,all);
    });
})

/*取得系统盘符*/
web.get('/get_drive',function(req,res){
    var Q = url.parse(req.url,true)
    function_global.get_drive(function(disk){
        returnAjax(req,res,disk);
    })
})

/*初始安装*/
var install_ini ={},install_record ={},install_step =1,install_request="",install_tmp;
const software = require('./namp/software.js')
web.get('/primary_install',function(req,res){
    install_ini = url.parse(req.url,true).query;
    install_record = {};
    install_socket();
    returnAjax(req,res,{
        "type":"success",
        "info":" 正在检查中,请稍候 ...."
    });
})
function install_socket(){
    io.on("connection",function(socket){/*socket.io 安装*/
        socket.on("install",function(d){
            install_request = d.request;
            install_step =  parseInt(d.install_step);
            if( !("install_step"+install_step in install_record) ){/*避免重复提交*/
                install_record["install_step"+install_step] = true;
                console.log(`install in step${install_step}`);
                switch (install_step){
                    case 1:/*step 检查提交的路径是否是正确的*/
                        ++install_step;
                        install_tmp = [{"name":"mongodb_data","path":install_ini.mongodb_data.replace(/\:.+/,':/'),"complete_path":install_ini.mongodb_data},
                            {"name":"mysql_data" ,"path":install_ini.mysql_data.replace(/\:.+/,':/'),"complete_path":install_ini.mysql_data},
                            {"name":"www_root" ,"path" : install_ini.www_root.replace(/\:.+/,':/'),"complete_path":install_ini.www_root}];
                        function_global.check_path_all(install_tmp,function(check_ok,r){
                            var o ={}
                            if(check_ok){/*路径存在 ,开始安装*/
                                o = {"install_step":install_step,"status":true,"data":install_ini}
                            }else{
                                o = {"install_step":"stop","status":false}
                            }
                            socket.emit("install",o);
                        })
                        break;
                    case 2:/*step 创建路径*/
                        ++install_step;
                        var complete_path = [install_ini.mongodb_data,install_ini.mysql_data,install_ini.www_root];
                        function_global.all_mkdir(complete_path,function(){
                            socket.emit("install",{"install_step":install_step,"status":true,"data":complete_path.length});
                        });
                        break;
                    case 3:/*step 解压软件*/
                        ++install_step;
                        version.get(function(all){//得到所有软件
                            software._unzip(all,function(){
                            })
                        });
                        break;
                }
            }
        });
    });
}

app.on("ready",()=>{
    ipcMain.on('dev-tools-window',() =>{ //调试模式
        mainWindow.openDevTools();
    })
});
web.use("/",express.static(__dirname+'/static'))
Server.listen("54222");
