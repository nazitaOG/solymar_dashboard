import { Currency, PrismaClient } from '@prisma/client';

type TouchReservationParams = {
  currency: Currency;
  totalAdjustment?: number;
  paidAdjustment?: number;
};

export async function touchReservation(
  tx: Omit<PrismaClient, '$transaction'>,
  reservationId: string,
  username: string,
  params?: TouchReservationParams,
) {
  // Siempre sellamos la reserva
  await tx.reservation.update({
    where: { id: reservationId },
    data: { updatedBy: username },
    select: { id: true },
  });

  if (!params) return;

  const { currency } = params;
  const totalAdj = params.totalAdjustment ?? 0;
  const paidAdj = params.paidAdjustment ?? 0;

  const existing = await tx.reservationCurrencyTotal.findUnique({
    where: { reservationId_currency: { reservationId, currency } },
  });

  // Calculamos nuevos totales con fallback seguro
  const prevTotal = Number(existing?.totalPrice ?? 0);
  const prevPaid = Number(existing?.amountPaid ?? 0);

  const newTotal = prevTotal + totalAdj;
  const newPaid = prevPaid + paidAdj;

  // 🚫 Protección: no permitir pagar más de lo total
  if (newPaid > newTotal) {
    console.warn(
      '⚠️ Paid exceeds total — adjusting to prevent constraint violation',
    );
  }

  const safeTotal = Math.max(newTotal, newPaid);
  const safePaid = Math.min(newPaid, safeTotal);

  await tx.reservationCurrencyTotal.upsert({
    where: { reservationId_currency: { reservationId, currency } },
    create: {
      reservationId,
      currency,
      totalPrice: safeTotal,
      amountPaid: safePaid,
      // createdBy: actorId,
      // updatedBy: actorId,
    },
    update: {
      totalPrice: safeTotal,
      amountPaid: safePaid,
      // updatedBy: actorId,
    },
    select: { reservationId: true },
  });
}
