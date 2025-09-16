import { PartialType } from '@nestjs/mapped-types';
import { CreateExcursionDto } from './create-excursion.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdateExcursionDto extends PartialType(CreateExcursionDto) {
  @AtLeastOneField([
    'totalPrice',
    'amountPaid',
    'origin',
    'excursionName',
    'provider',
    'bookingReference',
    'excursionDate',
    'reservationId',
  ])
  private _atLeastOne!: true;
}
