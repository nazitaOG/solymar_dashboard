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
import { Type } from 'class-transformer';
import { ToDateMinute } from '../../common/decorators/date.decorators';
import { ToTrim } from '../../common/decorators/string.decorators';

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

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  origin: string;

  @ToTrim()
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  excursionName: string;

  @ToTrim()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  provider: string;

  @ToTrim()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @IsNotEmpty()
  bookingReference?: string;

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  excursionDate: Date;

  @ToTrim()
  @IsUUID()
  @IsNotEmpty()
  reservationId: string;
}
