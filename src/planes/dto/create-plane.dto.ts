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
} from 'class-validator';
import { ToDateMinute } from '../../common/decorators/date.transformers';
import { Transform, Type } from 'class-transformer';
import { toUpperTrim, toTrim } from '../../common/transformers';

export class CreatePlaneDto {
  @Transform(toUpperTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  departure: string;

  @Transform(toUpperTrim, { toClassOnly: true })
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

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bookingReference: string;

  @Transform(toTrim, { toClassOnly: true })
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

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsOptional()
  @MaxLength(1024)
  notes?: string;

  @IsUUID()
  reservationId: string;
}
