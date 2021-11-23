import { App } from '../app';
import { ECommandExecType, ENotifyType, EntityBaseName, ExtensionsManagerVs, FileSystem, NodeVs } from '../vendor/node-vscode-utils/src';


export class VscodeTools extends App {
  constructor(
    protected nodeVs: NodeVs,
    protected extensionId: string,
  ) {
    super(nodeVs, extensionId, 'vscode-tools-jnoronha', 'VscodeTools');
    this.prepareAll([
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
            this.nodeVs.console.exec({ cmd: 'npm install -g yo', typeExec: ECommandExecType.vscodeTerminal });
            this.nodeVs.console.exec({ cmd: 'npm install -g typescript', typeExec: ECommandExecType.vscodeTerminal });
            this.nodeVs.console.exec({ cmd: 'npm install -g yo generator-code', typeExec: ECommandExecType.vscodeTerminal });
            this.nodeVs.console.exec({ cmd: 'npm install -g vsce', typeExec: ECommandExecType.vscodeTerminal });
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

  @EntityBaseName
  private async createNewExtensions() {
    const result = await this.windowsManager.showOpenDialog({ canSelectFolders: true });
    let path: string = result && result[0] && result[0]['path'] ? result[0]['path'] : '';
    if (path.length > 0) {
      path = this.nodeVscode.fileSystem.resolvePath(path);
      this.nodeVscode.console.exec({ cmd: 'yo code', cwd: path, typeExec: ECommandExecType.vscodeTerminal });
      this.logger.showOutputChannel();
    }
  }

  @EntityBaseName
  private generateVsixPackages() {
    const workspaceDir: string | undefined = ExtensionsManagerVs.getWorkspaceRootPath();
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

      if (FileSystem.fileExist(vscodeIgnoreFile, false)) {
        dataToInsert = FileSystem.readDocument(vscodeIgnoreFile).trim();
      }

      vscodeIgnoreData.forEach((newData) => {
        if (!dataToInsert.includes(newData)) {
          dataToInsert += '\n' + newData;
          isNewDataInserted = true;
        }
      });

      if (isNewDataInserted) {
        this.logger.notify('Write ' + vscodeIgnoreFile);
        FileSystem.writeDocument(vscodeIgnoreFile, dataToInsert);
      }
      this.logger.notify('Create package');
      this.nodeVscode.console.exec({ cmd: 'vsce package', cwd: workspaceDir, typeExec: ECommandExecType.vscodeTerminal });
    } else {
      this.logger.notify('Invalid workspace directory', ENotifyType.error);
    }
  }
}
