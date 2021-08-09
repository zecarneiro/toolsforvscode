import { IDirectories } from './../../sub-projects/utils/src/interface/directories';
import { Generic } from './../../sub-projects/utils/src/nodejs/generic';
import { FilesSystem } from './../../sub-projects/utils/src/nodejs/files-system';
import { App } from '../app';
import { ExtensionContext } from 'vscode';
import { WindowManager } from '../../sub-projects/utils/src/vscode/window-manager';
import { IProcessing } from '../../sub-projects/utils/src/interface/processing';
import { EPlatformType } from '../../sub-projects/utils/src/enum/platform-type';
import { annotateName } from '../../sub-projects/utils/src/nodejs/decorators';
import { ILogger } from '../interface/logger';
import { ENotifyType } from '../../sub-projects/utils/src/enum/notify-type';
import { GenericVs } from '../../sub-projects/utils/src/vscode/generic-vs';

export class VscodeTools extends App {
    readonly className = 'VscodeTools';
    readonly activityBarId = 'vscode-tools-jnoronha';

    constructor(
        context: ExtensionContext,
        extensionPath: string,
        directories: IDirectories,
        windowManager: WindowManager,
        loggerExtension: ILogger
    ) {
        super(context, extensionPath, directories, windowManager, loggerExtension);
        this.prepareAll([
            {
                treeItem: {
                    label: "Restart VS Code",
                    command: { command: this.getCommand('reloadvscodeonprofilechange'), title: "" }
                },
                callback: {
                    caller: this.restartVScode,
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
                    label: "Create Ext: Prepare Dependencies",
                    command: { command: this.getCommand('preparedependencycreateextension'), title: '' }
                },
                callback: {
                    caller: () => {
                        this.console.execSyncWhitoutOutput({cmd: 'npm install -g yo' }, 0);
                        this.console.execSyncWhitoutOutput({cmd: 'npm install -g typescript'}, 0);
                        this.console.execSyncWhitoutOutput({cmd: 'npm install -g yo generator-code'}, 0);
                        this.console.execSyncWhitoutOutput({cmd: 'npm install -g vsce'}, 0);
                    },
                    isSync: false,
                    thisArg: this
                }
            },
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
            }
        ]);

        // Create and show collapse/expand all statusbar for extension
        WindowManager.createStatusBar({ text: "$(collapse-all)", command: "editor.foldAll", tooltip: "Collapse All" });
        WindowManager.createStatusBar({ text: "$(expand-all)", command: "editor.unfoldAll", tooltip: "Expand All" });

        // Create and show collapse/expand region statusbar for extension
        WindowManager.createStatusBar({ text: "$(fold-up)", command: "editor.foldRecursively", tooltip: "Collapse Recursive By Cursor" });
        WindowManager.createStatusBar({ text: "$(fold-down)", command: "editor.unfoldRecursively", tooltip: "Expand Recursive By Cursor" });
    }

    @annotateName
    private async createNewExtensions() {
        let result = await WindowManager.showOpenDialog({ canSelectFolders: true });
        let path: string = result && result[0] && result[0]["path"] ? result[0]["path"] : '';
        if (path.length > 0) {
            path = FilesSystem.resolvePath(path);
            this.console.execSyncWhitoutOutput({cmd: 'yo code', cwd: path}, 0);
        }
    }

    @annotateName
    private generateVsixPackages() {
        let workspaceDir: string|undefined = GenericVs.getWorkspaceRootPath();
        if (workspaceDir && workspaceDir.length > 0) {
            let processing: IProcessing;
            let vscodeIgnoreFile = FilesSystem.resolvePath(workspaceDir + '/.vscodeignore');
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

            if (FilesSystem.fileExist(vscodeIgnoreFile, false)) {
                dataToInsert = FilesSystem.readDocument(vscodeIgnoreFile).trim();
            }

            vscodeIgnoreData.forEach(newData => {
                if (!dataToInsert.includes(newData)) {
                    dataToInsert += "\n" + newData;
                    isNewDataInserted = true;
                }
            });

            if (isNewDataInserted) {
                this.logger.notify("Write " + vscodeIgnoreFile);
                processing = Generic.startProcessing(this.logger);
                FilesSystem.writeDocument(vscodeIgnoreFile, dataToInsert);
                processing.disable();
            }
            this.logger.notify("Create package");
            this.console.execSyncWhitoutOutput({cmd: 'vsce package', cwd: workspaceDir}, 0);
        } else {
            this.logger.notify('Invalid workspace directory', ENotifyType.error);
        }
    }

    @annotateName
    private restartVScode() {
        if (FilesSystem.isPlatform(EPlatformType.windows)) {
            this.console.execSync({cmd: `${this.scriptsToSystem.windows} -RELOAD_VSCODE_CHANGED_PROFILE 1`}, false, this.console.shell.powershell);
        } else {
            this.logger.notify("Not implemented yet!!!");
        }
    }
}