import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonPricePolicies } from '../common/policies/price.policies';
import { PrismaClient } from '@prisma/client';
import { touchReservation } from '../common/db/touch-reservation.db';
import { NestStructuredLogger } from '../common/logging/structured-logger';
import { PlaneSegmentPolicies } from './policies/plane-segment.policies';

@Injectable()
export class PlanesService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  // username = nombre de usuario del usuario autenticado
  create(username: string, dto: CreatePlaneDto) {
    return handleRequest(
      async () => {
        // 1. Política de precios
        CommonPricePolicies.assertCreatePrice(dto, 'totalPrice', 'amountPaid', {
          labels: { total: 'total', paid: 'pagado' },
        });
        // 2. Política de segmentos
        PlaneSegmentPolicies.assertValidSegments(dto.segments);

        return this.prisma.$transaction(async (tx: PrismaClient) => {
          // 3. Crear el vuelo (sin info de tramo)
          const plane = await tx.plane.create({
            data: {
              reservationId: dto.reservationId,
              bookingReference: dto.bookingReference,
              provider: dto.provider ?? undefined,
              totalPrice: dto.totalPrice,
              amountPaid: dto.amountPaid,
              currency: dto.currency,
              notes: dto.notes ?? undefined,
              createdBy: username,
              updatedBy: username,
            },
            select: {
              id: true,
              reservationId: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
              createdAt: true,
              updatedAt: true,
              bookingReference: true,
              provider: true,
              notes: true,
            },
          });

          // 4. Insertar segmentos
          await tx.planeSegment.createMany({
            data: dto.segments.map((seg, i) => ({
              planeId: plane.id,
              segmentOrder: i + 1,
              departure: seg.departure,
              arrival: seg.arrival,
              departureDate: seg.departureDate,
              arrivalDate: seg.arrivalDate,
              airline: seg.airline ?? null,
              flightNumber: seg.flightNumber ?? null,
              createdBy: username,
              updatedBy: username,
            })),
          });

          // 5. Ajustar totales de la reserva
          await touchReservation(tx, plane.reservationId, username, {
            currency: plane.currency,
            totalAdjustment: Number(plane.totalPrice),
            paidAdjustment: Number(plane.amountPaid),
          });

          return plane;
        });
      },

      // LOGGING
      this.logger,
      {
        op: 'PlanesService.create',
        username,
        extras: {
          reservationId: dto.reservationId,
          segments: dto.segments.length,
          bookingReference: dto.bookingReference,
          currency: dto.currency,
          totalPrice: dto.totalPrice,
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () =>
        this.prisma.plane.findUniqueOrThrow({
          where: { id },
          include: {
            segments: {
              orderBy: { segmentOrder: 'asc' },
            },
          },
        }),
      this.logger,
      {
        op: 'PlanesService.findOne',
        extras: { id },
      },
    );
  }

  findByReservation(reservationId: string) {
    return handleRequest(
      async () => {
        // 1️⃣ Validamos coherencia
        const exists = await this.prisma.reservation.findUnique({
          where: { id: reservationId },
          select: { id: true },
        });

        if (!exists) {
          throw new Error(`Reservation ${reservationId} not found`);
        }

        // 2️⃣ Obtenemos los vuelos + segmentos
        const planes = await this.prisma.plane.findMany({
          where: { reservationId },
          include: {
            segments: {
              orderBy: { segmentOrder: 'asc' },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        return planes;
      },
      this.logger,
      {
        op: 'PlanesService.findByReservation',
        extras: { reservationId },
      },
    );
  }

  // actorId = id del usuario autenticado
  update(username: string, id: string, dto: UpdatePlaneDto) {
    return handleRequest(
      async () => {
        // 1. Obtener estado actual para cálculos de diferencia de precio
        const current = await this.prisma.plane.findUniqueOrThrow({
          where: { id },
          select: {
            totalPrice: true,
            amountPaid: true,
            reservationId: true,
            currency: true,
          },
        });

        // 2. Validaciones de negocio
        // 2.1 Precio
        CommonPricePolicies.assertUpdatePrice(
          dto,
          { total: current.totalPrice, paid: current.amountPaid },
          'totalPrice',
          'amountPaid',
          { labels: { total: 'total', paid: 'pagado' } },
        );

        // 2.2 Segmentos (si vienen en el DTO)
        if (dto.segments) {
          if (dto.segments.length === 0) {
            throw new BadRequestException(`Debe haber al menos 1 segmento.`);
          }
          // Validación individual
          dto.segments.forEach((seg, i) => {
            PlaneSegmentPolicies.assertValidSegment(seg, i);
          });
          // Validar orden
          PlaneSegmentPolicies.assertSegmentOrder(dto.segments);
          // Validar continuidad (fechas y aeropuertos)
          PlaneSegmentPolicies.assertContinuous(dto.segments);
        }

        // 3. Transacción de escritura
        return this.prisma.$transaction(async (tx) => {
          // A) Actualizar datos del Plane (Cabecera)
          // Nota: Ya no hacemos el 'include' aquí porque los segmentos cambiarán después
          await tx.plane.update({
            where: { id },
            data: {
              bookingReference: dto.bookingReference ?? undefined,
              provider: dto.provider ?? undefined,
              totalPrice:
                typeof dto.totalPrice === 'number' ? dto.totalPrice : undefined,
              amountPaid:
                typeof dto.amountPaid === 'number' ? dto.amountPaid : undefined,
              notes: dto.notes ?? undefined,
              updatedBy: username,
            },
          });

          // B) Reemplazo de Segmentos (Estrategia Delete-Insert)
          if (dto.segments) {
            // Borrar viejos
            await tx.planeSegment.deleteMany({
              where: { planeId: id },
            });

            // Insertar nuevos (con las nuevas fechas corregidas)
            await tx.planeSegment.createMany({
              data: dto.segments.map((s) => ({
                planeId: id,
                segmentOrder: s.segmentOrder,
                departure: s.departure,
                arrival: s.arrival,
                departureDate: s.departureDate,
                arrivalDate: s.arrivalDate,
                airline: s.airline ?? null,
                flightNumber: s.flightNumber ?? null,
                createdBy: username,
                updatedBy: username,
              })),
            });
          }

          // C) Reajuste de totales en la Reserva padre
          await touchReservation(
            tx as unknown as Omit<PrismaClient, '$transaction'>,
            current.reservationId,
            username,
            {
              currency: current.currency,
              totalAdjustment:
                typeof dto.totalPrice === 'number'
                  ? Number(dto.totalPrice) - current.totalPrice.toNumber()
                  : 0,
              paidAdjustment:
                typeof dto.amountPaid === 'number'
                  ? Number(dto.amountPaid) - current.amountPaid.toNumber()
                  : 0,
            },
          );

          // D) 🔥 FETCH FINAL (LA SOLUCIÓN)
          // Recuperamos el objeto completo DESPUÉS de haber borrado y creado los segmentos.
          // Esto garantiza que el frontend reciba los IDs y fechas nuevas.
          const finalResult = await tx.plane.findUniqueOrThrow({
            where: { id },
            include: {
              segments: {
                orderBy: { segmentOrder: 'asc' },
              },
            },
          });

          return finalResult;
        });
      },
      this.logger,
      {
        op: 'PlanesService.update',
        username,
        extras: {
          id,
          totalPriceNew:
            typeof dto.totalPrice === 'number'
              ? Number(dto.totalPrice)
              : undefined,
          amountPaidNew:
            typeof dto.amountPaid === 'number'
              ? Number(dto.amountPaid)
              : undefined,
          segmentsCount: dto.segments?.length ?? undefined,
        },
      },
    );
  }

  remove(username: string, id: string) {
    return handleRequest(
      async () => {
        return this.prisma.$transaction(async (tx: PrismaClient) => {
          const deleted = await tx.plane.delete({
            where: { id },
            select: {
              id: true,
              reservationId: true,
              totalPrice: true,
              amountPaid: true,
              currency: true,
            },
          });

          await touchReservation(tx, deleted.reservationId, username, {
            currency: deleted.currency,
            totalAdjustment: -deleted.totalPrice.toNumber(),
            paidAdjustment: -deleted.amountPaid.toNumber(),
          });

          return { id: deleted.id };
        });
      },
      this.logger,
      {
        op: 'PlanesService.remove',
        username,
        extras: { id },
      },
    );
  }
}
