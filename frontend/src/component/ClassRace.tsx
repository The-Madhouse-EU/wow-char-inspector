import React from 'react';
import { Grid } from '@grandlinex/react-components';
import { useAppContext } from '@/context/AppContext';

export default function ClassRace() {
  const { data, classMap } = useAppContext();
  return (
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
                  color: classMap.get(id),
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
  );
}
