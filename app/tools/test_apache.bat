@echo off
echo test_apache
D:
cd D:/web_server/Apache24/bin
httpd.exe -w -n "httpd" -k start
cmd
