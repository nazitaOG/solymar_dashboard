import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateExcursionDto {
  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;

  @IsString()
  provider: string;

  @IsDateString()
  excursionDate: Date;

  @IsString()
  excursionName: string;

  //donde se recoge el pasajero falta

  @IsUUID()
  reservationId: string;
}
