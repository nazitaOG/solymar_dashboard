import { Injectable } from '@nestjs/common';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { PrismaService } from '../common/prisma/prisma.service';
import { handleRequest } from '../common/utils/handle-request/handle-request';
import { CommonDatePolicies } from '../common/policies/common-date.policies';
import { PlanesPolicies } from './policies/planes.policies';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPlaneDto: CreatePlaneDto) {
    return handleRequest(() => {
      PlanesPolicies.assertAirports(createPlaneDto);
      CommonDatePolicies.assertUpdateRange(
        createPlaneDto,
        {
          start: createPlaneDto.departureDate,
          end: createPlaneDto.arrivalDate,
        },
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: {
            start: 'fecha de salida',
            end: 'fecha de llegada',
          },
        },
      );
      return this.prisma.plane.create({
        data: createPlaneDto,
      });
    });
  }

  // findAll() {
  //   return handleRequest(() => {
  //     return this.prisma.plane.findMany();
  //   });
  // }

  findOne(id: string) {
    return handleRequest(() => {
      return this.prisma.plane.findUniqueOrThrow({
        where: { id },
      });
    });
  }

  update(id: string, updatePlaneDto: UpdatePlaneDto) {
    return handleRequest(async () => {
      const current = await this.prisma.plane.findUniqueOrThrow({
        where: { id },
        select: {
          departureDate: true,
          arrivalDate: true,
          departure: true,
          arrival: true,
        },
      });

      PlanesPolicies.assertAirports(
        updatePlaneDto,
        current.departure ?? undefined,
        current.arrival ?? undefined,
      );

      CommonDatePolicies.assertUpdateRange(
        updatePlaneDto,
        { start: current.departureDate, end: current.arrivalDate },
        'departureDate',
        'arrivalDate',
        {
          minDurationMinutes: 60,
          allowEqual: true,
          labels: {
            start: 'fecha de salida',
            end: 'fecha de llegada',
          },
        },
      );

      return this.prisma.plane.update({
        where: { id },
        data: updatePlaneDto,
      });
    });
  }

  remove(id: string) {
    return handleRequest(() => {
      return this.prisma.plane.delete({
        where: { id },
      });
    });
  }
}
