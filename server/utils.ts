import { randomUUID } from 'node:crypto';

export const id = (prefix: string) => `${prefix}_${randomUUID()}`;
export const now = () => new Date().toISOString();
export const json = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}
