import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';
import { IsOptional, MaxLength, IsString } from 'class-validator';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @AtLeastOneField(['state', 'paxIds', 'name', 'notes'])
  private _atLeastOne!: true;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  name?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
