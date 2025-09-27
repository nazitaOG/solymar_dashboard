import { Injectable } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';
import { CommonPricePolicies } from '../common/policies/price.policies';

@Injectable()
export class ExcursionsService {
  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, createExcursionDto: CreateExcursionDto) {
    return handleRequest(async () => {
      CommonPricePolicies.assertCreatePrice(
        createExcursionDto,
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.excursion.create({
        data: {
          totalPrice: createExcursionDto.totalPrice,
          amountPaid: createExcursionDto.amountPaid,
          origin: createExcursionDto.origin,
          provider: createExcursionDto.provider,
          bookingReference: createExcursionDto.bookingReference ?? undefined,
          excursionDate: createExcursionDto.excursionDate,
          excursionName: createExcursionDto.excursionName,
          reservationId: createExcursionDto.reservationId,

          // sellos requeridos por el nuevo schema
          createdBy: actorId,
          updatedBy: actorId,
        },
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.excursion.findUniqueOrThrow({ where: { id } }),
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, updateExcursionDto: UpdateExcursionDto) {
    return handleRequest(async () => {
      const current = await this.prisma.excursion.findUniqueOrThrow({
        where: { id },
        select: { totalPrice: true, amountPaid: true },
      });

      CommonPricePolicies.assertUpdatePrice(
        updateExcursionDto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.excursion.update({
        where: { id },
        data: {
          totalPrice:
            typeof updateExcursionDto.totalPrice === 'number'
              ? updateExcursionDto.totalPrice
              : undefined,
          amountPaid:
            typeof updateExcursionDto.amountPaid === 'number'
              ? updateExcursionDto.amountPaid
              : undefined,
          origin: updateExcursionDto.origin ?? undefined,
          provider: updateExcursionDto.provider ?? undefined,
          bookingReference: updateExcursionDto.bookingReference ?? undefined,
          excursionDate: updateExcursionDto.excursionDate ?? undefined,
          excursionName: updateExcursionDto.excursionName ?? undefined,
          reservationId: updateExcursionDto.reservationId ?? undefined,

          // sello de último editor
          updatedBy: actorId,
        },
      });
    });
  }

  remove(actorId: string, id: string) {
    // Si más adelante hacés soft delete, acá iría deletedBy/At.
    return handleRequest(() => this.prisma.excursion.delete({ where: { id } }));
  }
}
