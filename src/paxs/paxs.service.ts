import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaxDto } from './dto/create-pax.dto';
import { UpdatePaxDto } from './dto/update-pax.dto';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaxPolicies } from './policies/pax.policies';
import { providedPair } from '../common/utils/value-guards';

@Injectable()
export class PaxService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePaxDto) {
    return handleRequest(() => {
      // Validaciones de negocio centralizadas
      PaxPolicies.assertCreate(dto);

      const hasPassport = providedPair(
        dto.passportNum,
        dto.passportExpirationDate,
      );
      const hasDni = providedPair(dto.dniNum, dto.dniExpirationDate);

      return this.prisma.pax.create({
        data: {
          name: dto.name,
          birthDate: new Date(dto.birthDate), // ISO → Date
          nationality: dto.nationality,
          // uploadDate lo setea la DB con @default(now())

          passport: hasPassport
            ? {
                create: {
                  passportNum: dto.passportNum!, // ya validado arriba
                  expirationDate: new Date(dto.passportExpirationDate!), // ya validado arriba
                },
              }
            : undefined,

          dni: hasDni
            ? {
                create: {
                  dniNum: dto.dniNum!, // ya validado arriba
                  expirationDate: new Date(dto.dniExpirationDate!), // ya validado arriba
                },
              }
            : undefined,
        },
        include: { passport: true, dni: true },
      });
    });
  }

  findAll() {
    return handleRequest(() =>
      this.prisma.pax.findMany({
        orderBy: { uploadDate: 'desc' },
      }),
    );
  }

  findOne(id: string) {
    return handleRequest(() =>
      this.prisma.pax.findUniqueOrThrow({
        where: { id },
        include: {
          passport: true,
          dni: true,
        },
      }),
    );
  }

  update(id: string, updatePaxDto: UpdatePaxDto) {
    return handleRequest(() => {
      PaxPolicies.assertUpdate(updatePaxDto);
      return this.prisma.pax.update({
        where: { id },
        data: {
          name: updatePaxDto.name ?? undefined,
          nationality: updatePaxDto.nationality ?? undefined,
          birthDate: updatePaxDto.birthDate ?? undefined,
          passport:
            updatePaxDto.passportNum !== undefined ||
            updatePaxDto.passportExpirationDate !== undefined
              ? {
                  upsert: {
                    update: {
                      passportNum:
                        updatePaxDto.passportNum !== undefined
                          ? updatePaxDto.passportNum
                          : undefined,
                      expirationDate:
                        updatePaxDto.passportExpirationDate !== undefined
                          ? new Date(updatePaxDto.passportExpirationDate)
                          : undefined,
                    },
                    create: (() => {
                      if (
                        !updatePaxDto.passportNum ||
                        !updatePaxDto.passportExpirationDate
                      ) {
                        throw new BadRequestException(
                          'Pasaporte: número y fecha son requeridos para crear.',
                        );
                      }
                      return {
                        passportNum: updatePaxDto.passportNum,
                        expirationDate: new Date(
                          updatePaxDto.passportExpirationDate,
                        ),
                      };
                    })(),
                  },
                }
              : undefined,
          dni:
            updatePaxDto.dniNum !== undefined ||
            updatePaxDto.dniExpirationDate !== undefined
              ? {
                  upsert: {
                    update: {
                      dniNum:
                        updatePaxDto.dniNum !== undefined
                          ? updatePaxDto.dniNum
                          : undefined,
                      expirationDate:
                        updatePaxDto.dniExpirationDate !== undefined
                          ? new Date(updatePaxDto.dniExpirationDate)
                          : undefined,
                    },
                    create: (() => {
                      if (
                        !updatePaxDto.dniNum ||
                        !updatePaxDto.dniExpirationDate
                      ) {
                        throw new BadRequestException(
                          'DNI: número y fecha son requeridos para crear.',
                        );
                      }
                      return {
                        dniNum: updatePaxDto.dniNum,
                        expirationDate: new Date(
                          updatePaxDto.dniExpirationDate,
                        ),
                      };
                    })(),
                  },
                }
              : undefined,
        },
        include: { passport: true, dni: true },
      });
    });
  }

  remove(id: string) {
    return handleRequest(() =>
      this.prisma.pax.delete({
        where: { id },
        include: { passport: true, dni: true },
      }),
    );
  }
}
