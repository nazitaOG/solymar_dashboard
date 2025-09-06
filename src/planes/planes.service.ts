import { Injectable } from '@nestjs/common';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { HandleRequest } from '../common/utils/handle-request';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPlaneDto: CreatePlaneDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.plane.create({
        data: createPlaneDto,
      });
    });
  }

  findAll() {
    return HandleRequest.prisma(() => {
      return this.prisma.plane.findMany();
    });
  }

  findOne(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.plane.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updatePlaneDto: UpdatePlaneDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.plane.update({
        where: { id },
        data: updatePlaneDto,
      });
    });
  }

  remove(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.plane.delete({
        where: { id },
      });
    });
  }
}
