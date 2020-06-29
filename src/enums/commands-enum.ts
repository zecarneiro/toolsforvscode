export enum CommandsEnum {
    INSTALL = 'extensionsmanager.install',
    UNINSTALL = 'extensionsmanager.uninstall',
    RELOAD = 'workbench.action.reloadWindow',
    MENU = 'extensionsmanager.menu',
    UPDATED_CONFIG = 'extensionsmanager.updatedconfig',
    INSTALL_EXTENSION = 'code --install-extension {0}',
    UNINSTALL_EXTENSION = 'code --uninstall-extension {0}'
}