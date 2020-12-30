import { ProfilesManager } from './lib/profiles-manager';
import * as vscode from 'vscode';
import { Settings } from './settings';
import { Terminal } from './utils/terminal';
import { Generic } from './utils/generic';

let generic: Generic;
let terminal: Terminal;

export function activate(context: vscode.ExtensionContext) {
	try {
		terminal = new Terminal(Settings.APP_NAME);
		generic = new Generic(Settings.APP_NAME, Settings.OUTPUT_CHANNEL, context);
		let profilesManager = new ProfilesManager(terminal, generic);

		profilesManager.init();

		// Create and show collapse/expand all statusbar for extension
		generic.createStatusBar("$(collapse-all)", "editor.foldAll", "Collapse All");
		generic.createStatusBar("$(expand-all)", "editor.unfoldAll", "Expand All");

		// Create and show collapse/expand region statusbar for extension
		generic.createStatusBar("$(fold-up)", "editor.foldRecursively", "Collapse Recursive By Cursor");
		generic.createStatusBar("$(fold-down)", "editor.unfoldRecursively", "Expand Recursive By Cursor");
	} catch (error) {
		console.error(error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
