const path = require('path')
const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const fs = require('fs')
const ipcMain = require('electron').ipcMain;/*主进程*/
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
/*
* 判断是否安装了namp环境,则namp_config.json判断*/
fs.readFile('./namp/namp_config.json',function(e,config){
	if(e){
		console.log(e)
	}
    config=config.toString()
	try{
        config = JSON.parse(config)
	}catch(e){
        config = {}
	}
	/*没有配置文件,还没有安装*/
	if(config == {}){/*初始安装*/

	}else{/*已经安装*/

	}
})

app.on('ready',function(){
	var windowOptions = {
      width: 992,
      minWidth: 992,
      height: 725,
      minHeight: 725,
      title: app.getName(),
	  frame: false
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/index/index.html'))//主窗口
    //mainWindow.openDevTools();

})
