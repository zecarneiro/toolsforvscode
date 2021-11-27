import { Uri } from 'vscode';
import { App } from '../app';
import { ECommandExecType, ENotifyType, FileSystem, NodeVs, VsExtensionsManager } from '../vendor/node-vscode-utils/src';


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
            this.nodeVs.vsConsole.exec({ cmd: 'npm install -g yo', typeExec: ECommandExecType.none });
            this.nodeVs.vsConsole.exec({ cmd: 'npm install -g typescript', typeExec: ECommandExecType.none });
            this.nodeVs.vsConsole.exec({ cmd: 'npm install -g yo generator-code', typeExec: ECommandExecType.none });
            this.nodeVs.vsConsole.exec({ cmd: 'npm install -g vsce', typeExec: ECommandExecType.none });
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
    this.nodeVs.vsWindowsManager.createStatusBar({ text: '$(collapse-all)', command: 'editor.foldAll', tooltip: 'Collapse All' });
    this.nodeVs.vsWindowsManager.createStatusBar({ text: '$(expand-all)', command: 'editor.unfoldAll', tooltip: 'Expand All' });

    // Create and show collapse/expand region statusbar for extension
    this.nodeVs.vsWindowsManager.createStatusBar({ text: '$(fold-up)', command: 'editor.foldRecursively', tooltip: 'Collapse Recursive By Cursor' });
    this.nodeVs.vsWindowsManager.createStatusBar({ text: '$(fold-down)', command: 'editor.unfoldRecursively', tooltip: 'Expand Recursive By Cursor' });

    // Reload
    this.nodeVs.vsWindowsManager.createStatusBar({ text: 'Reload', command: 'workbench.action.reloadWindow', tooltip: 'Reload VSCode' });
  }

  private async createNewExtensions() {
    const result = await this.nodeVs.vsWindowsManager.showOpenDialog<Uri>({ canSelectFolders: true });
    let path: string = result ? result['path'] : '';
    if (path.length > 0) {
      path = this.nodeVs.fileSystem.resolvePath(path);
      this.nodeVs.vsConsole.exec({ cmd: 'yo code', cwd: path, typeExec: ECommandExecType.none });
    }
  }

  private generateVsixPackages() {
    this.nodeVs.vsWindowsManager.showProcessingMsg();
    const workspaceDir: string | undefined = VsExtensionsManager.getWorkspaceRootPath();
    if (workspaceDir && workspaceDir.length > 0) {
      const vscodeIgnoreFile = this.nodeVs.fileSystem.resolvePath(workspaceDir + '/.vscodeignore');
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
      this.nodeVs.vsConsole.exec({ cmd: 'vsce package', cwd: workspaceDir, typeExec: ECommandExecType.none });
    } else {
      this.logger.notify('Invalid workspace directory', ENotifyType.error);
    }
  }
}
