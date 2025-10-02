import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { NestStructuredLogger } from '../common/logging/structured-logger';

type FindAllReservationsParams = {
  paxId?: string; // filtra reservas que incluyan a este PAX
  offset?: number; // desplazamiento (default 0)
  limit?: number; // tamaño de página (default 20, máx 100)
};

@Injectable()
export class ReservationsService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreateReservationDto) {
    return handleRequest(
      () =>
        this.prisma.$transaction(async (tx) => {
          // Validación de PAX existentes
          const paxIds = [...new Set(dto.paxIds)];
          const foundPax = await tx.pax.findMany({
            where: { id: { in: paxIds } },
            select: { id: true },
          });
          const foundPaxSet = new Set(foundPax.map((p) => p.id));
          const missing = paxIds.filter((id) => !foundPaxSet.has(id));
          if (missing.length) {
            throw new NotFoundException(
              `Some pax were not found: ${missing.join(', ')}`,
            );
          }

          // Crear reserva + join a pax (sellos en todas las filas)
          const res = await tx.reservation.create({
            data: {
              userId: dto.userId,
              state: dto.state,
              createdBy: actorId,
              updatedBy: actorId,
              paxReservations: {
                create: paxIds.map((paxId) => ({
                  pax: { connect: { id: paxId } },
                  createdBy: actorId,
                  updatedBy: actorId,
                })),
              },
            },
            include: {
              paxReservations: {
                include: { pax: { include: { passport: true, dni: true } } },
              },
            },
          });

          return res;
        }),
      this.logger,
      {
        op: 'ReservationsService.create',
        actorId,
        extras: {
          userId: dto.userId,
          paxCount: new Set(dto.paxIds).size,
          state: dto.state,
        },
      },
    );
  }

  findAll(params: FindAllReservationsParams = {}) {
    return handleRequest(
      async () => {
        // saneo offset/limit
        let offset = Number.isFinite(params.offset) ? Number(params.offset) : 0;
        if (offset < 0) offset = 0;

        let limit = Number.isFinite(params.limit) ? Number(params.limit) : 20;
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;

        // filtro por paxId (si viene)
        const where: Parameters<
          typeof this.prisma.reservation.findMany
        >[0]['where'] = params.paxId
          ? { paxReservations: { some: { paxId: params.paxId } } }
          : undefined;

        // pedimos +1 para saber si hay próxima página
        const rows = await this.prisma.reservation.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit + 1,
          // NOTA: no incluimos relaciones pesadas por defecto
          // si más adelante querés sumar include, lo agregamos con un flag
        });

        const hasNext = rows.length > limit;
        const data = hasNext ? rows.slice(0, limit) : rows;
        const nextOffset = hasNext ? offset + limit : undefined;

        return {
          meta: { offset, limit, hasNext, nextOffset },
          data,
        };
      },
      this.logger,
      {
        op: 'ReservationsService.findAll',
        extras: {
          paxId: params.paxId,
          offset: params.offset,
          limit: params.limit,
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () =>
        this.prisma.reservation.findUniqueOrThrow({
          where: { id },
          include: {
            paxReservations: {
              include: { pax: { include: { passport: true, dni: true } } },
            },
          },
        }),
      this.logger,
      {
        op: 'ReservationsService.findOne',
        extras: { id },
      },
    );
  }

  // actorId = id del usuario autenticado
  update(actorId: string, id: string, dto: UpdateReservationDto) {
    return handleRequest(
      () =>
        this.prisma.reservation.update({
          where: { id },
          data: {
            ...(dto.state && { state: dto.state }),
            updatedBy: actorId,
          },
          include: {
            paxReservations: {
              include: { pax: { include: { passport: true, dni: true } } },
            },
          },
        }),
      this.logger,
      {
        op: 'ReservationsService.update',
        actorId,
        extras: {
          id,
          stateNew: dto.state ?? undefined,
        },
      },
    );
  }

  // actorId = id del usuario autenticado
  remove(actorId: string, id: string) {
    return handleRequest(
      () =>
        this.prisma.reservation.delete({
          where: { id },
          include: {
            paxReservations: {
              include: { pax: { include: { passport: true, dni: true } } },
            },
          },
        }),
      this.logger,
      {
        op: 'ReservationsService.remove',
        actorId,
        extras: { id },
      },
    );
  }
}
