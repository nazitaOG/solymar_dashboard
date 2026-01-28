import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaxDto } from './dto/create-pax.dto';
import { UpdatePaxDto } from './dto/update-pax.dto';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaxPolicies } from './policies/pax.policies';
import { hasPrimary } from '../common/utils/value-guards';
import { NestStructuredLogger } from '../common/logging/structured-logger';

export type FindAllPaxParams = {
  include?: string | string[];
  offset?: number | string;
  limit?: number | string;
  // Filtros
  name?: string;
  nationality?: string;
  documentFilter?: 'all' | 'with-dni' | 'with-passport';
};

@Injectable()
export class PaxService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  // username = nombre de usuario del usuario autenticado
  create(username: string, dto: CreatePaxDto) {
    const hasPassport = hasPrimary(dto.passportNum, dto.passportExpirationDate);
    const hasDni = hasPrimary(dto.dniNum, dto.dniExpirationDate);

    return handleRequest(
      async () => {
        PaxPolicies.assertCreate(dto);

        // Seguridad adicional
        if (!hasPassport && !hasDni) {
          throw new BadRequestException(
            'Debe ingresar al menos un documento (DNI o Pasaporte).',
          );
        }

        return this.prisma.pax.create({
          data: {
            name: dto.name,
            birthDate: new Date(dto.birthDate),
            nationality: dto.nationality.toUpperCase(),
            email: dto.email ?? undefined,
            phoneNumber: dto.phoneNumber ?? undefined,
            createdBy: username,
            updatedBy: username,

            passport: hasPassport
              ? {
                  create: {
                    passportNum: dto.passportNum,
                    expirationDate:
                      dto.dniExpirationDate &&
                      dto.dniExpirationDate.trim() !== ''
                        ? new Date(dto.dniExpirationDate)
                        : null,
                    createdBy: username,
                    updatedBy: username,
                  },
                }
              : undefined,

            dni: hasDni
              ? {
                  create: {
                    dniNum: dto.dniNum,
                    expirationDate:
                      dto.dniExpirationDate &&
                      dto.dniExpirationDate.trim() !== ''
                        ? new Date(dto.dniExpirationDate)
                        : null,
                    createdBy: username,
                    updatedBy: username,
                  },
                }
              : undefined,
          },
          include: { passport: true, dni: true },
        });
      },
      this.logger,
      {
        op: 'PaxService.create',
        username,
        extras: {
          hasPassport,
          hasDni,
          nationality: dto.nationality,
        },
      },
    );
  }

  async findAll(params: FindAllPaxParams = {}) {
    return handleRequest(
      async () => {
        // 1. NORMALIZACIÓN DE PAGINACIÓN
        // Convertimos a número y validamos rangos
        let offset = Number(params.offset) || 0;
        if (offset < 0) offset = 0;

        let limit = Number(params.limit) || 20;
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;

        // 2. CONSTRUCCIÓN DEL WHERE DINÁMICO
        // Usamos el tipado estricto de Prisma para evitar errores de tipo en el objeto
        const where: Parameters<typeof this.prisma.pax.findMany>[0]['where'] = {
          // Filtro por NOMBRE (name)
          ...(params.name &&
            params.name.trim() !== '' && {
              name: { contains: params.name.trim(), mode: 'insensitive' },
            }),

          // Filtro por NACIONALIDAD
          ...(params.nationality &&
            params.nationality !== 'all' && {
              nationality: {
                equals: params.nationality,
                mode: 'insensitive',
              },
            }),

          // Filtro por TIPO DE DOCUMENTO (Lógica condicional)
          ...(params.documentFilter === 'with-dni' && {
            dni: { isNot: null },
          }),
          ...(params.documentFilter === 'with-passport' && {
            passport: { isNot: null },
          }),
        };

        // 3. CONSTRUCCIÓN DINÁMICA DE INCLUDES
        // Procesamos los includes que vienen del front (string o array)
        const includes = new Set(
          typeof params.include === 'string'
            ? params.include.split(',').map((i) => i.trim())
            : params.include || [],
        );

        // Definimos el objeto include con tipado estricto
        const include: Parameters<
          typeof this.prisma.pax.findMany
        >[0]['include'] = {};

        // Activamos relaciones solo si se piden
        if (includes.has('passport')) include.passport = true;
        if (includes.has('dni')) include.dni = true;
        // Si tienes PaxReservations y quisieras incluirlas:
        if (includes.has('paxReservations')) include.paxReservations = true;

        // 4. EJECUCIÓN EN PARALELO
        // Traemos data (limit + 1 para calcular hasNext) y el total count
        const [rows, total] = await Promise.all([
          this.prisma.pax.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit + 1,
            include,
          }),
          this.prisma.pax.count({ where }),
        ]);

        // 5. PROCESAMIENTO DE RESULTADOS
        const hasNext = rows.length > limit;
        const data = hasNext ? rows.slice(0, limit) : rows;

        // 6. RETORNO DE DATA + METADATA
        return {
          meta: {
            offset,
            limit,
            total,
            hasNext,
            totalPages: Math.ceil(total / limit),
            page: Math.floor(offset / limit) + 1,
            nextOffset: hasNext ? offset + limit : undefined,
          },
          data,
        };
      },
      this.logger,
      {
        op: 'PaxService.findAll',
        extras: {
          name: params.name,
          nationality: params.nationality,
          docFilter: params.documentFilter,
          offset: params.offset,
          limit: params.limit,
        },
      },
    );
  }

  findOne(id: string) {
    return handleRequest(
      () =>
        this.prisma.pax.findUniqueOrThrow({
          where: { id },
          include: { passport: true, dni: true },
        }),
      this.logger,
      {
        op: 'PaxService.findOne',
        extras: { id },
      },
    );
  }

  // actorId = id del usuario autenticado
  update(username: string, id: string, dto: UpdatePaxDto) {
    return handleRequest(
      () => {
        PaxPolicies.assertUpdate(dto);

        return this.prisma.pax.update({
          where: { id },
          data: {
            name: dto.name ?? undefined,
            nationality: dto.nationality ?? undefined,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,

            // sello de último editor
            updatedBy: username,
            email: dto.email !== undefined ? dto.email : undefined,
            phoneNumber:
              dto.phoneNumber !== undefined ? dto.phoneNumber : undefined,

            passport:
              dto.passportNum !== undefined ||
              dto.passportExpirationDate !== undefined
                ? {
                    upsert: {
                      update: {
                        passportNum:
                          dto.passportNum !== undefined
                            ? dto.passportNum
                            : undefined,
                        expirationDate:
                          dto.passportExpirationDate !== undefined
                            ? new Date(dto.passportExpirationDate)
                            : undefined,

                        // sello en nested update
                        updatedBy: username,
                      },
                      create: (() => {
                        if (!dto.passportNum || !dto.passportExpirationDate) {
                          throw new BadRequestException(
                            'Pasaporte: número y fecha son requeridos para crear.',
                          );
                        }
                        return {
                          passportNum: dto.passportNum,
                          expirationDate: new Date(dto.passportExpirationDate),
                          createdBy: username,
                          updatedBy: username,
                        };
                      })(),
                    },
                  }
                : undefined,

            dni:
              dto.dniNum !== undefined || dto.dniExpirationDate !== undefined
                ? {
                    upsert: {
                      update: {
                        dniNum:
                          dto.dniNum !== undefined ? dto.dniNum : undefined,
                        expirationDate:
                          dto.dniExpirationDate !== undefined
                            ? new Date(dto.dniExpirationDate)
                            : undefined,

                        // sello en nested update
                        updatedBy: username,
                      },
                      create: (() => {
                        if (!dto.dniNum || !dto.dniExpirationDate) {
                          throw new BadRequestException(
                            'DNI: número y fecha son requeridos para crear.',
                          );
                        }
                        return {
                          dniNum: dto.dniNum,
                          expirationDate: new Date(dto.dniExpirationDate),
                          createdBy: username,
                          updatedBy: username,
                        };
                      })(),
                    },
                  }
                : undefined,
          },
          include: { passport: true, dni: true },
        });
      },
      this.logger,
      {
        op: 'PaxService.update',
        username,
        extras: {
          id,
          passportChanged:
            dto.passportNum !== undefined ||
            dto.passportExpirationDate !== undefined,
          dniChanged:
            dto.dniNum !== undefined || dto.dniExpirationDate !== undefined,
        },
      },
    );
  }

  async remove(username: string, id: string) {
    return handleRequest(
      async () => {
        // 1. Verificamos existencia (esto está bien para dar un error limpio)
        const existing = await this.prisma.pax.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!existing) {
          throw new NotFoundException('Registro no encontrado en Pax');
        }

        // 2. Borramos ÚNICAMENTE al pasajero.
        // No hace falta $transaction para una sola operación.
        // La base de datos se encargará de borrar Dni y Passport
        // automáticamente gracias al ON DELETE CASCADE.
        return this.prisma.pax.delete({
          where: { id },
        });
      },
      this.logger,
      { op: 'PaxService.remove', username, extras: { id } },
    );
  }
}
