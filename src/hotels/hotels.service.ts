import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { HandleRequest } from '../common/utils/handle-request';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createHotelDto: CreateHotelDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.hotel.create({
        data: createHotelDto,
      });
    });
  }

  findAll() {
    return HandleRequest.prisma(() => {
      return this.prisma.hotel.findMany();
    });
  }

  findOne(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.hotel.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateHotelDto: UpdateHotelDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.hotel.update({
        where: { id },
        data: updateHotelDto,
      });
    });
  }

  remove(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.hotel.delete({
        where: { id },
      });
    });
  }
}
