import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @AtLeastOneField(['state', 'paxIds'])
  private _atLeastOne!: true;
}
