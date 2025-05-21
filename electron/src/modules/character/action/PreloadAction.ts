import {
  BaseAction,
  CMap,
  IBaseKernelModule,
  IKernel,
} from '@grandlinex/e-kernel';
import CharDB from '../db/CharDB';
import CharClient from '../client/CharClient';

export default class PreloadAction extends BaseAction<
  IKernel,
  CharDB,
  CharClient
> {
  constructor(moduele: IBaseKernelModule<any, any, any>) {
    super('get-preload', moduele);
    this.handler = this.handler.bind(this);
  }

  async handler(
    event: Electron.CrossProcessExports.IpcMainInvokeEvent,
  ): Promise<any> {
    const client = this.getModule().getClient();

    await client.calcAll(true);

    const db = this.getModule().getDb();

    const classList = new CMap(
      (await db.playerClass.getObjList()).map((x) => [x.class_name, x.color]),
    );

    return {
      classList: Array.from(classList),
      weekly: await db.weekly.getObjList({
        order: [{ key: 'e_id', order: 'ASC' }],
      }),
      instanzen: await db.instanzen.getObjList({
        order: [{ key: 'e_id', order: 'ASC' }],
      }),
    };
  }
}
