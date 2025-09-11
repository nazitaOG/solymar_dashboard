import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { TransportType } from '@prisma/client';

export class CreateTransferDto {
  @IsString()
  origin: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsDateString()
  departureDate: string;

  @IsDateString()
  arrivalDate: string;

  @IsString()
  provider: string;

  @IsOptional()
  @IsString()
  bookingReference?: string;

  @IsUUID()
  reservationId: string;

  @IsEnum(TransportType)
  @IsOptional()
  transportType?: TransportType;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;
}
