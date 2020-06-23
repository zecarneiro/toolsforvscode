"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const constants_data_1 = require("./constants-data");
const commands_enum_1 = require("./enums/commands-enum");
const vscode = require("vscode");
const extensions_profile_manager_1 = require("./extensions-profile-manager");
const messages_enum_1 = require("./enums/messages-enum");
const generic_tools_1 = require("./tools/generic-tools");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    try {
        let subscriptionsToPush = [];
        // Init generic tools
        let genericTools = new generic_tools_1.GenericTools();
        // Init Menu object
        let extensionsProfileManager = new extensions_profile_manager_1.ExtensionsProfileManager(context);
        // Insert install command
        subscriptionsToPush.push(vscode.commands.registerCommand(commands_enum_1.CommandsEnum.INSTALL, () => {
            extensionsProfileManager.installAllExtension();
        }));
        // Insert uninstall command
        subscriptionsToPush.push(vscode.commands.registerCommand(commands_enum_1.CommandsEnum.UNINSTALL, () => {
            extensionsProfileManager.uninstallAllExtension();
        }));
        // Insert get updated command
        subscriptionsToPush.push(vscode.commands.registerCommand(commands_enum_1.CommandsEnum.UPDATED_CONFIG, () => {
            genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.INIT_GET_CONFIG_UPDATED);
            extensionsProfileManager.getUpdatedConfig();
            genericTools.printOnOutputChannel(messages_enum_1.MessagesEnum.END_GET_CONFIG_UPDATED);
        }));
        // Create and show statusbar for extension
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        statusBar.text = 'Extensions Manager';
        statusBar.command = commands_enum_1.CommandsEnum.MENU;
        statusBar.tooltip = constants_data_1.ContantsData.TITLE_APP;
        statusBar.show();
        subscriptionsToPush.forEach(value => {
            context.subscriptions.push(value);
        });
    }
    catch (error) {
        console.error(error);
    }
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map