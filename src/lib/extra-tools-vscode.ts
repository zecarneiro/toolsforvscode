import { PlatformTypeEnum } from './../utils/enum/generic-enum';
import { Terminal } from './../utils/terminal';
import { IProcessing } from '../utils/interface/generic-interface';
import { Generic } from "../utils/generic";
import { IRegVsCmd } from "../utils/interface/generic-interface";
import * as vscode from 'vscode';

export class ExtraToolsVscode {
    // Commands
    private cmdGeneratePackage: string;
    private cmdPrepareDependencyCreateNewExtension: string;
    private cmdCreateNewExtension: string;
    private cmdRestartVscode: string;

    // Others
    private readonly activityBarId = 'tools-vscode-jnoronha-tools';
    private createExtensionsTerminal: Terminal | undefined;

    constructor(
        private generic: Generic
    ) {
        this.cmdGeneratePackage = generic.extensionData.name + '.generatepackage';
        this.cmdPrepareDependencyCreateNewExtension = generic.extensionData.name + '.preparedependencycreateextension';
        this.cmdCreateNewExtension = generic.extensionData.name + '.createnewextension';
        this.cmdRestartVscode = generic.extensionData.name + '.restartvscode';
    }

    init() {
        let commands: IRegVsCmd[] = [
            {
                command: this.cmdGeneratePackage,
                callback: () => { this.generateVsixPackages(); },
                thisArg: this
            },
            {
                command: this.cmdPrepareDependencyCreateNewExtension,
                callback: () => {
                    this.generic.extensionData.terminal.exec('npm install -g yo');
                    this.generic.extensionData.terminal.exec('npm install -g typescript');
                    this.generic.extensionData.terminal.exec('npm install -g yo generator-code');
                    this.generic.extensionData.terminal.exec('npm install -g vsce');
                },
                thisArg: this
            },
            {
                command: this.cmdCreateNewExtension,
                callback: () => { this.createNewExtensions(); },
                thisArg: this
            },
            {
                command: this.cmdRestartVscode,
                callback: () => { this.restartVscode(); },
                thisArg: this
            }
        ];

        // add activity bar
        let activityBar: vscode.TreeItem[] = [
            {
                label: "Generate VSIX",
                command: { command: this.cmdGeneratePackage, title: '' }
            },
            {
                label: "Create Ext: Prepare Dependencies",
                command: { command: this.cmdPrepareDependencyCreateNewExtension, title: '' }
            },
            {
                label: "Create Extension",
                command: { command: this.cmdCreateNewExtension, title: '' }
            }
        ];

        this.generic.createVscodeCommand(commands);
        this.generic.createActivityBar(activityBar, this.activityBarId, true);
        this.generic.createStatusBar({ text: "Restart", command: this.cmdRestartVscode, tooltip: 'Restart VSCode' });

        // Create and show collapse/expand all statusbar for extension
        this.generic.createStatusBar({ text: "$(collapse-all)", command: "editor.foldAll", tooltip: "Collapse All" });
        this.generic.createStatusBar({ text: "$(expand-all)", command: "editor.unfoldAll", tooltip: "Expand All" });

        // Create and show collapse/expand region statusbar for extension
        this.generic.createStatusBar({ text: "$(fold-up)", command: "editor.foldRecursively", tooltip: "Collapse Recursive By Cursor" });
        this.generic.createStatusBar({ text: "$(fold-down)", command: "editor.unfoldRecursively", tooltip: "Expand Recursive By Cursor" });
    }

    private restartVscode() {
        let output = this.generic.extensionData.terminal.execOnOutputChanel("code -s", undefined, true);
        if (output && output.stdout) {
            let outputCodeMainArr = output.stdout?.split('\r\n')?.find(x => x.includes('code main'))?.split('\t');
            if (outputCodeMainArr) {
                let indexWithPid = 2;
                let scripts = {
                    linux: this.generic.extensionData.path + '/scripts/restart-vscode.sh',
                    windows: this.generic.extensionData.path + '/scripts/restart-vscode.ps1'
                };
                if (outputCodeMainArr[indexWithPid]) {
                    let value: string | undefined;
                    switch (this.generic.getPlatform()) {
                        case PlatformTypeEnum.windows:
                            value = `${scripts.windows} ${outputCodeMainArr[indexWithPid]?.trim()}`;
                            break;
                        case PlatformTypeEnum.linux:
                            value = `${scripts.linux} ${outputCodeMainArr[indexWithPid]?.trim()}`;
                            break;
                        case PlatformTypeEnum.osx: // TODO: IMPLEMENT TO OSX
                            this.generic.notify("Not implemented yet!!!");
                            break;
                    }

                    if (value) {
                        value = this.generic.resolvePath(value) as string;
                        this.generic.extensionData.terminal.execOnOutputChanel(value, undefined);
                    }
                }
            }
        }
    }

    private createNewExtensions() {
        this.generic.showOpenDialog({ canSelectFolders: true }).then(result => {
            let path: string = result && result[0] && result[0]["path"] ? result[0]["path"] : '';
            console.log(path);
            if (path.length > 0) {
                if (!this.createExtensionsTerminal) {
                    this.createExtensionsTerminal = new Terminal('Create Extensions', this.generic);
                }
                path = this.generic.resolvePath(path) as string;
                let separatorCommands: string | undefined;
                switch (this.generic.getPlatform()) {
                    case PlatformTypeEnum.linux:
                        separatorCommands = '&&';
                        break;
                    case PlatformTypeEnum.windows:
                        separatorCommands = ';';
                        break;
                    case PlatformTypeEnum.osx: // TODO: IMPLEMENT TO OSX
                        this.generic.notify("Not implemented yet!!!");
                        break;
                }

                if (separatorCommands) {
                    this.createExtensionsTerminal.exec(`cd '${path}'${separatorCommands} yo code`);
                }
            }
        });
    }

    private generateVsixPackages() {
        let workspaceDir: string = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
        if (workspaceDir.length > 0) {
            let processing: IProcessing;
            let vscodeIgnoreFile = this.generic.resolvePath(workspaceDir + '/.vscodeignore') as string;
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

            if (this.generic.fileExist(vscodeIgnoreFile)) {
                dataToInsert = this.generic.readDocument(vscodeIgnoreFile).trim();
            }

            vscodeIgnoreData.forEach(newData => {
                if (!dataToInsert.includes(newData)) {
                    dataToInsert += "\n" + newData;
                    isNewDataInserted = true;
                }
            });

            if (isNewDataInserted) {
                processing = this.generic.showProcessing("Write " + vscodeIgnoreFile);
                this.generic.writeDocument(vscodeIgnoreFile, dataToInsert);
                processing.disable();
            }

            processing = this.generic.showProcessing("Create package");
            this.generic.extensionData.terminal.execOnOutputChanel('vsce package', workspaceDir);
            processing.disable();
            this.generic.printOutputChannel("Done");
        }
    }
}