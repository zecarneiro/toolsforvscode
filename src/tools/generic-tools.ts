import * as vscode from 'vscode';
import * as shelljs from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { CommandsEnum } from './../enums/commands-enum';
import { CommandInfoInterface } from './../interfaces/command-info-interface';
import { MessagesEnum } from './../enums/messages-enum';
import { ContantsData } from './../constants-data';
import { Keys } from '../enums/keys-enum';

export class GenericTools {
    private messageToPopup: string;
    constructor() {
        this.messageToPopup = ContantsData.TITLE_APP + ": {0}";
    }

    /*******************************************************
     * Public Area
     ******************************************************/
    sleep(ms: number) {
        let start = new Date().getTime()
        let expire = start + ms;
        while (new Date().getTime() < expire) { }
        return;
    }

    reloadWindow() {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }

    processShellJsError(printstdout = false): boolean {
        if (shelljs.error()) {
            vscode.window.createOutputChannel(shelljs.error());
            return false;
        }
        return true;
    }

    joinWordForValidPath(wordInit: string, wordEnd: string): string {
        return path.join(wordInit, wordEnd);
    }

    showInformationMessage(message: string) {
        vscode.window.showInformationMessage(this.messageToPopup.replace('{0}', message));
    }

    printOnOutputChannel(message: string, isNewLine = true) {
        if (isNewLine) {
            const todayNow = new Date();
            let dateFormated = todayNow.getFullYear() + "-" + todayNow.getMonth() + "-" + todayNow.getDay() + " ";
            dateFormated += todayNow.getHours() + ":" + todayNow.getMinutes() + ":" + todayNow.getSeconds() + "." + todayNow.getMilliseconds();
            
            message = "\[" + dateFormated + "\] " + message;

            ContantsData.OUTPUT_CHANNEL.appendLine("");
            ContantsData.OUTPUT_CHANNEL.append(message);
            ContantsData.OUTPUT_CHANNEL.show(true);
        }
        else {
            ContantsData.OUTPUT_CHANNEL.append(" " + message);
            ContantsData.OUTPUT_CHANNEL.show(true);
        }
    }

    readFile(file: string, directory?: string) {
        let data: any | string;
        file = directory ? this.joinWordForValidPath(directory, file) : file;
        if (shelljs.test('-f', file)) {
            data = shelljs.cat(file);
            if (!this.processShellJsError()) data = undefined;
            else data = data.stdout;
        }
        return data;
    }

    checkFileOrDirExist(fileOrDir: string, isDir = false, path?: string): boolean {
        fileOrDir = path
            ? this.joinWordForValidPath(path, fileOrDir)
            : fileOrDir;
        
        return isDir ? shelljs.test('-e', fileOrDir) : shelljs.test('-f', fileOrDir);
    }

    renameFilesOrDir(nameOld: string, nameNew: string, isDir = false, pathOld?: string, destPath?: string): boolean {
        nameOld = pathOld ? this.joinWordForValidPath(pathOld, nameOld) : nameOld;
        nameNew = destPath ? this.joinWordForValidPath(destPath, nameNew) : nameNew;

        if (this.checkFileOrDirExist(nameOld, isDir)) {
            fs.renameSync(nameOld, nameNew);
            return this.checkFileOrDirExist(nameNew, isDir);
        }
        return false;
    }

    installExtensions(extension: string) {
        let data = "",
            command = this.getCommand(true);
        this.printOnOutputChannel(MessagesEnum.INSTALL_EXTENSION.replace('{0}', extension));

        if (command) {
            command.arguments = command.arguments.replace('{0}', extension);
            const response = this.executeCommand(command);
            if (response.stderr && response.stderr.length && response.stderr.length > 0) {
                data = "ERROR: " + response.stderr.toString();
            } else {
                data = "Done"
            }
        } else {
            data = "Invalid Platform!!!";
        }
        this.printOnOutputChannel(data, false);
    }

    uninstallExtensions(extension: string) {
        let data = "",
            command = this.getCommand(false);
        this.printOnOutputChannel(MessagesEnum.UNINSTALL_EXTENSION.replace('{0}', extension));

        if (command) {
            command.arguments = command.arguments.replace('{0}', extension);
            const response = this.executeCommand(command);
            if (response.stderr && response.stderr.length && response.stderr.length > 0) {
                data = "ERROR: " + response.stderr.toString();
            } else {
                data = "Done"
            }
        } else {
            data = "Invalid Platform!!!";
        }
        this.printOnOutputChannel(data, false);
    }

    /*******************************************************
     * Private Area
     ******************************************************/
    private executeCommand(commandInfo: CommandInfoInterface): child_process.SpawnSyncReturns<any> {
        const response = child_process.spawnSync(commandInfo.executable, [commandInfo.arguments], {shell: true});
        return response;
    }

    private getCommand(isInstall: boolean): CommandInfoInterface | undefined {
        let commandInfo: CommandInfoInterface | undefined;
        let vscodeCMD = isInstall ? CommandsEnum.INSTALL_EXTENSION : CommandsEnum.UNINSTALL_EXTENSION;
        let configData = vscode.workspace.getConfiguration(Keys.APP_CONFIG);
        let platformValue = configData[Keys.PLATFORM_CONFIG]
            ? configData[Keys.PLATFORM_CONFIG] : undefined;

        switch (platformValue) {
            case Keys.PLATFORM_CONFIG_WIN:
                commandInfo = {
                    executable: 'powershell',
                    arguments: "-command \"" + vscodeCMD + "\""
                };
                break;
            case Keys.PLATFORM_CONFIG_LINUX: //TODO: Create to Linux Platform
                break;
            default:
                break;
        }
        return commandInfo;
    }
}