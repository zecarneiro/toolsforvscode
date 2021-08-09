import { LoggerVs } from './../sub-projects/utils/src/vscode/logger-vs';
import { ILogger } from './../sub-projects/utils/src/interface/logger';
import { ENotifyType } from './../sub-projects/utils/src/enum/notify-type';
import { IDirectories } from './../sub-projects/utils/src/interface/directories';
import { GenericVs } from './../sub-projects/utils/src/vscode/generic-vs';
import { VscodeTools } from './lib/vscode-tools';
import { ProfilesManagerTools } from './lib/profiles-manager-tools';
import * as vscode from 'vscode';
import { WindowManager } from '../sub-projects/utils/src/vscode/window-manager';
import { FilesSystem } from '../sub-projects/utils/src/nodejs/files-system';
import { App } from './app';
import { Shell } from '../sub-projects/utils/src/nodejs/shell';
import { SqliteExtend } from '../sub-projects/utils/src/nodejs/sqlite-extend';

let profilesManagerTools: ProfilesManagerTools | null;
let vscodeTools: VscodeTools | null;

export function activate(context: vscode.ExtensionContext) {
	try {
		const shell = new Shell();
		const extensionPath: string = FilesSystem.resolvePath(GenericVs.getExtensionPath(context) + '/dist');
		const directories: IDirectories = {
			files: FilesSystem.resolvePath(extensionPath + '/../files'),
			scripts: FilesSystem.resolvePath(extensionPath + '/../scripts')
		};
		shell.setEnv(SqliteExtend.driverSqliteDir, FilesSystem.resolvePath(directories.files + '/sqlite3'));
		const windowManager = new WindowManager(context);
		const logger: ILogger = new LoggerVs(App.extensionName);
		vscodeTools = new VscodeTools(context, extensionPath, directories, windowManager, logger);
		profilesManagerTools = new ProfilesManagerTools(context, extensionPath, directories, windowManager, logger);
	} catch (error) {
		profilesManagerTools = null;
		vscodeTools = null;
		WindowManager.notify(error, ENotifyType.error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { /* This is intentional */ }
