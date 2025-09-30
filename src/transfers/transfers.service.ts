import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-audit-reservation';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreateTransferDto) {
    return handleRequest(async () => {
      CommonOriginDestinationPolicies.assertCreateDifferent(
        dto,
        'origin',
        'destination',
        {
          required: 'any',
          labels: { a: 'origen', b: 'destino' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertCreateRange(
        dto,
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: { start: 'fecha de salida', end: 'fecha de llegada' },
        },
      );

      CommonPricePolicies.assertCreatePrice(dto, 'totalPrice', 'amountPaid', {
        labels: { total: 'total', paid: 'pagado' },
      });

      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const transfer = await tx.transfer.create({
          data: {
            origin: dto.origin,
            destination: dto.destination ?? undefined,
            departureDate: dto.departureDate,
            arrivalDate: dto.arrivalDate,
            provider: dto.provider,
            bookingReference: dto.bookingReference ?? undefined,
            reservationId: dto.reservationId,
            totalPrice: dto.totalPrice,
            amountPaid: dto.amountPaid,
            transportType: dto.transportType ?? undefined,
            createdBy: actorId,
            updatedBy: actorId,
          },
          select: { id: true, reservationId: true },
        });

        await touchReservation(tx, transfer.reservationId, actorId);
        return transfer;
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.transfer.findUniqueOrThrow({ where: { id } }),
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, dto: UpdateTransferDto) {
    return handleRequest(async () => {
      const current = await this.prisma.transfer.findUniqueOrThrow({
        where: { id },
        select: {
          departureDate: true,
          arrivalDate: true,
          origin: true,
          destination: true,
          totalPrice: true,
          amountPaid: true,
          reservationId: true, // usamos este, no el dto
        },
      });

      CommonOriginDestinationPolicies.assertUpdateDifferent(
        dto,
        { a: current.origin, b: current.destination },
        'origin',
        'destination',
        {
          required: 'any',
          labels: { a: 'origen', b: 'destino' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertUpdateRange(
        dto,
        { start: current.departureDate, end: current.arrivalDate },
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: { start: 'fecha de salida', end: 'fecha de llegada' },
        },
      );

      CommonPricePolicies.assertUpdatePrice(
        dto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const transfer = await tx.transfer.update({
          where: { id },
          data: {
            origin: dto.origin ?? undefined,
            destination: dto.destination ?? undefined,
            departureDate: dto.departureDate ?? undefined,
            arrivalDate: dto.arrivalDate ?? undefined,
            provider: dto.provider ?? undefined,
            bookingReference: dto.bookingReference ?? undefined,
            // NO permitir mover de reserva → NO tocar reservationId
            totalPrice:
              typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
            amountPaid:
              typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
            transportType: dto.transportType ?? undefined,
            updatedBy: actorId,
          },
          select: { id: true }, // no necesitamos reservationId
        });

        await touchReservation(tx, current.reservationId, actorId);
        return transfer;
      });
    });
  }

  remove(actorId: string, id: string) {
    // hard delete + touch en una sola consulta
    return handleRequest(async () => {
      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const deleted = await tx.transfer.delete({
          where: { id },
          select: { id: true, reservationId: true },
        });
        await touchReservation(tx, deleted.reservationId, actorId);
        return { id: deleted.id };
      });
    });
  }
}
