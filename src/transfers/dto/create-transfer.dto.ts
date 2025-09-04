import {
  IsDateString,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateTransferDto {
  @IsString()
  pickup: string;

  @IsString()
  dropOff: string;

  @IsDateString()
  pickupDate: Date;

  @IsString()
  bookingReference: string;

  @IsString()
  provider: string;

  @IsUUID()
  reservationId: string;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;
}
