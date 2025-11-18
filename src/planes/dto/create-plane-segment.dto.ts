import {
  IsDate,
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  Min,
  IsInt,
  MinLength,
} from 'class-validator';
import { ToDateMinute } from '../../common/decorators/date.decorators';
import { ToTrim, ToUpperTrim } from '../../common/decorators/string.decorators';
import { Type } from 'class-transformer';

export class CreatePlaneSegmentDto {
  @IsInt()
  @Min(1)
  segmentOrder: number;

  @ToUpperTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @MinLength(3)
  departure: string;

  @ToUpperTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @MinLength(3)
  arrival: string;

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  departureDate: Date;

  @Type(() => Date)
  @ToDateMinute()
  @IsDate()
  arrivalDate: Date;

  @ToUpperTrim()
  @IsString()
  @IsOptional()
  @MaxLength(128)
  airline?: string;

  @ToTrim()
  @IsString()
  @IsOptional()
  @MaxLength(64)
  flightNumber?: string;
}
