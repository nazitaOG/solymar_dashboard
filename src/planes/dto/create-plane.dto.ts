import {
  IsDateString,
  IsNumber,
  IsString,
  Max,
  Min,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreatePlaneDto {
  @IsString()
  departure: string;

  @IsString()
  @IsOptional()
  arrival: string;

  @IsDateString()
  departureDate: Date;

  @IsDateString()
  @IsOptional()
  arrivalDate: Date;

  @IsString()
  bookingReference: string;

  @IsString()
  @IsOptional()
  provider: string;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;

  //custom notes falta

  @IsUUID()
  reservationId: string;
}
