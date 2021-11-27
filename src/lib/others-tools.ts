import { App } from '../app';
import * as xlsx from 'xlsx';
import { QuickPickItem, Uri } from 'vscode';
import { FileSystem, NodeVs } from '../vendor/node-vscode-utils/src';


export class OthersTools extends App {
  constructor(
    protected nodeVs: NodeVs,
    protected extensionId: string,
  ) {
    super(nodeVs, extensionId, 'others-tools-jnoronha', 'OthersTools');
    this.prepareAll([
      {
        treeItem: {
          label: 'Convert XLSX to JSON',
          command: { command: this.getCommand('convertxlsxtojson'), title: '' },
        },
        callback: {
          caller: this.convertXlsxToJson,
          isSync: false,
          thisArg: this,
        },
      },
      {
        treeItem: {
          label: 'Show Tips and My Default Profiles',
          command: { command: this.getCommand('showtipsprofiles'), title: '' },
        },
        callback: {
          caller: () => {
            this.nodeVs.fileSystem.showFilesMD(this.nodeVs.fileSystem.resolvePath(this.directories.files + '/tips-profiles.md'));
          },
          isSync: true,
          thisArg: this,
        },
      },
    ]);
  }

  private async convertXlsxToJson() {
    const showError = (msg: string) => {
      this.logger.showOutputChannel();
      this.logger.error(msg);
    };
    const result = await this.nodeVs.vsWindowsManager.showOpenDialog<Uri>({ canSelectFiles: true });
    const fileInfo = this.nodeVs.fileSystem.getFileInfo(result ? result.path : '');
    const validExtension = ['.xlsx', '.xlsm', '.csv'];
    if (!fileInfo.hasError && validExtension.includes(fileInfo.data.extension)) {
      const wb = xlsx.readFile(fileInfo.data.filename);
      if (wb.SheetNames && wb.SheetNames.length > 0) {
        const items: QuickPickItem[] = wb.SheetNames.map<QuickPickItem>((name) => {
          return { label: name, picked: false };
        });
        this.nodeVs.vsWindowsManager.createQuickPick<QuickPickItem>(items, { canPickMany: false }).then((selectedItem) => {
          // User made final selection
          if (!selectedItem) {
            return;
          } else {
            const ws = wb.Sheets[selectedItem.label];
            const data = xlsx.utils.sheet_to_json(ws);
            const tempFile = this.nodeVs.fileSystem.createTempFile(fileInfo.data.basenameWithoutExtension + '.json');
            FileSystem.writeJsonFile(tempFile, data);
            this.nodeVs.fileSystem.showTextDocument(tempFile);
          }
        });
      } else {
        showError('This file: ' + fileInfo.data.basename + ' doesn\'t have any sheet');
      }
    } else {
      showError('Invalid file: ' + fileInfo.data.filename);
    }
  }
}
