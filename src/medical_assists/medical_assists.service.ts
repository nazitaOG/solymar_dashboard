import { Injectable } from '@nestjs/common';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { HandleRequest } from '../common/utils/handle-request';

@Injectable()
export class MedicalAssistsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMedicalAssistDto: CreateMedicalAssistDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.medicalAssist.create({
        data: createMedicalAssistDto,
      });
    });
  }

  findAll() {
    return HandleRequest.prisma(() => {
      return this.prisma.medicalAssist.findMany();
    });
  }

  findOne(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.medicalAssist.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateMedicalAssistDto: UpdateMedicalAssistDto) {
    return HandleRequest.prisma(() => {
      return this.prisma.medicalAssist.update({
        where: { id },
        data: updateMedicalAssistDto,
      });
    });
  }

  remove(id: string) {
    return HandleRequest.prisma(() => {
      return this.prisma.medicalAssist.delete({
        where: { id },
      });
    });
  }
}
