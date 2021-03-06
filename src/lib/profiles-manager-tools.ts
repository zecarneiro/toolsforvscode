import { LibStatic } from '../utils/lib-static';
import { IStatusStorageDb } from '../interface/status-storage-db-interface';
import { ProfileManagerMsgEnum } from '../enum/profiles-manager-enum';
import { IDisabledExt, IProfiles } from '../interface/profiles-manager-interface';
import { App } from '../app';
import { extensions, QuickPickItem } from 'vscode';
import { NotifyEnum, PlatformTypeEnum } from '../utils/enum/lib-enum';
import { ShellTypeEnum } from '../utils/enum/console-extends-enum';
import { Lib } from '../utils/lib';

export class ProfilesManagerTools extends App {
    static readonly className = 'ProfilesManagerTools';
    readonly activityBarId = 'profiles-manager-tools-jnoronha';

    private profilesData: IProfiles[];

    // Commands
    private cmdProfilesManager: string;


    // CONFIGURATIONS
    private readonly defaultMdProfilesFile = LibStatic.resolvePath<string>(this.filesDir + '/profiles.md');
    private readonly config = 'profiles';
    
    private readonly stateStorageDisabledExtensionKey = "extensionsIdentifiers/disabled";
    private readonly sqlDisableExt = {
        getAll: `SELECT * FROM ${this.tableStateStorage} WHERE key = '${this.stateStorageDisabledExtensionKey}'`,
        update: `UPDATE ${this.tableStateStorage} SET value = '{0}' WHERE key = '${this.stateStorageDisabledExtensionKey}'`,
        insert: `INSERT INTO ${this.tableStateStorage} (key, value) VALUES ('${this.stateStorageDisabledExtensionKey}', '{0}')`,
        enableAll: `DELETE FROM ${this.tableStateStorage} WHERE key = '${this.stateStorageDisabledExtensionKey}'`
    };

    constructor(
        lib: Lib
    ) {
        super(lib, ProfilesManagerTools.className);
        this.profilesData = [];
        this.cmdProfilesManager = this.getCommand('profilesmanager');

        this.prepareAll([
            {
                treeItem: {
                    label: "Activate All Extensions",
                    command: { command: this.getCommand('activeallextensions'), title: "" }
                },
                callback: {
                    caller: this.enableAllExtensions,
                    isSync: true,
                    thisArg: this
                }
            },
            {
                treeItem: {
                    label: "Reload When Profile Change",
                    command: { command: this.getCommand('reloadvscodeonprofilechange'), title: "" }
                },
                callback: {
                    caller: this.reloadVScode,
                    isSync: true,
                    thisArg: this
                }
            },
            {
                treeItem: {
                    label: "Install Extensions",
                    command: { command: this.getCommand('extensionsinstall'), title: '' }
                },
                callback: {
                    caller: this.InstallUninstallExt,
                    args: [true],
                    isSync: true,
                    thisArg: this
                }
            },
            {
                treeItem: {
                    label: "Uninstall Extensions",
                    command: { command: this.getCommand('extensionsuninstall'), title: '' }
                },
                callback: {
                    caller: this.InstallUninstallExt,
                    args: [false],
                    isSync: true,
                    thisArg: this
                }
            },
            {
                treeItem: {
                    label: "Show My Default Extensions",
                    command: { command: this.getCommand('showdefaultprofiles'), title: '' }
                },
                callback: {
                    caller: LibStatic.showFilesMD,
                    args: [this.defaultMdProfilesFile],
                    isSync: true,
                    thisArg: this
                }
            }
        ]);
        this.lib.registerVscodeCommand([
            {
                command: this.cmdProfilesManager,
                callback: {
                    caller: this.createMenu,
                    isSync: true,
                    thisArg: this
                }
            },
        ]);
        LibStatic.createStatusBar({ text: 'Profiles Manager', command: this.cmdProfilesManager });

        // Functions
        this.prepareProfiles();
    }

    private prepareProfiles() {
        let profileConfig = this.lib.extensionData.configData[this.config] as IProfiles[];
        if (profileConfig && profileConfig.length > 0) {
            this.profilesData = LibStatic.copyJsonData(profileConfig);
        }
        this.lib.sqliteExtend.file = LibStatic.getVscodeStorageStateFile();
    }

    private reloadVScode() {
        switch (LibStatic.getPlatform()) {
            case PlatformTypeEnum.windows:
                this.lib.consoleExtend.execOutputChannel(`${this.scriptsToSystem.windows} -RELOAD_VSCODE_CHANGED_PROFILE 1`, {
                    shell: this.lib.consoleExtend.getShell(ShellTypeEnum.powershell).command
                });
                break;
            case PlatformTypeEnum.linux:
                this.printMessages("Not implemented yet!!!", false, NotifyEnum.warning);
                break;
            case PlatformTypeEnum.osx: // TODO: IMPLEMENT TO OSX
                this.printMessages("Not implemented yet!!!", false, NotifyEnum.warning);
                break;
        }
    }

    private enableAllExtensions() {
        this.lib.sqliteExtend.exec(this.sqlDisableExt.enableAll, (result) => {
            if (result.error) {
                this.printMessages(result.error, false, NotifyEnum.error);
            } else {
                LibStatic.notify(ProfileManagerMsgEnum.EXTENSIONS_DISABLED_ENABLED);
            }
        });
    }

    private disableExtensions(profiles: string[]) {
        let toDisable: IDisabledExt[] = [];
        let profilesToDisabled: string[] = [];
        this.profilesData.forEach(profile => {
            const index = profiles.findIndex(x => x === profile.name);
            if (index === -1) {
                profile.data.forEach(id => {
                    const extension = extensions.getExtension(id);
                    if (profilesToDisabled.indexOf(profile.name) < 0) {
                        profilesToDisabled.push(profile.name);
                    }
                    toDisable.push({ id: id, uuid: extension?.packageJSON.uuid });
                });
            }
        });

        // Enable All Extensions
        if (toDisable.length === 0) {
            this.enableAllExtensions();
        }
        // Disable extensions
        else {
            this.lib.sqliteExtend. exec(this.sqlDisableExt.getAll, (result) => {
                if (result.error) {
                    this.printMessages(result.error, false, NotifyEnum.error);
                } else {
                    const value = LibStatic.stringToJson(toDisable, true);

                    // If already exist disabled extension(s)
                    if (result.data) {
                        let sql = LibStatic.stringReplaceAll(this.sqlDisableExt.update, [{ search: '{0}', toReplace: value }]);
                        this.lib.sqliteExtend.exec(sql, (sqlResult) => {
                            if (sqlResult.error) {
                                this.printMessages(sqlResult.error, false, NotifyEnum.error);
                            } else {
                                this.printMessages(ProfileManagerMsgEnum.EXTENSIONS_DISABLED_ENABLED, false);
                            }
                        });
                    }
                    // If not exist disabled extension(s)
                    else {
                        let sql = LibStatic.stringReplaceAll(this.sqlDisableExt.insert, [{ search: '{0}', toReplace: value }]);
                        this.lib.sqliteExtend.exec(sql, (sqlResult) => {
                            if (sqlResult.error) {
                                this.printMessages(sqlResult.error, false, NotifyEnum.error);
                            } else {
                                this.printMessages(ProfileManagerMsgEnum.EXTENSIONS_DISABLED_ENABLED, false);
                            }
                        });
                    }
                }
            });
        }
    }

    private createMenu() {
        this.lib.sqliteExtend.exec<IStatusStorageDb[]>(this.sqlDisableExt.getAll, (result) => {
            if (result.error) {
                this.printMessages(result.error, false, NotifyEnum.error);
            } else {
                
                let extensionsDisabled: IStatusStorageDb[] = result.data ? result.data : [];
                let extensionsDisabledData: IDisabledExt[] = [];
                let items: QuickPickItem[] = [];

                if (extensionsDisabled && extensionsDisabled.length > 0) {
                    extensionsDisabledData = LibStatic.stringToJson(extensionsDisabled[0].value, false) as IDisabledExt[];
                }

                this.profilesData.forEach(element => {
                    let description: string = '';
                    element.data.forEach(extensionId => {
                        if (description.length === 0) {
                            description = extensionId;
                        } else {
                            description += ', ' + extensionId;
                        }
                    });
                    let isPicked = true;
                    for (const extId in element.data) {
                        if (
                            extensionsDisabledData.findIndex(x => x.id === element.data[extId]) !== -1
                            || !LibStatic.isExtensionInstalled(element.data[extId])
                        ) {
                            isPicked = false;
                            break;
                        }
                    }
                    items.push({ label: element.name, picked: isPicked, description: description });
                });
                LibStatic.createQuickPick(items, { canPickMany: true }).then((selection) => {
                    selection = selection as QuickPickItem[] | undefined;
                    // User made final selection
                    if (!selection) {
                        return;
                    } else {
                        let profile: string[] = [];

                        this.printMessages("Processing...", false);
                        profile = selection.map(x => x.label);
                        this.disableExtensions(profile);
                    }
                });
            }
        });
    }

    /*******************************************************
     * Install/Uninstall Area
     ******************************************************/
    private InstallUninstallExt(isInstall: boolean) {
        this.profilesData.forEach(profile => {
            let ids: string[] = [];
            profile.data.forEach(id => {
                if (id !== App.id) {
                    ids.push(id);
                }
            });
            if (isInstall) {
                LibStatic.installUninstallExtensions(ids, this.lib.consoleExtend);
            } else {
                LibStatic.installUninstallExtensions(ids, this.lib.consoleExtend, true);
            }
        });
    }
}