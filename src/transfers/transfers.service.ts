import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTransferDto: CreateTransferDto) {
    return handleRequest(() =>
      this.prisma.transfer.create({
        data: {
          origin: createTransferDto.origin,
          destination: createTransferDto.destination ?? undefined,
          departureDate: new Date(createTransferDto.departureDate),
          arrivalDate: createTransferDto.arrivalDate,
          provider: createTransferDto.provider,
          bookingReference: createTransferDto.bookingReference ?? undefined,
          reservationId: createTransferDto.reservationId,
          totalPrice: createTransferDto.totalPrice,
          amountPaid: createTransferDto.amountPaid,
          transportType: createTransferDto.transportType ?? undefined,
        },
      }),
    );
  }

  // findAll() {
  //   return handleRequest(() => this.prisma.transfer.findMany());
  // }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.transfer.findUniqueOrThrow({ where: { id } }),
    );
  }

  update(id: string, updateTransferDto: UpdateTransferDto) {
    return handleRequest(() =>
      this.prisma.transfer.update({
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
      }),
    );
  }

  remove(id: string) {
    return handleRequest(() => this.prisma.transfer.delete({ where: { id } }));
  }
}
