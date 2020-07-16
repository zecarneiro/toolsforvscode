import { ProfileTypeObjetInterface } from './interfaces/profile-type-object-interface';
import { JsonDataInterface } from './interfaces/json-data-interface';
import * as vscode from 'vscode';
import { DirectoryOrFileInfoInterface } from './interfaces/directory-or-file-info-interface';
import { Keys } from './enums/keys-enum';
import { CommandsEnum } from './enums/commands-enum';
import { MessagesEnum } from './enums/messages-enum';
import { GenericTools } from './tools/generic-tools';
import { StorageExtensionInfoInterface } from './interfaces/storage-extension-info-interface';

export class ExtensionsProfileManager {
    // Objects
    private dataFromFile: JsonDataInterface;

    // Tools
    private genericTools: GenericTools = new GenericTools();

    // Others
    private item: string[];
    private configData: any;

    constructor(private contextExtension: vscode.ExtensionContext) {
        this.dataFromFile = {ignored: [], profiles: []};
        this.item = [];
        this.getUpdatedConfig();
        this.setMenu();
    }

    /*******************************************************
     * Public Area
     ******************************************************/
    getUpdatedConfig() {
        this.configData = vscode.workspace.getConfiguration(Keys.APP_CONFIG);
        let dataFile = this.genericTools.readFile(this.configData[Keys.JSON_FILE_CONFIG]);
        
        if (dataFile["ignored"] && dataFile["ignored"] instanceof Array) {
            for (const key in dataFile["ignored"]) {
                if (typeof dataFile["ignored"][key] === "string") {
                    this.dataFromFile.ignored.push(dataFile["ignored"][key]);
                }
            }
            this.dataFromFile.ignored = this.genericTools.removeDuplicatesValues(this.dataFromFile.ignored);
        }

        if (dataFile["profiles"] && dataFile["profiles"] instanceof Array) {
            for (const key in dataFile["profiles"]) {
                if (typeof dataFile["profiles"][key] == "object") {
                    let data = dataFile["profiles"][key] as ProfileTypeObjetInterface;

                    if (
                        data.name && data.data
                        && data.data instanceof Array
                        && data.data.length > 0
                        && !data.data.find(value => typeof value !== 'string')
                    ) {
                        this.dataFromFile.profiles.push(dataFile["profiles"][key]);
                    }
                }
            }
            this.dataFromFile.profiles = this.genericTools.removeDuplicatesValues(this.dataFromFile.profiles);
        }

        this.createMenuObject();
        this.validateAllProfiles();
    }

    /*******************************************************
     * Install/Uninstall Area
     ******************************************************/
    installAllExtension() {
        // No profiles
        this.dataFromFile.ignored.forEach(extensionName => {
            if (
                extensionName !== Keys.OWN_EXTENSION
                && !vscode.extensions.getExtension(extensionName)
                && !this.getValueStorage(extensionName)
            ) {
                this.genericTools.installExtensions(extensionName);
            }
        });

        //Profiles
        this.dataFromFile.profiles.forEach(profile => {
            profile.data.forEach(extensionName => {
                if (
                    extensionName !== Keys.OWN_EXTENSION
                    && !vscode.extensions.getExtension(extensionName)
                    && !this.getValueStorage(extensionName)
                ) {
                    this.genericTools.installExtensions(extensionName);
                }
            });
        });
        this.genericTools.showInformationMessage(MessagesEnum.RELOAD_WINDOW);
    }

    uninstallAllExtension() {
        let extensionsData = {
            toEnable: [] as string[],
            toUninstall: [] as string[]
        };        

        //Profiles
        this.dataFromFile.profiles.forEach(value => {
            value.data.forEach(extensionName => {
                if (extensionName !== Keys.OWN_EXTENSION) {
                    if (this.getValueStorage(extensionName)) {
                        if (!extensionsData.toEnable.includes(extensionName)) {
                            extensionsData.toEnable.push(extensionName);
                        }
                    } else {
                        if (
                            extensionsData.toEnable.length == 0
                            && vscode.extensions.getExtension(extensionName)
                            && !extensionsData.toUninstall.includes(extensionName)
                        ) {
                            extensionsData.toUninstall.push(extensionName);
                        }
                    }
                }
            });
        });

        // No profiles
        this.dataFromFile.ignored.forEach(extensionName => {
            if (extensionName !== Keys.OWN_EXTENSION) {
                if (this.getValueStorage(extensionName)) {
                    if (!extensionsData.toEnable.includes(extensionName)) {
                        extensionsData.toEnable.push(extensionName);
                    }
                } else {
                    if (
                        extensionsData.toEnable.length == 0
                        && vscode.extensions.getExtension(extensionName)
                        && !extensionsData.toUninstall.includes(extensionName)
                    ) {
                        extensionsData.toUninstall.push(extensionName);
                    }
                }
            }
        });

        if (extensionsData.toEnable.length > 0) {
            this.enableExtensions(extensionsData.toEnable);
            let message = MessagesEnum.RELOAD_WINDOW + " and Run Unistall again";
            this.genericTools.showInformationMessage(message);
        } else {
            extensionsData.toUninstall.forEach(extensionName => {
                this.genericTools.uninstallExtensions(extensionName);
            });
            this.genericTools.showInformationMessage(MessagesEnum.RELOAD_WINDOW);
        }
    }

    /*******************************************************
     * Storage Area
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

    /*******************************************************
     * Disable/Enable Extensions Area
     ******************************************************/
    private enableExtensions(extensionsData: string[]) {
        extensionsData.forEach(value => {
            let extensionData = vscode.extensions.getExtension(value);
            let storageValue = this.getValueStorage(value);
            let updateStorage = false;

            this.genericTools.printOnOutputChannel(MessagesEnum.ENABLE_EXTENSION.replace('{0}', value));
            if (!extensionData) {
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
                        updateStorage = true;
                    } else {
                        this.genericTools.printOnOutputChannel(MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                    }
                }
            } else {
                if (storageValue) updateStorage = true;
            }

            if (updateStorage) this.deleteKeyStorage(value);
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
            toEnable: [] as string[],
            toDisable: [] as string[]
        }

        this.dataFromFile.profiles.forEach(value => {
            let toDisabled: boolean;
            if (item instanceof Array) {
                toDisabled = !item.find(item => item.label == value.name);
            } else {
                toDisabled = item?.label !== value.name;
            }

            value.data.forEach(extensionName => {
                if (extensionName !== Keys.OWN_EXTENSION) {
                    if (toDisabled && extensionObject.toDisable.indexOf(extensionName) < 0) {
                        extensionObject.toDisable.push(extensionName);
                    } else if (!toDisabled && extensionObject.toEnable.indexOf(extensionName) < 0) {
                        extensionObject.toEnable.push(extensionName);
                    }
                }
            });
        });

        // Enable Extension
        this.enableExtensions(extensionObject.toEnable);

        // Disable Extension
        this.disableExtensions(extensionObject.toDisable);

        // Update profiles on storage
        this.validateAllProfiles();

        this.genericTools.showInformationMessage(MessagesEnum.RELOAD_WINDOW);
    }

    /*******************************************************
     * Menu Area
     ******************************************************/
    private createMenuObject() {
        this.dataFromFile.profiles.forEach(value => {
            if (this.item.indexOf(value.name) < 0) {
                this.item.push(value.name);
            }
        });
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

    private validateAllProfiles() {
        let activeProfile: string[] = [];
        this.dataFromFile.profiles.forEach(value => {
            for (const extensionName of value.data) {
                if (vscode.extensions.getExtension(extensionName)) {
                    if (activeProfile.indexOf(value.name) < 0) {
                        activeProfile.push(value.name);
                        break;
                    }
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