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

  findAll() {
    return handleRequest(
      () =>
        this.prisma.pax.findMany({
          orderBy: { createdAt: 'desc' }, // antes usabas uploadDate
          include: { passport: true, dni: true },
        }),
      this.logger,
      {
        op: 'PaxService.findAll',
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
