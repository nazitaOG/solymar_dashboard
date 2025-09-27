import { Injectable } from '@nestjs/common';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/date.policies';
import { CommonOriginDestinationPolicies } from '../common/policies/origin-destination.policies';
import { CommonPricePolicies } from '../common/policies/price.policies';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreatePlaneDto) {
    return handleRequest(() => {
      CommonOriginDestinationPolicies.assertCreateDifferent(
        dto,
        'departure',
        'arrival',
        {
          required: 'any',
          labels: { a: 'salida', b: 'llegada' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertUpdateRange(
        dto,
        { start: dto.departureDate, end: dto.arrivalDate },
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: { start: 'fecha de salida', end: 'fecha de llegada' },
        },
      );

      CommonPricePolicies.assertCreatePrice(
        dto,
        'totalPrice',
        'amountPaid',

        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.plane.create({
        data: {
          departure: dto.departure,
          arrival: dto.arrival ?? undefined,
          departureDate: dto.departureDate,
          arrivalDate: dto.arrivalDate ?? undefined,
          bookingReference: dto.bookingReference,
          provider: dto.provider ?? undefined,
          totalPrice: dto.totalPrice,
          amountPaid: dto.amountPaid,
          notes: dto.notes ?? undefined,
          reservationId: dto.reservationId,

          // sellos del nuevo esquema
          createdBy: actorId,
          updatedBy: actorId,
        },
      });
    });
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.plane.findUniqueOrThrow({ where: { id } }),
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, dto: UpdatePlaneDto) {
    return handleRequest(async () => {
      const current = await this.prisma.plane.findUniqueOrThrow({
        where: { id },
        select: {
          departureDate: true,
          arrivalDate: true,
          departure: true,
          arrival: true,
          totalPrice: true,
          amountPaid: true,
        },
      });

      CommonOriginDestinationPolicies.assertUpdateDifferent(
        dto,
        { a: current.departure, b: current.arrival },
        'departure',
        'arrival',
        {
          required: 'any',
          labels: { a: 'salida', b: 'llegada' },
          ignoreCase: true,
          trim: true,
        },
      );

      CommonDatePolicies.assertUpdateRange(
        dto,
        { start: current.departureDate, end: current.arrivalDate },
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: { start: 'fecha de salida', end: 'fecha de llegada' },
        },
      );

      CommonPricePolicies.assertUpdatePrice(
        dto,
        { total: current.totalPrice, paid: current.amountPaid },
        'totalPrice',
        'amountPaid',
        { labels: { total: 'total', paid: 'pagado' } },
      );

      return this.prisma.plane.update({
        where: { id },
        data: {
          departure: dto.departure ?? undefined,
          arrival: dto.arrival ?? undefined,
          departureDate: dto.departureDate ?? undefined,
          arrivalDate: dto.arrivalDate ?? undefined,
          bookingReference: dto.bookingReference ?? undefined,
          provider: dto.provider ?? undefined,
          totalPrice:
            typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
          amountPaid:
            typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
          notes: dto.notes ?? undefined,
          reservationId: dto.reservationId ?? undefined,

          // sello de último editor
          updatedBy: actorId,
        },
      });
    });
  }

  remove(actorId: string, id: string) {
    // si luego haces soft delete, acá guardarías deletedBy/At
    return handleRequest(() => this.prisma.plane.delete({ where: { id } }));
  }
}
