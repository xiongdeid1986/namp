@echo off
cd D:\web_server\mariadb
mysqld.exe --install-manual "mysql" 
mysqld.exe --initialize
net start mysql