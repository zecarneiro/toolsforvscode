import * as vscode from 'vscode';
import { DirectoryOrFileInfoInterface } from './interfaces/directory-or-file-info-interface';
import { Keys } from './enums/keys-enum';
import { CommandsEnum } from './enums/commands-enum';
import { MessagesEnum } from './enums/messages-enum';
import { GenericTools } from './tools/generic-tools';
import { StorageExtensionInfoInterface } from './interfaces/storage-extension-info-interface';
import { ContantsData } from './constants-data';

export class ExtensionsProfileManager {
    // Objects
    private jsonData: Object | undefined;
    private noProfileData: string[] = [];
    private profileData: Object = {};

    // Tools
    private genericTools: GenericTools = new GenericTools();

    // Others
    private item: string[];
    private configData: any;

    constructor(private contextExtension: vscode.ExtensionContext) {
        this.item = [];
        this.getUpdatedConfig();
        this.setMenu();
    }

    /*******************************************************
     * Public Area
     ******************************************************/
    getUpdatedConfig() {
        this.configData = vscode.workspace.getConfiguration(Keys.APP_CONFIG);
        this.jsonData = this.configData[Keys.JSON_FILE_CONFIG]
            ? JSON.parse(this.genericTools.readFile(this.configData[Keys.JSON_FILE_CONFIG]))
            : {};
        
        this.profileData = {};
        this.noProfileData = [];
        this.createMenuObject();
        this.validateAllProfiles();
    }

    installAllExtension() {
        //Profiles
        Object.entries(this.profileData).forEach(([key, value]) => {
            for (let extensionId in value) {
                const extensionName = value[extensionId];
                if (
                    extensionName !== Keys.OWN_EXTENSION
                    && !vscode.extensions.getExtension(extensionName)
                    && !this.getValueStorage(extensionName)
                )
                    this.genericTools.installExtensions(extensionName);
            }
        });

        // No profiles
        this.noProfileData.forEach(value => {
            const extensionName = value;
            if (
                extensionName !== Keys.OWN_EXTENSION
                && !vscode.extensions.getExtension(extensionName)
                && !this.getValueStorage(extensionName)
            ) {
                this.genericTools.installExtensions(extensionName);
            }
        });
        this.genericTools.showInformationMessage(MessagesEnum.RELOAD_WINDOW);
    }

    uninstallAllExtension() {
        //Profiles
        Object.entries(this.profileData).forEach(([key, value]) => {
            for (let extensionId in value) {
                const extensionName = value[extensionId];
                if (extensionName !== Keys.OWN_EXTENSION) {
                    if (this.getValueStorage(extensionName)) this.enableExtensions([extensionName]);
                    if (vscode.extensions.getExtension(extensionName)) this.genericTools.uninstallExtensions(extensionName);
                }
            }
        });

        // No profiles
        this.noProfileData.forEach(value => {
            const extensionName = value;
            if (extensionName !== Keys.OWN_EXTENSION) {
                if (this.getValueStorage(extensionName)) this.enableExtensions([extensionName]);
                if (vscode.extensions.getExtension(extensionName)) this.genericTools.uninstallExtensions(extensionName);
            }                
        });
        this.genericTools.showInformationMessage(MessagesEnum.RELOAD_WINDOW);
    }

    /*******************************************************
     * Private Area
     ******************************************************/
    private getValueStorage(key: string): StorageExtensionInfoInterface | undefined {
        return this.contextExtension.globalState.get(key) as StorageExtensionInfoInterface;
    }

    private deleteKeyStorage(key: string) {
        this.contextExtension.globalState.update(key, undefined);
    }

    private saveKeyStorage(key: string, storage: StorageExtensionInfoInterface) {
        this.contextExtension.globalState.update(key, storage);
    }

    private enableExtensions(extensionsData: string[]) {
        extensionsData.forEach(value => {
            this.genericTools.printOnOutputChannel(MessagesEnum.ENABLE_EXTENSION.replace('{0}', value));
            let extensionData = vscode.extensions.getExtension(value);
            if (!extensionData) {
                let storageValue = this.getValueStorage(value);
                if (!storageValue) {
                    this.genericTools.printOnOutputChannel(MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                } else {
                    let data: DirectoryOrFileInfoInterface = {
                        name: storageValue.disabled,
                        path: storageValue.installed,
                        newName: storageValue.enabled,
                        destPath: storageValue.installed
                    };
                    if (this.genericTools.renameFilesOrDir(data.name, data.newName as string, false, data.path, data.destPath)) {
                        this.deleteKeyStorage(value);
                    } else {
                        this.genericTools.printOnOutputChannel(MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                    }
                }
            }
        });
    }

    private disableExtensions(extensionsData: string[]) {
        extensionsData.forEach(value => {
            this.genericTools.printOnOutputChannel(MessagesEnum.DISABLE_EXTENSION.replace('{0}', value));
            let storageValue = this.getValueStorage(value);
            if (!storageValue) {
                let extensionData = vscode.extensions.getExtension(value);
                if (!extensionData) {
                    this.genericTools.printOnOutputChannel(MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                }
                else {
                    let newStorage: StorageExtensionInfoInterface = {
                        disabled: Keys.DISABLED_PACKAGEJSON,
                        enabled: Keys.ENABLED_PACKAGEJSON,
                        installed: extensionData.extensionPath
                    };
                    if (this.genericTools.renameFilesOrDir(newStorage.enabled, newStorage.disabled, false, newStorage.installed, newStorage.installed)) {
                        this.saveKeyStorage(value, newStorage);
                    } else {
                        this.genericTools.printOnOutputChannel(MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                    }
                }
            }
        });
    }

    private process(item: vscode.QuickPickItem | vscode.QuickPickItem[] | undefined) {
        let extensionObject = {
            'toEnable': [] as string[],
            'toDisable': [] as string[]
        }

        Object.entries(this.profileData).forEach(([key, value]) => {
            let toDisabled: boolean;
            if (item instanceof Array) {
                toDisabled = !item.find(item => item.label == key);
            } else {
                toDisabled = item?.label !== key;
            }

            for (let extensionId in value) {
                if (value[extensionId] !== Keys.OWN_EXTENSION) {
                    if (toDisabled) {
                        extensionObject.toDisable.push(value[extensionId]);
                    } else {
                        extensionObject.toEnable.push(value[extensionId]);
                    }
                }
            }
        });

        // Enable Extension
        this.enableExtensions(extensionObject.toEnable);

        // Disable Extension
        this.disableExtensions(extensionObject.toDisable);

        this.genericTools.showInformationMessage(MessagesEnum.RELOAD_WINDOW);
    }

    private setMenu() {
        let menuProfiles = vscode.commands.registerCommand(CommandsEnum.MENU, () => {
            let items:vscode.QuickPickItem[] = [];
            let profilesActivated = this.contextExtension.globalState.get(Keys.STORAGE_ACTIVATED_PROFILES) as string[];
    
            this.item.forEach(element => {
                let isPicked = (profilesActivated) ? profilesActivated.includes(element) : false;
                items.push({label: element, picked: isPicked});
            });
        
            vscode.window.showQuickPick<vscode.QuickPickItem>(items, {
                onDidSelectItem: (item) => {
                   console.log(item)
                },
                canPickMany: true
            }).then((selection) => {
                // User made final selection
                if (!selection) {
                    return
                } else {
                    this.process(selection);
                }
            });
        });
        this.contextExtension.subscriptions.push(menuProfiles);
    }

    private createMenuObject() {
        if (this.jsonData) {
            Object.entries(this.jsonData).forEach(([key, value]) => {
                if (key === Keys.NO_PROFILE) this.noProfileData = value;
                else if (key === Keys.PROFILE) this.profileData = value;
            });

            this.item = [];
            for (let profile in this.profileData) {
                this.item.push(profile);
            }
        }
    }

    private validateAllProfiles() {
        let activeProfile: string[] = [];
        Object.entries(this.profileData).forEach(([key, value]) => {
            for (let extensionId in value) {
                let extensionName = value[extensionId];
                if (vscode.extensions.getExtension(extensionName)) {
                    activeProfile.push(key);
                    break;
                }
            }
        });

        if (activeProfile.length > 0) {
            this.contextExtension.globalState.update(Keys.STORAGE_ACTIVATED_PROFILES, activeProfile);
        } else {
            this.contextExtension.globalState.update(Keys.STORAGE_ACTIVATED_PROFILES, undefined);
        }
    }
}