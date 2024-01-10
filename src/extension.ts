import { App } from './libs/app';
import { ExtensionContext } from 'vscode';

const id = 'jnoronha.toolsforvscode';
const extensionName = 'Tools For VSCode';
const totalLibs = 2;

export function activate(context: ExtensionContext) {
  const app = new App(context);
  app.start();
}

// this method is called when your extension is deactivated
export function deactivate() {/* This is intentional */}
