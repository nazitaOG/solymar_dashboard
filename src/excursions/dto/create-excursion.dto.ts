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
  origin: string;

  @IsString()
  provider: string;

  @IsDateString()
  excursionDate: Date;

  @IsString()
  excursionName: string;

  @IsUUID()
  reservationId: string;
}
