import { Injectable } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { HandleRequest } from '../common/utils/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ExcursionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createExcursionDto: CreateExcursionDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.excursion.create({
        data: createExcursionDto,
      });
    });
  }

  // findAll() {
  //   return HandleRequest.prisma(() => {
  //     return this.prisma.excursion.findMany();
  //   });
  // }

  findOne(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.excursion.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateExcursionDto: UpdateExcursionDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.excursion.update({
        where: { id },
        data: updateExcursionDto,
      });
    });
  }

  remove(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.excursion.delete({
        where: { id },
      });
    });
  }
}
