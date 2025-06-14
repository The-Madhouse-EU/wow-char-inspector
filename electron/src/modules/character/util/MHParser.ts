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
  profession: {
    id: number;
    type: string;
    name: string;
    skillLevel: number;
    maxSkillLevel: number;
    specializationIndex: number;
  }[];
  meta: boolean;
  faction: string;
  guildName: string;
  guildRankName: string;
  guildRankIndex: number;
};
export type MHData = NonNullable<ReturnType<typeof MHParser>>;

export default function MHParser(inp: string) {
  const itemArr: MHCharMeta[] = [];
  const global: {
    warBankGold: number;
  } = {
    warBankGold: 0,
  };

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
                  if (key === 'global') {
                    if (l2.value.type === 'TableConstructorExpression') {
                      l2.value.fields.forEach((l3) => {
                        if (
                          l3.type === 'TableKey' &&
                          l3.key.type === 'StringLiteral' &&
                          getRawString(l3.key.raw) === 'warbank-gold' &&
                          l3.value.type === 'NumericLiteral'
                        ) {
                          global.warBankGold = l3.value.value;
                        }
                      });
                    }
                  } else {
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
                      profession: [],
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
                                      // ############### RECORD ###############
                                      case 'profession':
                                        if (
                                          l4.value.type ===
                                          'TableConstructorExpression'
                                        ) {
                                          l4.value.fields.forEach((l5) => {
                                            const prof: MHCharMeta['profession'][number] =
                                              {
                                                id: -1,
                                                type: '',
                                                name: '',
                                                skillLevel: -1,
                                                maxSkillLevel: -1,
                                                specializationIndex: -1,
                                              };
                                            if (
                                              l5.type === 'TableKey' &&
                                              l5.key.type === 'StringLiteral' &&
                                              l5.value.type ===
                                                'TableConstructorExpression'
                                            ) {
                                              const keyL5 = getRawString(
                                                l5.key.raw,
                                              );
                                              prof.type = keyL5;
                                              l5.value.fields.forEach((l6) => {
                                                if (
                                                  l6.type === 'TableKey' &&
                                                  l6.key.type ===
                                                    'StringLiteral'
                                                ) {
                                                  const l6Key = getRawString(
                                                    l6.key.raw,
                                                  );
                                                  switch (l6Key) {
                                                    // ############### string ###############
                                                    case 'name':
                                                      if (
                                                        l6.value.type ===
                                                        'StringLiteral'
                                                      ) {
                                                        prof.name =
                                                          getRawString(
                                                            l6.value.raw,
                                                          );
                                                      }
                                                      break;
                                                    // ############### numbers ###############
                                                    case 'skillLevel':
                                                      if (
                                                        l6.value.type ===
                                                        'NumericLiteral'
                                                      ) {
                                                        prof.skillLevel =
                                                          l6.value.value;
                                                      }
                                                      break;
                                                    case 'id':
                                                      if (
                                                        l6.value.type ===
                                                        'NumericLiteral'
                                                      ) {
                                                        prof.id =
                                                          l6.value.value;
                                                      }
                                                      break;
                                                    case 'specializationIndex':
                                                      if (
                                                        l6.value.type ===
                                                        'NumericLiteral'
                                                      ) {
                                                        prof.specializationIndex =
                                                          l6.value.value;
                                                      }
                                                      break;
                                                    case 'maxSkillLevel':
                                                      if (
                                                        l6.value.type ===
                                                        'NumericLiteral'
                                                      ) {
                                                        prof.maxSkillLevel =
                                                          l6.value.value;
                                                      }
                                                      break;
                                                    default:
                                                  }
                                                }
                                              });
                                            }
                                            if (prof.id !== -1) {
                                              meta.profession.push(prof);
                                            }
                                          });
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
      global,
    };
  } catch (e) {
    console.error('Error parsing Lua file:', e);
    return null;
  }
}
