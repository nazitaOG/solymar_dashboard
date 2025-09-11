import {
  IsDateString,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { TransportType } from '../../common/enums/transport-type.enum';

export class CreateTransferDto {
  @IsEnum(TransportType)
  transportType: TransportType;

  @IsString()
  pickup: string;

  @IsString()
  @IsOptional()
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
