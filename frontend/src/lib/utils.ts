// eslint-disable-next-line import/prefer-default-export
export function goldString(amount?: number) {
  let gold;
  if (!amount || amount < 0) {
    return '0';
  }
  const g = Math.trunc((amount || 0) / 10000);
  if (g > 1000000) {
    gold = `${Math.trunc(g / 1000000)} M`;
  } else if (g > 1000) {
    gold = `${Math.trunc(g / 1000)} K`;
  } else {
    gold = g.toString();
  }

  return gold;
}
