import { ExtensionContext, TreeItem } from "vscode";
import { IActivityBarProvider } from "./utils/interface/activity-bar-provider-interface";
import { IRegVsCmd } from "./utils/interface/lib-interface";
import { Lib } from "./utils/lib";
import { LibStatic } from "./utils/lib-static";

export abstract class App {
    static readonly id = 'jnoronha.toolsforvscode';
    abstract readonly activityBarId: string;

    protected lib: Lib;
    protected filesDir: string = LibStatic.resolvePath(LibStatic.getExtensionPath(this.context) + '/files');
    protected scriptsDir: string = LibStatic.resolvePath(LibStatic.getExtensionPath(this.context) + '/scripts');
    protected readonly tableStateStorage = 'ItemTable';

    constructor(
        protected context: ExtensionContext,
    ) {
        this.lib = new Lib(this.context, App.id);
    }

    protected insertVscodeCommands(commands: IRegVsCmd[] | IRegVsCmd) {
        if (commands instanceof Array) {
            this.lib.registerVscodeCommand(commands);
        } else {
            this.lib.registerVscodeCommand([commands]);
        }
    }

    protected insertActivityBar(data: IActivityBarProvider[] | TreeItem[]) {
        LibStatic.createActivityBar(data, this.activityBarId, true);
    }

    closeSshConnection() {
        this.lib.sshExtend.closeConnection();
    }
}