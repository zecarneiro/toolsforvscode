import { ExtraToolsVscode } from './lib/extra-tools-vscode';
import { ProfilesManager } from './lib/profiles-manager';
import * as vscode from 'vscode';

let profilesManager: ProfilesManager;
let extraToolsVscode: ExtraToolsVscode;


export function activate(context: vscode.ExtensionContext) {
	try {
		profilesManager = new ProfilesManager(context);
		extraToolsVscode = new ExtraToolsVscode(context);
	} catch (error) {
		console.error(error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
