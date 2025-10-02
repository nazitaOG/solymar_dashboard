export type Maybe<T> = T | null | undefined;

export const isProvided = <T>(v: Maybe<T>): v is T =>
  v !== null && v !== undefined;

export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '';

export const providedPair = <A, B>(a: Maybe<A>, b: Maybe<B>): boolean =>
  isProvided(a) && isProvided(b);
