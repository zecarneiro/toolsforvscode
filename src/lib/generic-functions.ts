import { MessageType } from './../enum/message-type';
import { PlatformType } from './../enum/platform-type';
import { ShellCommand } from './../interface/shell-command';
import { Settings } from '../settings';
import * as vscode from 'vscode';
import { StringsReplace } from '../interface/strings-replace';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

export class GenericFunctions {

    static createStatusBar(text: any, command: any, tooltip?: any) {
        const foldRecursiveBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
		foldRecursiveBar.text = text;
		foldRecursiveBar.command = command;
		foldRecursiveBar.tooltip = tooltip;
		foldRecursiveBar.show();
	}

    static getStorage(context: vscode.ExtensionContext, key: string): any {
        return context.globalState.get(key);
    }

    static setStorage(context: vscode.ExtensionContext, key: string, value: any) {
        let oldValue = this.getStorage(context, key);
        if (oldValue !== value) {
            context.globalState.update(key, value);
        }
	}

	static removeDuplicatesValues(array: Array<any>): Array<any> {
        if (array instanceof Array) {
            let newArray: any[] = [];
            array.forEach(value => {
                let exist = false;
                for (const key in newArray) {
                    if (JSON.stringify(newArray[key]) === JSON.stringify(value)) {
                        exist = true;
                        break;
                    }
                }
                if (!exist) {
                    newArray.push(value);
                }
            });
            return newArray;
        }
        return array;
	}
	
	/**
     * @param data string
     * @param type number 1 = warning, 2 = error
     */
	static showMessage(data: string, type?: MessageType) {
        let message: string = Settings.APP_DISPLAY_NAME + ': ' + data;
        switch (type) {
            case MessageType.WARNING:
                vscode.window.showWarningMessage(message);
                break;
            case MessageType.ERROR:
                vscode.window.showErrorMessage(message);
                break;
            default:
                vscode.window.showInformationMessage(message);
                break;
        }
    }

    static printToOutputChannel(data: any, isClear: boolean = true) {
        if (isClear) {
			Settings.CONSOLE_LOG.clear();
        }
        Settings.CONSOLE_LOG.appendLine(data);
        Settings.CONSOLE_LOG.show();
	}
	
	static resolvePath(path: string): string {
        return vscode.Uri.file(path).fsPath;
	}

	static getPlatform(): PlatformType | undefined {		
		switch (process.platform) {
			case 'linux':
				return PlatformType.LINUX;
			case 'win32':
				return PlatformType.WINDOWS;
			default:
				return undefined;
        }
	}
	
	static execShellCMD(shellCommand: ShellCommand, terminal?: vscode.Terminal) {
		let toExecute: string = shellCommand.executable;
		let errormsg = this.name + ": ";

		if (toExecute) {
			if (shellCommand.arguments) {
				shellCommand.arguments.forEach(arg => {
					toExecute += ' ' + arg;
				});
			}

			if (terminal) {
				terminal.sendText(toExecute);
				terminal.show(true);
			} else {
				let command: string = '';
				switch (GenericFunctions.getPlatform()) {
					case PlatformType.WINDOWS:
						command = 'powershell -command \"' + toExecute + '\"';
						break;
					case PlatformType.LINUX:
						command = 'bash -c \"' + toExecute + '\"';
						break;
					default:
						GenericFunctions.printToOutputChannel(errormsg + "Invalid Operating System!!!");
						return;
				}

				GenericFunctions.printToOutputChannel("Run: " + command);
				const response = execSync(command);
				GenericFunctions.printToOutputChannel(`${response}`, false);
			}
		} else {
			GenericFunctions.printToOutputChannel(errormsg + "Invalid command!!!");
		}
	}
	
	/**
     * String Replace All
     * @param data
     * @param keysToReplace [{search: string, toReplace: string}, ...]
     */
	static replaceAll(data: string, keysToReplace?: StringsReplace[]): string {
        keysToReplace?.forEach(value => {
            data = data.split(value.search).join(value.toReplace);
        });
        return data;
    }

    static convertStringJson(data: string | Object | Array<any>, isString?: boolean): string | Object | Array<any> {
        if (isString) {
            return JSON.parse(data as string);
        } else {
            return JSON.stringify(data);
        }
    }

    static fileExist(file: string): boolean {
        let exist: boolean = false;
        try {
            file = GenericFunctions.resolvePath(file);
            if (existsSync(file)) {
                exist = true;
            }
        } catch(err) {
            GenericFunctions.showMessage(err, MessageType.ERROR);
        }
        return exist;
    }
}