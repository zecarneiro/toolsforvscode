import { LibStatic } from '../utils/lib-static';
import { App } from '../app';
import { Lib } from '../utils/lib';

export class NodeJsTools extends App {
    static readonly className = 'NodeJsTools';
    readonly activityBarId = 'nodejs-tools-jnoronha';
    private readonly nodeCliAppDir = LibStatic.resolvePath<string>(this.filesDir + '/node-cli-app');
    constructor(
        lib: Lib
    ) {
        super(lib, NodeJsTools.className);
        this.prepareAll([
            {
                treeItem: {
                    label: "Create App Electron with React and Typescript",
                    command: { command: this.getCommand('createappelectronreacttypescript'), title: "" }
                },
                callback: {
                    caller: this.createAppElectronReactTypescript,
                    isSync: true,
                    thisArg: this
                }
            },
            {
                treeItem: {
                    label: "Create App CLI with Typescript",
                    command: { command: this.getCommand('createappclitypescript'), title: "" }
                },
                callback: {
                    caller: this.createAppCliTypescript,
                    isSync: true,
                    thisArg: this
                }
            }
        ]);
    }

    private async createAppElectronReactTypescript() {
        let projectName = await LibStatic.createInputBox({
            prompt: 'Insert Project Name',
            placeHolder: 'my-app'
        });
        if (projectName && projectName.length > 0) {
            let result = await LibStatic.showOpenDialog({ canSelectFolders: true });
            let path: string = result && result[0] && result[0]["path"] ? result[0]["path"] : '';
            if (path.length > 0) {
                path = LibStatic.resolvePath<string>(path);
                const npx = 'npx';
                if (this.lib.consoleExtend.findCommandPath(npx).length <= 0) {
                    this.lib.consoleExtend.execTerminal(`npm install -g ${npx}`);
                }
                this.lib.consoleExtend.execTerminal(`npx create-react-app ${projectName} --template electron-react-typescript`, path);
            }
        }
    }
    
    private async createAppCliTypescript() {
        let result = await LibStatic.showOpenDialog({ canSelectFolders: true });
        let path: string = result && result[0] && result[0]["path"] ? result[0]["path"] : '';
        if (path.length > 0) {
            path = LibStatic.resolvePath(path);
            LibStatic.copyDir(this.nodeCliAppDir, path, true, true);

            // Install
            const commands = {
                'saveDev': [
                    '@types/node nodemon ts-node typescript'
                ],
                'save': [
                    'clear figlet chalk commander path'
                ]
            };
            commands.saveDev.forEach(cmd => {
                this.lib.consoleExtend.execTerminal(`npm install --save-dev ${cmd}`, path);
            });
            commands.save.forEach(cmd => {
                this.lib.consoleExtend.execTerminal(`npm install --save ${cmd}`, path);
            });
        }
    }
}