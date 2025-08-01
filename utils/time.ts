export function dateToUnix(date: Date): number {
  return Math.floor(date.valueOf() / 1000);
}