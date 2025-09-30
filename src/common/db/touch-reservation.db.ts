import { PrismaClient } from '@prisma/client';

type TouchReservation = {
  totalAdjustment?: number;
  paidAdjustment?: number;
};

/**
 * Marca la Reservation como actualizada por actorId.
 * Nota: el campo `updatetAt` se actualiza solo por @updatedAt cuando hacemos update.
 */
export async function touchReservation(
  tx: Omit<PrismaClient, '$transaction'>,
  reservationId: string,
  actorId: string,
  adjustments?: TouchReservation,
) {
  const totalAdjustment = adjustments?.totalAdjustment ?? 0;
  const paidAdjustment = adjustments?.paidAdjustment ?? 0;

  await tx.reservation.update({
    where: { id: reservationId },
    data: {
      ...(totalAdjustment !== 0 && {
        totalPrice: { increment: totalAdjustment },
      }),
      ...(paidAdjustment !== 0 && {
        amountPaid: { increment: paidAdjustment },
      }),
      updatedBy: actorId, // `updatetAt` sube solo por @updatedAt
    },
    select: { id: true },
  });
}
