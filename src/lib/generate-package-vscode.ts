import { ShellType } from './../utils/enum/terminal';
import { SettingsGeneratePackageVscode } from "../settings/generate-package-vscode";
import { Generic } from "../utils/generic";
import { IRegVsCmd } from "../utils/interface/generic";
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as os from 'os';
import { Terminal } from "../utils/terminal";

export class GeneratePackageVscode {
    constructor(
        private generic: Generic,
        private terminal: Terminal
    ) { }

    init() {
        let commands: IRegVsCmd[] = [
            {
                command: SettingsGeneratePackageVscode.CMD_GENERATE_PACKAGE,
                callback: () => { this.createMenu(); },
                thisArg: this
            }
        ];
        this.generic.createVscodeCommand(commands);
        this.generic.createStatusBar(SettingsGeneratePackageVscode.STATUS_BAR, SettingsGeneratePackageVscode.CMD_GENERATE_PACKAGE);
    }

    private createVsiPackages(typeShell: ShellType) {
        let workspaceDir: string = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
        if (workspaceDir.length > 0) {
            const tmpDir = os.tmpdir();
            let dirTemp = fs.mkdtempSync(this.generic.resolvePath(tmpDir + '/package-vscode-') as string);
            let filesToDelete = ['src', '.git', '.vscode', '.gitignore', '.vscodeignore', '.gitattributes', '.gitmodules'];

            this.generic.printOutputChannel("Create Temp dir: " + dirTemp + "...", false, "", true);
            fs.mkdirSync(dirTemp, { recursive: true });

            this.generic.printOutputChannel("Compile...");
            this.terminal.execOnOutputChanel("npm run compile", workspaceDir, typeShell);

            this.generic.printOutputChannel("Copy all files from project...");
            fse.copy(workspaceDir, dirTemp).then(() => {
                let packageExtension = '.vsix';

                this.generic.printOutputChannel("Delete unecessary files...");
                filesToDelete.forEach(file => {
                    file = this.generic.resolvePath(dirTemp + '/' + file) as string;
                    if (this.generic.fileExist(file)) {
                        fse.rmdirSync(file, { recursive: true });
                    }
                });

                this.generic.printOutputChannel("Create package...");
                this.terminal.execOnOutputChanel('vsce package', dirTemp, typeShell);

                this.generic.printOutputChannel("Copy package to project directory...");
                let files = fs.readdirSync(dirTemp);
                for (var i = 0; i < files.length; i++) {
                    if (files[i].includes(packageExtension)) {
                        let filename = this.generic.resolvePath(dirTemp + "/" + files[i]) as string;
                        fse.copySync(filename, this.generic.resolvePath(workspaceDir + "/" + files[i]) as string);
                    }
                };


                if (this.generic.fileExist(dirTemp)) {
                    this.generic.printOutputChannel("Delete Temp dir...");
                    fse.rmdirSync(dirTemp, { recursive: true });
                }

                this.generic.printOutputChannel("Done");
            }).catch(err => {
                console.log('An error occured while copying the folder.');
                return console.error(err);
            });
        }
    }

    private createMenu() {
        let type: string[] = ["From PowerShell", "From Bash"];
        let items: vscode.QuickPickItem[] = [
            {
                label: type[0]
            },
            {
                label: type[1]
            }
        ];
        this.generic.createQuickPick(items, { canPickMany: false }).then((selection) => {
            selection = selection as vscode.QuickPickItem | undefined;
            // User made final selection
            if (!selection) {
                return;
            } else {
                if (selection.label === type[0]) {
                    this.createVsiPackages(ShellType.powershell);
                } else if (selection.label === type[1]) {
                    this.createVsiPackages(ShellType.bash);
                }
            }
        });
    }
}