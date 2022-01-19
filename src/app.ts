import { EntityBaseName } from 'node-ts-js-utils';
import { FileSystem, ITreeItem, ITreeItemWithChildren, Logger, VscodeTsJsUtils } from 'vscode-ts-js-utils';
import { IDirectories } from './interface/directories';

export abstract class App {
  protected currentMethod: string = '';
  protected readonly extensionPath: string = this.utils.fileSystem.resolvePath(this.utils.extensions.getPath() + '/dist');
  protected readonly directories: IDirectories = {
    files: this.fileSystem.resolvePath(this.extensionPath + '/../files'),
    scripts: this.fileSystem.resolvePath(this.extensionPath + '/../scripts'),
  };
  protected readonly scriptsToSystem = {
    linux: this.fileSystem.resolvePath(this.directories.scripts + '/to-linux.sh'),
    windows: this.fileSystem.resolvePath(this.directories.scripts + '/to-windows.ps1'),
  };

  constructor(
    protected utils: VscodeTsJsUtils,
    protected extensionId: string,
    protected activityBarId: string,
    protected className: string,
  ) { }

  protected get logger(): Logger {
    this.utils.logger.className = this.className;
    this.utils.logger.methodName = this.currentMethod;
    return this.utils.logger;
  }

  protected get fileSystem(): FileSystem {
    return this.utils.fileSystem;
  }

  @EntityBaseName
  protected getSettings<T = any>(section?: string): T {
    return this.utils.extensions.getExtensionSettings<T>(this.extensionId, section);
  }

  @EntityBaseName
  protected getCommand(name: string): string {
    return `${this.utils.extensions.getExtensionInfo(this.extensionId).name}.${this.className}${name}`;
  }

  protected abstract process();
  protected abstract getActivityBar(): ITreeItemWithChildren[] | ITreeItem[];

  start() {
    try {
      this.utils.windows.createActivityBar(this.getActivityBar(), this.activityBarId);
      this.process();
    } catch (error) {
      this.logger.error(error?.message);
    }
  }
}
