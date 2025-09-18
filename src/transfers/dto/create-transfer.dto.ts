import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { TransportType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ToDateDay } from '../../common/decorators/date.decorators';
import { ToTrim } from '../../common/decorators/string.decorators';

export class CreateTransferDto {
  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  origin: string;

  @ToTrim()
  @IsOptional()
  @MaxLength(128)
  @IsString()
  destination?: string;

  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  departureDate: Date;

  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  arrivalDate: Date;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  provider: string;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  @IsOptional()
  bookingReference?: string;

  @ToTrim()
  @IsUUID()
  @IsNotEmpty()
  reservationId: string;

  @IsEnum(TransportType)
  @IsOptional()
  transportType?: TransportType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;
}
