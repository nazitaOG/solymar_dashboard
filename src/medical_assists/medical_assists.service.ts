import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-audit-reservation';

@Injectable()
export class MedicalAssistsService {
  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreateMedicalAssistDto) {
    return handleRequest(async () => {
      CommonPricePolicies.assertCreatePrice(dto, 'totalPrice', 'amountPaid', {
        labels: { total: 'total', paid: 'pagado' },
      });

      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const medical_assist = await tx.medicalAssist.create({
          data: {
            reservationId: dto.reservationId,
            bookingReference: dto.bookingReference,
            assistType: dto.assistType ?? undefined,
            provider: dto.provider,
            totalPrice: dto.totalPrice,
            amountPaid: dto.amountPaid,
            createdBy: actorId,
            updatedBy: actorId,
          },
          select: { id: true, reservationId: true },
        });

        await touchReservation(tx, medical_assist.reservationId, actorId);
        return medical_assist;
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.medicalAssist.findUniqueOrThrow({ where: { id } }),
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, dto: UpdateMedicalAssistDto) {
    return handleRequest(async () => {
      // Traemos valores actuales para validar y obtener reservationId
      const current = await this.prisma.medicalAssist.findUniqueOrThrow({
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
        const medical_assist = await tx.medicalAssist.update({
          where: { id },
          data: {
            // NO permitir mover de reserva → no tocar reservationId
            bookingReference: dto.bookingReference ?? undefined,
            assistType: dto.assistType ?? undefined,
            provider: dto.provider ?? undefined,
            totalPrice:
              typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
            amountPaid:
              typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
            updatedBy: actorId,
          },
          select: { id: true }, // no necesitamos reservationId aquí
        });

        await touchReservation(tx, current.reservationId, actorId);
        return medical_assist;
      });
    });
  }

  remove(actorId: string, id: string) {
    // hard delete + touch en una sola consulta
    return handleRequest(async () => {
      return this.prisma.$transaction(async (tx: PrismaClient) => {
        const deleted = await tx.medicalAssist.delete({
          where: { id },
          select: { id: true, reservationId: true },
        });
        await touchReservation(tx, deleted.reservationId, actorId);
        return { id: deleted.id };
      });
    });
  }
}
