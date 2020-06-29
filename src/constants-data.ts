import * as vscode from 'vscode';

export class ContantsData {
    public static RELOAD_STATUS_BAR = 'Reload';
    public static TITLE_STATUS_BAR = 'Extensions Manager';
    public static TITLE_APP = ContantsData.TITLE_STATUS_BAR + ' Profile';
    public static OUTPUT_CHANNEL = vscode.window.createOutputChannel(ContantsData.TITLE_APP);
    public static SLEEP_TIME = 500;
}