import { parse as parseLua } from 'luaparse';
import Instanzen from '../db/entity/Instanzen';

function getRawString(str: string) {
  return str.substring(1, str.length - 1);
}

function getCharacter(str: string) {
  const split = str.split(' - ');
  if (split.length === 2) {
    return {
      name: split[0],
      server: split[1],
    };
  }
  return null;
}

export type SIData = NonNullable<ReturnType<typeof SIParser>>;

export type CharProgress = {
  name: string;
  server: string;
  weekly: { key: string; completed: boolean }[];
  instances: { instance: string; difficulties: number[] }[];
  vault: {
    v1: (string | number)[];
    v2: (string | number)[];
    v3: (string | number)[];
  };
};

export default function SIParser(inp: string) {
  const insArr: Instanzen[] = [];

  const charData = new Map<string, CharProgress>();

  function addWeeky(
    name: string,
    server: string,
    data: CharProgress['weekly'][number],
  ) {
    if (!data.completed) {
      return;
    }
    const key = `${name}-${server}`;
    const exist = charData.get(key);
    if (exist) {
      exist.weekly.push(data);
      charData.set(key, exist);
    } else {
      charData.set(key, {
        name,
        server,
        weekly: [data],
        instances: [],
        vault: {
          v1: [],
          v2: [],
          v3: [],
        },
      });
    }
  }
  function addInstance(
    name: string,
    server: string,
    data: CharProgress['instances'][number],
  ) {
    const key = `${name}-${server}`;
    const exist = charData.get(key);
    if (exist) {
      exist.instances.push(data);
      charData.set(key, exist);
    } else {
      charData.set(key, {
        name,
        server,
        weekly: [],
        instances: [data],
        vault: {
          v1: [],
          v2: [],
          v3: [],
        },
      });
    }
  }
  function addVault(
    name: string,
    server: string,
    vault: keyof CharProgress['vault'],
    data: string | number,
  ) {
    const key = `${name}-${server}`;
    const exist = charData.get(key);
    if (exist) {
      exist.vault[vault].push(data);
      charData.set(key, exist);
    } else {
      const dat: CharProgress = {
        name,
        server,
        weekly: [],
        instances: [],
        vault: {
          v1: [],
          v2: [],
          v3: [],
        },
      };
      dat.vault[vault].push(data);
      charData.set(key, dat);
    }
  }

  try {
    const chunk = parseLua(inp, { comments: false });

    const base = chunk.body[0];

    if (base.type === 'AssignmentStatement') {
      base.init.forEach((l01) => {
        if (l01.type === 'TableConstructorExpression') {
          l01.fields.forEach((l02) => {
            if (
              l02.type === 'TableKey' &&
              l02.key.type === 'StringLiteral' &&
              getRawString(l02.key.raw) === 'Instances' &&
              l02.value.type === 'TableConstructorExpression'
            ) {
              l02.value.fields.forEach((l03) => {
                if (
                  l03.type === 'TableKey' &&
                  l03.key.type === 'StringLiteral' &&
                  l03.value.type === 'TableConstructorExpression'
                ) {
                  const name = getRawString(l03.key.raw);
                  let expansion = -1;
                  let isRaid = false;
                  let isHoliday = false;
                  let skip = false;

                  l03.value.fields.forEach((l04) => {
                    if (
                      l04.type === 'TableKey' &&
                      l04.key.type === 'StringLiteral'
                    ) {
                      const key = getRawString(l04.key.raw);
                      const log = getCharacter(key);
                      const diffList: number[] = [];
                      if (!log) {
                        switch (key) {
                          case 'Random':
                            if (
                              l04.value.type === 'BooleanLiteral' &&
                              l04.value.value
                            ) {
                              skip = true;
                            }
                            break;
                          case 'Holiday':
                            if (
                              l04.value.type === 'BooleanLiteral' &&
                              l04.value.value
                            ) {
                              isHoliday = true;
                            }
                            break;
                          case 'WorldBoss':
                            if (l04.value.type === 'NumericLiteral') {
                              skip = true;
                            }
                            break;
                          case 'Raid':
                            if (l04.value.type === 'BooleanLiteral') {
                              isRaid = l04.value.value;
                            }
                            break;
                          case 'Expansion':
                            if (l04.value.type === 'NumericLiteral') {
                              expansion = l04.value.value;
                            }
                            break;
                          default:
                        }
                      } else if (
                        l04.value.type === 'TableConstructorExpression'
                      ) {
                        l04.value.fields.forEach((l05) => {
                          if (
                            l05.type === 'TableKey' &&
                            l05.key.type === 'NumericLiteral' &&
                            l05.value.type === 'TableConstructorExpression'
                          ) {
                            const diff = l05.key.value;
                            l05.value.fields.forEach((l06) => {
                              if (
                                l06.type === 'TableKey' &&
                                l06.key.type === 'StringLiteral' &&
                                getRawString(l06.key.raw) === 'Expires' &&
                                l06.value.type === 'NumericLiteral' &&
                                l06.value.value > 0
                              ) {
                                diffList.push(diff);
                              }
                            });
                          }
                        });
                        if (diffList.length > 0) {
                          addInstance(log.name, log.server, {
                            instance: name,
                            difficulties: diffList,
                          });
                        }
                      }
                    }
                  });

                  if (!skip) {
                    insArr.push(
                      new Instanzen({
                        e_id: name,
                        expansion,
                        holiday: isHoliday,
                        instance_type: isRaid ? 'Raid' : 'Dungeon',
                      }),
                    );
                  }
                }
              });
            }

            // Check if is Toons
            if (
              l02.type === 'TableKey' &&
              l02.key.type === 'StringLiteral' &&
              l02.key.raw === '"Toons"'
            ) {
              if (l02.value.type === 'TableConstructorExpression') {
                l02.value.fields.forEach((l03) => {
                  // Start Char Loop
                  if (
                    l03.type === 'TableKey' &&
                    l03.key.type === 'StringLiteral' &&
                    l03.value.type === 'TableConstructorExpression'
                  ) {
                    const [character, server] = getRawString(l03.key.raw).split(
                      ' - ',
                    );

                    l03.value.fields.forEach((l04) => {
                      // Start Char Meta Loop
                      if (
                        l04.type === 'TableKey' &&
                        l04.key.type === 'StringLiteral'
                      ) {
                        if (
                          getRawString(l04.key.raw) === 'Progress' &&
                          l04.value.type === 'TableConstructorExpression'
                        ) {
                          l04.value.fields.forEach((l05) => {
                            if (
                              l05.type === 'TableKey' &&
                              l05.key.type === 'StringLiteral' &&
                              l05.value.type === 'TableConstructorExpression'
                            ) {
                              const name = getRawString(l05.key.raw);
                              let completed = false;
                              let disb = false;
                              l05.value.fields.forEach((l06, index) => {
                                if (
                                  l06.type === 'TableKey' &&
                                  l06.key.type === 'StringLiteral' &&
                                  l06.value.type === 'BooleanLiteral' &&
                                  getRawString(l06.key.raw) === 'isComplete'
                                ) {
                                  completed = l06.value.value;
                                } else if (
                                  l05.key.type === 'StringLiteral' &&
                                  getRawString(l05.key.raw) ===
                                    'great-vault-raid' &&
                                  index < 3 &&
                                  !disb &&
                                  l06.type === 'TableValue' &&
                                  (l06.value.type === 'StringLiteral' ||
                                    l06.value.type === 'NumericLiteral')
                                ) {
                                  addVault(
                                    character,
                                    server,
                                    'v2',
                                    l06.value.value,
                                  );
                                } else if (
                                  l05.key.type === 'StringLiteral' &&
                                  getRawString(l05.key.raw) ===
                                    'great-vault-world' &&
                                  index < 3 &&
                                  !disb &&
                                  l06.type === 'TableValue' &&
                                  (l06.value.type === 'StringLiteral' ||
                                    l06.value.type === 'NumericLiteral')
                                ) {
                                  addVault(
                                    character,
                                    server,
                                    'v3',
                                    l06.value.value,
                                  );
                                } else {
                                  disb = true;
                                }
                              });
                              addWeeky(character, server, {
                                key: name,
                                completed,
                              });
                            }
                          });
                        } else if (
                          getRawString(l04.key.raw) === 'MythicKeyBest' &&
                          l04.value.type === 'TableConstructorExpression'
                        ) {
                          let disb = false;
                          l04.value.fields.forEach((l05, index) => {
                            if (
                              index < 3 &&
                              !disb &&
                              l05.type === 'TableValue' &&
                              (l05.value.type === 'StringLiteral' ||
                                l05.value.type === 'NumericLiteral')
                            ) {
                              addVault(
                                character,
                                server,
                                'v1',
                                l05.value.value,
                              );
                            } else {
                              disb = true;
                            }
                          });
                        }
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    }

    return {
      insArr,
      charData,
    };
  } catch (e) {
    console.error('Error parsing Lua file:', e);
    return null;
  }
}
