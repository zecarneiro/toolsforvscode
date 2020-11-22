import * as vscode from 'vscode';
import { Settings } from '../settings';

export class Terminal {
    private terminal: vscode.Terminal | any;

    constructor() {
        vscode.window.onDidCloseTerminal(term => {
            this.terminal = undefined;
        });
    }

    private createTerminal() {
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal(Settings.APP_DISPLAY_NAME);
        }
    }

    getTerminal(): vscode.Terminal {
        this.createTerminal();
        return this.terminal;
    }
}