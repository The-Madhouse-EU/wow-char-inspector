// eslint-disable-next-line import/prefer-default-export
export function dateSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
