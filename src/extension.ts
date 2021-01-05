import { ExtraToolsVscode } from './lib/extra-tools-vscode';
import { ProfilesManager } from './lib/profiles-manager';
import * as vscode from 'vscode';
import { Settings } from './settings';
import { Generic } from './utils/generic';

let generic: Generic;

export function activate(context: vscode.ExtensionContext) {
	try {
		generic = new Generic(Settings.ID, context);
		let profilesManager = new ProfilesManager(generic);
		let extraToolsVscode = new ExtraToolsVscode(generic);

		profilesManager.init();
		extraToolsVscode.init();
	} catch (error) {
		console.error(error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
