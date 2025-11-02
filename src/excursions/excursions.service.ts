import { Injectable } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';
import { NestStructuredLogger } from '../common/logging/structured-logger';

@Injectable()
export class ExcursionsService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreateExcursionDto) {
    return handleRequest(
      async () => {
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
              currency: dto.currency,
              createdBy: actorId,
              updatedBy: actorId,
            },
          });

          await touchReservation(tx, excursion.reservationId, actorId, {
            currency: excursion.currency,
            totalAdjustment: Number(excursion.totalPrice),
            paidAdjustment: Number(excursion.amountPaid),
          });

          return excursion;
        });
      },
      this.logger,
      {
        op: 'ExcursionsService.create',
        actorId,
        extras: {
          reservationId: dto.reservationId,
          provider: dto.provider,
          origin: dto.origin,
          excursionDate:
            dto.excursionDate?.toISOString?.() ?? String(dto.excursionDate),
          excursionName: dto.excursionName,
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () => this.prisma.excursion.findUniqueOrThrow({ where: { id } }),
      this.logger,
      {
        op: 'ExcursionsService.findOne',
        extras: { id },
      },
    );
  }

  findByReservation(reservationId: string) {
    return handleRequest(
      async () => {
        // 🔍 (Opcional) Verificamos existencia de la reserva antes de buscar
        const exists = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { id: true },
        });
        if (!exists) {
          throw new Error(`Reservation ${reservationId} not found`);
        }

        // 🧭 Buscar excursiones asociadas a la reserva
        const excursions = await this.prisma.excursion.findMany({
          where: { reservationId },
          orderBy: { excursionDate: 'asc' },
        });

        return excursions;
      },
      this.logger,
      {
        op: 'ExcursionsService.findByReservation',
        extras: { reservationId },
      },
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, dto: UpdateExcursionDto) {
    return handleRequest(
      async () => {
        // Traer actuales para validar y calcular ajustes
        const current = await this.prisma.excursion.findUniqueOrThrow({
          where: { id },
          select: {
            reservationId: true,
            totalPrice: true,
            amountPaid: true,
            currency: true,
          },
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
        op: 'ExcursionsService.update',
        actorId,
        extras: {
          id,
          // Solo logueamos cambios numéricos si vienen; evitá PII
          totalPriceNew:
            typeof dto.totalPrice === 'number'
              ? Number(dto.totalPrice)
              : undefined,
          amountPaidNew:
            typeof dto.amountPaid === 'number'
              ? Number(dto.amountPaid)
              : undefined,
        },
      },
    );
  }

  remove(actorId: string, id: string) {
    return handleRequest(
      async () => {
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const deleted = await tx.excursion.delete({
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
        op: 'ExcursionsService.remove',
        actorId,
        extras: { id },
      },
    );
  }
}
