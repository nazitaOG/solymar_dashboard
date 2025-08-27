import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    try {
      const reservation = await this.prisma.reservation.create({
        data: createReservationDto,
      });

      return reservation;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      const reservations = await this.prisma.reservation.findMany();
      return reservations;
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id },
      });
      return reservation;
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    try {
      const reservation = await this.prisma.reservation.update({
        where: { id },
        data: updateReservationDto,
      });
      return reservation;
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: string) {
    try {
      const reservation = await this.prisma.reservation.delete({
        where: { id },
      });
      return reservation;
    } catch (error) {
      throw new Error(error);
    }
  }
}
