import { OthersTools } from './lib/others-tools';
import { NodeJsTools } from './lib/nodejs-tools';
import { LibStatic } from './utils/lib-static';
import { VscodeTools } from './lib/vscode-tools';
import { ProfilesManagerTools } from './lib/profiles-manager-tools';
import * as vscode from 'vscode';
import { Lib } from './utils/lib';
import { App } from './app';
import { NotifyEnum } from './utils/enum/lib-enum';

let lib: Lib;
let profilesManagerTools: ProfilesManagerTools | null;
let vscodeTools: VscodeTools | null;
let nodejsTools: NodeJsTools | null;
let othersTools: OthersTools | null;

export function activate(context: vscode.ExtensionContext) {
	try {
		lib = new Lib(context, App.id, App.extensionName);
		profilesManagerTools = new ProfilesManagerTools(lib);
		vscodeTools = new VscodeTools(lib);
		nodejsTools = new NodeJsTools(lib);
		othersTools = new OthersTools(lib);
	} catch (error) {
		profilesManagerTools = null;
		vscodeTools = null;
		nodejsTools = null;
		othersTools = null;
		LibStatic.notify(error, NotifyEnum.error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
