import SQLCon from '@grandlinex/bundle-sqlight';
import { CoreEntityWrapper, ICoreKernelModule } from '@grandlinex/e-kernel';
import Character from './entity/Character';
import Race from './entity/Race';
import PlayerClass, { PClass } from './entity/PlayerClass';
import Faction, { PFaction } from './entity/Faction';
import ClassMap from './entity/ClassMap';
import Patch001 from './patch/Patch001';
import Instanzen from './entity/Instanzen';
import Patch002 from './patch/Patch002';
import Weekly from './entity/Weekly';

export default class CharDB extends SQLCon {
  chars: CoreEntityWrapper<Character>;

  faction: CoreEntityWrapper<Faction>;

  playerClass: CoreEntityWrapper<PlayerClass>;

  race: CoreEntityWrapper<Race>;

  classMap: CoreEntityWrapper<ClassMap>;

  instanzen: CoreEntityWrapper<Instanzen>;

  weekly: CoreEntityWrapper<Weekly>;

  constructor(mod: ICoreKernelModule<any, any, any, any, any>) {
    super(mod, '2');

    this.setEntityCache(true);
    this.faction = this.registerEntity(new Faction());
    this.race = this.registerEntity(new Race());
    this.playerClass = this.registerEntity(new PlayerClass(), true);
    this.classMap = this.registerEntity(new ClassMap());
    this.chars = this.registerEntity(new Character());
    this.instanzen = this.registerEntity(new Instanzen());
    this.weekly = this.registerEntity(new Weekly());
    this.setUpdateChain(new Patch001(this), new Patch002(this));
  }

  async initNewDB(): Promise<void> {
    for (const f in PFaction) {
      if (f) {
        await this.faction.createObject(new Faction({ e_id: f as PFaction }));
      }
    }
    const WClassMap = new Map<PClass, [string, number]>([
      [PClass.Todesritter, ['#C41E3A', 6]],
      [PClass.Dämonenjäger, ['#A330C9', 12]],
      [PClass.Druide, ['#FF7C0A', 11]],
      [PClass.Rufer, ['#33937F', 13]],
      [PClass.Jäger, ['#AAD372', 3]],
      [PClass.Magier, ['#3FC7EB', 8]],
      [PClass.Mönch, ['#00FF98', 10]],
      [PClass.Paladin, ['#F48CBA', 2]],
      [PClass.Priester, ['#FFFFFF', 5]],
      [PClass.Schurke, ['#FFF468', 4]],
      [PClass.Schamane, ['#0070DD', 7]],
      [PClass.Hexenmeister, ['#8788EE', 9]],
      [PClass.Krieger, ['#C69B6D', 1]],
    ]);
    for (const k in PClass) {
      if (k) {
        const [color, idd] = WClassMap.get(k as PClass)!;
        await this.playerClass.createObject(
          new PlayerClass({
            class_name: k as PClass,
            e_id: idd.toString(),
            color,
          }),
        );
      }
    }

    const races: [number, string, PFaction, PClass[]][] = [
      [
        10,
        'Blutelf',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Mönch,
          PClass.Dämonenjäger,
          PClass.Todesritter,
        ],
      ],
      [
        52,
        'Dracthyr',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Rufer,
        ],
      ],
      [
        70,
        'Dracthyr',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Rufer,
        ],
      ],
      [
        11,
        'Draenei',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        34,
        'Dunkeleisenzwerg',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        9,
        'Goblin',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        28,
        'Hochbergtauren',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Druide,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        84,
        'Irdener',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Schamane,
          PClass.Mönch,
        ],
      ],
      [
        85,
        'Irdener',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Schamane,
          PClass.Mönch,
        ],
      ],
      [
        32,
        'Kul Tiraner',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Druide,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        36,
        "Mag'har",
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        1,
        'Mensch',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        2,
        'Orc',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        25,
        'Pandaren',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        26,
        'Pandaren',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        6,
        'Tauren',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Druide,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        8,
        'Troll',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Druide,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        5,
        'Untoter',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        35,
        'Vulpera',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        22,
        'Worgen',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Druide,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        31,
        'Zandalaritroll',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Druide,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        3,
        'Zwerg',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Schamane,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      //        --- ADD LIST
      [
        7,
        'Gnom',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        37,
        'Mechagnom',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        29,
        'Leerenelf',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        30,
        'Lichtgeschmiedeter Draenei',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Paladin,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
      [
        4,
        'Nachtelf',
        PFaction.Allianz,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Druide,
          PClass.Mönch,
          PClass.Dämonenjäger,
          PClass.Todesritter,
        ],
      ],
      [
        27,
        'Nachtgeborener',
        PFaction.Horde,
        [
          PClass.Krieger,
          PClass.Jäger,
          PClass.Magier,
          PClass.Schurke,
          PClass.Priester,
          PClass.Hexenmeister,
          PClass.Mönch,
          PClass.Todesritter,
        ],
      ],
    ];
    for (const [id, r, f, m] of races) {
      await this.race.createObject(
        new Race({ e_id: id.toString(), race_name: r, faction: f }),
      );
      for (const map of m) {
        await this.classMap.createObject(
          new ClassMap({ race: r, playerClass: map }),
        );
      }
    }

    const weekly: { key: string; txt: string; note?: string }[] = [
      // ################ GENERAL #####################
      {
        key: 'timewalking',
        txt: 'Zeitwanderung',
        note: 'Zeitwanderung Quest',
      },
      // ################ PVP #####################
      {
        key: 'call-to-battle',
        txt: 'Ein Aufruf zur Schlacht',
        note: 'PVP - Gewinnt 4 Schlachtfeldpartien.',
      },
      {
        key: 'tww-pvp-world',
        txt: 'Funken des Krieges',
        note: 'PVP - World Quest',
      },
      {
        key: 'tww-pvp-weekly',
        txt: 'PVP Weekly',
        note: 'PVP - Wöchentliche Quest',
      },
      // ################ TWW #####################
      {
        key: 'tww-spreading-the-light',
        txt: 'Verbreitung des Lichts',
        note: 'Kleine Schlüsselflammen aktiviert (4)',
      },
      {
        key: 'tww-delves',
        txt: 'Wöchentliche Delve',
        note: 'Wöchentlicher Delve Bonus',
      },
      {
        key: 'tww-the-key-to-success',
        txt: 'Schlüssel zum Erfolg',
        note: 'Delve Abgabe quest',
      },
      {
        key: 'The Severed Threads',
        txt: 'Die Durchtrennten Fäden',
        note: 'Die Durchtrennten Fäden Weekly',
      },
      {
        key: 'tww-archives',
        txt: 'Titanfragmente',
        note: 'Sammel 100 Titanfragmente',
      },
      {
        key: 'tww-gearing-up-for-trouble',
        txt: 'Erweckung der Maschine',
        note: 'In Sachen Probleme einen Gang hochschalten, Erweckung der Maschine weekly',
      },
      {
        key: 'tww-biergoth-dungeon-quest',
        txt: 'Dungeon Quest',
        note: 'Dornogal Dungeon Quest',
      },
      {
        key: 'tww-the-call-of-the-worldsoul',
        txt: 'Weltenseele',
        note: 'Weltenseele Quest',
      },
      {
        key: 'call-to-delves',
        txt: 'Ruf der Tiefe',
        note: 'Schließt 5 Tiefen in Khaz Algar ab.',
      },
      {
        key: 'tww-services-requested',
        txt: 'Berufsquest',
        note: 'Aufträge erfüllt oder Abgegeben',
      },
      {
        key: 'tww-the-theater-trope',
        txt: 'Die Theatertruppe',
        note: 'Nehmt am Theatertruppenereignis teil.',
      },
    ];

    for (const le of weekly) {
      await this.weekly.createObject(
        new Weekly({
          anzeige_text: le.txt,
          e_id: le.key,
          note: le.note || null,
          weekly_type: 1,
        }),
      );
    }
  }
}
