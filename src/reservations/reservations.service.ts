import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { HandleRequest } from '../common/utils/handle-request';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReservationDto) {
    return HandleRequest.prisma(() =>
      this.prisma.$transaction(async (tx) => {
        const paxIds = [...new Set(dto.paxIds)];

        const foundPax = await tx.pax.findMany({
          where: { id: { in: paxIds } },
          select: { id: true },
        });
        const foundPaxSet = new Set(foundPax.map((pax) => pax.id));
        const missingPaxIds = paxIds.filter((id) => !foundPaxSet.has(id));
        if (missingPaxIds.length > 0) {
          throw new NotFoundException(
            `Some pax were not found: ${missingPaxIds.join(', ')}`,
          );
        }

        return tx.reservation.create({
          data: {
            userId: dto.userId,
            totalPrice: dto.totalPrice,
            state: dto.state,
            paxReservations: {
              create: paxIds.map((paxId) => ({
                pax: { connect: { id: paxId } },
              })),
            },
          },
          include: {
            paxReservations: {
              include: {
                pax: { include: { passport: true, dni: true } },
              },
            },
          },
        });
      }),
    );
  }

  findAll() {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.findMany({
        orderBy: { uploadDate: 'desc' },
        include: {
          paxReservations: {
            include: {
              pax: { include: { passport: true, dni: true } },
            },
          },
        },
      }),
    );
  }

  findOne(id: string) {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.findUniqueOrThrow({
        where: { id },
        include: {
          paxReservations: {
            include: {
              pax: { include: { passport: true, dni: true } },
            },
          },
        },
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
        include: {
          paxReservations: {
            include: {
              pax: { include: { passport: true, dni: true } },
            },
          },
        },
      }),
    );
  }

  remove(id: string) {
    return HandleRequest.prisma(() =>
      this.prisma.reservation.delete({
        where: { id },
        include: {
          paxReservations: {
            include: {
              pax: { include: { passport: true, dni: true } },
            },
          },
        },
      }),
    );
  }
}
