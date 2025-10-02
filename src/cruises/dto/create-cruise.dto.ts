import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToDateDay } from '../../common/decorators/date.decorators';
import { ToTrim } from '../../common/decorators/string.decorators';
import { Currency } from '@prisma/client';

export class CreateCruiseDto {
  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ToTrim()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  @IsOptional()
  bookingReference?: string;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  provider: string;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  embarkationPort: string;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsOptional()
  @IsNotEmpty()
  arrivalPort?: string;

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
  @IsUUID()
  @IsNotEmpty()
  reservationId: string;
}
