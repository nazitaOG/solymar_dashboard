export type Maybe<T> = T | null | undefined;

export const isProvided = <T>(v: Maybe<T>): v is T =>
  v !== null && v !== undefined;

export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '';

export const providedPair = <A, B>(a: Maybe<A>, b: Maybe<B>): boolean =>
  isProvided(a) && isProvided(b);

export const hasPrimary = <Primary, Secondary>(
  primary: Maybe<Primary>,
  secondary?: Maybe<Secondary>,
): boolean => {
  // Si no hay principal pero sí secundario → no válido
  if (!isProvided(primary) && isProvided(secondary)) return false;

  // Si hay principal → válido (sin importar el secundario)
  if (isProvided(primary)) return true;

  // Ambos vacíos → no válido
  return false;
};
