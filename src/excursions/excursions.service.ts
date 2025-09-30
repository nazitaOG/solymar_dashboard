import { Injectable } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-audit-reservation';

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
          select: { id: true, reservationId: true },
        });

        await touchReservation(tx, excursion.reservationId, actorId);
        return excursion;
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
      // Traemos valores actuales solo para validar precios (y tomar reservationId)
      const current = await this.prisma.excursion.findUniqueOrThrow({
        where: { id },
        select: { totalPrice: true, amountPaid: true, reservationId: true },
      });

      CommonPricePolicies.assertUpdatePrice(
        dto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const excursion = await tx.excursion.update({
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
            // NO permitir mover de reserva → no tocar reservationId
            updatedBy: actorId,
          },
          select: { id: true }, // no necesitamos repetir reservationId
        });

        await touchReservation(tx, current.reservationId, actorId);
        return excursion;
      });
    });
  }

  remove(actorId: string, id: string) {
    // hard delete + touch en una sola consulta
    return handleRequest(async () => {
      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const deleted = await tx.excursion.delete({
          where: { id },
          select: { id: true, reservationId: true },
        });
        await touchReservation(tx, deleted.reservationId, actorId);
        return { id: deleted.id };
      });
    });
  }
}
