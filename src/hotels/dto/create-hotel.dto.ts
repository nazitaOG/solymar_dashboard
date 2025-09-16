import {
  IsDate,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { ToDateDay } from '../../common/decorators/date.transformers';
import { Type } from 'class-transformer';

export class CreateHotelDto {
  @IsDate()
  @Type(() => Date)
  @ToDateDay()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @ToDateDay()
  endDate: Date;

  @IsString()
  city: string;

  @IsString()
  @IsNotEmpty()
  hotelName: string;

  @IsString()
  @IsNotEmpty()
  bookingReference: string;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;

  @IsString()
  @IsNotEmpty()
  roomType: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsUUID()
  reservationId: string;
}
