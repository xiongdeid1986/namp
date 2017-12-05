const path = require('path');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const express = require('express');
const web = express();
const namp_base_path = "./namp/";
const Server = require('http').createServer(web);
const io = require('socket.io').listen(Server);
const fn_global = require(`${namp_base_path}fn_global.js`);
const software_config = require(`${namp_base_path}software_config.js`);
const url = require('url');
const returnAjax = require(`${namp_base_path}returnAjax.js`).returnAjax;
const ipcMain = require('electron').ipcMain;/*主进程*/
const setting_conf = require(`${namp_base_path}setting_conf.js`).setting_conf;//安装时配置
const software = require(`${namp_base_path}software_conduct.js`);//软件解压处理.
const fs = require('fs');
const install_namp = require(`${namp_base_path}install_namp.js`);
const config = require(`${namp_base_path}config.js`);
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
    install_namp.is_install(function(is_install,config){
        var open_path/*是否安装的打开地址*/,windowOptions = {
            width: 992,
            minWidth: 992,
            height: 725,
            minHeight: 725,
            title: app.getName(),
            frame: false
        }
        is_install ? open_path = '/index/index.html' : open_path = '/index/install.html';
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
var software_json;
web.get('/get_versions',function(req,res){
    software_config.get(function(soft_json){
        software_json = soft_json
        returnAjax(req,res,software_json);
    });
})

const drive = require(`${namp_base_path}drive.js`)
/*取得系统盘符*/
web.get('/get_drive',function(req,res){
    drive.get_drive(function(disk){
        returnAjax(req,res,disk);
    })
});

/*初始安装*/
var install_record={},install_step=1,install_request="",install_tmp;
web.get('/primary_install',function(req,res){
    install_record = {};
    config.set({"install_ini":url.parse(req.url,true).query},function(config){
        install_socket(config.install_ini/*socket安装*/);
        returnAjax(req,res,{
            "type":"success",
            "info":" 正在检查中,请稍候 ...."
        });
    });
})

function install_socket(install_ini){
    io.on("connection",function(socket){/*socket.io 安装*/
        socket.on("install",function(d){
            install_request = d.request;
            install_step =  parseInt(d.install_step);
            if( !("install_step"+install_step in install_record) ){/*避免重复提交*/
                install_record["install_step"+install_step] = true;
                switch (install_step){
                    case 1:/*step 检查提交的路径是否是正确的*/
                        ++install_step;
                        install_tmp = [{"name":"mongodb_data","path":install_ini.mongodb_data.replace(/\:.+/,':/'),"complete_path":install_ini.mongodb_data},
                            {"name":"mysql_data" ,"path":install_ini.mysql_data.replace(/\:.+/,':/'),"complete_path":install_ini.mysql_data},
                            {"name":"www_root" ,"path" : install_ini.www_root.replace(/\:.+/,':/'),"complete_path":install_ini.www_root}];
                        fn_global.check_path_all(install_tmp,function(check_ok,r){
                            var o ={};
                            if(check_ok){/*路径存在 ,开始安装*/
                                o = {"install_step":install_step,"status":true,"data":install_ini};
                            }else{
                                o = {"install_step":"stop","status":false};
                            }
                            socket.emit("install",o);
                        });
                        break;
                    case 2:/*step 创建路径*/
                        ++install_step;
                        var complete_path = [install_ini.mongodb_data,install_ini.mysql_data,install_ini.www_root];
                        fn_global.all_mkdir(complete_path,function(){
                            socket.emit("install",{"install_step":install_step,"status":true,"data":complete_path.length});
                        });
                        break;
                    case 3:/*step 解压软件*/
                        ++install_step;
                        software._unzip(software_json,socket,install_ini,function(all_confs){
                            setting_conf(all_confs,install_ini,socket,function(){
                                install_namp.command_install(socket,function(){

                                })
                                console.log('配置完成');
                            })
                        },true)
                        break;
                }
            }
        });
    });
}

app.on("ready",()=>{
    ipcMain.on('dev-tools-window',() => { //调试模式
        mainWindow.openDevTools();
    })
});
web.use("/",express.static(__dirname+'/static'));

/*-------- 测试 --------*/
const command = require(`${namp_base_path}command.js`);
web.get("/test",function(req,res){
    //D:/Apache24/bin/httpd -k install
    command.nircmd(`sc delete Apache2.4`,function(r,code){
        returnAjax(req,res,{
            "type":"success",
            "info":r
        });
    },true);
});
Server.listen("54222");
