export enum CommandsEnum {
    INSTALL = 'toolsforvscode.extensionsmanagerinstall',
    UNINSTALL = 'toolsforvscode.extensionsmanageruninstall',
    RELOAD = 'workbench.action.reloadWindow',
    
    MENU = 'toolsforvscode.extensionsmanagermenu',
    UPDATED_CONFIG = 'toolsforvscode.extensionsmanagerupdatedconfig',
    INSTALL_EXTENSION = 'code --install-extension {0}',
    UNINSTALL_EXTENSION = 'code --uninstall-extension {0}'
}