import {
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { ReservationState } from '../../common/enums/reservation-state.enum';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsUUID()
  userId: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @Type(() => Number)
  @IsEnum(ReservationState)
  state: ReservationState;

  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMinSize(1, { message: 'La reserva debe tener al menos un pasajero' })
  paxIds: string[];
}
