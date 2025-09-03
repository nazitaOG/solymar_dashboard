import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { HandleRequest } from '../common/utils/handle-request';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReservationDto) {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.create({
        data: {
          userId: dto.userId,
          totalPrice: dto.totalPrice,
          state: dto.state,
        },
      }),
    );
  }

  findAll() {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.findMany({
        orderBy: { uploadDate: 'desc' },
      }),
    );
  }

  findOne(id: string) {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.findUniqueOrThrow({
        where: { id },
      }),
    );
  }

  update(id: string, dto: UpdateReservationDto) {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.update({
        where: { id },
        data: {
          ...(typeof dto.totalPrice === 'number' && {
            totalPrice: dto.totalPrice,
          }),
          ...(dto.state && { state: dto.state }),
        },
      }),
    );
  }

  remove(id: string) {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.delete({
        where: { id },
      }),
    );
  }
}
