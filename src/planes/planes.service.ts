import { Injectable } from '@nestjs/common';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreatePlaneDto) {
    return handleRequest(async () => {
      CommonOriginDestinationPolicies.assertCreateDifferent(
        dto,
        'departure',
        'arrival',
        {
          required: 'any',
          labels: { a: 'salida', b: 'llegada' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertUpdateRange(
        dto,
        { start: dto.departureDate, end: dto.arrivalDate },
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
        const created = await tx.plane.create({
          data: {
            departure: dto.departure,
            arrival: dto.arrival ?? undefined,
            departureDate: dto.departureDate,
            arrivalDate: dto.arrivalDate ?? undefined,
            bookingReference: dto.bookingReference,
            provider: dto.provider ?? undefined,
            totalPrice: dto.totalPrice,
            amountPaid: dto.amountPaid,
            currency: dto.currency,
            notes: dto.notes ?? undefined,
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

        await touchReservation(tx, created.reservationId, actorId, {
          currency: created.currency,
          totalAdjustment: Number(created.totalPrice),
          paidAdjustment: Number(created.amountPaid),
        });

        return { id: created.id };
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.plane.findUniqueOrThrow({ where: { id } }),
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, dto: UpdatePlaneDto) {
    return handleRequest(async () => {
      const current = await this.prisma.plane.findUniqueOrThrow({
        where: { id },
        select: {
          departureDate: true,
          arrivalDate: true,
          departure: true,
          arrival: true,
          totalPrice: true,
          amountPaid: true,
          reservationId: true,
          currency: true,
        },
      });

      CommonOriginDestinationPolicies.assertUpdateDifferent(
        dto,
        { a: current.departure, b: current.arrival },
        'departure',
        'arrival',
        {
          required: 'any',
          labels: { a: 'salida', b: 'llegada' },
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
        const updated = await tx.plane.update({
          where: { id },
          data: {
            departure: dto.departure ?? undefined,
            arrival: dto.arrival ?? undefined,
            departureDate: dto.departureDate ?? undefined,
            arrivalDate: dto.arrivalDate ?? undefined,
            bookingReference: dto.bookingReference ?? undefined,
            provider: dto.provider ?? undefined,
            totalPrice:
              typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
            amountPaid:
              typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
            notes: dto.notes ?? undefined,
            // NO permitir mover de reserva
            updatedBy: actorId,
          },
          select: {
            id: true,
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
    });
  }

  remove(actorId: string, id: string) {
    return handleRequest(async () => {
      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const deleted = await tx.plane.delete({
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
