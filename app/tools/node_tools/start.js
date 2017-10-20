const path = require('path')
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const express = require('express')
const web = express()
const function_global = require("./namp/function_global.js")
const version = require('./namp/version.js')
const url = require('url')
const ipcMain = require('electron').ipcMain;/*主进程*/
web.listen("54222");
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
start()
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
    version.get(Q.query.v,function(php){
        var r = ''
        php = JSON.stringify(php)
        if('jsoncallback' in Q.query){
            r = `${Q.query.jsoncallback}(${php})`
        }else{
            r = php
        }
        res.end(r)
    })
})

/*取得系统盘符*/
web.get('/show_letter',function(req,res){
    var Q = url.parse(req.url,true)
    function_global.spawn([`wmic LOGICALDISK get name,Description,filesystem,size,freespace`],function(result){
        var r = ''
        //
        result = JSON.stringify(result)
        if('jsoncallback' in Q.query){
            r = `${Q.query.jsoncallback}(${result})`
        }else{
            r = result
        }
        res.end(r)
    })
})
app.on("ready",()=>{
    ipcMain.on('dev-tools-window',() =>{ //调试模式
        mainWindow.openDevTools();
    })
})

