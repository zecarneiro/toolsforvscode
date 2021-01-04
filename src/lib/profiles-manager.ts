import { IStatusStorageDb } from '../interface/status-storage-db-interface';
import { NotifyEnum } from '../utils/enum/generic-enum';
import { ProfileManagerMsgEnum } from '../enum/profiles-manager-enum';
import { IDisabledExt } from '../interface/profiles-manager-interface';
import { IRegVsCmd } from '../utils/interface/generic-interface';
import { SqliteFunctions } from '../utils/sqlite-functions';
import { Settings } from "../settings";
import * as vscode from 'vscode';
import { Generic } from '../utils/generic';
import { IProfiles } from '../interface/profiles-manager-interface';

export class ProfilesManager {
    private profilesData: IProfiles[];
    private sqliteDB: SqliteFunctions;

    // Commands
    private cmdProfilesManager: string;
    private cmdInstall: string;
    private cmdUninstall: string;
    private cmdShowDefaultProfiles: string;

    // CONFIGURATIONS
    private defaultMdProfilesFile: string;
    private readonly config = 'profiles';
    private readonly statusBar = 'Profiles Manager';
    private readonly stateStorageDisabledExtensionKey = "extensionsIdentifiers/disabled";
    private readonly sqlDisableExt = {
        getAll: `SELECT * FROM ${Settings.TABLE_STATE_STORAGE} WHERE key = '${this.stateStorageDisabledExtensionKey}'`,
        update: `UPDATE ${Settings.TABLE_STATE_STORAGE} SET value = '{0}' WHERE key = '${this.stateStorageDisabledExtensionKey}'`,
        insert: `INSERT INTO ${Settings.TABLE_STATE_STORAGE} (key, value) VALUES ('${this.stateStorageDisabledExtensionKey}', '{0}')`,
        enableAll: `DELETE FROM ${Settings.TABLE_STATE_STORAGE} WHERE key = '${this.stateStorageDisabledExtensionKey}'`
    };

    constructor(
        private generic: Generic
    ) {
        this.sqliteDB = new SqliteFunctions(generic);
        this.profilesData = [];
        this.defaultMdProfilesFile = generic.resolvePath(Settings.FILES_DIR(generic) + '/profiles.md') as string;
        this.cmdProfilesManager = generic.extensionData.name + '.profilesmanager';
        this.cmdInstall = generic.extensionData.name + '.extensionsinstall';
        this.cmdUninstall = generic.extensionData.name + '.extensionsuninstall';
        this.cmdShowDefaultProfiles = generic.extensionData.name + '.showdefaultprofiles';

        // Functions
        this.prepareAll();
    }

    init() {
        let commands: IRegVsCmd[] = [
            {
                command: this.cmdInstall,
                callback: () => { this.extensionManager(true); },
                thisArg: this
            },
            {
                command: this.cmdUninstall,
                callback: () => { this.extensionManager(false); },
                thisArg: this
            },
            {
                command: this.cmdProfilesManager,
                callback: () => { this.createMenu(); },
                thisArg: this
            },
            {
                command: this.cmdShowDefaultProfiles,
                callback: () => { this.generic.showFilesMD(this.defaultMdProfilesFile); },
                thisArg: this
            }
        ];
        this.generic.createVscodeCommand(commands);
        this.generic.createStatusBar(this.statusBar, this.cmdProfilesManager);
    }

    private prepareAll() {
        let profileConfig = this.generic.extensionData.configData[this.config] as IProfiles[];
        profileConfig.forEach(profile => {
            let toIsert = true;
            if (profile.name && profile.data && profile.name.length > 0 && profile.data.length > 0) {
                if (this.profilesData.length <= 0) {
                    toIsert = true;
                } else if (this.profilesData.findIndex(value => value.name === profile.name) !== -1) {
                    const msg = this.generic.stringReplaceAll(ProfileManagerMsgEnum.PROFILE_EXISTS, [{ search: '{0}', toReplace: profile.name }]);
                    toIsert = false;
                    this.generic.printOutputChannel(msg, { title: this.prepareAll.name, isNewLine: true });
                } else {
                    for (const key in profile.data) {
                        if (this.profilesData.findIndex(x => x.data.indexOf(profile.data[key]) >= 0) !== -1) {
                            const msg = this.generic.stringReplaceAll(ProfileManagerMsgEnum.PROFILE_EXISTS, [{ search: '{0}', toReplace: profile.data[key] }]);
                            toIsert = false;
                            this.generic.printOutputChannel(msg, { title: this.prepareAll.name, isNewLine: true });
                            break;
                        }
                    }
                }
            } else {
                toIsert = false;
            }

            if (toIsert) {
                this.profilesData.push(profile);
            }
        });
        this.sqliteDB.file = Settings.VSCODE_STATE_STORAGE_FILE(this.generic);
    }

    private disableExtensions(profiles: string[]) {
        let toDisable: IDisabledExt[] = [];
        let profilesToDisabled: string[] = [];
        this.profilesData.forEach(profile => {
            const index = profiles.findIndex(x => x === profile.name);
            if (index === -1) {
                profile.data.forEach(id => {
                    const extension = vscode.extensions.getExtension(id);
                    if (profilesToDisabled.indexOf(profile.name) < 0) {
                        profilesToDisabled.push(profile.name);
                    }
                    toDisable.push({ id: id, uuid: extension?.packageJSON.uuid });
                });
            }
        });

        // Enable All Extensions
        if (toDisable.length === 0) {
            this.sqliteDB.exec(this.sqlDisableExt.enableAll, (result) => {
                if (result.error) {
                    this.generic.notify(result.error, NotifyEnum.error);
                } else {
                    this.generic.notify(ProfileManagerMsgEnum.EXTENSIONS_ENABLED);
                }
            });
        }
        // Disable extensions
        else {
            this.sqliteDB.exec(this.sqlDisableExt.getAll, (result) => {
                if (result.error) {
                    this.generic.notify(result.error, NotifyEnum.error);
                } else {
                    const value = this.generic.stringToJson(toDisable, true);

                    // If already exist disabled extension(s)
                    if (result.data) {
                        let sql = this.generic.stringReplaceAll(this.sqlDisableExt.update, [{ search: '{0}', toReplace: value }]);
                        this.sqliteDB.exec(sql, (result) => {
                            if (result.error) {
                                this.generic.notify(result.error, NotifyEnum.error);
                            } else {
                                let message = this.generic.stringReplaceAll(ProfileManagerMsgEnum.EXTENSIONS_DISABLED, [{ search: '{0}', toReplace: profilesToDisabled.toString() }]);
                                this.generic.notify(message);
                            }
                        });
                    }
                    // If not exist disabled extension(s)
                    else {
                        let sql = this.generic.stringReplaceAll(this.sqlDisableExt.insert, [{ search: '{0}', toReplace: value }]);
                        this.sqliteDB.exec(sql, (result) => {
                            if (result.error) {
                                this.generic.notify(result.error, NotifyEnum.error);
                            } else {
                                let message = this.generic.stringReplaceAll(ProfileManagerMsgEnum.EXTENSIONS_DISABLED, [{ search: '{0}', toReplace: profilesToDisabled.toString() }]);
                                this.generic.notify(message);
                            }
                        });
                    }
                }
            });
        }
    }

    private createMenu() {
        this.sqliteDB.exec(this.sqlDisableExt.getAll, (result) => {
            if (result.error) {
                this.generic.notify(result.error, NotifyEnum.error);
            } else {
                let extensionsDisabled: IStatusStorageDb[] = result.data as IStatusStorageDb[];
                let extensionsDisabledData: IDisabledExt[] = [];
                let items: vscode.QuickPickItem[] = [];

                if (extensionsDisabled && extensionsDisabled.length > 0) {
                    extensionsDisabledData = this.generic.stringToJson(extensionsDisabled[0].value, false) as IDisabledExt[];
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
                            || !vscode.extensions.getExtension(element.data[extId])
                        ) {
                            isPicked = false;
                            break;
                        }
                    }
                    items.push({ label: element.name, picked: isPicked, description: description });
                });
                this.generic.createQuickPick(items, { canPickMany: true }).then((selection) => {
                    selection = selection as vscode.QuickPickItem[] | undefined;
                    // User made final selection
                    if (!selection) {
                        return;
                    } else {
                        let profile: string[] = [];
                        profile = selection.map(x => x.label);
                        this.disableExtensions(profile);
                    }
                });
            }
        });
    };

    /*******************************************************
     * Install/Uninstall Area
     ******************************************************/
    private extensionManager(isInstall: boolean) {
        this.profilesData.forEach(profile => {
            profile.data.forEach(id => {
                if (id !== this.generic.extensionData.id) {
                    if (isInstall) {
                        this.generic.installUninstallExtensions(id);
                    } else {
                        this.generic.installUninstallExtensions(id, true);
                    }
                }
            });
        });
    }
}