import { Injectable } from '@nestjs/common';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPlaneDto: CreatePlaneDto) {
    return handleRequest(() => {
      return this.prisma.plane.create({
        data: createPlaneDto,
      });
    });
  }

  // findAll() {
  //   return handleRequest(() => {
  //     return this.prisma.plane.findMany();
  //   });
  // }

  findOne(id: string) {
    return handleRequest(() => {
      return this.prisma.plane.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updatePlaneDto: UpdatePlaneDto) {
    return handleRequest(() => {
      return this.prisma.plane.update({
        where: { id },
        data: updatePlaneDto,
      });
    });
  }

  remove(id: string) {
    return handleRequest(() => {
      return this.prisma.plane.delete({
        where: { id },
      });
    });
  }
}
