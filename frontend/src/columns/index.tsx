import React, { CSSProperties } from 'react';
import { Grid, Tooltip } from '@grandlinex/react-components';
import moment from 'moment';
import { Character, CharMeta } from '@/lib';
import { external } from '@/tools/External';
import getColorCode from '@/tools/ColorUtil';

function shortenKey(kesStr?: string) {
  if (!kesStr) return '-';
  try {
    return kesStr.substring(kesStr.indexOf(':') + 2);
  } catch (e) {
    return '-';
  }
}

export type TableColumn = {
  key: string;
  title: React.ReactNode;
  render: (char: Character, colorMap: Map<string, string>) => React.ReactNode;
  style?: CSSProperties;
  sort?: (a: Character, b: Character) => number;
};

// #################################### SORT #################################################################
const strSort = (key: keyof Omit<Character, 'level' | 'meta'>) => {
  return (a: Character, b: Character) => a[key].localeCompare(b[key]);
};
const intSort = (key: keyof Pick<Character, 'level'>) => {
  return (a: Character, b: Character) => a[key] - b[key];
};

const strMetaSort = (
  key: keyof Pick<
    CharMeta,
    'spec' | 'mpKey' | 'zone' | 'guildName' | 'guildRankName'
  >,
) => {
  return (a: Character, b: Character) => {
    const ax = a.meta.raw?.[key] || '';
    const bx = b.meta.raw?.[key] || '';
    return ax.localeCompare(bx);
  };
};

const intMetaSort = (
  key: keyof Pick<CharMeta, 'il' | 'mp' | 'money' | 'playedTotal' | 'lastSeen'>,
) => {
  return (a: Character, b: Character) => {
    const ax = a.meta.raw?.[key] || -1;
    const bx = b.meta.raw?.[key] || -1;
    return ax - bx;
  };
};
// #################################### COLUM DEF ##############################################################
const columnList: TableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    render: ({ name }) => name,
    sort: strSort('name'),
  },
  {
    key: 'server',
    title: 'Server',
    render: ({ server }) => server,
    sort: strSort('name'),
  },
  {
    key: 'link',
    title: 'Links',
    render: ({ name, server }) => (
      <Grid flex flexR gap={2} className="button-row">
        <Tooltip text="WoW Armory">
          <span
            onClick={() => external(name, server, 'armory')}
            className="armory-img"
          />
        </Tooltip>
        <Tooltip text="Raider.io">
          <span
            onClick={() => external(name, server, 'rio')}
            className="rio-img"
          />
        </Tooltip>
        <Tooltip text="Warcraft Logs">
          <span
            onClick={() => external(name, server, 'wLogs')}
            className="logs-img"
          />
        </Tooltip>
        <Tooltip text="Raidbots">
          <span
            onClick={() => external(name, server, 'rBots')}
            className="raidbots-img"
          />
        </Tooltip>
        <Tooltip text="Simple Armory">
          <span
            onClick={() => external(name, server, 'sArmory')}
            className="s-armory-img"
          />
        </Tooltip>
      </Grid>
    ),
  },
  {
    key: 'level',
    title: 'Level',
    render: ({ level }) => (
      <span style={{ color: getColorCode(level, 80) }}>{level}</span>
    ),
    sort: intSort('level'),
  },
  {
    key: 'class',
    title: 'Klasse',
    render: ({ playerClass }, colorMap) => (
      <span style={{ color: colorMap.get(playerClass) }}>{playerClass}</span>
    ),
    sort: strSort('playerClass'),
  },
  {
    key: 'spec',
    title: 'Spec',
    render: ({ meta }) => meta.raw?.spec || '-',
    sort: strMetaSort('spec'),
  },
  {
    key: 'race',
    title: 'Rasse',
    render: ({ rase }) => rase,
    sort: strSort('rase'),
  },
  {
    key: 'faction',
    title: 'Fraktion',
    render: ({ faction }, colorMap) => (
      <span style={{ color: colorMap.get(faction) }}>{faction}</span>
    ),
    sort: strSort('faction'),
  },
  {
    key: 'ilevel',
    title: 'Item Level',
    render: ({ meta }) => (
      <span
        style={{
          color: getColorCode(meta.raw?.il || 0, 670, 600),
        }}
      >
        {meta.raw?.il.toFixed(1) || '?'}
      </span>
    ),
    sort: intMetaSort('il'),
  },
  {
    key: 'mrating',
    title: 'M+ Wertung',
    render: ({ meta }) => (
      <span
        style={{
          color: getColorCode(meta.raw?.mp || 0),
        }}
      >
        {meta.raw?.mp.toFixed(1) || '?'}
      </span>
    ),
    sort: intMetaSort('mp'),
  },
  {
    key: 'mkey',
    title: 'M+ Key',
    render: ({ meta }) => {
      if (!meta.raw) {
        return shortenKey();
      }
      if (
        meta.raw.mpKeyTimeOut > 0 &&
        moment.unix(meta.raw.mpKeyTimeOut).isBefore(moment())
      ) {
        return (
          <span style={{ color: 'gray' }}>{shortenKey(meta.raw.mpKey)}</span>
        );
      }
      return shortenKey(meta.raw.mpKey);
    },
    sort: strMetaSort('mpKey'),
  },
  {
    key: 'gold',
    title: (
      <>
        <span className="gold-img" />
        Gold
      </>
    ),
    render: ({ meta }) => {
      const g = Math.trunc((meta.raw?.money || 0) / 10000);
      if (g > 1000000) {
        return `${Math.trunc(g / 1000000)} M`;
      }
      if (g > 1000) {
        return `${Math.trunc(g / 1000)} K`;
      }
      return g;
    },
    style: {
      color: 'gold',
    },
    sort: intMetaSort('money'),
  },
  {
    key: 'tw-coin',
    title: (
      <>
        <span className="timewalk-img" />
        TW Marken
      </>
    ),
    render: ({ meta }) => meta.raw?.currency['1166'] ?? '?',
    style: { color: 'lightblue' },
  },
  {
    key: 'delve-key',
    title: (
      <>
        <span className="key-img" /> Delve Key
      </>
    ),
    render: ({ meta }) => meta.raw?.currency['3028'] ?? '?',
    style: { color: '#a86537' },
  },
  {
    key: 'vault_dungeon',
    title: 'Vault/M+',
    render: ({ meta }) => (
      <Grid flex flexR gap={4} className="button-row">
        <div>{meta.vault?.v1.map((e) => e?.toString() ?? '').join(', ')}</div>
      </Grid>
    ),
  },
  {
    key: 'vault_raid',
    title: 'Vault/Raid',
    render: ({ meta }) => (
      <Grid flex flexR gap={4} className="button-row">
        <div>{meta.vault?.v2.map((e) => e?.toString() ?? '').join(', ')}</div>
      </Grid>
    ),
  },
  {
    key: 'vault_delve',
    title: 'Vault/Delve',
    render: ({ meta }) => (
      <Grid flex flexR gap={4} className="button-row">
        <div>{meta.vault?.v3.map((e) => e?.toString() ?? '').join(', ')}</div>
      </Grid>
    ),
  },
  {
    key: 'armor',
    title: 'Rassen Rüstung',
    render: ({ meta }) =>
      meta.raw?.heritageArmor ? (
        <span style={{ color: 'green' }}>Ja</span>
      ) : (
        'Nein'
      ),
  },
  {
    key: 'rested',
    title: 'Ausgeruht',
    render: ({ meta }) =>
      meta.raw?.resting ? (
        <span style={{ color: 'green' }}>Ausgeruht</span>
      ) : (
        '-'
      ),
  },
  {
    key: 'zone',
    title: 'Standort',
    render: ({ meta }) => meta.raw?.zone || '?',
    sort: strMetaSort('zone'),
  },
  {
    key: 'wm',
    title: 'War Mode',
    render: ({ meta }) =>
      meta.raw?.warMode ? <span style={{ color: 'green' }}>An</span> : '-',
  },
  {
    key: 'gild',
    title: 'Gilde',
    render: ({ meta }) =>
      meta.raw?.guildName === 'none' ? (
        <span style={{ color: 'gray' }}>keine</span>
      ) : (
        meta.raw?.guildName
      ),
    sort: strMetaSort('guildName'),
  },
  {
    key: 'playtime',
    title: 'Spielzeit/Tage',
    render: ({ meta }) =>
      moment
        .duration(meta.raw?.playedTotal || 0, 'second')
        .asDays()
        .toFixed(2),
    sort: intMetaSort('playedTotal'),
  },
  {
    key: 'last-seen',
    title: 'Zuletzt Online/Tage',
    render: ({ meta }) =>
      meta.raw?.lastSeen
        ? moment
            .duration(
              moment().diff(moment(meta.raw.lastSeen * 1000), 'second'),
              'second',
            )
            .humanize({})
        : '??',
    sort: intMetaSort('lastSeen'),
  },
  ...[
    ['prof1', 'Beruf 1'],
    ['prof2', 'Beruf 2'],
    ['cooking', 'Kochkunst'],
    ['archaeology', 'Archäologie'],
    ['fishing', 'Angeln'],
  ].map<TableColumn>(([key, name]) => ({
    key,
    title: name,
    render: ({ meta }) => {
      const prof = meta.raw?.profession.find((e) => e.type === key);
      if (!prof) return <span style={{ color: 'gray' }}>Nicht Erlernt</span>;
      return (
        <span>
          {prof.name} ({prof.skillLevel}/{prof.maxSkillLevel})
        </span>
      );
    },
  })),
];

export default columnList;
