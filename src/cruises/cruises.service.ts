import { Injectable } from '@nestjs/common';
import { CreateCruiseDto } from './dto/create-cruise.dto';
import { UpdateCruiseDto } from './dto/update-cruise.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { touchReservation } from '../common/db/touch-reservation.db';
import { PrismaClient } from '@prisma/client';
import { NestStructuredLogger } from '../common/logging/structured-logger';

@Injectable()
export class CruisesService {
  private readonly logger = new NestStructuredLogger();
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Nuevo: recibimos actorId (usuario autenticado) para sellar createdBy/updatedBy.
   * Más adelante esto lo hará un middleware y podemos sacar el parámetro.
   */
  create(actorId: string, createCruiseDto: CreateCruiseDto) {
    return handleRequest(
      async () => {
        // Validaciones de dominio (igual que antes)
        CommonOriginDestinationPolicies.assertCreateDifferent(
          createCruiseDto,
          'embarkationPort',
          'arrivalPort',
          {
            required: 'any',
            labels: { a: 'embarque', b: 'llegada' },
            ignoreCase: true,
            trim: true,
          },
        );

        CommonDatePolicies.assertUpdateRange(
          createCruiseDto,
          { start: createCruiseDto.startDate, end: createCruiseDto.endDate },
          'startDate',
          'endDate',
          {
            minDurationMinutes: 60,
            allowEqual: true,
            labels: { start: 'fecha de salida', end: 'fecha de llegada' },
          },
        );

        CommonPricePolicies.assertCreatePrice(
          createCruiseDto,
          'totalPrice',
          'amountPaid',
          { labels: { total: 'total', paid: 'pagado' } },
        );

        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const cruise = await tx.cruise.create({
            data: {
              startDate: createCruiseDto.startDate,
              endDate: createCruiseDto.endDate ?? undefined,
              bookingReference: createCruiseDto.bookingReference ?? undefined,
              provider: createCruiseDto.provider,
              embarkationPort: createCruiseDto.embarkationPort,
              arrivalPort: createCruiseDto.arrivalPort ?? undefined,
              totalPrice: createCruiseDto.totalPrice,
              amountPaid: createCruiseDto.amountPaid,
              reservationId: createCruiseDto.reservationId,
              currency: createCruiseDto.currency,
              createdBy: actorId,
              updatedBy: actorId,
            },
          });
          await touchReservation(tx, createCruiseDto.reservationId, actorId, {
            currency: createCruiseDto.currency,
            totalAdjustment: createCruiseDto.totalPrice,
            paidAdjustment: createCruiseDto.amountPaid,
          });
          return cruise;
        });
      },
      this.logger,
      {
        op: 'CruisesService.create',
        actorId,
        extras: {
          reservationId: createCruiseDto.reservationId,
          embarkationPort: createCruiseDto.embarkationPort,
          arrivalPort: createCruiseDto.arrivalPort,
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      async () => {
        return this.prisma.cruise.findUniqueOrThrow({ where: { id } });
      },
      this.logger,
      {
        op: 'CruisesService.findOne',
        extras: { id },
      },
    );
  }

  findByReservation(reservationId: string) {
    return handleRequest(
      async () => {
        // Verificamos existencia de la reserva antes de buscar (opcional pero más prolijo)
        const exists = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { id: true },
        });
        if (!exists) {
          throw new Error(`Reservation ${reservationId} not found`);
        }

        // Devolvemos todos los cruceros de esa reserva
        const cruises = await this.prisma.cruise.findMany({
          where: { reservationId },
          orderBy: { startDate: 'asc' },
        });

        return cruises;
      },
      this.logger,
      {
        op: 'CruisesService.findByReservation',
        extras: { reservationId },
      },
    );
  }

  update(actorId: string, id: string, updateCruiseDto: UpdateCruiseDto) {
    return handleRequest(
      async () => {
        const current = await this.prisma.cruise.findUniqueOrThrow({
          where: { id },
          select: {
            startDate: true,
            endDate: true,
            embarkationPort: true,
            arrivalPort: true,
            totalPrice: true,
            amountPaid: true,
            reservationId: true,
            currency: true,
          },
        });

        // Validaciones de dominio (igual que antes)
        CommonOriginDestinationPolicies.assertUpdateDifferent(
          updateCruiseDto,
          { a: current.embarkationPort, b: current.arrivalPort },
          'embarkationPort',
          'arrivalPort',
          {
            required: 'any',
            labels: { a: 'embarque', b: 'llegada' },
            ignoreCase: true,
            trim: true,
          },
        );

        CommonDatePolicies.assertUpdateRange(
          updateCruiseDto,
          { start: current.startDate, end: current.endDate },
          'startDate',
          'endDate',
          {
            minDurationMinutes: 60,
            allowEqual: true,
            labels: { start: 'fecha de salida', end: 'fecha de llegada' },
          },
        );

        CommonPricePolicies.assertUpdatePrice(
          updateCruiseDto,
          { total: current.totalPrice, paid: current.amountPaid },
          'totalPrice',
          'amountPaid',
          { labels: { total: 'total', paid: 'pagado' } },
        );

        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const cruise = await tx.cruise.update({
            where: { id },
            data: {
              startDate: updateCruiseDto.startDate ?? undefined,
              endDate: updateCruiseDto.endDate ?? undefined,
              bookingReference: updateCruiseDto.bookingReference ?? undefined,
              provider: updateCruiseDto.provider ?? undefined,
              embarkationPort: updateCruiseDto.embarkationPort ?? undefined,
              arrivalPort: updateCruiseDto.arrivalPort ?? undefined,
              totalPrice:
                typeof updateCruiseDto.totalPrice === 'number'
                  ? updateCruiseDto.totalPrice
                  : undefined,
              amountPaid:
                typeof updateCruiseDto.amountPaid === 'number'
                  ? updateCruiseDto.amountPaid
                  : undefined,
              // sello requerido por el nuevo schema
              updatedBy: actorId,
            },
          });
          await touchReservation(tx, current.reservationId, actorId, {
            currency: current.currency,
            totalAdjustment:
              typeof updateCruiseDto.totalPrice === 'number'
                ? updateCruiseDto.totalPrice - current.totalPrice.toNumber()
                : 0,
            paidAdjustment:
              typeof updateCruiseDto.amountPaid === 'number'
                ? updateCruiseDto.amountPaid - current.amountPaid.toNumber()
                : 0,
          });
          return cruise;
        });
      },
      this.logger,
      {
        op: 'CruisesService.update',
        actorId,
        extras: { id },
      },
    );
  }

  remove(actorId: string, id: string) {
    return handleRequest(
      async () => {
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const deleted = await tx.cruise.delete({
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
        op: 'CruisesService.remove',
        actorId,
        extras: { id },
      },
    );
  }
}
