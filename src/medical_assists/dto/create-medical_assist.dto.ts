import { IsNumber, Min, Max, IsString, IsUUID } from 'class-validator';

export class CreateMedicalAssistDto {
  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  totalPrice: number;

  @IsNumber()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  amountPaid: number;

  @IsString()
  bookingReference: string;

  @IsString()
  assistType: string;

  @IsString()
  provider: string;

  @IsUUID()
  reservationId: string;
}
