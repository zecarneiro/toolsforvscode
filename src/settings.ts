import * as vscode from 'vscode';

export namespace Settings {
    export const APP_NAME = "toolsforvscode";
    export const APP_DISPLAY_NAME = "Tools for VSCode";
    export const CONSOLE_LOG = vscode.window.createOutputChannel(Settings.APP_DISPLAY_NAME);
    export const CONFIG_DATA = vscode.workspace.getConfiguration(Settings.APP_NAME);
    export const STATE_STORAGE_DISABLED_EXTENSION_KEY = "extensionsIdentifiers/disabled"; 

    // COMMANDS
    export const CMD_PROFILES_MANAGER = Settings.APP_NAME + '.profilesmanager';
    export const CMD_INSTALL = Settings.APP_NAME + '.extensionsinstall';
    export const CMD_UNINSTALL = Settings.APP_NAME + '.extensionsuninstall';    

    // CONFIGURATIONS
    export const CONFIG_PROFILES = 'profiles';
}