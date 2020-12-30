import { PlatformTypeEnum } from './utils/enum/generic';
import * as vscode from 'vscode';
import * as os from 'os';
import { Generic } from './utils/generic';

export namespace Settings {
    export const APP_NAME = "Tools for VSCode";
    export const EXTENSION_NAME = "toolsforvscode";
    export const CONFIG_DATA = vscode.workspace.getConfiguration(EXTENSION_NAME);
    export const OUTPUT_CHANNEL = vscode.window.createOutputChannel(APP_NAME);
    export const TABLE_STATE_STORAGE = 'ItemTable';

    // DIR
    export const FILES_DIR = __dirname + '/files';
    export const SCRIPTS_DIR = __dirname + '/scripts';

    // FILES
    export const VSCODE_STATE_STORAGE_FILE = (generic: Generic) => {
        let homeDir: string = os.homedir();
        let stateStorageFile: string = 'Code/User/globalStorage/state.vscdb';
        switch (generic.getPlatform()) {
            case PlatformTypeEnum.linux:
                stateStorageFile = homeDir + '/.config/' + stateStorageFile;
                break;
            case PlatformTypeEnum.windows:
                stateStorageFile = homeDir + '\\AppData\\Roaming\\' + stateStorageFile;
                break;
            default:
                stateStorageFile = '';
                break;
        }
        return generic.resolvePath(stateStorageFile) as string;
    }
};