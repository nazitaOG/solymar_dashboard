import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/common-date.policies';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createHotelDto: CreateHotelDto) {
    return handleRequest(() => {
      CommonDatePolicies.assertCreateRange(
        createHotelDto,
        'startDate',
        'endDate',
        {
          allowEqual: true,
          labels: {
            start: 'fecha de inicio',
            end: 'fecha de fin',
          },
        },
      );
      return this.prisma.hotel.create({
        data: createHotelDto,
      });
    });
  }

  // Si necesitas listar todos los hoteles, descomenta este método:
  // findAll() {
  //   return handleRequest(() => {
  //     return this.prisma.hotel.findMany();
  //   });
  // }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.hotel.findUniqueOrThrow({
        where: { id },
      }),
    );
  }

  update(id: string, updateHotelDto: UpdateHotelDto) {
    return handleRequest(async () => {
      const current = await this.prisma.hotel.findUniqueOrThrow({
        where: { id },
        select: { startDate: true, endDate: true },
      });

      CommonDatePolicies.assertUpdateRange(
        updateHotelDto,
        { start: current.startDate, end: current.endDate },
        'startDate',
        'endDate',
        {
          allowEqual: true,
          labels: {
            start: 'fecha de inicio',
            end: 'fecha de fin',
          },
        },
      );
      return this.prisma.hotel.update({
        where: { id },
        data: updateHotelDto,
      });
    });
  }

  remove(id: string) {
    return handleRequest(() => {
      return this.prisma.hotel.delete({
        where: { id },
      });
    });
  }
}
