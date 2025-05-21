import { CoreDBUpdate } from '@grandlinex/e-kernel';
import SQLCon from '@grandlinex/bundle-sqlight';

export default class Patch001 extends CoreDBUpdate<SQLCon> {
  constructor(db: SQLCon) {
    super('0', '1', db);
  }

  async performe(): Promise<boolean> {
    const db = this.getDb();

    await db.execScripts([
      {
        exec: `DROP TABLE main.player_class;`,
        param: [],
      },
      {
        exec: `DROP TABLE main.race;`,
        param: [],
      },
      {
        exec: `DROP TABLE main.faction;`,
        param: [],
      },
      {
        exec: `DROP TABLE main.character;`,
        param: [],
      },
      {
        exec: `DROP TABLE main.class_map;`,
        param: [],
      },
    ]);

    const pc = await db.getEntityWrapper('PlayerClass')!.init();
    const race = await db.getEntityWrapper('Race')!.init();
    const faction = await db.getEntityWrapper('Faction')!.init();
    const character = await db.getEntityWrapper('Character')!.init();
    const classMap = await db.getEntityWrapper('ClassMap')!.init();

    if (!(race && pc && faction && character && classMap)) {
      return false;
    }

    await db.initNewDB();

    return true;
  }
}
