import { OthersTools } from './lib/others-tools';
import { ProfilesManagerTools } from './lib/profiles-manager-tools';
import * as vscode from 'vscode';
import { VscodeTsJsUtils } from 'vscode-ts-js-utils/dist';

const id = 'jnoronha.toolsforvscode';
const extensionName = 'Tools For VSCode';
const totalLibs = 2;

async function init(utils: VscodeTsJsUtils, type: number) {
  try {
    switch (type) {
      case 0:
        new OthersTools(utils, id).start();
        break;
      case 1:
      default:
        new ProfilesManagerTools(utils, id).start();
        break;
    }
  } catch (error) {
    utils.logger.notify(error?.message);
  }
}

function setCustomConfig(utils: VscodeTsJsUtils) {
  utils.sqlite.command = utils.extensions.getExtensionSettings<string>(id, 'sqlite-command');
}

export function activate(context: vscode.ExtensionContext) {
  try {
    const utils: VscodeTsJsUtils = new VscodeTsJsUtils(extensionName, context);
    setCustomConfig(utils);
    for (let i = 0; i < totalLibs; ++i) {
      init(utils, i);
    }
  } catch (error) {
    console.log(error.message);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {/* This is intentional */}
