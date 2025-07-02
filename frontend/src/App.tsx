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
  CheckBox,
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
  Tooltip,
  useQData,
} from '@grandlinex/react-components';
import moment from 'moment';

import { toast } from 'react-toastify';
import { DataType, PreloadData } from '@/lib';
import columnList, { TableColumn } from '@/columns';
import DiffMap from '@/tools/DiffMap';
import LevelChars from '@/component/LevelChars';
import ClassRace from '@/component/ClassRace';
import Statistics from '@/component/Statistics';
import AppContext, {
  AppContextData,
  DefaultContextData,
} from '@/context/AppContext';
import { Instance, Raid, Weekly } from '@/component/Ico';
import { MainFrame, MainFrameItem } from '@/component/MainFrame';
import InfoBox from '@/component/InfoBox';
import FilterPage from '@/component/FilterPage';

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
  const [onlyMax, setOnlyMax] = useState<boolean>(
    LocalStorage.flagLoad('max-only'),
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
        icon: e.icon,
        mod: 0,
      })),
      ...preload.weekly.map((e) => ({
        key: e.e_id,
        type: 1,
        title: e.anzeige_text,
        icon: <Weekly />,
        mod: 0,
      })),
      ...preload.instanzen.map((e) => ({
        key: e.e_id,
        type: 2,
        title: e.e_id,
        icon: e.instance_type === 'Raid' ? <Raid /> : <Instance />,
        mod: e.expansion,
      })),
    ];
  }, [preload.instanzen, preload.weekly]);

  const [data, , reload] = useQData<DataType>(async () => {
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

  const classMap = useMemo(() => {
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
        (!onlyMax || c.level === 80) &&
        (c.name.toLowerCase().includes(lower) ||
          c.faction.toLowerCase().includes(lower) ||
          c.playerClass.toLowerCase().includes(lower) ||
          c.rase.toLowerCase().includes(lower) ||
          c.level.toString().includes(lower) ||
          c.server.toLowerCase().includes(lower) ||
          (c.meta.raw && c.meta.raw.spec.toLowerCase().includes(lower))),
    );
  }, [data, search, onlyMax]);

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
              <Grid flex flexR vCenter gap={4}>
                <Weekly />
                {weeklyField.anzeige_text}
              </Grid>
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
              <Grid flex flexR vCenter gap={4}>
                {instanceField.instance_type === 'Raid' ? (
                  <Raid />
                ) : (
                  <Instance />
                )}
                {instanceField.e_id}
              </Grid>
            </Tooltip>
          ),
          render: (char) => (
            <Grid flex flexR hCenter style={{ color: 'green' }}>
              {char.meta.instances
                ?.find((e) => e.instance === key)
                ?.difficulties.map((d) => DiffMap.get(d))
                .join(' + ') || <span style={{ color: 'red' }}>frei</span>}
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

  const contextData = useMemo<AppContextData>(
    () =>
      data
        ? {
            data,
            classMap,
          }
        : DefaultContextData,
    [classMap, data],
  );

  if (!data || !preload || !config) {
    return <div>Loading...</div>;
  }

  return (
    <AppContext.Provider value={contextData}>
      <MainFrame defaultFrame={!config?.profileFolder ? 'settings' : 'home'}>
        <MainFrameItem frameKey="home" name="Home" icon="IOHome">
          <Grid flex flexC className="app" gap={24}>
            <h2>Übersicht</h2>
            <Statistics />
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
                <Grid flex flexR vCenter gap={4}>
                  <CheckBox
                    checked={onlyMax}
                    onChange={(e) => {
                      setOnlyMax(e);
                      LocalStorage.flagSave('max-only', e);
                    }}
                  />
                  <span>Nur Max-Level Chars |</span>
                </Grid>
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
                              {col.icon}
                              {col.title}
                              {col.key === sort.key && sort.order === 'DSC' && (
                                <IOChevronUp />
                              )}
                              {col.key === sort.key && sort.order === 'ASC' && (
                                <IOChevronDown />
                              )}
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
                            <td style={col.style}>
                              {col.render(char, classMap)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          </Grid>
        </MainFrameItem>
        <MainFrameItem
          frameKey="config"
          name="Tabellen Einstellungen"
          icon="IOGrid"
        >
          <FilterPage
            colList={colList}
            colFilter={colFilter}
            setColFilter={setColFilter}
          />
        </MainFrameItem>
        <MainFrameItem frameKey="class" name="Klassen Liste" icon="IOPeople">
          <h2>Klassen Übersicht</h2>
          <ClassRace />
        </MainFrameItem>
        <MainFrameItem frameKey="level" name="Level Liste" icon="IOArrowUp">
          <h2>Level Liste </h2>
          <InfoBox>
            <b>Level Übersicht:</b>
            <br />
            Die Level Übersicht zeigt welche Charaktere gelevelt werden müssen
            um alle Klassen und Rassen auf Max-Level zu bringen.
          </InfoBox>
          <LevelChars />
        </MainFrameItem>
        <MainFrameItem
          frameKey="settings"
          name="Einstellungen"
          icon="IOSettings"
        >
          <>
            <h2>Einstellungen</h2>
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
                  App Version:{' '}
                  <span style={{ color: 'var(--glx-main-contrast)' }}>
                    {preload.appVersion}
                  </span>
                </b>
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
            <InfoBox>
              <b>Wichtig:</b>
              <br />
              Die App benötigt mindestens das 'MadhousePack Addon', und optional
              'SavedInstances Addon' für Instanzen und wöchentliche quests.
            </InfoBox>
          </>
        </MainFrameItem>
      </MainFrame>
    </AppContext.Provider>
  );
});

export default App;
