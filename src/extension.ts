import { OthersTools } from './lib/others-tools';
import { VscodeTools } from './lib/vscode-tools';
import { ProfilesManagerTools } from './lib/profiles-manager-tools';
import * as vscode from 'vscode';
import { ETypeUtils, NodeVs, VsExtensionsManager } from './vendor/node-vscode-utils/src';

const id = 'jnoronha.toolsforvscode';
const extensionName = 'Tools For VSCode';
const totalLibs = 3;

async function init(nodeVs: NodeVs, type: number) {
  try {
    switch (type) {
      case 1:
        new VscodeTools(nodeVs, id);
        break;
      case 2:
        new OthersTools(nodeVs, id);
        break;
      case 0:
      default:
        new ProfilesManagerTools(nodeVs, id);
        break;
    }
  } catch (error) {
    nodeVs.logger.notify(error?.message);
  }
}

function setCustomConfig(nodeVs: NodeVs) {
  nodeVs.sqlite.command = VsExtensionsManager.getExtensionSettings<string>(id, 'sqlite-command');
}

export function activate(context: vscode.ExtensionContext) {
  const nodeVs: NodeVs = new NodeVs(extensionName, ETypeUtils.vscode, context);
  setCustomConfig(nodeVs);
  for (let i = 0; i < totalLibs; ++i) {
    init(nodeVs, i);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {/* This is intentional */}
