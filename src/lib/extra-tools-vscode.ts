import { LibStatic } from './../utils/lib-static';
import { App } from '../app';
import { QuickPickItem, workspace } from 'vscode';
import { IProcessing } from '../utils/interface/lib-interface';
import { ShellTypeEnum } from '../utils/enum/console-extends-enum';
import { Lib } from '../utils/lib';

export class ExtraToolsVscode extends App {
    static readonly className = 'ExtraToolsVscode';
    readonly activityBarId = 'tools-vscode-jnoronha-tools';

    constructor(
        lib: Lib
    ) {
        super(lib, ExtraToolsVscode.className);
        this.prepareAll([
            {
                treeItem: {
                    label: "Generate VSIX",
                    command: { command: this.getCommand('generatepackage'), title: "" }
                },
                callback: {
                    caller: this.generateVsixPackages,
                    isSync: true,
                    thisArg: this
                }
            },
            {
                treeItem: {
                    label: "Create Ext: Prepare Dependencies",
                    command: { command: this.getCommand('preparedependencycreateextension'), title: '' }
                },
                callback: {
                    caller: () => {
                        this.lib.consoleExtend.execTerminal('npm install -g yo', undefined, ShellTypeEnum.system);
                        this.lib.consoleExtend.execTerminal('npm install -g typescript', undefined, ShellTypeEnum.system);
                        this.lib.consoleExtend.execTerminal('npm install -g yo generator-code', undefined, ShellTypeEnum.system);
                        this.lib.consoleExtend.execTerminal('npm install -g vsce', undefined, ShellTypeEnum.system);
                    },
                    isSync: true,
                    thisArg: this
                }
            },
            {
                treeItem: {
                    label: "Create Extension",
                    command: { command: this.getCommand('createnewextension'), title: '' }
                },
                callback: {
                    caller: this.createNewExtensions,
                    thisArg: this
                }
            },
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

        // Create and show collapse/expand all statusbar for extension
        LibStatic.createStatusBar({ text: "$(collapse-all)", command: "editor.foldAll", tooltip: "Collapse All" });
        LibStatic.createStatusBar({ text: "$(expand-all)", command: "editor.unfoldAll", tooltip: "Expand All" });

        // Create and show collapse/expand region statusbar for extension
        LibStatic.createStatusBar({ text: "$(fold-up)", command: "editor.foldRecursively", tooltip: "Collapse Recursive By Cursor" });
        LibStatic.createStatusBar({ text: "$(fold-down)", command: "editor.unfoldRecursively", tooltip: "Expand Recursive By Cursor" });
    }

    private async createNewExtensions() {
        let result = await LibStatic.showOpenDialog({ canSelectFolders: true });
        let path: string = result && result[0] && result[0]["path"] ? result[0]["path"] : '';
        if (path.length > 0) {
            path = LibStatic.resolvePath(path);
            this.lib.consoleExtend.execTerminal('yo code', path, ShellTypeEnum.system);
        }
    }

    private generateVsixPackages() {
        let workspaceDir: string = workspace.workspaceFolders ? workspace.workspaceFolders[0].uri.fsPath : '';
        if (workspaceDir.length > 0) {
            let processing: IProcessing;
            let vscodeIgnoreFile = LibStatic.resolvePath<string>(workspaceDir + '/.vscodeignore');
            let vscodeIgnoreData: string[] = [
                ".vscode/**",
                ".vscode-test/**",
                "build/**",
                "out/**",
                "src/**",
                ".gitignore",
                ".yarnrc",
                "vsc-extension-quickstart.md",
                "**/tsconfig.json",
                "**/.eslintrc.json",
                "**/*.map",
                "**/*.ts",
                ".gitmodules",
                ".gitattributes",
                ".vscodeignore",
                ".git/**",
                "webpack.config.js",
                "node_modules/**"
            ];
            let dataToInsert: string = '';
            let isNewDataInserted = false;

            if (LibStatic.fileExist(vscodeIgnoreFile, false)) {
                dataToInsert = LibStatic.readDocument(vscodeIgnoreFile).trim();
            }

            vscodeIgnoreData.forEach(newData => {
                if (!dataToInsert.includes(newData)) {
                    dataToInsert += "\n" + newData;
                    isNewDataInserted = true;
                }
            });

            if (isNewDataInserted) {
                processing = LibStatic.showProcessing("Write " + vscodeIgnoreFile, this.lib.consoleExtend.outputChannel);
                LibStatic.writeDocument(vscodeIgnoreFile, dataToInsert);
                processing.disable();
            }

            processing = LibStatic.showProcessing("Create package", this.lib.consoleExtend.outputChannel);
            this.lib.consoleExtend.execOutputChannel('vsce package', { cwd: workspaceDir, shell: this.lib.consoleExtend.getShell(ShellTypeEnum.bash).command });
            processing.disable();
            this.lib.consoleExtend.onOutputChannel("Done", {isNewLine: true});
        }
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