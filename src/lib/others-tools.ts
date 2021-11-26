import { App } from '../app';
import * as xlsx from 'xlsx';
import { QuickPickItem } from 'vscode';
import { FileSystem, Functions, NodeVs } from '../vendor/node-vscode-utils/src';


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
    const result = await this.nodeVs.vsWindowsManager.showOpenDialog({ canSelectFiles: true });
    let file: string = result && result[0] && result[0]['path'] ? result[0]['path'] : '';
    file = this.nodeVs.fileSystem.resolvePath(file);
    if (file.length > 0 && FileSystem.fileExist(file)) {
      const fileInfo = this.nodeVs.fileSystem.getFileInfo(file);
      const wb = xlsx.readFile(file);
      if (wb.SheetNames && wb.SheetNames.length > 0) {
        const items: QuickPickItem[] = wb.SheetNames.map<QuickPickItem>((name) => {
          return { label: name, picked: false };
        });
        this.nodeVs.vsWindowsManager.createQuickPick(items, { canPickMany: false }).then((selectedItem) => {
          // User made final selection
          if (!selectedItem) {
            return;
          } else {
            selectedItem.data = Functions.convert<QuickPickItem>(selectedItem.data);
            const ws = wb.Sheets[selectedItem.data.label];
            const data = xlsx.utils.sheet_to_json(ws);
            const tempFile = this.nodeVs.fileSystem.createTempFile(fileInfo.basenameWithoutExtension + '.json');
            FileSystem.writeJsonFile(tempFile, data);
            this.nodeVs.fileSystem.showTextDocument(tempFile);
          }
        });
      } else {
        this.logger.error('This file: ' + fileInfo.basename + ' doesn\'t have any sheet');
      }
    }
  }
}
