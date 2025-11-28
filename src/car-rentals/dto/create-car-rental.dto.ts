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
import { Currency } from '@prisma/client';
import { Type } from 'class-transformer';
import { ToDateMinute } from '../../common/decorators/date.decorators';
import { ToTrim } from '../../common/decorators/string.decorators';

export class CreateCarRentalDto {
  @ToTrim()
  @IsUUID()
  @IsNotEmpty()
  reservationId: string;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  provider: string;

  @ToTrim()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  @IsOptional()
  bookingReference?: string;

  // --- Fechas ---

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  pickupDate: Date;

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  dropoffDate: Date;

  // --- Ubicaciones ---

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  pickupLocation: string;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  dropoffLocation: string;

  // --- Detalles del Auto ---

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  carCategory: string;

  @ToTrim()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  @IsOptional()
  carModel?: string;

  // --- Financiero ---

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

  @IsEnum(Currency)
  currency: Currency;
}
