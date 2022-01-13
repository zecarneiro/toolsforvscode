import { App } from '../app';
import * as xlsx from 'xlsx';
import { QuickPickItem, Uri } from 'vscode';
import { Console, EFunctionsProcessType, FileSystem, Functions, IVsTreeItem, TsJsUtils, Windows } from '../vendor/ts-js-utils/src';

export class OthersTools extends App {
  constructor(
    protected tsJsUtils: TsJsUtils,
    protected extensionId: string,
  ) {
    super(tsJsUtils, extensionId, 'others-tools-jnoronha', 'OthersTools');
  }

  protected getActivityBar(): IVsTreeItem[] {
    return [
      {
        treeItem: {
          label: 'Convert XLSX to JSON',
          command: { command: this.getCommand('convertxlsxtojson'), title: '' },
        },
        callback: {
          caller: Functions.callbackProcess<any>(this.convertXlsxToJson, this, EFunctionsProcessType.bind),
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Generate VSIX For VSCode',
          command: { command: this.getCommand('generatepackage'), title: '' },
        },
        callback: {
          caller: Functions.callbackProcess<any>(this.generateVsixPackages, this, EFunctionsProcessType.bind),
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Create VSCode extension',
          command: { command: this.getCommand('createnewextension'), title: '' },
        },
        callback: {
          caller: Functions.callbackProcess<any>(this.createNewExtensions, this, EFunctionsProcessType.bind),
          thisArg: this,
        },
      },
    ];
  }

  protected process() {
    // Create and show collapse/expand all statusbar for extension
    Windows.createStatusBarVs({ text: '$(collapse-all)', command: 'editor.foldAll', tooltip: 'Collapse All' });
    Windows.createStatusBarVs({ text: '$(expand-all)', command: 'editor.unfoldAll', tooltip: 'Expand All' });
    // Create and show collapse/expand region statusbar for extension
    Windows.createStatusBarVs({ text: '$(fold-up)', command: 'editor.foldRecursively', tooltip: 'Collapse Recursive By Cursor' });
    Windows.createStatusBarVs({ text: '$(fold-down)', command: 'editor.unfoldRecursively', tooltip: 'Expand Recursive By Cursor' });
    // Reload
    Windows.createStatusBarVs({ text: 'Reload', command: 'workbench.action.reloadWindow', tooltip: 'Reload VSCode' });
  }

  private async convertXlsxToJson() {
    const result = await Windows.showOpenDialogVs<Uri>({ canSelectFiles: true });
    const fileInfo = FileSystem.getFileInfo(result ? FileSystem.resolvePath(result.path) : '', ['xlsx', 'xlsm', 'csv']);
    if (!fileInfo.hasError) {
      const wb = xlsx.readFile(fileInfo.data.filename);
      if (wb.SheetNames && wb.SheetNames.length > 0) {
        const items: QuickPickItem[] = wb.SheetNames.map<QuickPickItem>((name) => {
          return { label: name, picked: false };
        });
        const selectedItem = await Windows.createQuickPickVs<QuickPickItem>(items, { canPickMany: false });
        if (selectedItem) {
          const ws = wb.Sheets[selectedItem.label];
          const data = xlsx.utils.sheet_to_json(ws);
          const tempFile = this.tsJsUtils.fileSystem.createTempFile(fileInfo.data.basenameWithoutExtension + '.json');
          FileSystem.writeJsonFile(tempFile, data);
          Windows.showTextDocumentVs(tempFile);
        }
      } else {
        this.logger.error('This file: ' + fileInfo.data.basename + ' doesn\'t have any sheet');
      }
    } else {
      this.logger.error('Invalid file: ' + fileInfo.data.filename);
    }
  }

  private async generateVsixPackages() {
    const vsceCmd = Console.findCommand('vsce', false);
    if (vsceCmd.hasError || !vsceCmd.data) {
      this.logger.error('Please, install vsce: npm install -g vsce');
      return;
    }
    const result = await Windows.showOpenDialogVs<Uri>({ canSelectFolders: true });
    let path: string = result ? result['path'] : '';
    if (path.length > 0) {
      path = FileSystem.resolvePath(path);
      const vscodeIgnoreFile = FileSystem.resolvePath(path + '/.vscodeignore');
      const vscodeIgnoreData: string[] = [
        '.vscode/**',
        '.vscode-test/**',
        'build/**',
        'out/**',
        'src/**',
        '.gitignore',
        '.yarnrc',
        'vsc-extension-quickstart.md',
        '**/tsconfig.json',
        '**/.eslintrc.json',
        '**/*.map',
        '**/*.ts',
        '.gitmodules',
        '.gitattributes',
        '.vscodeignore',
        '.git/**',
        'webpack.config.js',
        'node_modules/**',
      ];
      let dataToInsert: string = '';
      let isNewDataInserted = false;

      if (FileSystem.fileExist(vscodeIgnoreFile)) {
        dataToInsert = FileSystem.readDocument(vscodeIgnoreFile).trim();
      }

      vscodeIgnoreData.forEach((newData) => {
        if (!dataToInsert.includes(newData)) {
          dataToInsert += '\n' + newData;
          isNewDataInserted = true;
        }
      });

      if (isNewDataInserted) {
        this.logger.info('Write ' + vscodeIgnoreFile);
        FileSystem.writeDocument(vscodeIgnoreFile, dataToInsert);
      }
      this.tsJsUtils.console.execVs({ cmd: 'vsce', args: ['package'], cwd: path });
    }
  }

  private async createNewExtensions() {
    const findCmd = Console.findCommand('yo', false);
    if (findCmd.hasError || !findCmd.data) {
      this.logger.error('Please, install necessary packages: npm install -g yo generator-code');
      return;
    }
    const result = await Windows.showOpenDialogVs<Uri>({ canSelectFolders: true });
    let path: string = result ? result['path'] : '';
    if (path.length > 0) {
      path = FileSystem.resolvePath(path);
      this.tsJsUtils.console.execVs({ cmd: 'yo', args: ['code'], cwd: path });
    }
  }
}
