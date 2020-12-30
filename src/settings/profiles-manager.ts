import { Settings } from "../settings";

export namespace SettingsProfilesManager {
    // COMMANDS
    export const CMD_PROFILES_MANAGER = Settings.EXTENSION_NAME + '.profilesmanager';
    export const CMD_INSTALL = Settings.EXTENSION_NAME + '.extensionsinstall';
    export const CMD_UNINSTALL = Settings.EXTENSION_NAME + '.extensionsuninstall';
    export const CMD_SHOW_DEFAULT_PROFILES = Settings.EXTENSION_NAME + '.showdefaultprofiles';

    // CONFIGURATIONS
    export const CONFIG_PROFILES = 'profiles';
    export const STATE_STORAGE_DISABLED_EXTENSION_KEY = "extensionsIdentifiers/disabled";
    export const DEFAULT_MD_PROFILES_FILE = Settings.FILES_DIR + '/profiles.md';
    export const SQL_DISABLE_EXT = {
        getAll: `SELECT * FROM ${Settings.TABLE_STATE_STORAGE} WHERE key = '${STATE_STORAGE_DISABLED_EXTENSION_KEY}'`,
        update: `UPDATE ${Settings.TABLE_STATE_STORAGE} SET value = '{0}' WHERE key = '${STATE_STORAGE_DISABLED_EXTENSION_KEY}'`,
        insert: `INSERT INTO ${Settings.TABLE_STATE_STORAGE} (key, value) VALUES ('${STATE_STORAGE_DISABLED_EXTENSION_KEY}', '{0}')`,
        enableAll: `DELETE FROM ${Settings.TABLE_STATE_STORAGE} WHERE key = '${STATE_STORAGE_DISABLED_EXTENSION_KEY}'`
    };
}