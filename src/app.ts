import { NotifyEnum } from "./utils/enum/lib-enum";
import { ITreeItemExtend, ITreeItemWithChildren } from "./utils/interface/lib-interface";
import { Lib } from "./utils/lib";
import { LibStatic } from "./utils/lib-static";

export abstract class App {
    static readonly id = 'jnoronha.toolsforvscode';
    static readonly extensionName = 'Tools For VSCode';
    abstract readonly activityBarId: string;

    protected filesDir: string;
    protected scriptsDir: string;
    protected readonly tableStateStorage = 'ItemTable';
    protected scriptsToSystem = {
        linux: '',
        windows: ''
    };

    constructor(
        protected lib: Lib,
        private objectName: string
    ) {
        this.filesDir = LibStatic.resolvePath<string>(lib.getExtensionPath() + '/files');
        this.scriptsDir = LibStatic.resolvePath<string>(lib.getExtensionPath() + '/scripts');
        this.scriptsToSystem.linux = LibStatic.resolvePath<string>(this.scriptsDir + '/to-linux.sh');
        this.scriptsToSystem.windows = LibStatic.resolvePath<string>(this.scriptsDir + '/to-windows.ps1');
    }

    protected prepareAll(dataTreeItemVscodeCmd: ITreeItemWithChildren[] | ITreeItemExtend[]) {
        this.lib.createActivityBar(dataTreeItemVscodeCmd, this.activityBarId);
    }

    protected printMessages(data: any, isOutputChannel: boolean, type?: NotifyEnum) {
        if (isOutputChannel) {
            this.lib.consoleExtend.onOutputChannel(data);
        } else {
            LibStatic.notify(`${App.extensionName}-${this.objectName}: ${data}`, type);
        }
    }

    protected getCommand(name: string): string {
        name = `${this.objectName}${name}`;
        return this.lib.getCommandFormated(name);
    }

    closeSshConnection() {
        this.lib.sshExtend.closeConnection();
    }
}