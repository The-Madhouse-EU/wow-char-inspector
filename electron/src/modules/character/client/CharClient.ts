import {
  CoreClient,
  ICoreKernel,
  ICoreKernelModule,
} from '@grandlinex/e-kernel';
import fs from 'node:fs';
import path from 'node:path';
import CharDB from '../db/CharDB';
import Character from '../db/entity/Character';
import NMap from '../util/NMap';
import MHParser, { MHData } from '../util/MHParser';
import SIParser, { SIData } from '../util/SIParser';

export default class CharClient extends CoreClient<ICoreKernel<any>, CharDB> {
  constructor(mod: ICoreKernelModule<any, any, any, any, any>) {
    super('CharClient', mod);
  }

  getRaceOverview() {
    const pcRacePrepare = this.getModule().getDb().db!.prepare(`
              SELECT a.race_name, b.max, c.total
              FROM (SELECT DISTINCT race_name FROM main.race) as a
                       left outer join
                   (SELECT rase,count(1) as max FROM main.character WHERE character.level = 80 GROUP BY rase) as b
                   on a.race_name = b.rase left outer join  (SELECT rase,count(1) as total FROM main.character GROUP BY rase) as c on a.race_name = c.rase;`);
    return pcRacePrepare
      .all()
      .map((e: any) => ({
        id: e.race_name,
        max: e.max || 0,
        total: e.total || 0,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getClassOverview() {
    const pcPrepare = this.getModule().getDb().db!.prepare(`
            SELECT a.class_name, b.max, c.total
            FROM (SELECT DISTINCT class_name FROM main.player_class) as a
                     left outer join
                 (SELECT playerClass,count(1) as max FROM main.character WHERE character.level = 80 GROUP BY playerClass) as b
                 on a.class_name = b.playerClass left outer join  (SELECT playerClass,count(1) as total FROM main.character GROUP BY playerClass) as c on a.class_name = c.playerClass;`);

    return pcPrepare
      .all()
      .map((e: any) => ({
        id: e.class_name,
        max: e.max || 0,
        total: e.total || 0,
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getNotMaxChars() {
    const pcPrepare = this.getModule()
      .getDb()
      .db!.prepare(
        `SELECT * FROM main.character WHERE character.level != 80 ORDER BY level DESC`,
      );
    return pcPrepare.all() as Character[];
  }

  helpPrint(name: string, data: Map<string, number>, silent = true) {
    if (silent) return;
    this.debug(`## Table: ${name} ##`);
    this.debug(`###################################`);
    data.forEach((max, e_id) => {
      this.debug(`| ${e_id} | ${max || 0} |`);
    });
    this.debug(`###################################`);
  }

  async getMissingChars() {
    let out: Character[] = [];
    const db = this.getModule().getDb();
    let chars = this.getNotMaxChars();
    const missingRaceA = this.getRaceOverview();
    const missingRace = new NMap(missingRaceA.map((o) => [o.id, o.max]));
    const missingClassA = this.getClassOverview();
    const missingClass = new NMap(missingClassA.map((o) => [o.id, o.max]));
    const raceList = await db.race.getObjList();

    // ---------------------- BESTEHENDE CHARAKTERE - RACE ----------------------
    this.helpPrint('Race', missingRace);
    this.helpPrint('Class', missingClass);

    missingRace.forEach((e, k) => {
      if (e === 0) {
        const existing = chars.find((c) => c.rase === k);
        if (existing) {
          missingRace.set(k, 1);
          out.push(existing);
          chars = chars.filter((c) => c.e_id !== existing.e_id);
          missingClass.increase(existing.playerClass);
        }
      }
    });

    this.debug('====================================================');
    // ---------------------- BESTEHENDE CHARAKTERE - Klasse ----------------------
    this.helpPrint('Race', missingRace);
    this.helpPrint('Class', missingClass);

    missingClass.forEach((e, k) => {
      if (e === 0) {
        const existing = chars.find((c) => c.playerClass === k);
        if (existing) {
          missingClass.set(k, 1);
          out.push(existing);
          chars = chars.filter((c) => c.e_id !== existing.e_id);
          missingRace.increase(existing.rase);
        }
      }
    });

    this.debug('====================================================');
    // ---------------------- NEUE CHARAKTERE - Klasse ----------------------
    this.helpPrint('Race', missingRace);
    this.helpPrint('Class', missingClass);

    for (const [k, e] of missingClass) {
      if (e === 0) {
        const list = await db.classMap.getObjList({
          search: { playerClass: k },
        });

        const hasGood = list.find((c) => {
          return missingRace.get(c.race) === 0;
        });
        if (hasGood) {
          out.push(
            new Character({
              faction: (await db.race.findObj({ race_name: hasGood.race })!)!
                .faction,
              level: 0,
              meta: {},
              name: 'Neuer Character',
              playerClass: hasGood.playerClass,
              rase: hasGood.race,
              server: 'Blackhand',
            }),
          );
          missingClass.set(k, 1);
          missingRace.set(hasGood.race, 1);
        } else {
          const char =
            list.find((x) => {
              return (
                raceList.find((y) => y.race_name === x.race)!.faction ===
                'Horde'
              );
            }) || list[0];

          missingClass.set(k, 1);
          missingRace.increase(char.race);

          out.push(
            new Character({
              faction: (await db.race.findObj({ race_name: char.race })!)!
                .faction,
              level: 0,
              meta: {},
              name: 'Neuer Character',
              playerClass: char.playerClass,
              rase: char.race,
              server: 'Blackhand',
            }),
          );
        }
      }
    }
    this.debug('====================================================');
    // ---------------------- NEUE CHARAKTERE - Rassen ----------------------
    this.helpPrint('Race', missingRace);
    this.helpPrint('Class', missingClass);

    for (const [k, e] of missingRace) {
      if (e === 0) {
        const list = await db.classMap.getObjList({
          search: { race: k },
        });

        const hasGood = list.find((c) => {
          return missingClass.get(c.playerClass) === 0;
        });
        if (hasGood) {
          const race = await db.race.findObj({ race_name: hasGood.race });
          this.log(hasGood.race, race);
          out.push(
            new Character({
              faction: race!.faction,
              level: 0,
              meta: {},
              name: 'Neuer Character',
              playerClass: hasGood.playerClass,
              rase: hasGood.race,
              server: 'Blackhand',
            }),
          );
          missingRace.set(k, 1);
          missingClass.set(hasGood.playerClass, 1);
        } else {
          const char =
            list.find((x) => {
              return (
                raceList.find((y) => y.race_name === x.race)!.faction ===
                'Horde'
              );
            }) || list[0];

          missingRace.set(k, 1);
          missingClass.increase(char.playerClass);

          out.push(
            new Character({
              faction: (await db.race.findObj({ race_name: char.race })!)!
                .faction,
              level: 0,
              meta: {},
              name: 'Neuer Character',
              playerClass: char.playerClass,
              rase: char.race,
              server: 'Blackhand',
            }),
          );
        }
      }
    }
    this.debug('====================================================');
    // ---------------------- NEUE CHARAKTERE - Rassen ----------------------
    this.helpPrint('Race', missingRace);
    this.helpPrint('Class', missingClass);

    let opti = await this.optimize(out, missingRace, missingClass);
    while (opti) {
      this.debug('Optimierung gefunden');

      const [a, b] = opti.remove;

      out = out.filter((c) => c.e_id !== a.e_id && c.e_id !== b.e_id);

      missingRace.decrease(a.rase);
      missingRace.decrease(b.rase);
      missingClass.decrease(a.playerClass);
      missingClass.decrease(b.playerClass);

      const char = opti.replace;
      const exist = await db.chars.findObj({
        rase: char.race,
        playerClass: char.playerClass,
      });
      out.push(
        exist ||
          new Character({
            faction: (await db.race.findObj({ race_name: char.race })!)!
              .faction,
            level: 0,
            meta: {},
            name: 'Neuer Character',
            playerClass: char.playerClass,
            rase: char.race,
            server: 'Blackhand',
          }),
      );
      missingRace.increase(char.race);
      missingClass.increase(char.playerClass);

      opti = await this.optimize(out, missingRace, missingClass);
    }

    this.debug('====================================================');
    // ---------------------- NEUE CHARAKTERE - Rassen ----------------------
    this.helpPrint('Race', missingRace);
    this.helpPrint('Class', missingClass);

    return out.sort((a, b) => b.level - a.level);
  }

  async optimize(out: Character[], missingRace: NMap, missingClass: NMap) {
    const map = await this.getModule().getDb().classMap.getObjList();
    const mR = new NMap(Array.from(missingRace));
    const mC = new NMap(Array.from(missingClass));
    for (const a of out) {
      for (const b of out) {
        if (a.e_id !== b.e_id) {
          // Remove a and b from the maps
          mR.decrease(a.rase);
          mR.decrease(b.rase);
          mC.decrease(a.playerClass);
          mC.decrease(b.playerClass);

          for (const replace of map) {
            // Add the replacement to the maps
            mR.increase(replace.race);
            mC.increase(replace.playerClass);
            // Check if the replacement is valid
            if (
              mR.toValueArray().every((e) => e > 0) &&
              mC.toValueArray().every((e) => e > 0)
            ) {
              return {
                remove: [a, b],
                replace,
              };
            }
            // Remove the replacement from the maps
            mR.decrease(replace.race);
            mC.decrease(replace.playerClass);
          }

          // Restore a and b to the maps
          mR.increase(a.rase);
          mR.increase(b.rase);
          mC.increase(a.playerClass);
          mC.increase(b.playerClass);
        }
      }
    }
    return null;
  }

  async loadMadhouseData(): Promise<MHData['itemArr'] | null> {
    const folder = await this.getKernel()
      .getModule()
      .getDb()
      .getConfig('profile-folder');
    this.log('folder');
    this.log(folder);
    if (folder) {
      const siPath = path.join(
        folder.c_value,
        'SavedVariables',
        'MadhousePack.lua',
      );

      if (fs.existsSync(siPath)) {
        const parser = MHParser(fs.readFileSync(path.join(siPath), 'utf-8'));
        if (!parser?.itemArr) {
          this.error(`Error while parsing SI data`);
          return null;
        }
        return parser.itemArr;
      }
      this.warn('MadhousePack not exist');
    }
    this.warn('MadhousePack path not set');
    return null;
  }

  async loadSavedInstancesData(): Promise<SIData | null> {
    const folder = await this.getKernel()
      .getModule()
      .getDb()
      .getConfig('profile-folder');
    this.log('folder');
    this.log(folder);
    if (folder) {
      const siPath = path.join(
        folder.c_value,
        'SavedVariables',
        'SavedInstances.lua',
      );

      if (fs.existsSync(siPath)) {
        const parser = SIParser(fs.readFileSync(path.join(siPath), 'utf-8'));
        if (!parser) {
          this.error(`Error while parsing SI data`);
          return null;
        }
        return parser;
      }
      this.warn('SavedInstances not exist');
    }
    this.warn('SavedInstances path not set');
    return null;
  }

  async calcAll(init = false) {
    const db = this.getModule().getDb();
    await db.setConfig('last-update', new Date().toISOString());

    const siData = await this.loadSavedInstancesData();
    if (init) {
      for (const instance of siData?.insArr || []) {
        if (!(await db.instanzen.getObjById(instance.e_id))) {
          await db.instanzen.createObject(instance);
        }
      }
    }

    const data = await this.loadMadhouseData();
    const charSet = new Set<string>();
    if (data) {
      for (const char of data) {
        charSet.add(char.guid);
        const exist = await db.chars.getObjById(char.guid);
        const race = (await db.race.getObjById(char.raceID.toString()))!;
        const pc = (await db.playerClass.getObjById(char.classID.toString()))!;
        const extendData = siData?.charData.get(
          `${char.character}-${char.server}`,
        );
        if (exist) {
          this.debug(
            `Update Char ${char.guid} ${char.character}-${char.server}`,
          );

          await db.chars.updateObject(exist.e_id, {
            name: char.character,
            server: char.server,
            faction: char.faction,
            level: char.level,
            playerClass: pc.class_name,
            rase: race.race_name,
            meta: {
              raw: char,
              weekly: extendData?.weekly,
              instances: extendData?.instances,
              vault: extendData?.vault,
            },
          });
        } else {
          this.debug(
            `Erstelle Char ${char.guid} ${char.character}-${char.server}`,
          );
          await db.chars.createObject(
            new Character({
              e_id: char.guid,
              name: char.character,
              server: char.server,
              faction: char.faction,
              level: char.level,
              playerClass: pc.class_name,
              rase: race.race_name,
              meta: {
                raw: char,
                weekly: extendData?.weekly,
                instances: extendData?.instances,
                vault: extendData?.vault,
              },
            }),
          );
        }
      }
    } else {
      this.warn('Skipping profile data update');
    }
    for (const c of await db.chars.getObjList()) {
      if (!charSet.has(c.e_id)) {
        await db.chars.delete(c.e_id);
      }
    }
  }
}
