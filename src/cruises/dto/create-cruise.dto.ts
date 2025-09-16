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
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { toTrim } from '../../common/transformers';
import { ToDateDay } from '../../common/decorators/date.transformers';

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

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  @IsOptional()
  bookingReference?: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  provider: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  embarkationPort: string;

  @Transform(toTrim, { toClassOnly: true })
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

  @Transform(toTrim, { toClassOnly: true })
  @IsUUID()
  @IsNotEmpty()
  reservationId: string;
}
