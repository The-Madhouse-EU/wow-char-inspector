import React, { useMemo, useState } from 'react';
import {
  PortalStepper,
  Form,
  Grid,
  InputOptionType,
  LocalStorage,
  PortStepperConf,
} from '@grandlinex/react-components';
import InfoBox from '@/component/InfoBox';

const stList = [
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
];
export default function FilterPage({
  colList,
  colFilter,
  setColFilter,
}: {
  colList: {
    key: string;
    type: number;
    title: React.ReactNode | string;
    icon: React.ReactNode | React.JSX.Element;
    mod: number;
  }[];
  colFilter: string[];
  setColFilter: (list: string[]) => void;
}) {
  const [filterSearch, setFilterSearch] = useState('');
  const colX = useMemo(() => {
    if (!filterSearch || filterSearch === '') {
      return colList;
    }
    const lower = filterSearch.toLowerCase();
    return colList.filter((c) => {
      return (
        (typeof c.title === 'string'
          ? c.title.toLowerCase().includes(lower)
          : false) || c.key.toLowerCase().includes(lower)
      );
    });
  }, [colList, filterSearch]);
  const data = useMemo(() => {
    return {
      selected: colX.filter((e) => colFilter.includes(e.key)),
      general: colX.filter((e) => e.type === 0 && !colFilter.includes(e.key)),
      weekly: colX.filter((e) => e.type === 1 && !colFilter.includes(e.key)),
      expansion: stList.toReversed().map((x) => ({
        ...x,
        list: colX.filter(
          (e) => e.type === 2 && e.mod === x.x && !colFilter.includes(e.key),
        ),
      })),
    };
  }, [colFilter, colX]);
  return (
    <PortalStepper
      offset={50}
      conf={[
        {
          key: 'filter',
          name: 'Filter',
          render: (
            <>
              {' '}
              <InfoBox>
                <b>
                  Hier können die Spalten für die Tabelle ein und ausgeblendet
                  werden
                </b>
              </InfoBox>
              <Form
                defaultState={{
                  search: filterSearch,
                }}
                options={[
                  [
                    {
                      key: 'search',
                      label: 'Filter',
                      type: InputOptionType.TEXT,
                      decorationType: 'box',
                    },
                  ],
                ]}
                onChange={({ form }) => {
                  setFilterSearch(form.search);
                }}
              />
            </>
          ),
        },
        {
          key: 'select',
          name: 'Ausgewählt',
          hidden: data.selected.length === 0,
          render: (
            <Grid flex flexR gap={4} flexWrap>
              {data.selected.map((c) => (
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
                    {c.icon}
                    {c.title}
                  </Grid>
                </button>
              ))}
            </Grid>
          ),
        },
        {
          key: 'general',
          name: 'Allgemein',
          hidden: data.general.length === 0,
          render: (
            <Grid flex flexR gap={4} flexWrap>
              {data.general.map((c) => (
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
                    {c.icon}
                    {c.title}
                  </Grid>
                </button>
              ))}
            </Grid>
          ),
        },
        {
          key: 'weekly',
          name: 'Weekly',
          hidden: data.weekly.length === 0,
          render: (
            <Grid flex flexR gap={4} flexWrap>
              {data.weekly.map((c) => (
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
                    {c.icon}
                    {c.title}
                  </Grid>
                </button>
              ))}
            </Grid>
          ),
        },
        ...data.expansion.map<PortStepperConf>(({ x, name, list }) => ({
          key: `expansion-${x}`,
          name: `${name}`,
          hidden: list.length === 0,
          render: (
            <Grid flex flexR gap={4} flexWrap>
              {list.map((c) => (
                <button
                  type="button"
                  className="col-filter-button"
                  onClick={() => {
                    const l = [...colFilter, c.key];
                    LocalStorage.jsonSave<string[]>('filter', l);
                    setColFilter(l);
                  }}
                >
                  <Grid flex flexR gap={4} center>
                    {c.icon}
                    {c.title}
                  </Grid>
                </button>
              ))}
            </Grid>
          ),
        })),
      ]}
    />
  );
}
