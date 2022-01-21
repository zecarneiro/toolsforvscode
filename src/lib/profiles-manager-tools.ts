import { EFunctionsProcessType, Functions } from 'node-ts-js-utils';
import { VscodeTsJsUtils, ITreeItem } from 'vscode-ts-js-utils';
import { QuickPickItem, workspace } from 'vscode';
import { App } from '../app';
import { IProfiles } from '../interface/Iprofiles';
import { EProfileMessages } from '../enum/Eprofiles-messages';

export class ProfilesManagerTools extends App {
  private profilesData: IProfiles[] = [];
  // Commands
  private cmdProfilesManager: string;


  // CONFIGURATIONS
  private readonly config = 'profiles';

  constructor(
    protected utils: VscodeTsJsUtils,
    protected extensionId: string,
  ) {
    super(utils, extensionId, 'profiles-manager-tools-jnoronha', 'ProfilesManagerTools');
  }

  protected getActivityBar(): ITreeItem[] {
    return [
      {
        treeItem: {
          label: 'Install extensions',
          command: { command: this.getCommand('extensionsinstall'), title: '' },
        },
        callback: {
          caller: Functions.callbackProcess<any>(this.installUninstallExt, this, EFunctionsProcessType.bind, true),
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Uninstall extensions',
          command: { command: this.getCommand('extensionsuninstall'), title: '' },
        },
        callback: {
          caller: Functions.callbackProcess<any>(this.installUninstallExt, this, EFunctionsProcessType.bind, false),
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Set refresh time(in minutes)',
          command: { command: this.getCommand('extensionsrefreshtimedisabled'), title: 'Time to get all disabled extensions from database' },
        },
        callback: {
          caller: () => {
            this.utils.windows.createInputBox({
              placeHolder: '2',
              prompt: 'Insert time refresh in minutes',
              value: this.utils.extensions.refreshTime.toString(),
            }).then((res) => {
              this.utils.extensions.refreshTime = parseInt(res);
            });
          },
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Profiles example',
          command: { command: this.getCommand('profilesexamples'), title: '' },
        },
        callback: {
          caller: Functions.callbackProcess<any>(this.profilesExample, this, EFunctionsProcessType.bind),
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Show status of profiles',
          command: { command: this.getCommand('extensionsunshowstatus'), title: '' },
        },
        callback: {
          caller: Functions.callbackProcess<any>(this.showStatus, this, EFunctionsProcessType.bind),
          thisArg: this,
        },
      },
    ];
  }

  protected process() {
    const isValidSql = this.utils.sqlite.isValidToContinue();
    if (isValidSql.hasError) {
      throw isValidSql.error;
    }
    this.cmdProfilesManager = this.getCommand('profilesmanager');
    this.utils.console.registerCommand([
      {
        command: this.cmdProfilesManager,
        callback: {
          caller: Functions.callbackProcess<any>(this.createMenu, this, EFunctionsProcessType.bind),
          thisArg: this,
        },
      },
    ]);
    this.utils.windows.createStatusBar({ text: 'Profiles', command: this.cmdProfilesManager });
    this.prepareProfiles();
    workspace.onDidChangeConfiguration((listener) => {
      if (listener.affectsConfiguration(this.config)) {
        this.prepareProfiles();
      }
    });
  }

  private async createMenu() {
    const items: QuickPickItem[] = [];
    this.profilesData.forEach((element) => {
      let canPicked = true;
      element.data.forEach((id) => {
        if (canPicked && (!this.utils.extensions.isInstalled(id) || this.utils.extensions.isDisabled(id))) {
          canPicked = false;
        }
      });
      items.push({ label: element.name, picked: canPicked });
    });
    const selectedItems = await this.utils.windows.createQuickPick<QuickPickItem[]>(items, { canPickMany: true });
    if (selectedItems) {
      let ids: string[] = [];
      for (const profile of this.profilesData) {
        if (!selectedItems.find((val) => val.label === profile.name) && !profile.hide) {
          ids = ids.concat(profile.data);
        }
      }
      const response = this.utils.extensions.disable(ids);
      if (response.hasError) {
        this.logger.error(response.error);
      } else {
        this.logger.success(EProfileMessages.restartMessage);
      }
    }
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

  // eslint-disable-next-line valid-jsdoc
  /** *****************************************************
   * Install/Uninstall Area
   ******************************************************/
  private async installUninstallExt(isInstall: boolean): Promise<any> {
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
      await this.utils.extensions.installUninstallExtensions(ids, isInstall);
    }
  }

  private showStatus() {
    const css = `
    table, th, td {
      border:1px solid black;
    }
    table, h2 {
      align: center;
      width:50%;
    }
    th, td, h2 {
      text-align: center;
    }
    `;
    let data = '';
    for (const config of this.getConfig()) {
      if (config.data.length > 0) {
        data += `<h2>${config.name}</h2>`;
        data += `<table><tr><th style="width:70%">Extension ID</th><th>Status</th></tr>`;
        config.data.forEach((id) => {
          if (this.utils.extensions.isDisabled(id)) {
            data += `<tr><td style="width:70%">${id}</td><td>Disabled</td></tr>`;
          } else if (!this.utils.extensions.isInstalled(id)) {
            data += `<tr><td style="width:70%">${id}</td><td style="color:red">Not Instaled</td></tr>`;
          } else {
            data += `<tr><td style="width:70%">${id}</td><td style="color:green">Enabled</td></tr>`;
          }
        });
        data += `</table>`;
      }
    }
    this.utils.windows.showWebViewHTML(data, 'Status of all extension based on profiles defined', css);
  }

  private profilesExample() {
    const body = `<pre>
    [
      {
          "name": "VSCode",
          "hide": true,
          "data": [
              "mkxml.vscode-filesize",
              "ms-devlabs.extension-manifest-editor"
          ]
      },
      {
          "name": "Themes",
          "hide": true,
          "data": [
              "rokoroku.vscode-theme-darcula",
              "vscode-icons-team.vscode-icons",
              "orepor.color-tabs-vscode-ext"
          ]
      },
      {
          "name": "Generic",
          "hide": true,
          "data": [
              "vincaslt.highlight-matching-tag",
              "stylelint.vscode-stylelint",
              "usernamehw.errorlens",
              "hediet.debug-visualizer",
              "formulahendry.code-runner"
          ]
      },
      {
          "name": "Multi-Profile Dependencies",
          "hide": true,
          "data": [
              "Pivotal.vscode-manifest-yaml", // Spring, YML
              "pivotal.vscode-concourse", // Spring, CI-CD
              "redhat.vscode-yaml" // XML/HTML, OpenAPI
          ]
      },
      {
          "name": "Git/CI-CD",
          "data": [
              "eamodio.gitlens",
              "rubbersheep.gi"
          ]
      }
    ]</pre>`;
    this.utils.windows.showWebViewHTML(body, 'Example of Profiles');
  }
}
