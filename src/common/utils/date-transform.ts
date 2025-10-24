export function toDateRaw(value: unknown): Date {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.valueOf())) throw new Error('Invalid date');
  return d;
}

export function toDateDay(value: unknown): Date {
  const d = toDateRaw(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateMinute(value: unknown): Date {
  const d = toDateRaw(value);
  d.setSeconds(0, 0);
  return d;
}
