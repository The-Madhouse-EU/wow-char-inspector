import React, {
  ElementRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  CMap,
  Grid,
  IOCheckmarkDone,
  IOChevronDown,
  IOChevronForward,
  IOChevronUp,
  IOClose,
  IODice,
  IOGlobe,
  IOTime,
  LocalStorage,
  PortalStepper,
  Tooltip,
  useQData,
} from '@grandlinex/react-components';
import moment from 'moment';

import { toast } from 'react-toastify';
import getColorCode from '@/tools/ColorUtil';
import { Character, PreloadData } from '@/lib';
import columnList, { TableColumn } from '@/columns';
import DiffMap from '@/tools/DiffMap';

moment.locale('de');

export type AppRefType = ElementRef<typeof App>;
export type AppParentFunction = {
  update(): void;
};

const App = forwardRef<
  AppParentFunction,
  {
    preload: PreloadData;
    reloadPreload: () => void;
  }
>(({ preload, reloadPreload }, ref) => {
  const [search, setSearch] = useState('');

  const [colFilter, setColFilter] = useState<string[]>(
    LocalStorage.jsonLoad<string[]>('filter') || columnList.map((e) => e.key),
  );

  const [mode, setMode] = useState<'all' | 'weekly' | 'instance'>('all');

  const modeColFilter = useMemo(() => {
    if (mode === 'all') {
      return colFilter;
    }
    if (mode === 'weekly') {
      return [
        'name',
        'server',
        'class',
        ...colFilter.filter((e) => !!preload.weekly.find((j) => j.e_id === e)),
      ];
    }
    return [
      'name',
      'server',
      'class',
      ...colFilter.filter((e) => !!preload.instanzen.find((j) => j.e_id === e)),
    ];
  }, [mode, colFilter, preload]);

  const colList = useMemo(() => {
    return [
      ...columnList.map((e) => ({
        key: e.key,
        type: 0,
        title: e.title,
        mod: 0,
      })),
      ...preload.weekly.map((e) => ({
        key: e.e_id,
        type: 1,
        title: `(W) ${e.anzeige_text}`,
        mod: 0,
      })),
      ...preload.instanzen.map((e) => ({
        key: e.e_id,
        type: 2,
        title: `(${e.instance_type === 'Raid' ? 'R' : 'D'}) ${e.e_id}`,
        mod: e.expansion,
      })),
    ];
  }, [preload.instanzen, preload.weekly]);

  const [data, , reload] = useQData<{
    chars: Character[];
    missing: Character[];
    classOverview: { id: any; max: any; total: any }[];
    raceOverview: { id: any; max: any; total: any }[];
  }>(async () => {
    return window.glxApi.invoke('get-info', { preload: true });
  });

  const [config, , reloadConfig] = useQData(async () => {
    const folder = await window.glxApi.coreFunctions.getConfig({
      key: 'profile-folder',
    });

    const addon = await window.glxApi.invoke<{
      siAddon: boolean;
      mhAddon: boolean;
    }>('test-wtf');

    if (!folder) {
      toast.dark('Es ist kein WoW-Ordner ausgewählt.');
    }

    return {
      profileFolder: folder?.c_value || '',
      addon,
    };
  });

  useImperativeHandle(ref, () => ({
    update: () => {
      reload();
    },
  }));

  const totals = useMemo(() => {
    const maxRio =
      data?.chars
        ?.map((e) => e.meta.raw?.mp ?? 0)
        .reduce((a, b) => Math.max(a, b), 0) ?? 0;
    const maxIlv =
      data?.chars
        ?.map((e) => e.meta.raw?.il ?? 0)
        .reduce((a, b) => Math.max(a, b), 0) ?? 0;

    const goldSum =
      data?.chars
        ?.map((e) => e.meta.raw?.money ?? 0)
        .reduce((a, b) => a + b, 0) ?? 0;

    let gold;
    const g = Math.trunc((goldSum || 0) / 10000);
    if (g > 1000000) {
      gold = `${Math.trunc(g / 1000000)} M`;
    } else if (g > 1000) {
      gold = `${Math.trunc(g / 1000)} K`;
    } else {
      gold = g.toString();
    }

    const timewalk =
      data?.chars
        .map((e) => e.meta.raw?.currency['1166'] ?? 0)
        .reduce((a, b) => a + b, 0) ?? 0;
    const playtimeSum =
      data?.chars
        .map((e) => e.meta.raw?.playedTotal ?? 0)
        .reduce((a, b) => a + b, 0) ?? 0;

    const playtime = moment.duration(playtimeSum, 'second').asDays().toFixed(2);
    return {
      gold,
      timewalk,
      playtime,
      maxRio,
      maxIlv,
    };
  }, [data]);

  const map = useMemo(() => {
    const classList = new CMap<string, string>(preload?.classList || []);
    classList.set('Horde', '#c22222');
    classList.set('Allianz', '#2828d0');
    return classList;
  }, [preload]);

  const charFilter = useMemo(() => {
    if (!data?.chars) return [];
    const lower = search.toLowerCase();
    return data.chars.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.faction.toLowerCase().includes(lower) ||
        c.playerClass.toLowerCase().includes(lower) ||
        c.rase.toLowerCase().includes(lower) ||
        c.level.toString().includes(lower) ||
        c.server.toLowerCase().includes(lower) ||
        (c.meta.raw && c.meta.raw.spec.toLowerCase().includes(lower)),
    );
  }, [data, search]);

  const [sort, setSort] = useState<{ key: string; order: 'ASC' | 'DSC' }>({
    key: 'level',
    order: 'DSC',
  });

  const getColumn = useCallback<(key: string) => TableColumn>(
    (key: string) => {
      const baseField = columnList.find((e) => e.key === key);
      if (baseField) {
        return baseField;
      }
      const weeklyField = preload.weekly.find((e) => e.e_id === key);

      if (weeklyField) {
        return {
          key,
          title: (
            <Tooltip position="bottom" text={weeklyField.note}>
              {weeklyField.anzeige_text}
            </Tooltip>
          ),
          render: (char) =>
            char.meta.weekly?.find((e) => e.key === key)?.completed ? (
              <Grid flex flexR hCenter style={{ color: 'green' }}>
                <IOCheckmarkDone />
              </Grid>
            ) : (
              <Grid flex flexR hCenter style={{ color: 'red' }}>
                <IOClose />
              </Grid>
            ),
          sort: (a, b) => {
            const ax =
              a.meta.weekly?.find((e) => e.key === key)?.completed || false;
            const bx =
              b.meta.weekly?.find((e) => e.key === key)?.completed || false;
            console.log(key, ax, bx);
            if (ax === bx) return 0;
            if (ax) return 1;
            return -1;
          },
        };
      }
      const instanceField = preload.instanzen.find((e) => e.e_id === key);

      if (instanceField) {
        return {
          key,
          title: (
            <Tooltip position="bottom" text={instanceField.instance_type}>
              {instanceField.e_id}
            </Tooltip>
          ),
          render: (char) => (
            <Grid flex flexR hCenter style={{ color: 'green' }}>
              {char.meta.instances
                ?.find((e) => e.instance === key)
                ?.difficulties.map((d) => DiffMap.get(d)) || (
                <span style={{ color: 'red' }}>frei</span>
              )}
            </Grid>
          ),
          sort: (a, b) => {
            const ax =
              a.meta.instances?.find((e) => e.instance === key)?.difficulties
                .length || 0;
            const bx =
              b.meta.instances?.find((e) => e.instance === key)?.difficulties
                .length || 0;
            return ax - bx;
          },
        };
      }

      return {
        key,
        title: `Missing ${key}`,
        render: () => <>NOT DEFINED</>,
      };
    },
    [preload.instanzen, preload.weekly],
  );

  const sortData = useMemo(() => {
    const sf = getColumn(sort.key);

    if ((sort.key === 'level' && sort.order === 'DSC') || !sf || !sf.sort) {
      return charFilter;
    }

    if (sort.order === 'DSC') {
      return charFilter.toSorted(sf.sort).toReversed();
    }

    return charFilter.toSorted(sf.sort);
  }, [charFilter, getColumn, sort.key, sort.order]);

  if (!data || !preload || !config) {
    return <div>Loading...</div>;
  }

  return (
    <Grid flex flexC className="app" gap={24}>
      <h2>Übersicht</h2>

      <PortalStepper
        offset={150}
        className="stepper"
        collapse
        conf={[
          {
            key: 'settings',
            name: 'Einstellungen',
            collapsed: !!config?.profileFolder,
            render: (
              <>
                <Grid flex flexR gap={24}>
                  <Grid flex flexC>
                    World of Warcraft Ordner:
                    <pre>{config?.profileFolder}</pre>
                    <Button
                      onClick={() => {
                        window.glxApi.invoke('set-config-folder').then(() => {
                          reloadConfig();
                          reloadPreload();
                          reload();
                        });
                      }}
                    >
                      Auswählens
                    </Button>
                  </Grid>
                  <Grid flex flexC style={{ fontSize: '24px' }}>
                    <b>
                      MadhousePack Addon:{' '}
                      {config?.addon.mhAddon ? (
                        <span style={{ color: 'green' }}>JA</span>
                      ) : (
                        <span style={{ color: 'red' }}>Nein</span>
                      )}
                    </b>
                    <b>
                      SavedInstances Addon:{' '}
                      {config?.addon.siAddon ? (
                        <span style={{ color: 'green' }}>JA</span>
                      ) : (
                        <span style={{ color: 'red' }}>Nein</span>
                      )}
                    </b>
                  </Grid>
                </Grid>
                <pre
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '8px',
                    fontSize: '18px',
                    color: 'gold',
                  }}
                >
                  <b>Wichtig:</b>
                  <br />
                  Die App benötigt mindestens das 'MadhousePack Addon', und
                  optional 'SavedInstances Addon' für Instanzen und wöchentliche
                  quests.
                </pre>
              </>
            ),
          },
          {
            key: 'totals',
            name: 'Statistiken',
            collapse: false,
            render: (
              <Grid
                flex
                flexR
                gap={24}
                className="glx-py-12"
                flexWrap
                style={{ fontSize: '24px' }}
              >
                <Grid flex flexR style={{ color: 'gold' }}>
                  <b>
                    <span className="gold-img" /> Gesamt: {totals.gold}
                  </b>
                </Grid>
                <Grid flex flexR style={{ color: 'lightblue' }} gap={8}>
                  <span className="timewalk-img" />{' '}
                  <b>Zeitwanderungs Abzeichen: {totals.timewalk}</b>
                </Grid>
                <Grid flex flexR gap={8}>
                  <b>Spielzeit in Tagen: {totals.playtime}</b>
                </Grid>
                <Grid flex flexR gap={8}>
                  <b>
                    Höchste M+ Wertung:{' '}
                    <span
                      style={{
                        color: getColorCode(totals.maxRio),
                      }}
                    >
                      {totals.maxRio}
                    </span>
                  </b>
                </Grid>
                <Grid flex flexR gap={8}>
                  <b>
                    Höchstes Item Level:{' '}
                    <span
                      style={{
                        color: getColorCode(totals.maxIlv, 670, 600),
                      }}
                    >
                      {totals.maxIlv.toFixed(0)}
                    </span>
                  </b>
                </Grid>
              </Grid>
            ),
          },
          {
            key: 'table',
            name: 'Tabellen Einstellungen',
            collapsed: true,
            render: (
              <Grid flex flexC gap={24} className="glx-py-12" flexWrap>
                <h5>Ausgewählt</h5>
                <Grid flex flexR gap={4} flexWrap>
                  {colList
                    .filter((e) => colFilter.includes(e.key))
                    .map((c) => (
                      <button
                        type="button"
                        className="col-filter-button"
                        onClick={() => {
                          if (colFilter.length > 1) {
                            const list = colFilter.filter((e) => e !== c.key);
                            LocalStorage.jsonSave<string[]>('filter', list);
                            setColFilter(list);
                          }
                        }}
                      >
                        <Grid flex flexR gap={4} center>
                          {c.title}
                        </Grid>
                      </button>
                    ))}
                </Grid>
                <h5>Verfügbar - Allgemein</h5>
                <Grid flex flexR gap={4} flexWrap>
                  {colList
                    .filter((e) => e.type === 0 && !colFilter.includes(e.key))
                    .map((c) => (
                      <button
                        type="button"
                        className="col-filter-button"
                        onClick={() => {
                          const list = [...colFilter, c.key];
                          LocalStorage.jsonSave<string[]>('filter', list);
                          setColFilter(list);
                        }}
                      >
                        <Grid flex flexR gap={4} center>
                          {c.title}
                        </Grid>
                      </button>
                    ))}
                </Grid>

                <h5>Verfügbar - Weekly</h5>
                <Grid flex flexR gap={4} flexWrap>
                  {colList
                    .filter((e) => e.type === 1 && !colFilter.includes(e.key))
                    .map((c) => (
                      <button
                        type="button"
                        className="col-filter-button"
                        onClick={() => {
                          const list = [...colFilter, c.key];
                          LocalStorage.jsonSave<string[]>('filter', list);
                          setColFilter(list);
                        }}
                      >
                        <Grid flex flexR gap={4} center>
                          {c.title}
                        </Grid>
                      </button>
                    ))}
                </Grid>
                {[
                  {
                    x: 0,
                    name: 'Classic',
                  },
                  {
                    x: 1,
                    name: 'Burning Crusade',
                  },
                  {
                    x: 2,
                    name: 'WotLK',
                  },
                  {
                    x: 3,
                    name: 'Cata',
                  },
                  {
                    x: 4,
                    name: 'MoP',
                  },
                  {
                    x: 5,
                    name: 'WoD',
                  },
                  {
                    x: 6,
                    name: 'Legion',
                  },
                  {
                    x: 7,
                    name: 'BfA',
                  },
                  {
                    x: 8,
                    name: 'Shadowlands',
                  },
                  {
                    x: 9,
                    name: 'Dragonflight',
                  },
                  {
                    x: 10,
                    name: 'The War Within',
                  },
                ]
                  .toReversed()
                  .map(({ x, name }) => (
                    <>
                      <h5>Instanzen - {name}</h5>
                      <Grid flex flexR gap={4} flexWrap>
                        {colList
                          .filter(
                            (e) =>
                              e.type === 2 &&
                              e.mod === x &&
                              !colFilter.includes(e.key),
                          )
                          .map((c) => (
                            <button
                              type="button"
                              className="col-filter-button"
                              onClick={() => {
                                const list = [...colFilter, c.key];
                                LocalStorage.jsonSave<string[]>('filter', list);
                                setColFilter(list);
                              }}
                            >
                              <Grid flex flexR gap={4} center>
                                {c.title}
                              </Grid>
                            </button>
                          ))}
                      </Grid>
                    </>
                  ))}
              </Grid>
            ),
          },
          {
            key: 'chars',
            name: `Charaktere (${charFilter.length})`,
            render: (
              <>
                <Grid flex flexR className="glx-mb-12" gap={8} vCenter>
                  <input
                    className="search-field"
                    type="text"
                    placeholder="Filter/Suche (Name,Server,Klasse,Rasse,Level,Fraktion)"
                    style={{ width: 400 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search !== '' && (
                    <button onClick={() => setSearch('')}>
                      <IOClose />
                    </button>
                  )}
                  <div>Ansichten:</div>
                  <Tooltip text="Alle Elemente Anzeigen">
                    <button
                      type="button"
                      disabled={mode === 'all'}
                      onClick={() => setMode('all')}
                    >
                      <IOGlobe />
                    </button>
                  </Tooltip>
                  <Tooltip text="Nur Weeklys anzeigen">
                    <button
                      type="button"
                      disabled={mode === 'weekly'}
                      onClick={() => setMode('weekly')}
                    >
                      <IOTime />
                    </button>
                  </Tooltip>
                  <Tooltip text="Nur Instanzen anzeigen">
                    <button
                      type="button"
                      disabled={mode === 'instance'}
                      onClick={() => setMode('instance')}
                    >
                      <IODice />
                    </button>
                  </Tooltip>
                </Grid>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {colList
                          .filter((e) => modeColFilter.includes(e.key))
                          .map((e) => getColumn(e.key))
                          .map((col) => (
                            <th
                              onClick={(e) => {
                                e.preventDefault();
                                if (col.sort) {
                                  if (
                                    sort.key !== col.key ||
                                    sort.order === 'DSC'
                                  ) {
                                    setSort({
                                      key: col.key,
                                      order: 'ASC',
                                    });
                                  } else {
                                    setSort({
                                      key: col.key,
                                      order: 'DSC',
                                    });
                                  }
                                }
                              }}
                            >
                              <Grid
                                flex
                                flexR
                                center
                                gap={4}
                                className={[[!!col.sort, 'can-sort']]}
                              >
                                {col.title}
                                {col.key === sort.key &&
                                  sort.order === 'DSC' && <IOChevronUp />}
                                {col.key === sort.key &&
                                  sort.order === 'ASC' && <IOChevronDown />}
                                {col.key !== sort.key && (
                                  <span className="hover-sort">
                                    <IOChevronDown />
                                  </span>
                                )}
                                {col.key !== sort.key && (
                                  <span className="pending-sort">
                                    <IOChevronForward />
                                  </span>
                                )}
                              </Grid>
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortData.map((char) => (
                        <tr>
                          {colList
                            .filter((e) => modeColFilter.includes(e.key))
                            .map((e) => getColumn(e.key))
                            .map((col) => (
                              <td style={col.style}>{col.render(char, map)}</td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ),
          },
          {
            key: 'klassandrass',
            name: 'Klassen & Rassen',
            render: (
              <Grid flex flexR className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Anzahl</th>
                      <th>Anzahl - Lvl. 80</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.raceOverview.map(({ id, max, total }) => (
                      <tr>
                        <td>{id}</td>
                        <td>{total}</td>
                        <td
                          style={{
                            color: max > 0 ? 'green' : 'red',
                          }}
                        >
                          {max}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Anzahl</th>
                      <th>Anzahl - Lvl. 80</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.classOverview.map(({ id, max, total }) => (
                      <tr>
                        <td
                          style={{
                            color: map.get(id),
                          }}
                        >
                          {id}
                        </td>
                        <td>{total}</td>
                        <td
                          style={{
                            color: max > 0 ? 'green' : 'red',
                          }}
                        >
                          {max}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Grid>
            ),
          },
          {
            key: 'level',
            name: `Level Liste (${data.missing.length})`,
            render: (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Server</th>
                    <th>Level</th>
                    <th>Klasse</th>
                    <th>Rasse</th>
                    <th>Fraktion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.missing.map(
                    ({ name, server, level, playerClass, rase, faction }) => (
                      <tr>
                        <td>{name}</td>
                        <td>{server}</td>
                        <td
                          style={{
                            color: getColorCode(level, 80),
                          }}
                        >
                          {level}
                        </td>
                        <td
                          style={{
                            color: map.get(playerClass),
                          }}
                        >
                          {playerClass}
                        </td>
                        <td>{rase}</td>
                        <td
                          style={{
                            color: map.get(faction),
                          }}
                        >
                          {faction}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            ),
          },
        ]}
      />
    </Grid>
  );
});

export default App;
