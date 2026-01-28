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
import { Prisma } from '@prisma/client';

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
        let offset = Number(params.offset) || 0;
        if (offset < 0) offset = 0;

        let limit = Number(params.limit) || 20;
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;

        // 🧠 2. LÓGICA DE BÚSQUEDA INTELIGENTE
        let fuzzyIds: string[] | null = null;

        if (params.name && params.name.trim().length > 0) {
          // A. Dividimos el input en palabras: "Lioenl Messy" -> ["Lioenl", "Messy"]
          const terms = params.name.trim().split(/\s+/).filter(Boolean);

          if (terms.length > 0) {
            // B. Creamos una condición SQL por cada palabra.
            // Cada palabra debe cumplirse (AND) para que el registro sea válido.
            // Usamos word_similarity > 0.35 para tolerar errores como "Mesi" o "Lioenl".
            const conditions = terms.map(
              (term) => Prisma.sql`
              (
                name ILIKE ${`%${term}%`} 
                OR 
                word_similarity(${term}, name) > 0.35
              )
            `,
            );

            // C. Unimos todas las condiciones con AND
            const whereClause = Prisma.join(conditions, ' AND ');

            // D. Ejecutamos la query cruda
            const rawResults = await this.prisma.$queryRaw<{ id: string }[]>`
              SELECT id 
              FROM "Pax" 
              WHERE ${whereClause}
            `;

            fuzzyIds = rawResults.map((r) => r.id);
          }
        }

        // 3. CONSTRUCCIÓN DEL WHERE DINÁMICO (Prisma)
        const where: Prisma.PaxWhereInput = {
          // ✅ APLICACIÓN DEL FILTRO DE IDs
          // Si fuzzyIds no es null, filtramos por esos IDs encontrados.
          ...(fuzzyIds !== null && {
            id: { in: fuzzyIds },
          }),

          // Filtro por NACIONALIDAD
          ...(params.nationality &&
            params.nationality !== 'all' && {
              nationality: {
                equals: params.nationality,
                mode: 'insensitive',
              },
            }),

          // Filtro por TIPO DE DOCUMENTO
          ...(params.documentFilter === 'with-dni' && {
            dni: { isNot: null },
          }),
          ...(params.documentFilter === 'with-passport' && {
            passport: { isNot: null },
          }),
        };

        // 4. CONSTRUCCIÓN DINÁMICA DE INCLUDES
        const includes = new Set(
          typeof params.include === 'string'
            ? params.include.split(',').map((i) => i.trim())
            : params.include || [],
        );

        const include: Prisma.PaxInclude = {};
        if (includes.has('passport')) include.passport = true;
        if (includes.has('dni')) include.dni = true;
        if (includes.has('paxReservations')) include.paxReservations = true;

        // 5. EJECUCIÓN EN PARALELO
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

        // 6. RETORNO DE DATA + METADATA
        const hasNext = rows.length > limit;
        const data = hasNext ? rows.slice(0, limit) : rows;

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
