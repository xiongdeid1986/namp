net stop http
Sc config http start= disabled
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\HTTP" /v "Start" /t reg_dword /d "0" /f
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" /v "c:\windows\system32\cmd.exe" /t reg_sz /d "RUNASADMIN" /f
cmd
