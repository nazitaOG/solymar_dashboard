import { Injectable } from '@nestjs/common';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonPricePolicies } from '../common/policies/price.policies';

@Injectable()
export class MedicalAssistsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMedicalAssistDto: CreateMedicalAssistDto) {
    return handleRequest(() => {
      CommonPricePolicies.assertCreatePrice(
        createMedicalAssistDto,
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.medicalAssist.create({
        data: {
          totalPrice: createMedicalAssistDto.totalPrice,
          amountPaid: createMedicalAssistDto.amountPaid,
          bookingReference: createMedicalAssistDto.bookingReference,
          assistType: createMedicalAssistDto.assistType ?? undefined,
          provider: createMedicalAssistDto.provider,
          reservationId: createMedicalAssistDto.reservationId,
        },
      });
    });
  }

  // findAll() {
  //   return handleRequest(() => {
  //     return this.prisma.medicalAssist.findMany();
  //   });
  // }

  findOne(id: string) {
    return handleRequest(() => {
      return this.prisma.medicalAssist.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updateMedicalAssistDto: UpdateMedicalAssistDto) {
    return handleRequest(async () => {
      const current = await this.prisma.medicalAssist.findUniqueOrThrow({
        where: { id },
        select: { totalPrice: true, amountPaid: true },
      });

      CommonPricePolicies.assertUpdatePrice(
        updateMedicalAssistDto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.medicalAssist.update({
        where: { id },
        data: {
          totalPrice:
            typeof updateMedicalAssistDto.totalPrice === 'number'
              ? updateMedicalAssistDto.totalPrice
              : undefined,
          amountPaid:
            typeof updateMedicalAssistDto.amountPaid === 'number'
              ? updateMedicalAssistDto.amountPaid
              : undefined,
          bookingReference:
            updateMedicalAssistDto.bookingReference ?? undefined,
          assistType: updateMedicalAssistDto.assistType ?? undefined,
          provider: updateMedicalAssistDto.provider ?? undefined,
          reservationId: updateMedicalAssistDto.reservationId ?? undefined,
        },
      });
    });
  }

  remove(id: string) {
    return handleRequest(() => {
      return this.prisma.medicalAssist.delete({
        where: { id },
      });
    });
  }
}
