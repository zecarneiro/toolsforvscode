import * as vscode from 'vscode';
import { ContantsData } from './constants-data';
import { CommandsEnum } from './enums/commands-enum';
import { ExtensionsProfileManager } from './extensions-profile-manager';
import { MessagesEnum } from './enums/messages-enum';
import { GenericTools } from './tools/generic-tools';
import { Keys } from './enums/keys-enum';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function setStatusBar(configData: any) {	
	// Create and show reload statusbar for extension
	if (configData && configData[Keys.SHOW_RELOAD_CONFIG]) {
		const realodStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
		realodStatusBar.text = ContantsData.RELOAD_STATUS_BAR;
		realodStatusBar.command = CommandsEnum.RELOAD;
		realodStatusBar.tooltip = ContantsData.RELOAD_STATUS_BAR;
		realodStatusBar.show();
	}

	// Create and show Expand/Collapse statusbar for extension
	if (configData && configData[Keys.SHOW_EXPAND_COLLAPSE_CONFIG]) {
		const foldRecursiveBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
		foldRecursiveBar.text = "$(fold-up)";
		foldRecursiveBar.command = "editor.foldRecursively";
		foldRecursiveBar.tooltip = "Collapse Recursive By Cursor";
		foldRecursiveBar.show();

		const unfoldRecursiveBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
		unfoldRecursiveBar.text = "$(fold-down)";
		unfoldRecursiveBar.command = "editor.unfoldRecursively";
		unfoldRecursiveBar.tooltip = "Expand Recursive By Cursor";
		unfoldRecursiveBar.show();

		const foldAllBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
		foldAllBar.text = "$(collapse-all)";
		foldAllBar.command = "editor.foldAll";
		foldAllBar.tooltip = "Collapse All";
		foldAllBar.show();

		const unfoldAllBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
		unfoldAllBar.text = "$(expand-all)";
		unfoldAllBar.command = "editor.unfoldAll";
		unfoldAllBar.tooltip = "Expand All";
		unfoldAllBar.show();
	}
}

export function activate(context: vscode.ExtensionContext) {
	const configData = vscode.workspace.getConfiguration(Keys.APP_CONFIG);
	if (configData && configData[Keys.SHOW_EXTENSIONS_MANAGER_CONFIG]) {
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

			// Create and show statusbar for extension
			const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
			statusBar.text = ContantsData.EXTENSIONS_MANAGER_STATUS_BAR;
			statusBar.command = CommandsEnum.MENU;
			statusBar.tooltip = ContantsData.TITLE_APP;
			statusBar.show();
		} catch (error) {
			console.error(error);
		}
	}

	// Set other buttons on status bar
	setStatusBar(configData);
}

// this method is called when your extension is deactivated
export function deactivate() {
	setStatusBar(null);
}
