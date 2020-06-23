"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericTools = void 0;
const commands_enum_1 = require("./../enums/commands-enum");
const messages_enum_1 = require("./../enums/messages-enum");
const constants_data_1 = require("./../constants-data");
const vscode = require("vscode");
const shelljs = require("shelljs");
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const keys_enum_1 = require("../enums/keys-enum");
class GenericTools {
    constructor() { }
    sleep(ms) {
        let start = new Date().getTime();
        let expire = start + ms;
        while (new Date().getTime() < expire) { }
        return;
    }
    processShellJsError(printstdout = false) {
        if (shelljs.error()) {
            vscode.window.createOutputChannel(shelljs.error());
            return false;
        }
        return true;
    }
    joinWordForValidPath(wordInit, wordEnd) {
        return path.join(wordInit, wordEnd);
    }
    printOnOutputChannel(message, isNewLine = true) {
        constants_data_1.ContantsData.OUTPUT_CHANNEL.show();
        if (isNewLine) {
            const todayNow = new Date();
            let dateFormated = todayNow.getFullYear() + "-" + todayNow.getMonth() + "-" + todayNow.getDay() + " ";
            dateFormated += todayNow.getHours() + ":" + todayNow.getMinutes() + ":" + todayNow.getSeconds() + "." + todayNow.getMilliseconds();
            message = "\[" + dateFormated + "\] " + message;
            constants_data_1.ContantsData.OUTPUT_CHANNEL.appendLine("");
            constants_data_1.ContantsData.OUTPUT_CHANNEL.append(message);
        }
        else {
            constants_data_1.ContantsData.OUTPUT_CHANNEL.append(" " + message);
        }
    }
    readFile(file, directory) {
        let data;
        file = directory ? this.joinWordForValidPath(directory, file) : file;
        if (shelljs.test('-f', file)) {
            data = shelljs.cat(file);
            if (!this.processShellJsError())
                data = undefined;
            else
                data = data.stdout;
        }
        return data;
    }
    checkFileOrDirExist(fileOrDir, isDir = false, path) {
        fileOrDir = path
            ? this.joinWordForValidPath(path, fileOrDir)
            : fileOrDir;
        return isDir ? shelljs.test('-e', fileOrDir) : shelljs.test('-f', fileOrDir);
    }
    renameFilesOrDir(nameOld, nameNew, isDir = false, pathOld, destPath) {
        nameOld = pathOld ? this.joinWordForValidPath(pathOld, nameOld) : nameOld;
        nameNew = destPath ? this.joinWordForValidPath(destPath, nameNew) : nameNew;
        if (this.checkFileOrDirExist(nameOld, isDir)) {
            fs.renameSync(nameOld, nameNew);
            return this.checkFileOrDirExist(nameNew, isDir);
        }
        return false;
    }
    installExtensions(extension) {
        let data = "", command = this.getCommand(true);
        this.printOnOutputChannel(messages_enum_1.MessagesEnum.INSTALL_EXTENSION.replace('{0}', extension));
        this.sleep(constants_data_1.ContantsData.SLEEP_TIME);
        if (command) {
            command.arguments = command.arguments.replace('{0}', extension);
            const response = this.executeCommand(command);
            if (response.stderr && response.stderr.length && response.stderr.length > 0) {
                data = "ERROR: " + response.stderr.toString();
            }
            else {
                data = "Done";
            }
        }
        else {
            data = "Invalid Platform!!!";
        }
        this.printOnOutputChannel(data, false);
    }
    uninstallExtensions(extension) {
        let data = "", command = this.getCommand(false);
        this.printOnOutputChannel(messages_enum_1.MessagesEnum.UNINSTALL_EXTENSION.replace('{0}', extension));
        this.sleep(constants_data_1.ContantsData.SLEEP_TIME);
        if (command) {
            command.arguments = command.arguments.replace('{0}', extension);
            const response = this.executeCommand(command);
            if (response.stderr && response.stderr.length && response.stderr.length > 0) {
                data = "ERROR: " + response.stderr.toString();
            }
            else {
                data = "Done";
            }
        }
        else {
            data = "Invalid Platform!!!";
        }
        this.printOnOutputChannel(data, false);
    }
    executeCommand(commandInfo) {
        const response = child_process.spawnSync(commandInfo.executable, [commandInfo.arguments], { shell: true });
        return response;
    }
    getCommand(isInstall) {
        let commandInfo;
        let vscodeCMD = isInstall ? commands_enum_1.CommandsEnum.INSTALL_EXTENSION : commands_enum_1.CommandsEnum.UNINSTALL_EXTENSION;
        let configData = vscode.workspace.getConfiguration(keys_enum_1.Keys.APP_CONFIG);
        let platformValue = configData[keys_enum_1.Keys.PLATFORM_CONFIG]
            ? configData[keys_enum_1.Keys.PLATFORM_CONFIG] : undefined;
        switch (platformValue) {
            case keys_enum_1.Keys.PLATFORM_CONFIG_WIN:
                commandInfo = {
                    executable: 'powershell',
                    arguments: "-command \"" + vscodeCMD + "\""
                };
                break;
            case keys_enum_1.Keys.PLATFORM_CONFIG_LINUX: //TODO: Create to Linux Platform
                break;
            default:
                break;
        }
        return commandInfo;
    }
}
exports.GenericTools = GenericTools;
//# sourceMappingURL=generic-tools.js.map