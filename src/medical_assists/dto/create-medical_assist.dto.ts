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
import { Transform, Type } from 'class-transformer';
import { toTrim } from '../../common/transformers';

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

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bookingReference: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  assistType?: string;

  @Transform(toTrim, { toClassOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  provider: string;

  @IsUUID()
  reservationId: string;
}
