import { BaseAction, IBaseKernelModule, IKernel } from '@grandlinex/e-kernel';
import CharDB from '../db/CharDB';
import CharClient from '../client/CharClient';

export default class InfoAction extends BaseAction<
  IKernel,
  CharDB,
  CharClient
> {
  constructor(moduele: IBaseKernelModule<any, any, any>) {
    super('get-info', moduele);
    this.handler = this.handler.bind(this);
  }

  async handler(
    event: Electron.CrossProcessExports.IpcMainInvokeEvent,
  ): Promise<any> {
    const client = this.getModule().getClient();

    await client.calcAll();

    const db = this.getModule().getDb();

    const chars = await db.chars.getObjList({
      order: [
        {
          key: 'level',
          order: 'DESC',
        },
        {
          key: 'name',
          order: 'ASC',
        },
      ],
    });
    const global = await db.getConfig('global-data');

    return {
      global: JSON.parse(global.c_value || '{}'),
      chars,
      classOverview: client.getClassOverview(),
      raceOverview: client.getRaceOverview(),
      missing: await client.getMissingChars(),
    };
  }
}
