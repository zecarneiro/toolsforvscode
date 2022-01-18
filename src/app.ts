import { VsExtensionsManager } from './vendor/ts-js-utils/src/lib/vs-extensions-manager';
import { IDirectories } from './interface/directories';
import { EntityBaseName, FileSystem, IVsTreeItem, IVsTreeItemWithChildren, Logger, TsJsUtils } from './vendor/ts-js-utils/src';

export abstract class App {
  protected currentMethod: string = '';
  protected readonly extensionPath: string = FileSystem.resolvePath(this.tsJsUtils.extensionManagerVs.getPath() + '/dist');
  protected readonly directories: IDirectories = {
    files: FileSystem.resolvePath(this.extensionPath + '/../files'),
    scripts: FileSystem.resolvePath(this.extensionPath + '/../scripts'),
  };
  protected readonly scriptsToSystem = {
    linux: FileSystem.resolvePath(this.directories.scripts + '/to-linux.sh'),
    windows: FileSystem.resolvePath(this.directories.scripts + '/to-windows.ps1'),
  };

  constructor(
    protected tsJsUtils: TsJsUtils,
    protected extensionId: string,
    protected activityBarId: string,
    protected className: string,
  ) { }

  protected get logger(): Logger {
    this.tsJsUtils.logger.className = this.className;
    this.tsJsUtils.logger.methodName = this.currentMethod;
    return this.tsJsUtils.logger;
  }

  @EntityBaseName
  protected getSettings<T = any>(section?: string): T {
    return VsExtensionsManager.getExtensionSettings<T>(this.extensionId, section);
  }

  @EntityBaseName
  protected getCommand(name: string): string {
    return `${VsExtensionsManager.getExtensionInfo(this.extensionId).name}.${this.className}${name}`;
  }

  protected abstract process();
  protected abstract getActivityBar(): IVsTreeItemWithChildren[] | IVsTreeItem[];

  start() {
    try {
      this.tsJsUtils.windows.createActivityBarVs(this.getActivityBar(), this.activityBarId);
      this.process();
    } catch (error) {
      this.logger.error(error?.message);
    }
  }
}
