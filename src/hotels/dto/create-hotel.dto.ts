import {
  IsDateString,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class CreateHotelDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsString()
  city: string;

  @IsString()
  hotelName: string;

  @IsString()
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
  roomType: string;

  @IsString()
  provider: string;

  @IsUUID()
  reservationId: string;
}
