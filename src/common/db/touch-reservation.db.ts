import { Currency, PrismaClient } from '@prisma/client';

type TouchReservationParams = {
  currency: Currency;
  totalAdjustment?: number;
  paidAdjustment?: number;
};

export async function touchReservation(
  tx: Omit<PrismaClient, '$transaction'>,
  reservationId: string,
  actorId: string,
  params?: TouchReservationParams,
) {
  // Siempre sellamos la reserva
  await tx.reservation.update({
    where: { id: reservationId },
    data: { updatedBy: actorId },
    select: { id: true },
  });

  if (!params) return;

  const currency = params.currency;
  const total = params.totalAdjustment ?? 0;
  const paid = params.paidAdjustment ?? 0;

  // Hacemos UPSERT para garantizar existencia de la fila por (reservationId, currency).
  // Nota: usamos increment: 0 cuando no hay cambios para que el update sea válido,
  // y de todas formas se cree la fila si no existía.
  await tx.reservationCurrencyTotal.upsert({
    where: { reservationId_currency: { reservationId, currency } },
    create: {
      reservationId,
      currency,
      totalPrice: total,
      amountPaid: paid,
      // Si tu tabla tiene createdBy/updatedBy, descomenta:
      // createdBy: actorId,
      // updatedBy: actorId,
    },
    update: {
      totalPrice: { increment: total },
      amountPaid: { increment: paid },
      // Si tu tabla tiene updatedBy:
      // updatedBy: actorId,
    },
    select: { reservationId: true },
  });
}
