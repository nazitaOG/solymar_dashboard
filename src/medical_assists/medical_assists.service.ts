import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';
import { CommonPricePolicies } from '../common/policies/price.policies';

@Injectable()
export class MedicalAssistsService {
  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreateMedicalAssistDto) {
    return handleRequest(async () => {
      CommonPricePolicies.assertCreatePrice(
        dto,
        'totalPrice',
        'amountPaid',

        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.medicalAssist.create({
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
      const current = await this.prisma.medicalAssist.findUniqueOrThrow({
        where: { id },
        select: { totalPrice: true, amountPaid: true },
      });

      CommonPricePolicies.assertUpdatePrice(
        dto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.medicalAssist.update({
        where: { id },
        data: {
          reservationId: dto.reservationId ?? undefined,
          bookingReference: dto.bookingReference ?? undefined,
          assistType: dto.assistType ?? undefined,
          provider: dto.provider ?? undefined,
          totalPrice:
            typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
          amountPaid:
            typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,

          updatedBy: actorId,
        },
      });
    });
  }

  remove(actorId: string, id: string) {
    // si luego haces soft delete, acá guardarías deletedBy/At
    return handleRequest(() =>
      this.prisma.medicalAssist.delete({ where: { id } }),
    );
  }
}
