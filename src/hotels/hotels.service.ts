import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';
import { NestStructuredLogger } from '../common/logging/structured-logger';

@Injectable()
export class HotelsService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  create(username: string, dto: CreateHotelDto) {
    return handleRequest(
      async () => {
        CommonDatePolicies.assertCreateRange(dto, 'startDate', 'endDate', {
          allowEqual: true,
          labels: { start: 'fecha de inicio', end: 'fecha de fin' },
        });
        CommonPricePolicies.assertCreatePrice(dto, 'totalPrice', 'amountPaid', {
          labels: { total: 'total', paid: 'pagado' },
        });

        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const hotel = await tx.hotel.create({
            data: {
              startDate: dto.startDate,
              endDate: dto.endDate,
              city: dto.city,
              hotelName: dto.hotelName,
              bookingReference: dto.bookingReference,
              totalPrice: dto.totalPrice,
              amountPaid: dto.amountPaid,
              currency: dto.currency,
              roomType: dto.roomType,
              provider: dto.provider,
              reservationId: dto.reservationId,
              createdBy: username,
              updatedBy: username,
            },
            select: {
              id: true,
              startDate: true,
              endDate: true,
              city: true,
              hotelName: true,
              bookingReference: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
              roomType: true,
              provider: true,
              reservationId: true,
              createdAt: true,
              updatedAt: true,
              createdBy: true,
              updatedBy: true,
            },
          });

          await touchReservation(tx, hotel.reservationId, username, {
            currency: hotel.currency,
            totalAdjustment: Number(hotel.totalPrice),
            paidAdjustment: Number(hotel.amountPaid),
          });

          return hotel;
        });
      },
      this.logger,
      {
        op: 'HotelsService.create',
        username,
        extras: {
          reservationId: dto.reservationId,
          city: dto.city,
          hotelName: dto.hotelName,
          startDate: dto.startDate?.toISOString?.() ?? String(dto.startDate),
          endDate: dto.endDate?.toISOString?.() ?? String(dto.endDate),
          provider: dto.provider,
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () => this.prisma.hotel.findUniqueOrThrow({ where: { id } }),
      this.logger,
      {
        op: 'HotelsService.findOne',
        extras: { id },
      },
    );
  }

  findByReservation(reservationId: string) {
    return handleRequest(
      async () => {
        // 🔎 Validamos que la reserva exista (opcional pero consistente)
        const exists = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { id: true },
        });
        if (!exists) {
          throw new Error(`Reservation ${reservationId} not found`);
        }

        // 🏨 Traemos los hoteles de esa reserva ordenados por fecha
        const hotels = await this.prisma.hotel.findMany({
          where: { reservationId },
          orderBy: { startDate: 'asc' },
        });

        return hotels;
      },
      this.logger,
      {
        op: 'HotelsService.findByReservation',
        extras: { reservationId },
      },
    );
  }

  update(username: string, id: string, dto: UpdateHotelDto) {
    return handleRequest(
      async () => {
        const current = await this.prisma.hotel.findUniqueOrThrow({
          where: { id },
          select: {
            startDate: true,
            endDate: true,
            totalPrice: true,
            amountPaid: true,
            reservationId: true,
            currency: true,
          },
        });

        CommonDatePolicies.assertUpdateRange(
          dto,
          { start: current.startDate, end: current.endDate },
          'startDate',
          'endDate',
          {
            allowEqual: true,
            labels: { start: 'fecha de inicio', end: 'fecha de fin' },
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
          const updated = await tx.hotel.update({
            where: { id },
            data: {
              startDate: dto.startDate ?? undefined,
              endDate: dto.endDate ?? undefined,
              city: dto.city ?? undefined,
              hotelName: dto.hotelName ?? undefined,
              bookingReference: dto.bookingReference ?? undefined,
              totalPrice:
                typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
              amountPaid:
                typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
              roomType: dto.roomType ?? undefined,
              provider: dto.provider ?? undefined,
              updatedBy: username,
            },
            select: {
              id: true,
              startDate: true,
              endDate: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
              roomType: true,
              provider: true,
              city: true,
              hotelName: true,
              bookingReference: true,
              reservationId: true,
              createdAt: true,
              updatedAt: true,
              createdBy: true,
              updatedBy: true,
            },
          });

          await touchReservation(tx, current.reservationId, username, {
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
        op: 'HotelsService.update',
        username,
        extras: {
          id,
          totalPriceNew:
            typeof dto.totalPrice === 'number'
              ? Number(dto.totalPrice)
              : undefined,
          amountPaidNew:
            typeof dto.amountPaid === 'number'
              ? Number(dto.amountPaid)
              : undefined,
          startDateNew: dto.startDate?.toISOString?.() ?? undefined,
          endDateNew: dto.endDate?.toISOString?.() ?? undefined,
        },
      },
    );
  }

  remove(username: string, id: string) {
    return handleRequest(
      async () => {
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          // 1️⃣ Buscar el hotel antes de borrarlo (para conocer montos y reserva)
          const deleted = await tx.hotel.delete({
            where: { id },
            select: {
              id: true,
              reservationId: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
            },
          });

          // 2️⃣ Ajustes a aplicar a la reserva
          const totalAdjustment = -deleted.totalPrice.toNumber();
          const paidAdjustment = -deleted.amountPaid.toNumber();

          // 3️⃣ Llamada segura al touchReservation
          //    Este método actualiza/crea el total de la reserva por moneda
          //    evitando violar constraints si el resultado sería negativo.
          await tx.reservationCurrencyTotal.upsert({
            where: {
              reservationId_currency: {
                reservationId: deleted.reservationId,
                currency: deleted.currency,
              },
            },
            update: {
              // Prisma no soporta GREATEST() directo, así que aseguramos en app
              totalPrice: {
                increment: totalAdjustment,
              },
              amountPaid: {
                increment: paidAdjustment,
              },
              updatedAt: new Date(),
            },
            create: {
              reservationId: deleted.reservationId,
              currency: deleted.currency,
              totalPrice: Math.max(totalAdjustment, 0), // 👈 evita negativos
              amountPaid: Math.max(paidAdjustment, 0), // 👈 evita negativos
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          return { id: deleted.id };
        });
      },
      this.logger,
      {
        op: 'HotelsService.remove',
        username,
        extras: { id },
      },
    );
  }
}
