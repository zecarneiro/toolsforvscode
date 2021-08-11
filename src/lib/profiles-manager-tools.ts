import { ILogger } from './../../sub-projects/utils/src/interface/logger';
import { Generic } from './../../sub-projects/utils/src/nodejs/generic';
import { ConsoleVs } from './../../sub-projects/utils/src/vscode/console-vs';
import { FilesManager } from './../../sub-projects/utils/src/vscode/files-manager';
import { FilesSystem } from './../../sub-projects/utils/src/nodejs/files-system';
import { App } from '../app';
import { QuickPickItem, ExtensionContext, workspace } from 'vscode';
import { IProfiles } from '../interface/profiles';
import { GenericVs } from '../../sub-projects/utils/src/vscode/generic-vs';
import { IDirectories } from '../../sub-projects/utils/src/interface/directories';
import { WindowManager } from '../../sub-projects/utils/src/vscode/window-manager';
import { annotateName } from '../../sub-projects/utils/src/nodejs/decorators';

export class ProfilesManagerTools extends App {
    readonly className = 'ProfilesManagerTools';
    readonly activityBarId = 'profiles-manager-tools-jnoronha';

    private profilesData: IProfiles[] = [];

    // Commands
    private cmdProfilesManager: string;


    // CONFIGURATIONS
    private readonly defaultMdProfilesFile = FilesSystem.resolvePath(this.directories.files + '/profiles.md');
    private readonly config = 'profiles';

    constructor(
        context: ExtensionContext,
        extensionPath: string,
        directories: IDirectories,
        windowManager: WindowManager,
        loggerExtension: ILogger
    ) {
        super(context, extensionPath, directories, windowManager, loggerExtension);
        this.cmdProfilesManager = this.getCommand('profilesmanager');

        this.prepareAll([
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
                    label: "Show Status all Extensions",
                    command: { command: this.getCommand('extensionsunshowstatus'), title: '' }
                },
                callback: {
                    caller: this.showStatus,
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
                    caller: FilesManager.showFilesMD,
                    args: [this.defaultMdProfilesFile],
                    isSync: true,
                    thisArg: this
                }
            }
        ]);
        ConsoleVs.registerVscodeCommand([
            {
                command: this.cmdProfilesManager,
                callback: {
                    caller: this.createMenu,
                    isSync: true,
                    thisArg: this
                }
            }
        ], context);
        WindowManager.createStatusBar({ text: 'Profiles Manager', command: this.cmdProfilesManager });

        // Functions
        this.prepareProfiles();
        workspace.onDidChangeConfiguration(listener => {
            if (listener.affectsConfiguration(this.config)) {
                this.prepareProfiles();
            }
        });
    }

    private getConfig(): IProfiles[] {
        const profileConfig = this.getSettings<IProfiles[]>(this.config);
        return profileConfig ? profileConfig : [];
    }

    @annotateName
    private prepareProfiles() {
        let immutableIds: string[] = [];
        this.getConfig().forEach(profiles => {
            if (profiles.hide) {
                immutableIds = immutableIds.concat(profiles.data);
            } else {
                this.profilesData.push(profiles);
            }
        });
        this.storageExtensions.immutableNoDisableIds = immutableIds;
        this.storageExtensions.enableImmutable();
    }

    @annotateName
    private disableExtensions(profiles: string[]) {
        this.logger.info("Processing...");
        let ids: string[] = [];
        for(const profile of this.profilesData) {
            if (profiles.includes(profile.name) && !profile.data.includes(App.id)) {
                ids = ids.concat(profile.data);
            }
        }
        this.storageExtensions.disable(ids);
    }

    @annotateName
    private createMenu() {
        const disabledExtension = this.storageExtensions.getAllDisabled();
        if (disabledExtension.hasError) {
            this.logger.error(disabledExtension.error?.message);
            return;
        }
        let items: QuickPickItem[] = [];
        this.profilesData.forEach(element => {
            const canPicked = element.data.findIndex(id => disabledExtension.data.findIndex(x => x.id === id) !== -1 || !GenericVs.isExtensionInstalled(id));
            items.push({ label: element.name, picked: canPicked < 0 ? true : false });
        });
        WindowManager.createQuickPick(items, { canPickMany: true }).then((selectedItems) => {
            // User made final selection
            if (!selectedItems) {
                return;
            } else {
                const selected = Generic.convert<QuickPickItem[]>(selectedItems);
                const profile: string[] = this.profilesData.map(profileData => {
                    if (!profileData.hide && selected.findIndex(x => x.label === profileData.name) < 0) {
                        return profileData.name;
                    }
                }).filter(x => x !== undefined);
                this.disableExtensions(profile);
            }
        });
    }

    /*******************************************************
     * Install/Uninstall Area
     ******************************************************/
    @annotateName
    private InstallUninstallExt(isInstall: boolean) {
        let ids: string[] = [];
        let profileConfig = this.getSettings<IProfiles[]>(this.config);
        if (profileConfig && profileConfig.length > 0) {
            for (const profile of profileConfig) {
                for (const id of profile.data) {
                    if (id !== App.id) {
                        ids.push(id);
                    }
                }
            }
            if (isInstall) {
                GenericVs.installExtensions(ids, this.console, this.logger, this.context);
            } else {
                GenericVs.uninstallExtensions(ids, this.console, this.logger, this.context);
            }
        }
    }

    @annotateName
    private showStatus() {
        let refresh = true;
        let message = {disabled: '', installed: '', notInstalled: ''};
        for (const config of this.getConfig()) {
            config.data.forEach(id => {
                if (this.storageExtensions.isDisabled(id, refresh ? false : refresh)) {
                    message.disabled += `This extension id '${id}' is disabled!\n`;
                } else if (GenericVs.isExtensionInstalled(id)) {
                    message.installed += `This extension id '${id}' is installed!\n`;
                } else {
                    message.notInstalled += `This extension id '${id}' is 'not installed'!\n`;
                }
            });
        }
        if (message.notInstalled.length > 0) {
            this.logger.error(message.notInstalled);
        }
        if (message.disabled.length > 0) {
            this.logger.warn(message.disabled);
        }
        if (message.installed.length > 0) {
            this.logger.success(message.installed);
        }
    }
}