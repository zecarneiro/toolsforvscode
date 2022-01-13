import { OthersTools } from './lib/others-tools';
import { ProfilesManagerTools } from './lib/profiles-manager-tools';
import * as vscode from 'vscode';
import { TsJsUtils, VsExtensionsManager } from './vendor/ts-js-utils/src';

const id = 'jnoronha.toolsforvscode';
const extensionName = 'Tools For VSCode';
const totalLibs = 2;

async function init(tsJsUtils: TsJsUtils, type: number) {
  try {
    switch (type) {
      case 0:
        new OthersTools(tsJsUtils, id).start();
        break;
      case 1:
      default:
        new ProfilesManagerTools(tsJsUtils, id).start();
        break;
    }
  } catch (error) {
    tsJsUtils.logger.notifyVs(error?.message);
  }
}

function setCustomConfig(tsJsUtils: TsJsUtils) {
  tsJsUtils.sqlite.command = VsExtensionsManager.getExtensionSettings<string>(id, 'sqlite-command');
}

export function activate(context: vscode.ExtensionContext) {
  const tsJsUtils: TsJsUtils = new TsJsUtils(extensionName, context);
  setCustomConfig(tsJsUtils);
  for (let i = 0; i < totalLibs; ++i) {
    init(tsJsUtils, i);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {/* This is intentional */}
