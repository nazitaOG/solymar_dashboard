import { Injectable } from '@nestjs/common';
import { CreateCarRentalDto } from './dto/create-car-rental.dto';
import { UpdateCarRentalDto } from './dto/update-car-rental.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';
import { NestStructuredLogger } from '../common/logging/structured-logger';

@Injectable()
export class CarRentalsService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  create(actorId: string, dto: CreateCarRentalDto) {
    return handleRequest(
      async () => {
        // 1. Validar fechas (Retiro vs Devolución)
        CommonDatePolicies.assertCreateRange(dto, 'pickupDate', 'dropoffDate', {
          minDurationMinutes: 60,
          allowEqual: false,
          labels: { start: 'fecha de retiro', end: 'fecha de devolución' },
        });

        // 2. Validar precios
        CommonPricePolicies.assertCreatePrice(dto, 'totalPrice', 'amountPaid', {
          labels: { total: 'total', paid: 'pagado' },
        });

        // 3. Transacción: Crear Auto + Actualizar Reserva
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const created = await tx.carRental.create({
            data: {
              pickupLocation: dto.pickupLocation,
              dropoffLocation: dto.dropoffLocation,
              pickupDate: dto.pickupDate,
              dropoffDate: dto.dropoffDate,
              provider: dto.provider,
              bookingReference: dto.bookingReference ?? undefined,
              reservationId: dto.reservationId,
              totalPrice: dto.totalPrice,
              amountPaid: dto.amountPaid,
              carCategory: dto.carCategory,
              carModel: dto.carModel ?? undefined,
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
        op: 'CarRentalsService.create',
        actorId,
        extras: {
          reservationId: dto.reservationId,
          provider: dto.provider,
          pickupLocation: dto.pickupLocation,
          pickupDate: dto.pickupDate?.toISOString?.() ?? String(dto.pickupDate),
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () => this.prisma.carRental.findUniqueOrThrow({ where: { id } }),
      this.logger,
      {
        op: 'CarRentalsService.findOne',
        extras: { id },
      },
    );
  }

  findByReservation(reservationId: string) {
    return handleRequest(
      async () => {
        // Validar existencia de la reserva
        const exists = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { id: true },
        });
        if (!exists) {
          throw new Error(`Reservation ${reservationId} not found`);
        }

        // Retornar alquileres ordenados por fecha de retiro
        return this.prisma.carRental.findMany({
          where: { reservationId },
          orderBy: { pickupDate: 'asc' },
        });
      },
      this.logger,
      {
        op: 'CarRentalsService.findByReservation',
        extras: { reservationId },
      },
    );
  }

  update(actorId: string, id: string, dto: UpdateCarRentalDto) {
    return handleRequest(
      async () => {
        // Obtener datos actuales para validación y cálculo de diferencias
        const current = await this.prisma.carRental.findUniqueOrThrow({
          where: { id },
          select: {
            pickupDate: true,
            dropoffDate: true,
            totalPrice: true,
            amountPaid: true,
            reservationId: true,
            currency: true,
          },
        });

        // Validar fechas
        CommonDatePolicies.assertUpdateRange(
          dto,
          { start: current.pickupDate, end: current.dropoffDate },
          'pickupDate',
          'dropoffDate',
          {
            minDurationMinutes: 60,
            allowEqual: false,
            labels: { start: 'fecha de retiro', end: 'fecha de devolución' },
          },
        );

        // Validar precios
        CommonPricePolicies.assertUpdatePrice(
          dto,
          { total: current.totalPrice, paid: current.amountPaid },
          'totalPrice',
          'amountPaid',
          { labels: { total: 'total', paid: 'pagado' } },
        );

        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const updated = await tx.carRental.update({
            where: { id },
            data: {
              pickupLocation: dto.pickupLocation ?? undefined,
              dropoffLocation: dto.dropoffLocation ?? undefined,
              pickupDate: dto.pickupDate ?? undefined,
              dropoffDate: dto.dropoffDate ?? undefined,
              provider: dto.provider ?? undefined,
              bookingReference: dto.bookingReference ?? undefined,
              totalPrice:
                typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
              amountPaid:
                typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
              carCategory: dto.carCategory ?? undefined,
              carModel: dto.carModel ?? undefined,
              updatedBy: actorId,
            },
          });

          // Actualizar totales en la reserva principal
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
        op: 'CarRentalsService.update',
        actorId,
        extras: {
          id,
          pickupDateNew: dto.pickupDate?.toISOString?.() ?? undefined,
          dropoffDateNew: dto.dropoffDate?.toISOString?.() ?? undefined,
          totalPriceNew:
            typeof dto.totalPrice === 'number'
              ? Number(dto.totalPrice)
              : undefined,
        },
      },
    );
  }

  remove(actorId: string, id: string) {
    return handleRequest(
      async () => {
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const deleted = await tx.carRental.delete({
            where: { id },
            select: {
              id: true,
              reservationId: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
            },
          });

          // Restar los montos de la reserva
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
        op: 'CarRentalsService.remove',
        actorId,
        extras: { id },
      },
    );
  }
}
