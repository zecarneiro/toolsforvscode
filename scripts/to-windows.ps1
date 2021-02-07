param(
    $JAVA_PATH,
    $RELOAD_VSCODE_CHANGED_PROFILE
)

if ($RELOAD_VSCODE_CHANGED_PROFILE) {
    & cmd /c start powershell -windowstyle hidden -Command "taskkill /F /IM Code.exe; code"
}

if ($JAVA_PATH) {
    $sysenv = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment"
    $path = (Get-ItemProperty -Path $sysenv -Name Path).Path

    # Remove old
    $oldJava = "$env:JAVA_HOME"
    $path = $path.replace(";$oldJava\bin", "")

    setx /m JAVA_HOME "$JAVA_PATH"
    $path = $path + ";$JAVA_PATH\bin"
    Set-ItemProperty -Path "$sysenv" -Name Path -Value "$path"
    Stop-Process -ProcessName explorer
}

