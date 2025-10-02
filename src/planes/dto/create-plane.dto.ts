import {
  IsDate,
  IsNumber,
  IsString,
  Max,
  Min,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ToDateMinute } from '../../common/decorators/date.decorators';
import { Type } from 'class-transformer';
import { ToTrim, ToUpperTrim } from '../../common/decorators/string.decorators';
import { Currency } from '@prisma/client';

export class CreatePlaneDto {
  @ToUpperTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  departure: string;

  @ToUpperTrim()
  @IsString()
  @IsOptional()
  @MaxLength(128)
  arrival?: string;

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  departureDate: Date;

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  @IsOptional()
  arrivalDate?: Date;

  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bookingReference: string;

  @ToTrim()
  @IsString()
  @IsOptional()
  @MaxLength(128)
  provider?: string;

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

  @ToTrim()
  @IsString()
  @IsOptional()
  @MaxLength(1024)
  notes?: string;

  @IsUUID()
  reservationId: string;
}
