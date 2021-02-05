param(
    $JAVA_PATH,
    $RESTART_VSCODE
)

if ($RESTART_VSCODE) {
    & cmd /c start powershell -windowstyle hidden -Command "taskkill /F /IM Code.exe; code"
}

if ($JAVA_PATH) {
    $sysenv = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment"
    $path = (Get-ItemProperty -Path $sysenv -Name Path).Path

    # Remove old
    $oldJava = "$env:JAVA_HOME"
    $path = $path.replace(";$oldJava\bin", "")

    setx JAVA_HOME "$JAVA_PATH"
    $path = $path + ";$JAVA_PATH\bin"
    Set-ItemProperty -Path "$sysenv" -Name Path -Value "$path"
}

