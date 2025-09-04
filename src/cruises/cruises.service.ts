import { Injectable } from '@nestjs/common';
import { CreateCruiseDto } from './dto/create-cruise.dto';
import { UpdateCruiseDto } from './dto/update-cruise.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { HandleRequest } from '../common/utils/handle-request';

@Injectable()
export class CruisesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCruiseDto: CreateCruiseDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.cruise.create({
        data: createCruiseDto,
      });
    });
  }

  findAll() {
    return HandleRequest.prisma(() => {
      return this.prisma.cruise.findMany();
    });
  }

  findOne(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.cruise.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateCruiseDto: UpdateCruiseDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.cruise.update({
        where: { id },
        data: updateCruiseDto,
      });
    });
  }

  remove(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.cruise.delete({
        where: { id },
      });
    });
  }
}
