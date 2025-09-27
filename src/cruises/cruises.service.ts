import { Injectable } from '@nestjs/common';
import { CreateCruiseDto } from './dto/create-cruise.dto';
import { UpdateCruiseDto } from './dto/update-cruise.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';

@Injectable()
export class CruisesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Nuevo: recibimos actorId (usuario autenticado) para sellar createdBy/updatedBy.
   * Más adelante esto lo hará un middleware y podemos sacar el parámetro.
   */
  create(actorId: string, createCruiseDto: CreateCruiseDto) {
    return handleRequest(async () => {
      // Validaciones de dominio (igual que antes)
      CommonOriginDestinationPolicies.assertCreateDifferent(
        createCruiseDto,
        'embarkationPort',
        'arrivalPort',
        {
          required: 'any',
          labels: { a: 'embarque', b: 'llegada' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertUpdateRange(
        createCruiseDto,
        { start: createCruiseDto.startDate, end: createCruiseDto.endDate },
        'startDate',
        'endDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: { start: 'fecha de salida', end: 'fecha de llegada' },
        },
      );

      CommonPricePolicies.assertCreatePrice(
        createCruiseDto,
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.cruise.create({
        data: {
          startDate: createCruiseDto.startDate,
          endDate: createCruiseDto.endDate ?? undefined,
          bookingReference: createCruiseDto.bookingReference ?? undefined,
          provider: createCruiseDto.provider,
          embarkationPort: createCruiseDto.embarkationPort,
          arrivalPort: createCruiseDto.arrivalPort ?? undefined,
          totalPrice: createCruiseDto.totalPrice,
          amountPaid: createCruiseDto.amountPaid,
          reservationId: createCruiseDto.reservationId,

          // 🔐 sellos requeridos por el nuevo schema
          createdBy: actorId,
          updatedBy: actorId,
        },
      });
    });
  }

  findOne(id: string) {
    return handleRequest(async () => {
      return this.prisma.cruise.findUniqueOrThrow({ where: { id } });
    });
  }

  update(actorId: string, id: string, updateCruiseDto: UpdateCruiseDto) {
    return handleRequest(async () => {
      const current = await this.prisma.cruise.findUniqueOrThrow({
        where: { id },
        select: {
          startDate: true,
          endDate: true,
          embarkationPort: true,
          arrivalPort: true,
          totalPrice: true,
          amountPaid: true,
        },
      });

      // Validaciones de dominio (igual que antes)
      CommonOriginDestinationPolicies.assertUpdateDifferent(
        updateCruiseDto,
        { a: current.embarkationPort, b: current.arrivalPort },
        'embarkationPort',
        'arrivalPort',
        {
          required: 'any',
          labels: { a: 'embarque', b: 'llegada' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertUpdateRange(
        updateCruiseDto,
        { start: current.startDate, end: current.endDate },
        'startDate',
        'endDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: { start: 'fecha de salida', end: 'fecha de llegada' },
        },
      );

      CommonPricePolicies.assertUpdatePrice(
        updateCruiseDto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.cruise.update({
        where: { id },
        data: {
          startDate: updateCruiseDto.startDate ?? undefined,
          endDate: updateCruiseDto.endDate ?? undefined,
          bookingReference: updateCruiseDto.bookingReference ?? undefined,
          provider: updateCruiseDto.provider ?? undefined,
          embarkationPort: updateCruiseDto.embarkationPort ?? undefined,
          arrivalPort: updateCruiseDto.arrivalPort ?? undefined,
          totalPrice:
            typeof updateCruiseDto.totalPrice === 'number'
              ? updateCruiseDto.totalPrice
              : undefined,
          amountPaid:
            typeof updateCruiseDto.amountPaid === 'number'
              ? updateCruiseDto.amountPaid
              : undefined,
          reservationId: updateCruiseDto.reservationId ?? undefined,

          // 🔐 sello requerido por el nuevo schema
          updatedBy: actorId,
        },
      });
    });
  }

  remove(actorId: string, id: string) {
    // Si querés “soft delete” con auditoría, acá pondrías deletedBy/At.
    return handleRequest(async () => {
      return this.prisma.cruise.delete({ where: { id } });
    });
  }
}
