"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keys = void 0;
var Keys;
(function (Keys) {
    // Keys for config of vscode settings
    Keys["APP_CONFIG"] = "extensionsmanager";
    Keys["JSON_FILE_CONFIG"] = "jsonFile";
    Keys["MULTIPLE_PROFILE_CONFIG"] = "multiple-profile";
    Keys["PLATFORM_CONFIG"] = "plataform";
    Keys["PLATFORM_CONFIG_WIN"] = "Windows";
    Keys["PLATFORM_CONFIG_LINUX"] = "Linux";
    // Keys of JSON File
    Keys["NO_PROFILE"] = "ignored";
    Keys["PROFILE"] = "profiles";
    // Keys for STORAGE
    Keys["STORAGE_ACTIVATED_PROFILES"] = "activeProfiles";
    Keys["STORAGE_EXTENSION_ON_PROCESS"] = "extensionOnProcess";
    // Keys for new names of package json files of extensions when disabled or enabled
    Keys["DISABLED_PACKAGEJSON"] = "package.json_EXT_DISABLED";
    Keys["ENABLED_PACKAGEJSON"] = "package.json";
    Keys["OWN_EXTENSION"] = "josecnoronha.extensionsmanager";
})(Keys = exports.Keys || (exports.Keys = {}));
//# sourceMappingURL=keys-enum.js.map