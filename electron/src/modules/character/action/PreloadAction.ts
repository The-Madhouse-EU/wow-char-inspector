import { BaseAction, CMap, IBaseKernelModule } from '@grandlinex/e-kernel';
import { app } from 'electron';
import CharDB from '../db/CharDB';
import CharClient from '../client/CharClient';

export default class PreloadAction extends BaseAction<CharDB, CharClient> {
  constructor(moduele: IBaseKernelModule<any, any, any>) {
    super('get-preload', moduele);
    this.handler = this.handler.bind(this);
  }

  async handler() {
    const client = this.getModule().getClient();

    await client.calcAll(true);

    const db = this.getModule().getDb();

    const classList = new CMap(
      (await db.playerClass.getObjList()).map((x) => [x.class_name, x.color]),
    );

    return {
      appVersion: app.getVersion(),
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
