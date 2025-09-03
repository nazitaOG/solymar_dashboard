import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaxDto } from './dto/create-pax.dto';
import { UpdatePaxDto } from './dto/update-pax.dto';
import { HandleRequest } from '../common/utils/handle-request';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PaxService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePaxDto) {
    return HandleRequest.prisma(async () => {
      // Validaciones de negocio
      const wantsPassport =
        dto.passportNum != null || dto.passportExpirationDate != null;
      const wantsDni = dto.dniNum != null || dto.dniExpirationDate != null;

      if (!wantsPassport && !wantsDni) {
        throw new BadRequestException(
          'El pasajero debe tener al menos un documento (DNI o Pasaporte).',
        );
      }
      if (wantsPassport && (!dto.passportNum || !dto.passportExpirationDate)) {
        throw new BadRequestException(
          'Pasaporte: número y fecha de expiración son requeridos juntos.',
        );
      }
      if (wantsDni && (!dto.dniNum || !dto.dniExpirationDate)) {
        throw new BadRequestException(
          'DNI: número y fecha de expiración son requeridos juntos.',
        );
      }
      return this.prisma.pax.create({
        data: {
          name: dto.name,
          birthDate: new Date(dto.birthDate), // ISO → Date
          nationality: dto.nationality,
          // uploadDate lo setea la DB con @default(now())

          passport: wantsPassport
            ? {
                create: {
                  passportNum: dto.passportNum!, // ya validado arriba
                  expirationDate: new Date(dto.passportExpirationDate!), // ya validado arriba
                },
              }
            : undefined,

          dni: wantsDni
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

  async findAll() {
    return HandleRequest.prisma(() =>
      this.prisma.pax.findMany({
        orderBy: { uploadDate: 'desc' },
      }),
    );
  }

  findOne(id: string) {
    return HandleRequest.prisma(() =>
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
    return HandleRequest.prisma(async () =>
      this.prisma.pax.update({
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
      }),
    );
  }

  remove(id: string) {
    return HandleRequest.prisma(async () =>
      this.prisma.pax.delete({
        where: { id },
        include: { passport: true, dni: true },
      }),
    );
  }
}
