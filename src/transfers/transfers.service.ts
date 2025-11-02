import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';
import { NestStructuredLogger } from '../common/logging/structured-logger';

@Injectable()
export class TransfersService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  create(actorId: string, dto: CreateTransferDto) {
    return handleRequest(
      async () => {
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
          const created = await tx.transfer.create({
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
              currency: dto.currency,
              createdBy: actorId,
              updatedBy: actorId,
            },
          });

          await touchReservation(tx, created.reservationId, actorId, {
            currency: created.currency,
            totalAdjustment: Number(created.totalPrice),
            paidAdjustment: Number(created.amountPaid),
          });

          return created;
        });
      },
      this.logger,
      {
        op: 'TransfersService.create',
        actorId,
        extras: {
          reservationId: dto.reservationId,
          origin: dto.origin,
          destination: dto.destination,
          provider: dto.provider,
          transportType: dto.transportType,
          departureDate:
            dto.departureDate?.toISOString?.() ?? String(dto.departureDate),
          arrivalDate:
            dto.arrivalDate?.toISOString?.() ?? String(dto.arrivalDate),
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () => this.prisma.transfer.findUniqueOrThrow({ where: { id } }),
      this.logger,
      {
        op: 'TransfersService.findOne',
        extras: { id },
      },
    );
  }

  findByReservation(reservationId: string) {
    return handleRequest(
      async () => {
        // 🚦 Validamos existencia de la reserva (mantiene consistencia con el resto de servicios)
        const exists = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { id: true },
        });
        if (!exists) {
          throw new Error(`Reservation ${reservationId} not found`);
        }

        // 🚗 Traemos los traslados asociados a esa reserva, ordenados por fecha
        const transfers = await this.prisma.transfer.findMany({
          where: { reservationId },
          orderBy: { departureDate: 'asc' },
        });

        return transfers;
      },
      this.logger,
      {
        op: 'TransfersService.findByReservation',
        extras: { reservationId },
      },
    );
  }

  update(actorId: string, id: string, dto: UpdateTransferDto) {
    return handleRequest(
      async () => {
        const current = await this.prisma.transfer.findUniqueOrThrow({
          where: { id },
          select: {
            departureDate: true,
            arrivalDate: true,
            origin: true,
            destination: true,
            totalPrice: true,
            amountPaid: true,
            reservationId: true,
            currency: true,
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
          const updated = await tx.transfer.update({
            where: { id },
            data: {
              origin: dto.origin ?? undefined,
              destination: dto.destination ?? undefined,
              departureDate: dto.departureDate ?? undefined,
              arrivalDate: dto.arrivalDate ?? undefined,
              provider: dto.provider ?? undefined,
              bookingReference: dto.bookingReference ?? undefined,
              totalPrice:
                typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
              amountPaid:
                typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
              transportType: dto.transportType ?? undefined,
              updatedBy: actorId,
            },
          });

          await touchReservation(tx, current.reservationId, actorId, {
            currency: current.currency,
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
      },
      this.logger,
      {
        op: 'TransfersService.update',
        actorId,
        extras: {
          id,
          originNew: dto.origin ?? undefined,
          destinationNew: dto.destination ?? undefined,
          totalPriceNew:
            typeof dto.totalPrice === 'number'
              ? Number(dto.totalPrice)
              : undefined,
          amountPaidNew:
            typeof dto.amountPaid === 'number'
              ? Number(dto.amountPaid)
              : undefined,
          departureDateNew: dto.departureDate?.toISOString?.() ?? undefined,
          arrivalDateNew: dto.arrivalDate?.toISOString?.() ?? undefined,
        },
      },
    );
  }

  remove(actorId: string, id: string) {
    return handleRequest(
      async () => {
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const deleted = await tx.transfer.delete({
            where: { id },
            select: {
              id: true,
              reservationId: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
            },
          });

          await touchReservation(tx, deleted.reservationId, actorId, {
            currency: deleted.currency,
            totalAdjustment: -deleted.totalPrice.toNumber(),
            paidAdjustment: -deleted.amountPaid.toNumber(),
          });

          return { id: deleted.id };
        });
      },
      this.logger,
      {
        op: 'TransfersService.remove',
        actorId,
        extras: { id },
      },
    );
  }
}
