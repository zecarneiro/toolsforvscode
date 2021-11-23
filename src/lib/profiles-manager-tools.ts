import { QuickPickItem, workspace } from 'vscode';
import { App } from '../app';
import { IProfiles } from '../interface/profiles';
import { EntityBaseName, Functions, NodeVs } from '../vendor/node-vscode-utils/src';

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
    ]);
    this.console.registerVscodeCommand([
      {
        command: this.cmdProfilesManager,
        callback: {
          caller: this.createMenu,
          isSync: true,
          thisArg: this,
        },
      },
    ]);
    this.windowsManager.createStatusBar({ text: 'Profiles Manager', command: this.cmdProfilesManager });

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

  @EntityBaseName
  private prepareProfiles() {
    let immutableIds: string[] = [];
    this.getConfig().forEach((profiles) => {
      if (profiles.hide) {
        immutableIds = immutableIds.concat(profiles.data);
      } else {
        this.profilesData.push(profiles);
      }
    });
    this.extensionsManager.immutableIds = immutableIds;
    this.extensionsManager.enableImmutable();
  }

  @EntityBaseName
  private disableExtensions(profiles: string[]) {
    let ids: string[] = [];
    for (const profile of this.profilesData) {
      if (profiles.includes(profile.name) && !profile.data.includes(this.extensionId)) {
        ids = ids.concat(profile.data);
      }
    }
    this.extensionsManager.disable(ids);
    this.logger.showOutputChannel();
  }

  @EntityBaseName
  private createMenu() {
    const disabledExtension = this.extensionsManager.getDisabled();
    if (disabledExtension.hasError) {
      this.logger.error(disabledExtension.error?.message);
      return;
    }
    const items: QuickPickItem[] = [];
    this.profilesData.forEach((element) => {
      const canPicked = element.data.findIndex((id) => disabledExtension.data.findIndex((x) => x.id === id) !== -1 || !this.extensionsManager.isInstalled(id));
      items.push({ label: element.name, picked: canPicked < 0 ? true : false });
    });
    this.windowsManager.createQuickPick(items, { canPickMany: true }).then((selectedItems) => {
      // User made final selection
      if (!selectedItems) {
        return;
      } else {
        const selected = Functions.convert<QuickPickItem[]>(selectedItems);
        const profile: string[] = this.profilesData.map((profileData) => {
          if (!profileData.hide && selected.findIndex((x) => x.label === profileData.name) < 0) {
            return profileData.name;
          }
        }).filter((x) => x !== undefined);
        this.disableExtensions(profile);
      }
    });
  }

  // eslint-disable-next-line valid-jsdoc
  /** *****************************************************
   * Install/Uninstall Area
   ******************************************************/
  @EntityBaseName
  private InstallUninstallExt(isInstall: boolean) {
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
      if (isInstall) {
        this.extensionsManager.installExtensions(ids);
      } else {
        this.extensionsManager.uninstallExtensions(ids);
      }
    }
  }

  @EntityBaseName
  private showStatus() {
    const message = { disabled: '', installed: '', notInstalled: '' };
    for (const config of this.getConfig()) {
      config.data.forEach((id) => {
        if (this.extensionsManager.isDisabled(id)) {
          message.disabled += `This extension id '${id}' is disabled!\n`;
        } else if (this.extensionsManager.isInstalled(id)) {
          message.installed += `This extension id '${id}' is installed!\n`;
        } else {
          message.notInstalled += `This extension id '${id}' is 'not installed'!\n`;
        }
      });
    }
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
