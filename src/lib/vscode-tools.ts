import { App } from '../app';
import { annotateName, ENotifyType, EShellType, NodeVscode } from '../vendor/node-vscode-utils/src';


export class VscodeTools extends App {
  constructor(
    protected nodeVscode: NodeVscode,
    protected extensionId: string,
  ) {
    super(nodeVscode, extensionId, 'vscode-tools-jnoronha', 'VscodeTools');
    this.prepareAll([
      {
        treeItem: {
          label: 'Restart VSCode',
          command: { command: this.getCommand('reloadvscodeonprofilechange'), title: '' },
        },
        callback: {
          caller: this.restartVScode,
          isSync: true,
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Create Extension',
          command: { command: this.getCommand('createnewextension'), title: '' },
        },
        callback: {
          caller: this.createNewExtensions,
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Create Ext: Prepare Dependencies',
          command: { command: this.getCommand('preparedependencycreateextension'), title: '' },
        },
        callback: {
          caller: () => {
            this.nodeVscode.console.execSync({ cmd: 'npm install -g yo', successCode: 0 });
            this.nodeVscode.console.execSync({ cmd: 'npm install -g typescript', successCode: 0 });
            this.nodeVscode.console.execSync({ cmd: 'npm install -g yo generator-code', successCode: 0 });
            this.nodeVscode.console.execSync({ cmd: 'npm install -g vsce', successCode: 0 });
          },
          isSync: false,
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Generate VSIX',
          command: { command: this.getCommand('generatepackage'), title: '' },
        },
        callback: {
          caller: this.generateVsixPackages,
          isSync: true,
          thisArg: this,
        },
      },
    ]);

    // Create and show collapse/expand all statusbar for extension
    this.windowsManager.createStatusBar({ text: '$(collapse-all)', command: 'editor.foldAll', tooltip: 'Collapse All' });
    this.windowsManager.createStatusBar({ text: '$(expand-all)', command: 'editor.unfoldAll', tooltip: 'Expand All' });

    // Create and show collapse/expand region statusbar for extension
    this.windowsManager.createStatusBar({ text: '$(fold-up)', command: 'editor.foldRecursively', tooltip: 'Collapse Recursive By Cursor' });
    this.windowsManager.createStatusBar({ text: '$(fold-down)', command: 'editor.unfoldRecursively', tooltip: 'Expand Recursive By Cursor' });

    // Reload
    this.windowsManager.createStatusBar({ text: 'Reload', command: 'workbench.action.reloadWindow', tooltip: 'Reload VSCode' });
  }

  @annotateName
  private async createNewExtensions() {
    const result = await this.windowsManager.showOpenDialog({ canSelectFolders: true });
    let path: string = result && result[0] && result[0]['path'] ? result[0]['path'] : '';
    if (path.length > 0) {
      path = this.nodeVscode.fileSystem.resolvePath(path);
      this.nodeVscode.console.execSync({ cmd: 'yo code', cwd: path, successCode: 0 });
      this.logger.showOutputChannel();
    }
  }

  @annotateName
  private generateVsixPackages() {
    const workspaceDir: string | undefined = this.extensionsManager.getWorkspaceRootPath();
    if (workspaceDir && workspaceDir.length > 0) {
      const vscodeIgnoreFile = this.nodeVscode.fileSystem.resolvePath(workspaceDir + '/.vscodeignore');
      const vscodeIgnoreData: string[] = [
        '.vscode/**',
        '.vscode-test/**',
        'build/**',
        'out/**',
        'src/**',
        '.gitignore',
        '.yarnrc',
        'vsc-extension-quickstart.md',
        '**/tsconfig.json',
        '**/.eslintrc.json',
        '**/*.map',
        '**/*.ts',
        '.gitmodules',
        '.gitattributes',
        '.vscodeignore',
        '.git/**',
        'webpack.config.js',
        'node_modules/**',
      ];
      let dataToInsert: string = '';
      let isNewDataInserted = false;

      if (this.nodeVscode.fileSystem.fileExist(vscodeIgnoreFile, false)) {
        dataToInsert = this.nodeVscode.fileSystem.readDocument(vscodeIgnoreFile).trim();
      }

      vscodeIgnoreData.forEach((newData) => {
        if (!dataToInsert.includes(newData)) {
          dataToInsert += '\n' + newData;
          isNewDataInserted = true;
        }
      });

      if (isNewDataInserted) {
        this.logger.notify('Write ' + vscodeIgnoreFile);
        this.nodeVscode.fileSystem.writeDocument(vscodeIgnoreFile, dataToInsert);
      }
      this.logger.notify('Create package');
      this.nodeVscode.console.exec({ cmd: 'vsce package', cwd: workspaceDir, successCode: 0 });
    } else {
      this.logger.notify('Invalid workspace directory', ENotifyType.error);
    }
  }

  @annotateName
  private restartVScode() {
    if (this.nodeVscode.fileSystem.isWindows) {
      this.nodeVscode.console.execSync({ cmd: `${this.scriptsToSystem.windows} -RELOAD_VSCODE_CHANGED_PROFILE 1`, shellType: EShellType.powershell });
    } else {
      this.logger.notify('Not implemented yet!!!');
    }
  }
}
