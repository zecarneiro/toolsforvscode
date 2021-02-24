import { LibStatic } from './utils/lib-static';
import { ExtraToolsVscode } from './lib/extra-tools-vscode';
import { ProfilesManager } from './lib/profiles-manager';
import * as vscode from 'vscode';
import { Lib } from './utils/lib';
import { App } from './app';
import { NotifyEnum } from './utils/enum/lib-enum';

let lib: Lib;
let profilesManager: ProfilesManager | null;
let extraToolsVscode: ExtraToolsVscode | null;


export function activate(context: vscode.ExtensionContext) {
	try {
		lib = new Lib(context, App.id, App.extensionName);
		profilesManager = new ProfilesManager(lib);
		extraToolsVscode = new ExtraToolsVscode(lib);
	} catch (error) {
		profilesManager = null;
		extraToolsVscode = null;
		LibStatic.notify(error, NotifyEnum.error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
