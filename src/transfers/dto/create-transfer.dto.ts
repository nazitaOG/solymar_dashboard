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
import { toTrim } from '../../common/transformers';
import { Transform, Type } from 'class-transformer';
import { ToDateDay } from '../../common/decorators/date.transformers';

export class CreateTransferDto {
  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  origin: string;

  @Transform(toTrim, { toClassOnly: true })
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

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  provider: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  @IsOptional()
  bookingReference?: string;

  @Transform(toTrim, { toClassOnly: true })
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
