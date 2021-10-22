import { App } from '../app';
import * as xlsx from 'xlsx';
import { annotateName, NodeVscode } from 'node-vscode-utils';
import { QuickPickItem } from 'vscode';


export class OthersTools extends App {
  constructor(
    protected nodeVscode: NodeVscode,
    protected extensionId: string,
  ) {
    super(nodeVscode, extensionId, 'others-tools-jnoronha', 'OthersTools');
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
    ]);
  }

  @annotateName
  private async convertXlsxToJson() {
    const result = await this.windowsManager.showOpenDialog({ canSelectFiles: true });
    let file: string = result && result[0] && result[0]['path'] ? result[0]['path'] : '';
    file = this.nodeVscode.fileSystem.resolvePath(file);
    if (file.length > 0 && this.nodeVscode.fileSystem.fileExist(file)) {
      const fileInfo = this.nodeVscode.fileSystem.getFileInfo(file);
      const wb = xlsx.readFile(file);
      if (wb.SheetNames && wb.SheetNames.length > 0) {
        const items: QuickPickItem[] = wb.SheetNames.map<QuickPickItem>((name) => {
          return { label: name, picked: false };
        });
        this.windowsManager.createQuickPick(items, { canPickMany: false }).then((selectedItem) => {
          // User made final selection
          if (!selectedItem) {
            return;
          } else {
            selectedItem = this.functions.convert<QuickPickItem>(selectedItem);
            const ws = wb.Sheets[selectedItem.label];
            const data = xlsx.utils.sheet_to_json(ws);
            const tempFile = this.nodeVscode.fileSystem.createTempFile(fileInfo.basenameWithoutExtension + '.json');
            this.nodeVscode.fileSystem.writeJsonFile(tempFile, data);
            this.nodeVscode.fileSystem.showTextDocument(tempFile);
          }
        });
      } else {
        this.logger.error('This file: ' + fileInfo.basename + ' doesn\'t have any sheet');
      }
    }
  }
}
