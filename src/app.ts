import { IDirectories } from './interface/directories';
import { EntityBaseName, ITreeItemExtend, ITreeItemWithChildren, Logger, NodeVs, VsExtensionsManager } from './vendor/node-vscode-utils/src';

export abstract class App {
  protected currentMethod: string = '';
  protected readonly extensionPath: string = this.nodeVs.fileSystem.resolvePath(this.nodeVs.vsExtensionsManager.getPath() + '/dist');
  protected readonly directories: IDirectories = {
    files: this.nodeVs.fileSystem.resolvePath(this.extensionPath + '/../files'),
    scripts: this.nodeVs.fileSystem.resolvePath(this.extensionPath + '/../scripts'),
  };
  protected readonly scriptsToSystem = {
    linux: this.nodeVs.fileSystem.resolvePath(this.directories.scripts + '/to-linux.sh'),
    windows: this.nodeVs.fileSystem.resolvePath(this.directories.scripts + '/to-windows.ps1'),
  };

  constructor(
    protected nodeVs: NodeVs,
    protected extensionId: string,
    protected activityBarId: string,
    protected className: string,
  ) { }

  protected get logger(): Logger {
    this.nodeVs.logger.prefix = this.nodeVs.logger.formatPrefix(this.className, this.currentMethod, true);
    return this.nodeVs.logger;
  }

  @EntityBaseName
  protected getSettings<T = any>(section?: string): T {
    return VsExtensionsManager.getExtensionSettings<T>(this.extensionId, section);
  }

  @EntityBaseName
  protected getCommand(name: string): string {
    return `${VsExtensionsManager.getExtensionInfo(this.extensionId).name}.${this.className}${name}`;
  }

  @EntityBaseName
  protected prepareAll(dataTreeItemVscodeCmd: ITreeItemWithChildren[] | ITreeItemExtend[]) {
    this.nodeVs.vsWindowsManager.createActivityBar(dataTreeItemVscodeCmd, this.activityBarId);
  }
}
