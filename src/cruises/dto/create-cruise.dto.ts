import {
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateCruiseDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  @IsOptional()
  endDate: Date;

  @IsString()
  bookingReference: string;

  @IsString()
  provider: string;

  @IsString()
  embarkationPort: string;

  @IsString()
  @IsOptional()
  arrivalPort: string;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;

  @IsUUID()
  reservationId: string;
}
