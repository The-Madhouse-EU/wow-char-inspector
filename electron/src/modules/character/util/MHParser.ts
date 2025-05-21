import { parse as parseLua } from 'luaparse';

function getRawString(str: string) {
  return str.substring(1, str.length - 1);
}
export type MHCharMeta = {
  guid: string;
  character: string;
  server: string;
  raceName: string;
  className: string;
  spec: string;
  mpKey: string;
  mpKeyTimeOut: number;
  resting: boolean;
  warMode: boolean;
  heritageArmor: boolean;
  classID: number;
  raceID: number;
  lastSeen: number;
  il: number;
  playedTotal: number;
  money: number;
  mp: number;
  level: number;
  zone: string;
  currency: Record<string, number>;
  meta: boolean;
  faction: string;
  guildName: string;
  guildRankName: string;
  guildRankIndex: number;
};
export type MHData = NonNullable<ReturnType<typeof MHParser>>;

export default function MHParser(inp: string) {
  const itemArr: MHCharMeta[] = [];

  try {
    const chunks = parseLua(inp, { comments: false });

    chunks.body.forEach((chunk) => {
      if (chunk.type === 'AssignmentStatement') {
        if (
          chunk.variables[0] &&
          chunk.variables[0].type === 'Identifier' &&
          chunk.variables[0].name === 'MadhouseAddonConfig'
        ) {
          chunk.init.forEach((l1) => {
            if (l1.type === 'TableConstructorExpression') {
              l1.fields.forEach((l2) => {
                if (l2.type === 'TableKey' && l2.key.type === 'StringLiteral') {
                  const key = getRawString(l2.key.raw);
                  if (key !== 'global') {
                    const split = key.split('-');
                    const name = split[0];
                    const server = split.slice(1).join('-');
                    const meta: MHCharMeta = {
                      guid: '',
                      character: name,
                      server,
                      classID: -1,
                      raceID: -1,
                      zone: '???',
                      className: '',
                      raceName: '',
                      resting: false,
                      heritageArmor: false,
                      warMode: false,
                      lastSeen: -1,
                      il: -1,
                      playedTotal: -1,
                      money: -1,
                      mp: -1,
                      level: 0,
                      currency: {},
                      faction: '',
                      meta: false,
                      guildRankName: '',
                      guildName: '',
                      guildRankIndex: 0,
                      spec: '',
                      mpKey: '',
                      mpKeyTimeOut: 0,
                    };
                    if (l2.value.type === 'TableConstructorExpression') {
                      l2.value.fields.forEach((l3) => {
                        if (
                          l3.type === 'TableKey' &&
                          l3.key.type === 'StringLiteral'
                        ) {
                          switch (getRawString(l3.key.raw)) {
                            case 'currency_data':
                              if (
                                l3.value.type === 'TableConstructorExpression'
                              ) {
                                l3.value.fields.forEach((l4) => {
                                  if (
                                    l4.type === 'TableKey' &&
                                    l4.key.type === 'NumericLiteral' &&
                                    l4.value.type === 'NumericLiteral'
                                  ) {
                                    meta.currency[l4.key.value.toString()] =
                                      l4.value.value;
                                  }
                                });
                              }
                              break;
                            case 'meta':
                              if (
                                l3.value.type === 'TableConstructorExpression'
                              ) {
                                meta.meta = true;
                                l3.value.fields.forEach((l4) => {
                                  if (
                                    l4.type === 'TableKey' &&
                                    l4.key.type === 'StringLiteral'
                                  ) {
                                    switch (getRawString(l4.key.raw)) {
                                      // ############### Boolean ###############
                                      case 'isResting':
                                        if (
                                          l4.value.type === 'BooleanLiteral'
                                        ) {
                                          meta.resting = l4.value.value;
                                        }
                                        break;
                                      case 'heritageArmor':
                                        if (
                                          l4.value.type === 'BooleanLiteral'
                                        ) {
                                          meta.heritageArmor = l4.value.value;
                                        }
                                        break;
                                      case 'resting':
                                        if (
                                          l4.value.type === 'BooleanLiteral'
                                        ) {
                                          meta.resting = l4.value.value;
                                        }
                                        break;
                                      case 'warMode':
                                        if (
                                          l4.value.type === 'BooleanLiteral'
                                        ) {
                                          meta.warMode = l4.value.value;
                                        }
                                        break;
                                      // ############### STRING ###############
                                      case 'mpKey':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.mpKey = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      case 'specName':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.spec = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      case 'guid':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.guid = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      case 'guildName':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.guildName = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      case 'guildRankName':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.guildRankName = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      case 'faction':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.faction =
                                            getRawString(l4.value.raw) ===
                                            'Horde'
                                              ? 'Horde'
                                              : 'Allianz';
                                        }
                                        break;
                                      case 'zone':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.zone = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      case 'raceName':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.raceName = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      case 'className':
                                        if (l4.value.type === 'StringLiteral') {
                                          meta.className = getRawString(
                                            l4.value.raw,
                                          );
                                        }
                                        break;
                                      // ############### NUMBERS ###############
                                      case 'mpKey_timeout':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.mpKeyTimeOut = l4.value.value;
                                        }
                                        break;
                                      case 'playedTotal':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.playedTotal = l4.value.value;
                                        }
                                        break;
                                      case 'guildRankIndex':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.guildRankIndex = l4.value.value;
                                        }
                                        break;
                                      case 'money':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.money = l4.value.value;
                                        }
                                        break;
                                      case 'lastSeen':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.lastSeen = l4.value.value;
                                        }
                                        break;
                                      case 'classID':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.classID = l4.value.value;
                                        }
                                        break;
                                      case 'raceID':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.raceID = l4.value.value;
                                        }
                                        break;
                                      case 'il':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.il = l4.value.value;
                                        }
                                        break;
                                      case 'mp':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.mp = l4.value.value;
                                        }
                                        break;
                                      case 'level':
                                        if (
                                          l4.value.type === 'NumericLiteral'
                                        ) {
                                          meta.level = l4.value.value;
                                        }
                                        break;
                                      default:
                                    }
                                  }
                                });
                              }
                              break;
                            default:
                          }
                        }
                      });
                    }
                    if (meta.meta) {
                      itemArr.push(meta);
                    }
                  }
                }
              });
            }
          });
        }
      }
    });

    return {
      itemArr,
    };
  } catch (e) {
    console.error('Error parsing Lua file:', e);
    return null;
  }
}
