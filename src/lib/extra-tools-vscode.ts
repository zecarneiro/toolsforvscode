import { Terminal } from './../utils/terminal';
import { IProcessing } from '../utils/interface/generic-interface';
import { ShellType } from '../utils/enum/terminal-enum';
import { Generic } from "../utils/generic";
import { IRegVsCmd } from "../utils/interface/generic-interface";
import * as vscode from 'vscode';

export class ExtraToolsVscode {
    // Commands
    private cmdGeneratePackage: string;
    private cmdPrepareDependencyCreateNewExtension: string;
    private cmdCreateNewExtension: string;

    // Others
    private readonly statusBar = 'Generate VSIX';
    private createExtensionsTerminal: Terminal | undefined;

    constructor(
        private generic: Generic
    ) {
        this.cmdGeneratePackage = generic.extensionData.name + '.generatepackage';
        this.cmdPrepareDependencyCreateNewExtension = generic.extensionData.name + '.preparedependencycreateextension';
        this.cmdCreateNewExtension = generic.extensionData.name + '.createnewextension';
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
            }
        ];
        this.generic.createVscodeCommand(commands);
        this.generic.createStatusBar(this.statusBar, this.cmdGeneratePackage);
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
                this.createExtensionsTerminal.exec(`cd "${path}" && yo code`);
            }
        });
    }

    private generateVsixPackages() {
        let type: string[] = ["From PowerShell", "From Bash"];
        let items: vscode.QuickPickItem[] = [{ label: type[0] }, { label: type[1] }];
        this.generic.createQuickPick(items, { canPickMany: false }).then((selected) => {
            selected = selected as vscode.QuickPickItem | undefined;
            if (!selected) {
                return;
            } else {
                let workspaceDir: string = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
                if (workspaceDir.length > 0) {
                    let processing: IProcessing;
                    let typeShell: ShellType = selected.label === type[0] ? ShellType.powershell : ShellType.bash;
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
                    this.generic.extensionData.terminal.execOnOutputChanel('vsce package', workspaceDir, typeShell);
                    processing.disable();
                    this.generic.printOutputChannel("Done");
                }
            }
        });
    }
}