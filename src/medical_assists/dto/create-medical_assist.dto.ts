import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToTrim } from '../../common/decorators/string.decorators';
import { Currency } from '@prisma/client';

export class CreateMedicalAssistDto {
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
  @IsNotEmpty()
  @MaxLength(255)
  bookingReference: string;

  @ToTrim()
  @IsString()
  @IsOptional()
  @MaxLength(128)
  assistType?: string;

  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  provider: string;

  @IsUUID()
  reservationId: string;
}
