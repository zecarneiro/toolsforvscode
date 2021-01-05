param(
    [string] $ID
)
& cmd /c start powershell -windowstyle hidden -Command "Stop-Process -Id $ID; code"