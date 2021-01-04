import { PlatformTypeEnum } from './utils/enum/generic-enum';
import * as os from 'os';
import { Generic } from './utils/generic';

export namespace Settings {
    export const ID = 'josecnoronha.toolsforvscode';
    export const TABLE_STATE_STORAGE = 'ItemTable';

    // DIR
    export const FILES_DIR = (generic: Generic) => { return generic.resolvePath(generic.extensionData.path + '/files') as string; };
    export const SCRIPTS_DIR = (generic: Generic) => { return generic.resolvePath(generic.extensionData.path + '/scripts') as string; };

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
    };
};