import { Injectable } from '@nestjs/common';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPlaneDto: CreatePlaneDto) {
    return handleRequest(() => {
      CommonOriginDestinationPolicies.assertCreateDifferent(
        createPlaneDto,
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
        createPlaneDto,
        {
          start: createPlaneDto.departureDate,
          end: createPlaneDto.arrivalDate,
        },
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: {
            start: 'fecha de salida',
            end: 'fecha de llegada',
          },
        },
      );
      CommonPricePolicies.assertCreatePrice(
        createPlaneDto,
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );
      return this.prisma.plane.create({
        data: {
          departure: createPlaneDto.departure,
          arrival: createPlaneDto.arrival ?? undefined,
          departureDate: createPlaneDto.departureDate,
          arrivalDate: createPlaneDto.arrivalDate ?? undefined,
          bookingReference: createPlaneDto.bookingReference,
          provider: createPlaneDto.provider ?? undefined,
          totalPrice: createPlaneDto.totalPrice,
          amountPaid: createPlaneDto.amountPaid,
          notes: createPlaneDto.notes ?? undefined,
          reservationId: createPlaneDto.reservationId,
        },
      });
    });
  }

  // findAll() {
  //   return handleRequest(() => {
  //     return this.prisma.plane.findMany();
  //   });
  // }

  findOne(id: string) {
    return handleRequest(() => {
      return this.prisma.plane.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updatePlaneDto: UpdatePlaneDto) {
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
        },
      });

      CommonOriginDestinationPolicies.assertUpdateDifferent(
        updatePlaneDto,
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
        updatePlaneDto,
        { start: current.departureDate, end: current.arrivalDate },
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: {
            start: 'fecha de salida',
            end: 'fecha de llegada',
          },
        },
      );

      CommonPricePolicies.assertUpdatePrice(
        updatePlaneDto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.plane.update({
        where: { id },
        data: {
          departure: updatePlaneDto.departure ?? undefined,
          arrival: updatePlaneDto.arrival ?? undefined,
          departureDate: updatePlaneDto.departureDate ?? undefined,
          arrivalDate: updatePlaneDto.arrivalDate ?? undefined,
          bookingReference: updatePlaneDto.bookingReference ?? undefined,
          provider: updatePlaneDto.provider ?? undefined,
          totalPrice:
            typeof updatePlaneDto.totalPrice === 'number'
              ? updatePlaneDto.totalPrice
              : undefined,
          amountPaid:
            typeof updatePlaneDto.amountPaid === 'number'
              ? updatePlaneDto.amountPaid
              : undefined,
          notes: updatePlaneDto.notes ?? undefined,
          reservationId: updatePlaneDto.reservationId ?? undefined,
        },
      });
    });
  }

  remove(id: string) {
    return handleRequest(() => {
      return this.prisma.plane.delete({
        where: { id },
      });
    });
  }
}
