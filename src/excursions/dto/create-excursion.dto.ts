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
import { ToDateMinute } from '../../common/decorators/date.transformers';

export class CreateExcursionDto {
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
  @MaxLength(128)
  @IsNotEmpty()
  origin: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  excursionName: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  provider: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  bookingReference?: string;

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  excursionDate: Date;

  @Transform(toTrim, { toClassOnly: true })
  @IsUUID()
  @IsNotEmpty()
  reservationId: string;
}
