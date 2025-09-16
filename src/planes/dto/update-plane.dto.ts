import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaneDto } from './create-plane.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdatePlaneDto extends PartialType(CreatePlaneDto) {
  @AtLeastOneField([
    'departure',
    'arrival',
    'departureDate',
    'arrivalDate',
    'bookingReference',
    'provider',
    'totalPrice',
    'amountPaid',
    'notes',
    'reservationId',
  ])
  private _atLeastOne!: true;
}
