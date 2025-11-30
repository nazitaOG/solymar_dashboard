import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';
import { NestStructuredLogger } from '../common/logging/structured-logger';

@Injectable()
export class MedicalAssistsService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  create(username: string, dto: CreateMedicalAssistDto) {
    return handleRequest(
      async () => {
        CommonPricePolicies.assertCreatePrice(dto, 'totalPrice', 'amountPaid', {
          labels: { total: 'total', paid: 'pagado' },
        });

        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const created = await tx.medicalAssist.create({
            data: {
              reservationId: dto.reservationId,
              bookingReference: dto.bookingReference,
              assistType: dto.assistType ?? undefined,
              provider: dto.provider,
              totalPrice: dto.totalPrice,
              amountPaid: dto.amountPaid,
              currency: dto.currency,
              createdBy: username,
              updatedBy: username,
            },
          });

          await touchReservation(tx, created.reservationId, username, {
            currency: created.currency,
            totalAdjustment: Number(created.totalPrice),
            paidAdjustment: Number(created.amountPaid),
          });

          return created;
        });
      },
      this.logger,
      {
        op: 'MedicalAssistsService.create',
        username,
        extras: {
          reservationId: dto.reservationId,
          provider: dto.provider,
          assistType: dto.assistType,
          bookingReference: dto.bookingReference,
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () => this.prisma.medicalAssist.findUniqueOrThrow({ where: { id } }),
      this.logger,
      {
        op: 'MedicalAssistsService.findOne',
        extras: { id },
      },
    );
  }

  findByReservation(reservationId: string) {
    return handleRequest(
      async () => {
        // 🔍 Validamos que la reserva exista (opcional pero mantiene consistencia)
        const exists = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { id: true },
        });
        if (!exists) {
          throw new Error(`Reservation ${reservationId} not found`);
        }

        // 🏥 Obtenemos todas las asistencias médicas asociadas a la reserva
        const assists = await this.prisma.medicalAssist.findMany({
          where: { reservationId },
          orderBy: { createdAt: 'asc' },
        });

        return assists;
      },
      this.logger,
      {
        op: 'MedicalAssistsService.findByReservation',
        extras: { reservationId },
      },
    );
  }

  update(username: string, id: string, dto: UpdateMedicalAssistDto) {
    return handleRequest(
      async () => {
        const current = await this.prisma.medicalAssist.findUniqueOrThrow({
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
          const updated = await tx.medicalAssist.update({
            where: { id },
            data: {
              bookingReference: dto.bookingReference ?? undefined,
              assistType: dto.assistType ?? undefined,
              provider: dto.provider ?? undefined,
              totalPrice:
                typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
              amountPaid:
                typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
              updatedBy: username,
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
        op: 'MedicalAssistsService.update',
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
          assistTypeNew: dto.assistType ?? undefined,
          providerNew: dto.provider ?? undefined,
        },
      },
    );
  }

  remove(username: string, id: string) {
    return handleRequest(
      async () => {
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const deleted = await tx.medicalAssist.delete({
            where: { id },
            select: {
              id: true,
              reservationId: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
            },
          });

          await touchReservation(tx, deleted.reservationId, username, {
            currency: deleted.currency,
            totalAdjustment: -deleted.totalPrice.toNumber(),
            paidAdjustment: -deleted.amountPaid.toNumber(),
          });

          return { id: deleted.id };
        });
      },
      this.logger,
      {
        op: 'MedicalAssistsService.remove',
        username,
        extras: { id },
      },
    );
  }
}
