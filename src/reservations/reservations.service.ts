import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { NestStructuredLogger } from '../common/logging/structured-logger';
import { Currency } from '@prisma/client';

export type FindAllReservationsParams = {
  paxId?: string; // filtra reservas que incluyan a este PAX
  offset?: number; // desplazamiento (default 0)
  limit?: number; // tamaño de página (default 20, máx 100)
  include?: string | string[]; // includes para la consulta
};

@Injectable()
export class ReservationsService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  // username = nombre de usuario del usuario autenticado
  // actorId = id del usuario autenticado
  create(username: string, actorId: string, dto: CreateReservationDto) {
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
              userId: actorId,
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
              currencyTotals: {
                create: Object.values(Currency).map((currency) => ({
                  currency,
                  totalPrice: 0,
                  amountPaid: 0,
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
        username,
        extras: {
          userId: actorId,
          paxCount: new Set(dto.paxIds).size,
          state: dto.state,
        },
      },
    );
  }

  findAll(params: FindAllReservationsParams = {}) {
    return handleRequest(
      async () => {
        let offset = Number.isFinite(params.offset) ? Number(params.offset) : 0;
        if (offset < 0) offset = 0;

        let limit = Number.isFinite(params.limit) ? Number(params.limit) : 20;
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;

        // Filtro opcional por pax
        const where: Parameters<
          typeof this.prisma.reservation.findMany
        >[0]['where'] = params.paxId
          ? { paxReservations: { some: { paxId: params.paxId } } }
          : undefined;

        // Construcción dinámica de includes
        const includes = new Set(
          typeof params.include === 'string'
            ? params.include.split(',').map((i) => i.trim())
            : params.include || [],
        );

        const include: Parameters<
          typeof this.prisma.reservation.findMany
        >[0]['include'] = {};

        if (includes.has('paxReservations')) {
          include.paxReservations = {
            include: {
              pax: {
                select: {
                  id: true,
                  name: true,
                  birthDate: true,
                  nationality: true,
                },
              },
            },
          };
        }

        if (includes.has('currencyTotals')) {
          include.currencyTotals = true;
        }

        if (includes.has('hotels')) include.hotels = true;
        if (includes.has('planes')) include.planes = true;
        if (includes.has('cruises')) include.cruises = true;
        if (includes.has('transfers')) include.transfers = true;
        if (includes.has('excursions')) include.excursions = true;
        if (includes.has('medicalAssists')) include.medicalAssists = true;

        // Query principal
        const rows = await this.prisma.reservation.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit + 1,
          include, // 👈 dinámico
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
          include: params.include,
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

  update(username: string, id: string, dto: UpdateReservationDto) {
    return handleRequest(
      () =>
        this.prisma.$transaction(async (tx) => {
          const data: Parameters<typeof tx.reservation.update>[0]['data'] = {
            ...(dto.state && { state: dto.state }),
            ...(dto.name && { name: dto.name }),
            updatedBy: username,
          };

          let added = 0;
          let removed = 0;

          if (Array.isArray(dto.paxIds)) {
            // Rechazar array vacío
            if (dto.paxIds.length === 0) {
              throw new BadRequestException(
                'paxIds no puede ser un array vacío: la reserva debe mantener al menos un pasajero.',
              );
            }

            // Normalizar (únicos)
            const incomingIds = Array.from(new Set(dto.paxIds));

            // Validar existencia
            const found = await tx.pax.findMany({
              where: { id: { in: incomingIds } },
              select: { id: true },
            });
            const foundSet = new Set(found.map((p) => p.id));
            const missing = incomingIds.filter((pid) => !foundSet.has(pid));
            if (missing.length) {
              throw new NotFoundException(
                `Some pax were not found: ${missing.join(', ')}`,
              );
            }

            // Traer actuales
            const current = await tx.paxReservation.findMany({
              where: { reservationId: id },
              select: { paxId: true },
            });
            const currentSet = new Set(current.map((r) => r.paxId));

            // Diff
            const toAdd = incomingIds.filter((pid) => !currentSet.has(pid));
            const toRemove = [...currentSet].filter(
              (pid) => !incomingIds.includes(pid),
            );

            // Aplicar cambios
            if (toAdd.length > 0) {
              await tx.paxReservation.createMany({
                data: toAdd.map((paxId) => ({
                  paxId,
                  reservationId: id,
                  createdBy: username,
                  updatedBy: username,
                })),
                skipDuplicates: true,
              });
              added = toAdd.length;
            }

            if (toRemove.length > 0) {
              await tx.paxReservation.deleteMany({
                where: { reservationId: id, paxId: { in: toRemove } },
              });
              removed = toRemove.length;
            }
          }

          const updated = await tx.reservation.update({
            where: { id },
            data,
            include: {
              paxReservations: {
                include: { pax: { include: { passport: true, dni: true } } },
              },
            },
          });

          return Object.assign(updated, {
            _paxSync: Array.isArray(dto.paxIds)
              ? { added, removed, total: updated.paxReservations.length }
              : undefined,
          });
        }),
      this.logger,
      {
        op: 'ReservationsService.update',
        username,
        extras: {
          id,
          stateNew: dto.state ?? undefined,
          paxSyncRequested: Array.isArray(dto.paxIds),
          paxNewCount: Array.isArray(dto.paxIds)
            ? new Set(dto.paxIds).size
            : undefined,
        },
      },
    );
  }

  // username = nombre de usuario del usuario autenticado
  remove(username: string, id: string) {
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
        username,
        extras: { id },
      },
    );
  }
}
