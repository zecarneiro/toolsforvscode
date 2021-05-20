import { LibStatic } from '../utils/lib-static';
import { App } from '../app';
import { QuickPickItem } from 'vscode';
import { Lib } from '../utils/lib';

export class OthersTools extends App {
    static readonly className = 'OthersTools';
    readonly activityBarId = 'others-tools-jnoronha';

    constructor(
        lib: Lib
    ) {
        super(lib, OthersTools.className);
        this.prepareAll([
            {
                treeItem: {
                    label: "Change Java Versions",
                    command: { command: this.getCommand('changejavaversions'), title: '' }
                },
                callback: {
                    caller: this.changeJavaVersions,
                    isSync: true,
                    thisArg: this
                }
            }
        ]);
    }

    private changeJavaVersions() {
        const javaEnv = LibStatic.readEnvVariable("JAVA_HOME");
        const javaVersionsConfig = this.lib.extensionData.configData["javaversions"] as Object;
        if (javaVersionsConfig) {
            let items: QuickPickItem[] = [];

            Object.entries(javaVersionsConfig).forEach(([key, value]) => {
                value = LibStatic.resolvePath<string>(value);
                value = value.substr(value.length - 1) === '/' || value.substr(value.length - 1) === '\\'
                    ? value.slice(0, -1) : value;
                let isActive = javaEnv === value;
                items.push({label: key, detail: value, description: isActive ? 'ACTIVE' : ''});
            });
            LibStatic.createQuickPick(items, { canPickMany: false }).then((selection) => {
                selection = selection as QuickPickItem | undefined;
                // User made final selection
                if (!selection) {
                    return;
                } else {
                    this.lib.consoleExtend.runCommandPowerShellAsAdmin(`${this.scriptsToSystem.windows} -JAVA_PATH '${selection.detail}'`);
                }
            });
        }
    }
}