import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaxDto } from './dto/create-pax.dto';
import { UpdatePaxDto } from './dto/update-pax.dto';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaxPolicies } from './policies/pax.policies';
import { providedPair } from '../common/utils/value-guards';
import { NestStructuredLogger } from '../common/logging/structured-logger';

@Injectable()
export class PaxService {
  private readonly logger = new NestStructuredLogger();

  constructor(private readonly prisma: PrismaService) {}

  // actorId = id del usuario autenticado
  create(actorId: string, dto: CreatePaxDto) {
    return handleRequest(
      () => {
        PaxPolicies.assertCreate(dto);

        const hasPassport = providedPair(
          dto.passportNum,
          dto.passportExpirationDate,
        );
        const hasDni = providedPair(dto.dniNum, dto.dniExpirationDate);

        return this.prisma.pax.create({
          data: {
            name: dto.name,
            birthDate: new Date(dto.birthDate),
            nationality: dto.nationality,

            // sellos del nuevo esquema
            createdBy: actorId,
            updatedBy: actorId,

            passport: hasPassport
              ? {
                  create: {
                    passportNum: dto.passportNum,
                    expirationDate: new Date(dto.passportExpirationDate),
                    createdBy: actorId,
                    updatedBy: actorId,
                  },
                }
              : undefined,

            dni: hasDni
              ? {
                  create: {
                    dniNum: dto.dniNum,
                    expirationDate: new Date(dto.dniExpirationDate),
                    createdBy: actorId,
                    updatedBy: actorId,
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
        actorId,
        // Evitar PII sensible en logs; logueamos flags y tipos
        extras: {
          hasPassport: Boolean(dto.passportNum && dto.passportExpirationDate),
          hasDni: Boolean(dto.dniNum && dto.dniExpirationDate),
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
  update(actorId: string, id: string, dto: UpdatePaxDto) {
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
            updatedBy: actorId,

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
                        updatedBy: actorId,
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
                          createdBy: actorId,
                          updatedBy: actorId,
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
                        updatedBy: actorId,
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
                          createdBy: actorId,
                          updatedBy: actorId,
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
        actorId,
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

  remove(actorId: string, id: string) {
    // si luego haces soft delete, acá podrías registrar deletedBy/At
    return handleRequest(
      () =>
        this.prisma.pax.delete({
          where: { id },
          include: { passport: true, dni: true },
        }),
      this.logger,
      {
        op: 'PaxService.remove',
        actorId,
        extras: { id },
      },
    );
  }
}
