import { Injectable } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';

@Injectable()
export class ExcursionsService {
  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreateExcursionDto) {
    return handleRequest(async () => {
      CommonPricePolicies.assertCreatePrice(dto, 'totalPrice', 'amountPaid', {
        labels: { total: 'total', paid: 'pagado' },
      });

      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const excursion = await tx.excursion.create({
          data: {
            totalPrice: dto.totalPrice,
            amountPaid: dto.amountPaid,
            origin: dto.origin,
            provider: dto.provider,
            bookingReference: dto.bookingReference ?? undefined,
            excursionDate: dto.excursionDate,
            excursionName: dto.excursionName,
            reservationId: dto.reservationId,
            createdBy: actorId,
            updatedBy: actorId,
          },
          select: {
            id: true,
            reservationId: true,
            totalPrice: true,
            amountPaid: true,
          },
        });

        await touchReservation(tx, excursion.reservationId, actorId, {
          totalAdjustment: Number(excursion.totalPrice),
          paidAdjustment: Number(excursion.amountPaid),
        });

        return { id: excursion.id };
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.excursion.findUniqueOrThrow({ where: { id } }),
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, dto: UpdateExcursionDto) {
    return handleRequest(async () => {
      // Traer actuales para validar y calcular ajustes
      const current = await this.prisma.excursion.findUniqueOrThrow({
        where: { id },
        select: { reservationId: true, totalPrice: true, amountPaid: true },
      });

      CommonPricePolicies.assertUpdatePrice(
        dto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const updated = await tx.excursion.update({
          where: { id },
          data: {
            totalPrice:
              typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
            amountPaid:
              typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
            origin: dto.origin ?? undefined,
            provider: dto.provider ?? undefined,
            bookingReference: dto.bookingReference ?? undefined,
            excursionDate: dto.excursionDate ?? undefined,
            excursionName: dto.excursionName ?? undefined,
            // NO se permite mover de reserva
            updatedBy: actorId,
          },
          select: { id: true }, // no necesitamos repetir montos acá
        });

        await touchReservation(tx, current.reservationId, actorId, {
          totalAdjustment:
            typeof dto.totalPrice === 'number'
              ? Number(dto.totalPrice) - current.totalPrice.toNumber()
              : 0,
          paidAdjustment:
            typeof dto.amountPaid === 'number'
              ? Number(dto.amountPaid) - current.amountPaid.toNumber()
              : 0,
        });

        return updated;
      });
    });
  }

  remove(actorId: string, id: string) {
    return handleRequest(async () => {
      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const deleted = await tx.excursion.delete({
          where: { id },
          select: {
            id: true,
            reservationId: true,
            totalPrice: true,
            amountPaid: true,
          },
        });

        await touchReservation(tx, deleted.reservationId, actorId, {
          totalAdjustment: -deleted.totalPrice.toNumber(),
          paidAdjustment: -deleted.amountPaid.toNumber(),
        });

        return { id: deleted.id };
      });
    });
  }
}
