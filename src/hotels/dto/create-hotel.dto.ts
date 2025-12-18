import {
  IsDate,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  Max,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ToDateDay } from '../../common/decorators/date.decorators';
import { Type } from 'class-transformer';
import { ToTrim } from '../../common/decorators/string.decorators';
import { Currency } from '@prisma/client';

export class CreateHotelDto {
  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  endDate: Date;

  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  city: string;

  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  hotelName: string;

  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bookingReference: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(255)
  roomType?: string;

  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  provider: string;

  @IsUUID()
  reservationId: string;
}
