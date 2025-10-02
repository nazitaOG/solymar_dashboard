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
  await tx.reservation.update({
    where: { id: reservationId },
    data: { updatedBy: actorId },
    select: { id: true },
  });

  if (!params) return;

  const currency = params.currency;
  const total = params.totalAdjustment ?? 0;
  const paid = params.paidAdjustment ?? 0;

  if (total === 0 && paid === 0) return;

  await tx.reservationCurrencyTotal.update({
    where: { reservationId_currency: { reservationId, currency } },
    data: {
      ...(total !== 0 && { totalPrice: { increment: total } }),
      ...(paid !== 0 && { amountPaid: { increment: paid } }),
    },
    select: { reservationId: true },
  });
}
