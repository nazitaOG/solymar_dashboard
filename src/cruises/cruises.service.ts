import { Injectable } from '@nestjs/common';
import { CreateCruiseDto } from './dto/create-cruise.dto';
import { UpdateCruiseDto } from './dto/update-cruise.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';

@Injectable()
export class CruisesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCruiseDto: CreateCruiseDto) {
    return handleRequest(() => {
      return this.prisma.cruise.create({
        data: createCruiseDto,
      });
    });
  }

  // findAll() {
  //   return handleRequest(() => {
  //     return this.prisma.cruise.findMany();
  //   });
  // }

  findOne(id: string) {
    return handleRequest(() => {
      return this.prisma.cruise.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateCruiseDto: UpdateCruiseDto) {
    return handleRequest(() => {
      return this.prisma.cruise.update({
        where: { id },
        data: updateCruiseDto,
      });
    });
  }

  remove(id: string) {
    return handleRequest(() => {
      return this.prisma.cruise.delete({
        where: { id },
      });
    });
  }
}
