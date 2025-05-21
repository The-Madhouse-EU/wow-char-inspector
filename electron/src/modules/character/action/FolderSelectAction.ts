import { BaseAction, IBaseKernelModule, IKernel } from '@grandlinex/e-kernel';
import { dialog } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import CharDB from '../db/CharDB';
import CharClient from '../client/CharClient';

export default class FolderSelectAction extends BaseAction<
  IKernel,
  CharDB,
  CharClient
> {
  firstLoad: boolean;

  constructor(moduele: IBaseKernelModule<any, any, any>) {
    super('set-config-folder', moduele);
    this.handler = this.handler.bind(this);
    this.firstLoad = true;
  }

  async handler(
    event: Electron.CrossProcessExports.IpcMainInvokeEvent,
    args: unknown,
  ): Promise<any> {
    const folder = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: 'C:\\Program Files (x86)',
      title: 'Wähle deinen WoW Ordner aus',
    });
    if (folder.canceled) {
      return null;
    }
    const [pendingFolder] = folder.filePaths;
    this.log(pendingFolder);

    const account = path.join(pendingFolder, '_retail_', 'WTF', 'Account');
    if (!fs.existsSync(account)) {
      await dialog.showMessageBox({
        message:
          'Ungültiger Order: Bsp: "C:\\Program Files (x86)\\World of Warcraft"',
        type: 'error',
      });
      this.error(`Account folder does not exist`);
      return null;
    }

    let fullPath: string;

    const accounts = (await fs.promises.readdir(account)).filter(
      (e) => e !== 'SavedVariables',
    );

    if (accounts.length > 0) {
      const answer = await dialog.showMessageBox({
        message: 'Wähle den Account aus',
        buttons: accounts,
      });
      if (answer.response >= 0) {
        fullPath = path.join(account, accounts[answer.response]);
      } else {
        return null;
      }
    } else {
      fullPath = path.join(account, accounts[0]);
    }

    await this.getKernel()
      .getModule()
      .getDb()
      .setConfig('profile-folder', fullPath);
    return fullPath;
  }
}
