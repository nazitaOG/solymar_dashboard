import * as argon2 from 'argon2';

export type Argon2Tuning = {
  /**
   * Memoria en KiB (p. ej. 1 << 16 = 65 536 KiB ≈ 64 MiB).
   * Ajustá para ~100–300 ms por hash en tu entorno.
   */
  memoryCost?: number;
  /** Iteraciones (time cost). */
  timeCost?: number;
  /** Paralelismo (lanes). */
  parallelism?: number;
};

export async function hashPassword(
  plain: string,
  tuning?: Argon2Tuning,
  pepper?: string, // opcional: secreto de app
): Promise<string> {
  const input = pepper ? plain + pepper : plain;
  return argon2.hash(input, {
    type: argon2.argon2id,
    memoryCost: tuning?.memoryCost ?? 1 << 16, // ~64 MiB
    timeCost: tuning?.timeCost ?? 3,
    parallelism: tuning?.parallelism ?? 1,
  });
}

/**
 * Verifica una contraseña contra su hash almacenado.
 * Devuelve true/false. No se lanzan detalles para no filtrar info.
 */
export async function verifyPassword(
  hashed: string,
  candidate: string,
  pepper?: string,
): Promise<boolean> {
  const input = pepper ? candidate + pepper : candidate;
  return argon2.verify(hashed, input);
}
