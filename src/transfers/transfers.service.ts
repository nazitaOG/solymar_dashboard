import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTransferDto: CreateTransferDto) {
    return handleRequest(async () => {
      CommonOriginDestinationPolicies.assertCreateDifferent(
        createTransferDto,
        'origin',
        'destination',
        {
          required: 'any',
          labels: { a: 'origen', b: 'destino' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertCreateRange(
        createTransferDto,
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
        createTransferDto,
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.transfer.create({
        data: {
          origin: createTransferDto.origin,
          destination: createTransferDto.destination ?? undefined,
          departureDate: createTransferDto.departureDate,
          arrivalDate: createTransferDto.arrivalDate,
          provider: createTransferDto.provider,
          bookingReference: createTransferDto.bookingReference ?? undefined,
          reservationId: createTransferDto.reservationId,
          totalPrice: createTransferDto.totalPrice,
          amountPaid: createTransferDto.amountPaid,
          transportType: createTransferDto.transportType ?? undefined,
        },
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.transfer.findUniqueOrThrow({ where: { id } }),
    );
  }

  update(id: string, updateTransferDto: UpdateTransferDto) {
    return handleRequest(async () => {
      const current = await this.prisma.transfer.findUniqueOrThrow({
        where: { id },
        select: {
          departureDate: true,
          arrivalDate: true,
          origin: true,
          destination: true,
          totalPrice: true,
          amountPaid: true,
        },
      });

      CommonOriginDestinationPolicies.assertUpdateDifferent(
        updateTransferDto,
        { a: current.origin, b: current.destination },
        'origin',
        'destination',
        {
          required: 'any',
          labels: { a: 'origen', b: 'destino' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertUpdateRange(
        updateTransferDto,
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
        updateTransferDto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.transfer.update({
        where: { id },
        data: {
          origin: updateTransferDto.origin ?? undefined,
          destination: updateTransferDto.destination ?? undefined,
          departureDate: updateTransferDto.departureDate ?? undefined,
          arrivalDate: updateTransferDto.arrivalDate ?? undefined,
          provider: updateTransferDto.provider ?? undefined,
          bookingReference: updateTransferDto.bookingReference ?? undefined,
          reservationId: updateTransferDto.reservationId ?? undefined,
          totalPrice:
            typeof updateTransferDto.totalPrice === 'number'
              ? updateTransferDto.totalPrice
              : undefined,
          amountPaid:
            typeof updateTransferDto.amountPaid === 'number'
              ? updateTransferDto.amountPaid
              : undefined,
          transportType: updateTransferDto.transportType ?? undefined,
        },
      });
    });
  }

  remove(id: string) {
    return handleRequest(() => this.prisma.transfer.delete({ where: { id } }));
  }
}
