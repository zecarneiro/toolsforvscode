"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionsProfileManager = void 0;
const vscode = require("vscode");
const keys_enum_1 = require("./enums/keys-enum");
const commands_enum_1 = require("./enums/commands-enum");
const messages_enum_1 = require("./enums/messages-enum");
const generic_tools_1 = require("./tools/generic-tools");
const constants_data_1 = require("./constants-data");
class ExtensionsProfileManager {
    constructor(contextExtension) {
        this.contextExtension = contextExtension;
        this.noProfileData = [];
        this.profileData = {};
        // Tools
        this.genericTools = new generic_tools_1.GenericTools();
        this.isMultipleProfile = false;
        this.item = [];
        this.getUpdatedConfig();
        this.setMenu();
    }
    getUpdatedConfig() {
        this.configData = vscode.workspace.getConfiguration(keys_enum_1.Keys.APP_CONFIG);
        this.isMultipleProfile = this.configData[keys_enum_1.Keys.MULTIPLE_PROFILE_CONFIG]
            ? this.configData[keys_enum_1.Keys.MULTIPLE_PROFILE_CONFIG]
            : false;
        this.jsonData = this.configData[keys_enum_1.Keys.JSON_FILE_CONFIG]
            ? JSON.parse(this.genericTools.readFile(this.configData[keys_enum_1.Keys.JSON_FILE_CONFIG]))
            : {};
        this.profileData = {};
        this.noProfileData = [];
        this.createMenuObject();
    }
    getValueStorage(key) {
        return this.contextExtension.globalState.get(key);
    }
    deleteKeyStorage(key) {
        this.contextExtension.globalState.update(key, undefined);
    }
    saveKeyStorage(key, storage) {
        this.contextExtension.globalState.update(key, storage);
    }
    process(item) {
        let extensionObject = {
            'toEnable': [],
            'toDisable': [],
            'profileActicted': []
        };
        Object.entries(this.profileData).forEach(([key, value]) => {
            let toDisabled;
            if (item instanceof Array) {
                toDisabled = !item.find(item => item.label == key);
            }
            else {
                toDisabled = (item === null || item === void 0 ? void 0 : item.label) !== key;
            }
            if (!toDisabled)
                extensionObject.profileActicted.push(key);
            for (let extensionId in value) {
                if (value[extensionId] !== keys_enum_1.Keys.OWN_EXTENSION) {
                    if (toDisabled) {
                        extensionObject.toDisable.push(value[extensionId]);
                    }
                    else {
                        extensionObject.toEnable.push(value[extensionId]);
                    }
                }
            }
        });
        // Enable Extension
        extensionObject.toEnable.forEach(value => {
            this.genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.ENABLE_EXTENSION.replace('{0}', value));
            this.genericTools.sleep(constants_data_1.ContantsData.SLEEP_TIME);
            let extensionData = vscode.extensions.getExtension(value);
            if (!extensionData) {
                let storageValue = this.getValueStorage(value);
                if (!storageValue) {
                    this.genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                }
                else {
                    let data = {
                        name: storageValue.disabled,
                        path: storageValue.installed,
                        newName: storageValue.enabled,
                        destPath: storageValue.installed
                    };
                    if (this.genericTools.renameFilesOrDir(data.name, data.newName, false, data.path, data.destPath)) {
                        this.deleteKeyStorage(value);
                    }
                    else {
                        this.genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                    }
                }
            }
        });
        // Disable Extension
        extensionObject.toDisable.forEach(value => {
            this.genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.DISABLE_EXTENSION.replace('{0}', value));
            this.genericTools.sleep(constants_data_1.ContantsData.SLEEP_TIME);
            let storageValue = this.getValueStorage(value);
            if (!storageValue) {
                let extensionData = vscode.extensions.getExtension(value);
                if (!extensionData) {
                    this.genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                }
                else {
                    let newStorage = {
                        disabled: keys_enum_1.Keys.DISABLED_PACKAGEJSON,
                        enabled: keys_enum_1.Keys.ENABLED_PACKAGEJSON,
                        installed: extensionData.extensionPath
                    };
                    if (this.genericTools.renameFilesOrDir(newStorage.enabled, newStorage.disabled, false, newStorage.installed, newStorage.installed)) {
                        this.saveKeyStorage(value, newStorage);
                    }
                    else {
                        this.genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.ENABLE_DISABLE_IVALID.replace('{0}', value), false);
                    }
                }
            }
        });
        this.contextExtension.globalState.update(keys_enum_1.Keys.STORAGE_ACTIVATED_PROFILES, extensionObject.profileActicted);
    }
    setMenu() {
        let menuProfiles = vscode.commands.registerCommand(commands_enum_1.CommandsEnum.MENU, () => {
            let items = [];
            let profilesActivated = this.contextExtension.globalState.get(keys_enum_1.Keys.STORAGE_ACTIVATED_PROFILES);
            this.item.forEach(element => {
                let isPicked = (profilesActivated) ? profilesActivated.includes(element) : false;
                items.push({ label: element, picked: isPicked });
            });
            vscode.window.showQuickPick(items, {
                onDidSelectItem: (item) => {
                    console.log(item);
                },
                canPickMany: this.isMultipleProfile
            }).then((selection) => {
                // User made final selection
                if (!selection) {
                    return;
                }
                else {
                    this.process(selection);
                }
            });
        });
        this.contextExtension.subscriptions.push(menuProfiles);
    }
    createMenuObject() {
        if (this.jsonData) {
            Object.entries(this.jsonData).forEach(([key, value]) => {
                if (key === keys_enum_1.Keys.NO_PROFILE)
                    this.noProfileData = value;
                else if (key === keys_enum_1.Keys.PROFILE)
                    this.profileData = value;
            });
            this.item = [];
            for (let profile in this.profileData) {
                this.item.push(profile);
            }
        }
    }
    installAllExtension() {
        //Profiles
        Object.entries(this.profileData).forEach(([key, value]) => {
            for (let extensionId in value) {
                if (value !== keys_enum_1.Keys.OWN_EXTENSION && !vscode.extensions.getExtension(value))
                    this.genericTools.installExtensions(value[extensionId]);
            }
        });
        // No profiles
        this.noProfileData.forEach(value => {
            if (value !== keys_enum_1.Keys.OWN_EXTENSION && !vscode.extensions.getExtension(value))
                this.genericTools.installExtensions(value);
        });
    }
    uninstallAllExtension() {
        //Profiles
        Object.entries(this.profileData).forEach(([key, value]) => {
            for (let extensionId in value) {
                if (value !== keys_enum_1.Keys.OWN_EXTENSION && !vscode.extensions.getExtension(value))
                    this.genericTools.uninstallExtensions(value[extensionId]);
            }
        });
        // No profiles
        this.noProfileData.forEach(value => {
            if (value !== keys_enum_1.Keys.OWN_EXTENSION && !vscode.extensions.getExtension(value))
                this.genericTools.uninstallExtensions(value);
        });
    }
}
exports.ExtensionsProfileManager = ExtensionsProfileManager;
//# sourceMappingURL=extensions-profile-manager.js.map