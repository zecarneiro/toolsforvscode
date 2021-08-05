import { IDirectories } from './../sub-projects/utils/src/interface/directories';
import { ExtensionContext } from 'vscode';
import { IExtensionInfo } from '../sub-projects/utils/src/interface/extension-info';
import { ILogger } from '../sub-projects/utils/src/interface/logger';
import { ITreeItemExtend } from '../sub-projects/utils/src/interface/tree-item-extend';
import { ITreeItemWithChildren } from '../sub-projects/utils/src/interface/tree-item-with-children';
import { FilesSystem } from '../sub-projects/utils/src/nodejs/files-system';
import { SshExtend } from '../sub-projects/utils/src/nodejs/ssh-extend';
import { ConsoleVs } from '../sub-projects/utils/src/vscode/console-vs';
import { GenericVs } from '../sub-projects/utils/src/vscode/generic-vs';
import { WindowManager } from '../sub-projects/utils/src/vscode/window-manager';
import { StorageExtensions } from '../sub-projects/utils/src/vscode/storage-extensions';

export abstract class App {
    static readonly id = 'jnoronha.toolsforvscode';
    static readonly extensionName = 'Tools For VSCode';
    abstract readonly activityBarId: string;
    abstract className: string = '';
    protected currentMethod: string = '';
    protected scriptsToSystem = {
        linux: '',
        windows: ''
    };

    constructor(
        protected context: ExtensionContext,
        protected extensionPath: string,
        protected directories: IDirectories,
        private windowManager: WindowManager,
        private loggerExtension: ILogger
    ) {
        this.scriptsToSystem.linux = FilesSystem.resolvePath(this.directories.scripts + '/to-linux.sh');
        this.scriptsToSystem.windows = FilesSystem.resolvePath(this.directories.scripts + '/to-windows.ps1');
    }

    protected get logger(): ILogger {
        this.loggerExtension.class = undefined;
        this.loggerExtension.method = this.currentMethod;
        return this.loggerExtension;
    }

    private _console: ConsoleVs|undefined;
    protected get console(): ConsoleVs {
        if (!this._console) {
            this._console = new ConsoleVs(App.extensionName, this.logger);
        }
        return this._console;
    }

    private _sshExtend: SshExtend|undefined;
    protected get sshExtend(): SshExtend {
        if (!this._sshExtend) {
            this._sshExtend = new SshExtend(this.logger);
        }
        return this._sshExtend;
    }

    private _storageExtensions: StorageExtensions|undefined;
    protected get storageExtensions(): StorageExtensions {
        if (!this._storageExtensions) {
            this._storageExtensions = new StorageExtensions(this.context, this.logger);
        }
        return this._storageExtensions;
    }

    getExtensionInfo(): IExtensionInfo {
        return GenericVs.getExtensionInfo(App.id);
    }

    getSettings<T = any>(section?: string): T {
        return GenericVs.getExtensionSettings<T>(App.id, section);
    }

    protected getCommand(name: string): string {
        return `${this.getExtensionInfo().name}.${this.className}${name}`;
    }

    protected prepareAll(dataTreeItemVscodeCmd: ITreeItemWithChildren[] | ITreeItemExtend[]) {
        this.windowManager.createActivityBar(dataTreeItemVscodeCmd, this.activityBarId);
    }
}