import { OthersTools } from './lib/others-tools';
import { VscodeTools } from './lib/vscode-tools';
import { ProfilesManagerTools } from './lib/profiles-manager-tools';
import * as vscode from 'vscode';
import { ETypeUtils, NodeVscode } from 'node-vscode-utils';

const id = 'jnoronha.toolsforvscode';
const extensionName = 'Tools For VSCode';
const totalLibs = 3;

function init(nodeVscode: NodeVscode, type: number) {
  try {
    switch (type) {
      case 1:
        new VscodeTools(nodeVscode, id);
        break;
      case 2:
        new OthersTools(nodeVscode, id);
        break;
      case 0:
      default:
        new ProfilesManagerTools(nodeVscode, id);
        break;
    }
  } catch (error) {
    nodeVscode.logger.error(error);
  }
}

export function activate(context: vscode.ExtensionContext) {
  const nodeVscode: NodeVscode = new NodeVscode(extensionName, ETypeUtils.vscode, context);
  nodeVscode.sqlite.command = nodeVscode.extensionsManagerVs.getExtensionSettings<string>(id, 'sqlite-command'); <string>('sqlite-command');
  for (let i = 0; i < totalLibs; ++i) {
    init(nodeVscode, i);
  }
}

// this method is called when your extension is deactivated
export function deactivate() {/* This is intentional */}
