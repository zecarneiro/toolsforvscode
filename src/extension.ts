import * as vscode from 'vscode';
import { ContantsData } from './constants-data';
import { CommandsEnum } from './enums/commands-enum';
import { ExtensionsProfileManager } from './extensions-profile-manager';
import { MessagesEnum } from './enums/messages-enum';
import { GenericTools } from './tools/generic-tools';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function setStatusBar() {
	// Create and show statusbar for extension
	const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
	statusBar.text = ContantsData.TITLE_STATUS_BAR;
	statusBar.command = CommandsEnum.MENU;
	statusBar.tooltip = ContantsData.TITLE_APP;
	statusBar.show();
	
	// Create and show reload statusbar for extension
	const realodStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
	realodStatusBar.text = ContantsData.RELOAD_STATUS_BAR;
	realodStatusBar.command = CommandsEnum.RELOAD;
	realodStatusBar.tooltip = ContantsData.RELOAD_STATUS_BAR;
	realodStatusBar.show();
}

export function activate(context: vscode.ExtensionContext) {
	setStatusBar();
	try {
		let subscriptionsToPush: any[] = [];

		// Init generic tools
		let genericTools = new GenericTools();

		// Init Menu object
		let extensionsProfileManager = new ExtensionsProfileManager(context);

		// Insert install command
		subscriptionsToPush.push(vscode.commands.registerCommand(CommandsEnum.INSTALL, () => {
			extensionsProfileManager.installAllExtension();
		}));

		// Insert uninstall command
		subscriptionsToPush.push(vscode.commands.registerCommand(CommandsEnum.UNINSTALL, () => {
			extensionsProfileManager.uninstallAllExtension();
		}));

		// Insert get updated command
		subscriptionsToPush.push(vscode.commands.registerCommand(CommandsEnum.UPDATED_CONFIG, () => {
			genericTools.printOnOutputChannel(MessagesEnum.INIT_GET_CONFIG_UPDATED);
			extensionsProfileManager.getUpdatedConfig();
			genericTools.printOnOutputChannel(MessagesEnum.END_GET_CONFIG_UPDATED);
		}));

		subscriptionsToPush.forEach(value => {
			context.subscriptions.push(value);
		});
	} catch (error) {
		console.error(error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
