import {
  IsDate,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  Max,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ToDateDay } from '../../common/decorators/date.transformers';
import { Transform, Type } from 'class-transformer';
import { toTrim } from '../../common/transformers';

export class CreateHotelDto {
  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @ToDateDay()
  @IsDate()
  endDate: Date;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  city: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  hotelName: string;

  @Transform(toTrim, { toClassOnly: true })
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

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  roomType: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  provider: string;

  @IsUUID()
  reservationId: string;
}
