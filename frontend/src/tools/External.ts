export type CharLinkType = 'rio' | 'wLogs' | 'armory' | 'rBots' | 'sArmory';
export function CharacterLinks(
  type: CharLinkType,
  name: string,
  server: string,
) {
  switch (type) {
    case 'rio':
      return `https://raider.io/characters/eu/${server}/${name}`;
    case 'wLogs':
      return `https://www.warcraftlogs.com/character/EU/${server}/${name}`;
    case 'armory':
      return `https://worldofwarcraft.blizzard.com/de-de/character/eu/${server}/${name}`;
    case 'sArmory':
      return `https://simplearmory.com/#/eu/${server}/${name}`;
    case 'rBots':
      return `https://www.raidbots.com/simbot/stats?region=eu&realm=${
        server
      }&name=${name}`;
    default:
      return '#';
  }
}

export const external = (name: string, server: string, type: CharLinkType) =>
  window.glxApi.coreFunctions.openExternal({
    external: true,
    url: CharacterLinks(type, name, server),
  });
