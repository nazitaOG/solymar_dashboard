import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  create(actorId: string, dto: CreateHotelDto) {
    return handleRequest(async () => {
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
            createdBy: actorId,
            updatedBy: actorId,
          },
          select: {
            id: true,
            reservationId: true,
            totalPrice: true,
            amountPaid: true,
            currency: true,
          },
        });

        await touchReservation(tx, hotel.reservationId, actorId, {
          currency: hotel.currency,
          totalAdjustment: Number(hotel.totalPrice),
          paidAdjustment: Number(hotel.amountPaid),
        });

        return { id: hotel.id };
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.hotel.findUniqueOrThrow({ where: { id } }),
    );
  }

  update(actorId: string, id: string, dto: UpdateHotelDto) {
    return handleRequest(async () => {
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
            updatedBy: actorId,
          },
          select: { id: true },
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
    });
  }

  remove(actorId: string, id: string) {
    return handleRequest(async () => {
      return this.prisma.$transaction(async (tx: PrismaClient) => {
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

        await touchReservation(tx, deleted.reservationId, actorId, {
          currency: deleted.currency,
          totalAdjustment: -deleted.totalPrice.toNumber(),
          paidAdjustment: -deleted.amountPaid.toNumber(),
        });

        return { id: deleted.id };
      });
    });
  }
}
