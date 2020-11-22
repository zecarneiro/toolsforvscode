import { StatusStorageDb } from './interface/status-storage-db';
import { ExtensionsDisabled } from './interface/extensions-disabled';
import { SqliteFunctions } from './lib/sqlite-functions';
import { StringsReplace } from './interface/strings-replace';
import { ExtensionsCommands } from './enum/extensions-command';
import { GenericFunctions } from './lib/generic-functions';
import { Profiles } from './interface/profiles';
import { Settings } from "./settings";
import * as vscode from 'vscode';
import { Terminal } from './lib/terminal';
import { PlatformType } from './enum/platform-type';
import * as os from 'os';
import { MessageType } from './enum/message-type';

export class ProfilesManager {
    private profilesData: Profiles[];
    private sqliteDB: SqliteFunctions;
    private tableStateStorage: string = 'ItemTable';
    private sqlDisableExtensions = {
        getAll: `SELECT * FROM ${this.tableStateStorage} WHERE key = '${Settings.STATE_STORAGE_DISABLED_EXTENSION_KEY}'`,
        update: `UPDATE ${this.tableStateStorage} SET value = '{0}' WHERE key = '${Settings.STATE_STORAGE_DISABLED_EXTENSION_KEY}'`,
        insert: `INSERT INTO ${this.tableStateStorage} (key, value) VALUES ('${Settings.STATE_STORAGE_DISABLED_EXTENSION_KEY}', '{0}')`,
        enableAll: `DELETE FROM ${this.tableStateStorage} WHERE key = '${Settings.STATE_STORAGE_DISABLED_EXTENSION_KEY}'`
    };

    constructor(private terminal: Terminal) {
        this.profilesData = [];
        this.sqliteDB = new SqliteFunctions();
        this.prepareAll();
    }

    private prepareAll() {
        let profileConfig = Settings.CONFIG_DATA[Settings.CONFIG_PROFILES] as Profiles[];
        profileConfig.forEach(profile => {
            let toIsert = true;
            if (profile.name && profile.data && profile.name.length > 0 && profile.data.length > 0) {
                if (this.profilesData.length <= 0) {
                    toIsert = true;
                } else if (this.profilesData.findIndex(value => value.name === profile.name) !== -1) {
                    const msg = "Already exists profile with name: " + profile.name;
                    toIsert = false;
                    GenericFunctions.printToOutputChannel(msg, true);
                } else {
                    for (const key in profile.data) {
                        if (this.profilesData.findIndex(x => x.data.indexOf(profile.data[key]) >= 0) !== -1) {
                            const msg = "Already exists extension id: " + profile.data[key];
                            toIsert = false;
                            GenericFunctions.printToOutputChannel(msg, true);
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
    }

    private getStateStorageFile(): string {
        let homeDir: string = os.homedir();
        let stateStorageFile: string = 'Code/User/globalStorage/state.vscdb';
        switch (GenericFunctions.getPlatform()) {
            case PlatformType.LINUX:
                return homeDir + '/.config/' + stateStorageFile;
            case PlatformType.WINDOWS:
                return homeDir + '\\AppData\\Roaming\\' + stateStorageFile;
            default:
                return '';
        }
    }

    private disableExtensions(profiles: string[]) {
        let toDisable: ExtensionsDisabled[] = [];
        this.profilesData.forEach(profile => {
            const index = profiles.findIndex(x => x === profile.name);
            if (index === -1) {
                profile.data.forEach(id => {
                    const extension = vscode.extensions.getExtension(id);
                    toDisable.push({id: id, uuid: extension?.packageJSON.uuid});
                });
            }
        });

        this.sqliteDB.open(this.getStateStorageFile()).then(conn => {
            if (conn.status) {
                let db = conn.data.database;
                const message = {
                    success: 'All ;extensions disabled. Please Reload!!!',
                    error: 'Manage Profile Operations Fail'
                };

                // Enable All Extensions
                if (toDisable.length === 0) {
                    db.exec(this.sqlDisableExtensions.enableAll).then(x => {
                        GenericFunctions.showMessage(message.success, MessageType.ONLY_PRINT);
                    }).catch(error => GenericFunctions.showMessage(error, MessageType.ERROR));

                // Disable extensions
                } else {
                    db.get(this.sqlDisableExtensions.getAll).then(select => {
                        const value = GenericFunctions.convertStringJson(toDisable);

                        // If already exist disabled extension(s)
                        if (select) {
                            let sql = GenericFunctions.replaceAll(this.sqlDisableExtensions.update, [{search: '{0}', toReplace: value as string}]);
                            db.exec(sql).then(x => {
                                GenericFunctions.showMessage(message.success, MessageType.ONLY_PRINT);
                            }).catch(error => GenericFunctions.showMessage(error, MessageType.ERROR));

                        // If not exist disabled extension(s)
                        } else {
                            let sql = GenericFunctions.replaceAll(this.sqlDisableExtensions.insert, [{search: '{0}', toReplace: value as string}]);
                            db.exec(sql).then(x => {
                                GenericFunctions.showMessage(message.success, MessageType.ONLY_PRINT);
                            }).catch(error => GenericFunctions.showMessage(error, MessageType.ERROR));
                        }
                    }).catch(error => GenericFunctions.showMessage(error, MessageType.ERROR));
                }
            } else {
                GenericFunctions.showMessage(conn.message, MessageType.ERROR);
            }
        });
    }

    createMenu() {
        this.sqliteDB.open(this.getStateStorageFile()).then(conn => {
            if (conn.status) {
                let db = conn.data.database;
                db.get<StatusStorageDb>(this.sqlDisableExtensions.getAll).then(extensionsDisabled => {
                    let extensionsDisabledData: ExtensionsDisabled[] = [];
                    let items: vscode.QuickPickItem[] = [];

                    if (extensionsDisabled) {
                        extensionsDisabledData = GenericFunctions.convertStringJson(extensionsDisabled.value, true) as ExtensionsDisabled[];
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
                        items.push({label: element.name, picked: isPicked, description: description});
                    });

                    vscode.window.showQuickPick<vscode.QuickPickItem>(items, {
                        onDidSelectItem: (item) => {
                        console.log(item);
                        },
                        canPickMany: true
                    }).then((selection) => {
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
                GenericFunctions.showMessage(conn.message, MessageType.ERROR);
            }
        });
    }

    /*******************************************************
     * Install/Uninstall Area
     ******************************************************/
    installAllExtension() {
        this.profilesData.forEach(profile => {
            profile.data.forEach(id => {
                if (id !== Settings.APP_NAME) {
                    const stringsReplace: StringsReplace[] = [{search: '{0}', toReplace: id}];
                    const installCMD = GenericFunctions.replaceAll(ExtensionsCommands.INSTALL, stringsReplace);
                    GenericFunctions.execShellCMD({executable: installCMD}, this.terminal.getTerminal());
                }
            });
        });
    }

    uninstallAllExtension() {
        this.profilesData.forEach(profile => {
            profile.data.forEach(id => {
                if (id !== Settings.APP_NAME) {
                    const stringsReplace: StringsReplace[] = [{search: '{0}', toReplace: id}];
                    const uninstallCMD = GenericFunctions.replaceAll(ExtensionsCommands.UNINSTALL, stringsReplace);
                    GenericFunctions.execShellCMD({executable: uninstallCMD}, this.terminal.getTerminal());
                }
            });
        });
    }
}