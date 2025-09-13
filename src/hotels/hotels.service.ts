import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createHotelDto: CreateHotelDto) {
    return handleRequest(() => {
      return this.prisma.hotel.create({
        data: createHotelDto,
      });
    });
  }

  // findAll() {
  //   return handleRequest(() => {
  //     return this.prisma.hotel.findMany();
  //   });
  // }

  findOne(id: string) {
    return handleRequest(() => {
      return this.prisma.hotel.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateHotelDto: UpdateHotelDto) {
    return handleRequest(() => {
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
