import { BadRequestException } from '@nestjs/common';
import { CreatePlaneDto } from '../dto/create-plane.dto';
import { UpdatePlaneDto } from '../dto/update-plane.dto';

export class PlanesPolicies {
  static assertAirports(
    dto: CreatePlaneDto | UpdatePlaneDto,
    currentDeparture?: string,
    currentArrival?: string,
  ): void {
    const norm = (v?: string) => {
      if (typeof v !== 'string') return undefined;
      const s = v.trim().toUpperCase();
      return s.length ? s : undefined;
    };

    if (dto instanceof CreatePlaneDto) {
      const dep = norm(dto.departure);
      const arr = norm(dto.arrival);
      if (dep && arr && dep === arr) {
        throw new BadRequestException(
          'El aeropuerto de salida y llegada no pueden ser el mismo.',
        );
      }
      return;
    }

    if (dto instanceof UpdatePlaneDto) {
      const providedDep = dto.departure !== undefined;
      const providedArr = dto.arrival !== undefined;

      if (!providedDep && !providedArr) return;

      const departureFinal = norm(dto.departure ?? currentDeparture);
      const arrivalFinal = norm(dto.arrival ?? currentArrival);

      if (departureFinal && arrivalFinal && departureFinal === arrivalFinal) {
        throw new BadRequestException(
          'El aeropuerto de salida y llegada no pueden ser el mismo.',
        );
      }
    }
  }
}
