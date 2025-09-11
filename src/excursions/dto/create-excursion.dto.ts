import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsDateString,
  IsUUID,
  IsOptional,
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

  @IsOptional()
  @IsString()
  bookingReference?: string;

  @IsDateString()
  excursionDate: Date;

  @IsString()
  excursionName: string;

  @IsUUID()
  reservationId: string;
}
