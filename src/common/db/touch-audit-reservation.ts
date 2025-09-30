import { PrismaClient } from '@prisma/client';

/**
 * Marca la Reservation como actualizada por actorId.
 * Nota: el campo `updatetAt` se actualiza solo por @updatedAt cuando hacemos update.
 */
export async function touchReservation(
  tx: Omit<PrismaClient, '$transaction'>,
  reservationId: string,
  actorId: string,
) {
  await tx.reservation.update({
    where: { id: reservationId },
    data: { updatedBy: actorId }, // `updatetAt` sube solo
    select: { id: true },
  });
}
