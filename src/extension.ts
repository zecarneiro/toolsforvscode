import { GeneratePackageVscode } from './lib/generate-package-vscode';
import { ProfilesManager } from './lib/profiles-manager';
import * as vscode from 'vscode';
import { Settings } from './settings';
import { Terminal } from './utils/terminal';
import { Generic } from './utils/generic';

let generic: Generic;
let terminal: Terminal;

export function activate(context: vscode.ExtensionContext) {
	try {
		generic = new Generic(Settings.APP_NAME, Settings.OUTPUT_CHANNEL, context);
		terminal = new Terminal(Settings.APP_NAME, generic);
		let profilesManager = new ProfilesManager(terminal, generic);
		let generatePackageVscode = new GeneratePackageVscode(generic, terminal);

		profilesManager.init();
		generatePackageVscode.init();

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
