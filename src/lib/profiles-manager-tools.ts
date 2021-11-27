import { QuickPickItem, workspace } from 'vscode';
import { App } from '../app';
import { IProfiles } from '../interface/profiles';
import { NodeVs } from '../vendor/node-vscode-utils/src';

export class ProfilesManagerTools extends App {
  private profilesData: IProfiles[] = [];
  // Commands
  private cmdProfilesManager: string;


  // CONFIGURATIONS
  private readonly config = 'profiles';

  constructor(
    protected nodeVscode: NodeVs,
    protected extensionId: string,
  ) {
    super(nodeVscode, extensionId, 'profiles-manager-tools-jnoronha', 'ProfilesManagerTools');
    this.cmdProfilesManager = this.getCommand('profilesmanager');
    this.prepareAll([
      {
        treeItem: {
          label: 'Install Extensions',
          command: { command: this.getCommand('extensionsinstall'), title: '' },
        },
        callback: {
          caller: this.InstallUninstallExt,
          args: [true],
          isSync: true,
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Uninstall Extensions',
          command: { command: this.getCommand('extensionsuninstall'), title: '' },
        },
        callback: {
          caller: this.InstallUninstallExt,
          args: [false],
          isSync: true,
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Show Status all Extensions',
          command: { command: this.getCommand('extensionsunshowstatus'), title: '' },
        },
        callback: {
          caller: this.showStatus,
          isSync: true,
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Set refresh time(in minutes)',
          command: { command: this.getCommand('extensionsrefreshtimedisabled'), title: 'Time to get all disabled extensions from database' },
        },
        callback: {
          caller: this.configRefreshTimeDb,
          isSync: true,
          thisArg: this,
        },
      },
    ]);
    this.nodeVs.vsConsole.registerVscodeCommand([
      {
        command: this.cmdProfilesManager,
        callback: {
          caller: this.createMenu,
          isSync: true,
          thisArg: this,
        },
      },
    ]);
    this.nodeVs.vsWindowsManager.createStatusBar({ text: 'Profiles Manager', command: this.cmdProfilesManager });

    // Functions
    this.prepareProfiles();
    workspace.onDidChangeConfiguration((listener) => {
      if (listener.affectsConfiguration(this.config)) {
        this.prepareProfiles();
      }
    });
  }

  private getConfig(): IProfiles[] {
    const profileConfig = this.getSettings<IProfiles[]>(this.config);
    return profileConfig ? profileConfig : [];
  }

  private prepareProfiles() {
    this.getConfig().forEach((profiles) => {
      if (!profiles.hide) {
        this.profilesData.push(profiles);
      }
    });
  }

  private createMenu() {
    const items: QuickPickItem[] = [];
    this.profilesData.forEach((element) => {
      let canPicked = true;
      element.data.forEach((id) => {
        if (canPicked && (this.nodeVs.vsExtensionsManager.isDisabled(id) || !this.nodeVs.vsExtensionsManager.isInstalled(id))) {
          canPicked = false;
        }
      });
      items.push({ label: element.name, picked: canPicked });
    });
    this.nodeVs.vsWindowsManager.createQuickPick<QuickPickItem[]>(items, { canPickMany: true }).then((selectedItems) => {
      // User made final selection
      if (!selectedItems) {
        return;
      } else {
        this.nodeVs.vsWindowsManager.showProcessingMsg();
        let ids: string[] = [];
        for (const profile of this.profilesData) {
          if (!selectedItems.find((val) => val.label === profile.name) && !profile.hide) {
            ids = ids.concat(profile.data);
          }
        }
        const response = this.nodeVs.vsExtensionsManager.disable(ids);
        if (response.hasError) {
          this.logger.showOutputChannel();
          this.logger.error(response.error);
        } else {
          this.nodeVs.vsExtensionsManager.showSuccessMsg();
        }
      }
    });
  }

  private configRefreshTimeDb() {
    this.nodeVs.vsWindowsManager.createInputBox({
      placeHolder: '2',
      prompt: 'Insert time refresh in minutes',
      value: this.nodeVs.vsExtensionsManager.refreshTime.toString(),
    }).then((res) => {
      this.nodeVs.vsExtensionsManager.refreshTime = parseInt(res);
    });
  }

  // eslint-disable-next-line valid-jsdoc
  /** *****************************************************
   * Install/Uninstall Area
   ******************************************************/
  private InstallUninstallExt(isInstall: boolean) {
    this.nodeVs.vsWindowsManager.showProcessingMsg();
    const ids: string[] = [];
    const profileConfig = this.getSettings<IProfiles[]>(this.config);
    if (profileConfig && profileConfig.length > 0) {
      for (const profile of profileConfig) {
        for (const id of profile.data) {
          if (id !== this.extensionId) {
            ids.push(id);
          }
        }
      }
      this.logger.showOutputChannel();
      if (isInstall) {
        this.nodeVs.vsExtensionsManager.installExtensions(ids);
      } else {
        this.nodeVs.vsExtensionsManager.uninstallExtensions(ids);
      }
    }
  }

  private showStatus() {
    const message = { disabled: '', installed: '', notInstalled: '' };
    for (const config of this.getConfig()) {
      config.data.forEach((id) => {
        if (this.nodeVs.vsExtensionsManager.isDisabled(id)) {
          message.disabled += `Extension id: '${id}' is disabled!\n`;
        } else if (this.nodeVs.vsExtensionsManager.isInstalled(id)) {
          message.installed += `Extension id: '${id}' is installed!\n`;
        } else {
          message.notInstalled += `Extension id: '${id}' is 'not installed'!\n`;
        }
      });
    }
    this.logger.showOutputChannel();
    if (message.notInstalled.length > 0) {
      this.logger.error(message.notInstalled);
    }
    if (message.disabled.length > 0) {
      this.logger.warn(message.disabled);
    }
    if (message.installed.length > 0) {
      this.logger.success(message.installed);
    }
  }
}
