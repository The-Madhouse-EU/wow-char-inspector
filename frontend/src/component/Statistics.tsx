import React, { useMemo } from 'react';
import { Grid } from '@grandlinex/react-components';
import moment from 'moment/moment';
import { goldString } from '@/lib/utils';
import getColorCode from '@/tools/ColorUtil';
import { useAppContext } from '@/context/AppContext';

export default function Statistics() {
  const { data } = useAppContext();
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

    const gold = goldString(goldSum);
    const goldWB = goldString(data?.global.warBankGold || 0);
    const goldTotal = goldString((data?.global.warBankGold || 0) + goldSum);

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
      goldWB,
      goldTotal,
      timewalk,
      playtime,
      maxRio,
      maxIlv,
    };
  }, [data]);
  return (
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
          <span className="gold-img" /> Gesamt: {totals.goldTotal}
          {' | '}Chars: {totals.gold}
          {' | '}Warbank: {totals.goldWB}
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
  );
}
