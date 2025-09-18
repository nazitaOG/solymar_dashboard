export const trimValue = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

export const upperTrimValue = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export const lowerTrimValue = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;
