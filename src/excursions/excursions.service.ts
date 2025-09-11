import { Injectable } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { HandleRequest } from '../common/utils/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ExcursionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createExcursionDto: CreateExcursionDto) {
    return HandleRequest.prisma(() => {
      return HandleRequest.prisma(() =>
        this.prisma.excursion.create({
          data: {
            totalPrice: createExcursionDto.totalPrice,
            amountPaid: createExcursionDto.amountPaid,
            origin: createExcursionDto.origin,
            provider: createExcursionDto.provider,
            bookingReference: createExcursionDto.bookingReference ?? undefined,
            excursionDate: new Date(createExcursionDto.excursionDate),
            excursionName: createExcursionDto.excursionName,
            reservationId: createExcursionDto.reservationId,
          },
        }),
      );
    });
  }

  // findAll() {
  //   return HandleRequest.prisma(() => {
  //     return this.prisma.excursion.findMany();
  //   });
  // }

  findOne(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.excursion.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateExcursionDto: UpdateExcursionDto) {
    return HandleRequest.prisma(() => {
      return HandleRequest.prisma(() =>
        this.prisma.excursion.update({
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
            excursionDate:
              updateExcursionDto.excursionDate !== undefined
                ? new Date(updateExcursionDto.excursionDate)
                : undefined,
            excursionName: updateExcursionDto.excursionName ?? undefined,
            reservationId: updateExcursionDto.reservationId ?? undefined,
          },
        }),
      );
    });
  }

  remove(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.excursion.delete({
        where: { id },
      });
    });
  }
}
