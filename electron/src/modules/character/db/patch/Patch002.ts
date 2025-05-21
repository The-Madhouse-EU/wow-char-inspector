import { CoreDBUpdate } from '@grandlinex/e-kernel';
import SQLCon from '@grandlinex/bundle-sqlight';
import Patch001 from './Patch001';

export default class Patch002 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('1', '2', db);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();
    if (!(await db.getEntityWrapper('Instanzen')!.init())) {
      return false;
    }
    if (!(await db.getEntityWrapper('Weekly')!.init())) {
      return false;
    }

    const prePatch = new Patch001(db);
    return prePatch.performe();
  }
}
