import * as vscode from 'vscode';

export class ContantsData {
    public static TITLE_APP = 'Extensions Manager Profile';
    public static OUTPUT_CHANNEL = vscode.window.createOutputChannel(ContantsData.TITLE_APP);
    public static SLEEP_TIME = 5000;
}