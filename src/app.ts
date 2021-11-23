import { IDirectories } from './interface/directories';
import { Console, EntityBaseName, ExtensionsManagerVs, Functions, ITreeItemExtend, ITreeItemWithChildren, Logger, NodeVs, WindowManagerVs } from './vendor/node-vscode-utils/src';

export abstract class App {
  protected currentMethod: string = '';
  protected readonly extensionPath: string = this.nodeVscode.fileSystem.resolvePath(this.nodeVscode.extensionsManagerVs.getPath() + '/dist');
  protected readonly directories: IDirectories = {
    files: this.nodeVscode.fileSystem.resolvePath(this.extensionPath + '/../files'),
    scripts: this.nodeVscode.fileSystem.resolvePath(this.extensionPath + '/../scripts'),
  };
  protected readonly scriptsToSystem = {
    linux: this.nodeVscode.fileSystem.resolvePath(this.directories.scripts + '/to-linux.sh'),
    windows: this.nodeVscode.fileSystem.resolvePath(this.directories.scripts + '/to-windows.ps1'),
  };

  constructor(
    protected nodeVscode: NodeVs,
    protected extensionId: string,
    protected activityBarId: string,
    protected className: string,
  ) { }

  protected get logger(): Logger {
    this.nodeVscode.logger.prefix = this.nodeVscode.logger.formatPrefix(this.className, this.currentMethod, true);
    return this.nodeVscode.logger;
  }

  protected get extensionsManager(): ExtensionsManagerVs {
    return this.nodeVscode.extensionsManagerVs;
  }

  protected get console(): Console {
    return this.nodeVscode.console;
  }

  protected get windowsManager(): WindowManagerVs {
    return this.nodeVscode.windowsManagerVs;
  }

  protected get functions(): Functions {
    return this.nodeVscode.functions;
  }

  @EntityBaseName
  protected getSettings<T = any>(section?: string): T {
    return ExtensionsManagerVs.getExtensionSettings<T>(this.extensionId, section);
  }

  @EntityBaseName
  protected getCommand(name: string): string {
    return `${ExtensionsManagerVs.getExtensionInfo(this.extensionId).name}.${this.className}${name}`;
  }

  @EntityBaseName
  protected prepareAll(dataTreeItemVscodeCmd: ITreeItemWithChildren[] | ITreeItemExtend[]) {
    this.windowsManager.createActivityBar(dataTreeItemVscodeCmd, this.activityBarId);
  }
}
