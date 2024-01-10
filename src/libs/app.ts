import { StatusBarAlignment, ExtensionContext, commands } from 'vscode';
import { WindowsUtils } from './external/vscode-utils/windows-utils';

export class App {
    private id = 'jnoronha.toolsforvscode';
    private extensionName = 'Tools For VSCode';
    private _statusBarPriority: number|undefined;
  
    constructor(context: ExtensionContext) {}

    private get nextStatusBarPriority(): number {
      if (!this._statusBarPriority) {
        this._statusBarPriority = 100;
      } else {
        this._statusBarPriority += 1;
      }
      return this._statusBarPriority;
    }
    private createAllStatusBar() {
      // Terminal
      WindowsUtils.createStatusBar('$(terminal)', 'workbench.action.terminal.toggleTerminal', 'Terminal', StatusBarAlignment.Right, this.nextStatusBarPriority);

      // Reload
      WindowsUtils.createStatusBar('Reload', 'workbench.action.reloadWindow', 'Reload VSCode', StatusBarAlignment.Right, this.nextStatusBarPriority);

      // Create and show collapse/expand region statusbar for extension
      WindowsUtils.createStatusBar('$(fold-up)', 'editor.foldRecursively', 'Collapse Recursive By Cursor', StatusBarAlignment.Right, this.nextStatusBarPriority);
      WindowsUtils.createStatusBar('$(fold-down)', 'editor.unfoldRecursively', 'Expand Recursive By Cursor', StatusBarAlignment.Right, this.nextStatusBarPriority);

      // Create and show collapse/expand all statusbar for extension
      WindowsUtils.createStatusBar('$(collapse-all)', 'editor.foldAll', 'Collapse All', StatusBarAlignment.Right, this.nextStatusBarPriority);
      WindowsUtils.createStatusBar('$(expand-all)', 'editor.unfoldAll', 'Expand All', StatusBarAlignment.Right, this.nextStatusBarPriority);
    }
  
    start() {
      this.createAllStatusBar();
      console.log(commands.getCommands());
    }
  }