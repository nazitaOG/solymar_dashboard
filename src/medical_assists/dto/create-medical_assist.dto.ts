import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToTrim } from '../../common/decorators/string.decorators';

export class CreateMedicalAssistDto {
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
  @IsNotEmpty()
  @MaxLength(255)
  bookingReference: string;

  @ToTrim()
  @IsString()
  @IsOptional()
  @MaxLength(128)
  assistType?: string;

  @ToTrim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  provider: string;

  @IsUUID()
  reservationId: string;
}
