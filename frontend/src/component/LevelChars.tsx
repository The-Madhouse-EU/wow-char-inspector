import React from 'react';
import { Table } from '@grandlinex/react-components';
import getColorCode from '@/tools/ColorUtil';
import { useAppContext } from '@/context/AppContext';

export default function LevelChars() {
  const { data, classMap } = useAppContext();
  return (
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
                  color: classMap.get(playerClass),
                }}
              >
                {playerClass}
              </td>
              <td>{rase}</td>
              <td
                style={{
                  color: classMap.get(faction),
                }}
              >
                {faction}
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}

// TODO: Use this later
export function LevelCharsV2() {
  const { data } = useAppContext();
  return (
    <Table
      key="level-chars"
      rowData={data.missing}
      rowKey="e_id"
      sortable
      pagination={{ defaultSize: 10, sizes: [10, 20, 30] }}
      columnDefs={[
        {
          field: 'name',
          headerName: 'Name',
          dataType: 'string',
        },
        {
          field: 'server',
          headerName: 'Server',
          dataType: 'string',
        },
        {
          field: 'level',
          headerName: 'Level',
          dataType: 'number',
        },
        {
          field: 'playerClass',
          headerName: 'Klasse',
          dataType: 'string',
        },
        {
          field: 'rase',
          headerName: 'Rasse',
          dataType: 'string',
        },
        {
          field: 'faction',
          headerName: 'Fraktion',
          dataType: 'string',
        },
      ]}
    />
  );
}
