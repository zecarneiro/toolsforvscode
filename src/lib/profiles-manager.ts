import { NotifyEnum } from './../utils/enum/generic';
import { ProfileManagerMsgEnum } from './../enum/profiles-manager';
import { IDisabledExt } from './../interface/profiles-manager';
import { IRegVsCmd } from './../utils/interface/generic';
import { SqliteFunctions } from '../utils/sqlite-functions';
import { Settings } from "../settings";
import * as vscode from 'vscode';
import { Terminal } from '../utils/terminal';
import { Generic } from '../utils/generic';
import { SettingsProfilesManager } from '../settings/profiles-manager';
import { IProfiles } from '../interface/profiles-manager';
import { IStatusStorageDb } from '../interface/status-storage-db';

export class ProfilesManager {
    private profilesData: IProfiles[];
    private sqliteDB: SqliteFunctions;

    constructor(
        private terminal: Terminal,
        private generic: Generic
    ) {
        this.sqliteDB = new SqliteFunctions();
        this.profilesData = [];
        this.prepareAll();
    }

    init() {
        let commands: IRegVsCmd[] = [
            {
                command: SettingsProfilesManager.CMD_INSTALL,
                callback: () => { this.installAllExtension(); },
                thisArg: this
            },
            {
                command: SettingsProfilesManager.CMD_UNINSTALL,
                callback: () => { this.uninstallAllExtension(); },
                thisArg: this
            },
            {
                command: SettingsProfilesManager.CMD_PROFILES_MANAGER,
                callback: () => { this.createMenu(); },
                thisArg: this
            },
            {
                command: SettingsProfilesManager.CMD_SHOW_DEFAULT_PROFILES,
                callback: () => { this.generic.showFilesMD(SettingsProfilesManager.DEFAULT_MD_PROFILES_FILE); },
                thisArg: this
            }
        ];
        this.generic.createVscodeCommand(commands);
        this.generic.createStatusBar(SettingsProfilesManager.STATUS_BAR, SettingsProfilesManager.CMD_PROFILES_MANAGER);
    }

    private prepareAll() {
        let profileConfig = Settings.CONFIG_DATA[SettingsProfilesManager.CONFIG] as IProfiles[];
        profileConfig.forEach(profile => {
            let toIsert = true;
            if (profile.name && profile.data && profile.name.length > 0 && profile.data.length > 0) {
                if (this.profilesData.length <= 0) {
                    toIsert = true;
                } else if (this.profilesData.findIndex(value => value.name === profile.name) !== -1) {
                    const msg = this.generic.stringReplaceAll(ProfileManagerMsgEnum.PROFILE_EXISTS, [{ search: '{0}', toReplace: profile.name }]);
                    toIsert = false;
                    this.generic.printOutputChannel(msg, true, this.prepareAll.name);
                } else {
                    for (const key in profile.data) {
                        if (this.profilesData.findIndex(x => x.data.indexOf(profile.data[key]) >= 0) !== -1) {
                            const msg = this.generic.stringReplaceAll(ProfileManagerMsgEnum.PROFILE_EXISTS, [{ search: '{0}', toReplace: profile.data[key] }]);
                            toIsert = false;
                            this.generic.printOutputChannel(msg, true, this.prepareAll.name);
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
        this.profilesData.forEach(profile => {
            const index = profiles.findIndex(x => x === profile.name);
            if (index === -1) {
                profile.data.forEach(id => {
                    const extension = vscode.extensions.getExtension(id);
                    toDisable.push({ id: id, uuid: extension?.packageJSON.uuid });
                });
            }
        });

        this.sqliteDB.open().then(res => {
            if (res.status) {
                let db = res.data;

                // Enable All Extensions
                if (toDisable.length === 0) {
                    db.exec(SettingsProfilesManager.SQL_DISABLE_EXT.enableAll).then(x => {
                        this.generic.notify(ProfileManagerMsgEnum.EXTENSIONS_DISABLED);
                    }).catch(error => this.generic.notify(error, NotifyEnum.error));

                    // Disable extensions
                } else {
                    db.get(SettingsProfilesManager.SQL_DISABLE_EXT.getAll).then(select => {
                        const value = this.generic.stringToJson(toDisable, true);

                        // If already exist disabled extension(s)
                        if (select) {
                            let sql = this.generic.stringReplaceAll(SettingsProfilesManager.SQL_DISABLE_EXT.update, [{ search: '{0}', toReplace: value }]);
                            db.exec(sql).then(x => {
                                this.generic.notify(ProfileManagerMsgEnum.EXTENSIONS_DISABLED);
                            }).catch(error => this.generic.notify(error, NotifyEnum.error));

                            // If not exist disabled extension(s)
                        } else {
                            let sql = this.generic.stringReplaceAll(SettingsProfilesManager.SQL_DISABLE_EXT.insert, [{ search: '{0}', toReplace: value }]);
                            db.exec(sql).then(x => {
                                this.generic.notify(ProfileManagerMsgEnum.EXTENSIONS_DISABLED);
                            }).catch(error => this.generic.notify(error, NotifyEnum.error));
                        }
                    }).catch(error => this.generic.notify(error, NotifyEnum.error));
                }
            } else {
                this.generic.notify(res.message, NotifyEnum.error);
            }
        });
    }

    private createMenu() {
        this.sqliteDB.open().then(res => {
            if (res.status) {
                let db = res.data;
                db.get<IStatusStorageDb>(SettingsProfilesManager.SQL_DISABLE_EXT.getAll).then(extensionsDisabled => {
                    let extensionsDisabledData: IDisabledExt[] = [];
                    let items: vscode.QuickPickItem[] = [];

                    if (extensionsDisabled) {
                        extensionsDisabledData = this.generic.stringToJson(extensionsDisabled.value, false) as IDisabledExt[];
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
                });
            } else {
                this.generic.notify(res.message, NotifyEnum.error);
            }
        });
    }

    /*******************************************************
     * Install/Uninstall Area
     ******************************************************/
    private installAllExtension() {
        this.profilesData.forEach(profile => {
            profile.data.forEach(id => {
                if (id !== Settings.APP_NAME) {
                    this.generic.installUninstallExtensions(id, this.terminal);
                }
            });
        });
    }

    private uninstallAllExtension() {
        this.profilesData.forEach(profile => {
            profile.data.forEach(id => {
                if (id !== Settings.EXTENSION_NAME) {
                    this.generic.installUninstallExtensions(id, this.terminal, true);
                }
            });
        });
    }
}