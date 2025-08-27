import { IsUUID, IsISO8601, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ReservationState } from '../../common/enums/reservation-state.enum';

export class CreateReservationDto {
  @IsUUID()
  userId: string;

  @IsISO8601()
  uploadDate: string;

  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsEnum(ReservationState)
  state: ReservationState;
}
