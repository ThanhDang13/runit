export function normalizeToIso(date: string | Date): string {
  return new Date(date).toISOString();
}
