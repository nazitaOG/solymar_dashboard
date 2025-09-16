import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';

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

      CommonPricePolicies.assertCreatePrice(
        createHotelDto,
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.hotel.create({
        data: {
          startDate: createHotelDto.startDate,
          endDate: createHotelDto.endDate,
          city: createHotelDto.city,
          hotelName: createHotelDto.hotelName,
          bookingReference: createHotelDto.bookingReference,
          totalPrice: createHotelDto.totalPrice,
          amountPaid: createHotelDto.amountPaid,
          roomType: createHotelDto.roomType,
          provider: createHotelDto.provider,
          reservationId: createHotelDto.reservationId,
        },
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
        select: {
          startDate: true,
          endDate: true,
          totalPrice: true,
          amountPaid: true,
        },
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

      CommonPricePolicies.assertUpdatePrice(
        updateHotelDto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.hotel.update({
        where: { id },
        data: {
          startDate: updateHotelDto.startDate ?? undefined,
          endDate: updateHotelDto.endDate ?? undefined,
          city: updateHotelDto.city ?? undefined,
          hotelName: updateHotelDto.hotelName ?? undefined,
          bookingReference: updateHotelDto.bookingReference ?? undefined,
          totalPrice:
            typeof updateHotelDto.totalPrice === 'number'
              ? updateHotelDto.totalPrice
              : undefined,
          amountPaid:
            typeof updateHotelDto.amountPaid === 'number'
              ? updateHotelDto.amountPaid
              : undefined,
          roomType: updateHotelDto.roomType ?? undefined,
          provider: updateHotelDto.provider ?? undefined,
          reservationId: updateHotelDto.reservationId ?? undefined,
        },
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
