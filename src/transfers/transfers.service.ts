import { Injectable } from '@nestjs/common';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { HandleRequest } from '../common/utils/handle-request';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}
  create(createTransferDto: CreateTransferDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.transfer.create({
        data: createTransferDto,
      });
    });
  }

  // findAll() {
  //   return HandleRequest.prisma(() => {
  //     return this.prisma.transfer.findMany();
  //   });
  // }

  findOne(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.transfer.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateTransferDto: UpdateTransferDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.transfer.update({
        where: { id },
        data: updateTransferDto,
      });
    });
  }

  remove(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.transfer.delete({
        where: { id },
      });
    });
  }
}
