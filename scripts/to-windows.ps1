param(
    $RELOAD_VSCODE_CHANGED_PROFILE
)

if ($RELOAD_VSCODE_CHANGED_PROFILE) {
    & cmd /c start powershell -windowstyle hidden -Command "taskkill /F /IM Code.exe; code"
}

