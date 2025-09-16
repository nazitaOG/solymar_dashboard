import { PartialType } from '@nestjs/mapped-types';
import { CreateTransferDto } from './create-transfer.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdateTransferDto extends PartialType(CreateTransferDto) {
  @AtLeastOneField([
    'origin',
    'destination',
    'departureDate',
    'arrivalDate',
    'provider',
    'bookingReference',
    'reservationId',
    'transportType',
    'totalPrice',
    'amountPaid',
  ])
  private _atLeastOne!: true;
}
