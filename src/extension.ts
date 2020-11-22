import { ProfilesManager } from './profiles-manager';
import { GenericFunctions } from './lib/generic-functions';
import * as vscode from 'vscode';
import { Settings } from './settings';
import { Terminal } from './lib/terminal';

export function activate(context: vscode.ExtensionContext) {
	try {
		let subscriptionsToPush: any[] = [];
		let terminal = new Terminal();
		let profilesManager = new ProfilesManager(terminal);

		// Insert install command
		subscriptionsToPush.push(vscode.commands.registerCommand(Settings.CMD_INSTALL, () => {
			profilesManager.installAllExtension();
		}));

		// Insert uninstall command
		subscriptionsToPush.push(vscode.commands.registerCommand(Settings.CMD_UNINSTALL, () => {
			profilesManager.uninstallAllExtension();
		}));

		// Create and show profiles menu
		subscriptionsToPush.push(vscode.commands.registerCommand(Settings.CMD_PROFILES_MANAGER, () => {
			profilesManager.createMenu();
		}));
		GenericFunctions.createStatusBar('Profiles Manager', Settings.CMD_PROFILES_MANAGER);

		subscriptionsToPush.forEach(value => {
			context.subscriptions.push(value);
		});
	} catch (error) {
		console.error(error);
	}

	// Create and show reload statusbar for extension
	GenericFunctions.createStatusBar('Reload', 'workbench.action.reloadWindow');

	// Create and show collapse/expand all statusbar for extension
	GenericFunctions.createStatusBar("$(collapse-all)", "editor.foldAll", "Collapse All");
	GenericFunctions.createStatusBar("$(expand-all)", "editor.unfoldAll", "Expand All");

	// Create and show collapse/expand region statusbar for extension
	GenericFunctions.createStatusBar("$(fold-up)", "editor.foldRecursively", "Collapse Recursive By Cursor");
	GenericFunctions.createStatusBar("$(fold-down)", "editor.unfoldRecursively", "Expand Recursive By Cursor");
}

// this method is called when your extension is deactivated
export function deactivate() {}
