import {
  IsUUID,
  IsEnum,
  ArrayMinSize,
  IsArray,
  IsOptional,
} from 'class-validator';
import { ReservationState } from '../../common/enums/reservation-state.enum';

export class CreateReservationDto {
  @IsOptional()
  @IsUUID()
  userId?: string; // opcional porque el backend lo rellenará

  @IsEnum(ReservationState)
  state: ReservationState;

  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMinSize(1, { message: 'La reserva debe tener al menos un pasajero' })
  paxIds: string[];
}
