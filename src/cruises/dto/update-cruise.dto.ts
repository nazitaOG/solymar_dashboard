import { PartialType } from '@nestjs/mapped-types';
import { CreateCruiseDto } from './create-cruise.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdateCruiseDto extends PartialType(CreateCruiseDto) {
  @AtLeastOneField([
    'startDate',
    'endDate',
    'bookingReference',
    'provider',
    'embarkationPort',
    'arrivalPort',
    'totalPrice',
    'amountPaid',
    'reservationId',
  ])
  private _atLeastOne!: true;
}
