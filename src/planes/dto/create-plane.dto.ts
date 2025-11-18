import {
  IsNumber,
  IsString,
  Max,
  Min,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ToTrim } from '../../common/decorators/string.decorators';
import { Type } from 'class-transformer';
import { Currency } from '@prisma/client';
import { CreatePlaneSegmentDto } from './create-plane-segment.dto';

export class CreatePlaneDto {
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

  // Aquí vienen los tramos del vuelo
  @ValidateNested({ each: true })
  @Type(() => CreatePlaneSegmentDto)
  @ArrayMinSize(1)
  segments: CreatePlaneSegmentDto[];
}
