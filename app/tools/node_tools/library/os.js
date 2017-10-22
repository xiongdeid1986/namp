const os = require("os")
var osInfo = {}

osInfo["totalmem"] = {}
osInfo["totalmem"]["description"] = "计算机内存"
osInfo["totalmem"]["value"] = parseInt((parseInt(os.totalmem())/1024/1024/1024)*100)/100

osInfo["arch"] = {}
osInfo["arch"]["description"] = "cpu处理器架构"
osInfo["arch"]["value"] = os.arch()

osInfo["cpus"] = {}
osInfo["cpus"]["description"] = "cpu信息"
osInfo["cpus"]["value"] = os.cpus()

osInfo["endianness"] = {}
osInfo["endianness"]["description"] = "字节顺序"//高位优先BE,低位优先的LE
osInfo["endianness"]["value"] = os.endianness()

osInfo["freemem"] = {}
osInfo["freemem"]["description"] = "空闲内存"
osInfo["freemem"]["value"] = parseInt((parseInt(os.freemem())/1024/1024/1024)*100)/100

osInfo["homedir"] = {}
osInfo["homedir"]["description"] = "当前用户根目录"
osInfo["homedir"]["value"] = os.homedir()

osInfo["hostname"] = {}
osInfo["hostname"]["description"] = "系统主机名"
osInfo["hostname"]["value"] = os.hostname()

osInfo["loadavg"] = {}
osInfo["loadavg"]["description"] = "最近5、10、15分钟平均负载" /*针对linux或unix的统计，windows下始终返回[0,0,0]*/
osInfo["loadavg"]["value"] = os.loadavg()

osInfo["networkInterfaces"] = {}
osInfo["networkInterfaces"]["description"] = "网络配置列表"
osInfo["networkInterfaces"]["value"] = os.networkInterfaces()

osInfo["platform"] = {}
osInfo["platform"]["description"] = "系统类型" /*'darwin', 'freebsd', 'linux', 'sunos', 'win32*/
osInfo["platform"]["value"] = os.platform()

osInfo["release"] = {}
osInfo["release"]["description"] = "系统版本"
osInfo["release"]["value"] = os.release()

osInfo["type"] = {}
osInfo["type"]["description"] = "操作系统名称"
osInfo["type"]["value"] = os.type()

osInfo["tmpdir"] = {}
osInfo["tmpdir"]["description"] = "临时文件目录"
osInfo["tmpdir"]["value"] = os.tmpdir()

osInfo["uptime"] = {}
osInfo["uptime"]["description"] = "计算机正常运行时间"
osInfo["uptime"]["value"] = os.uptime()

exports.osInfo = osInfo
exports.os = os
