import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTransferDto } from './create-transfer.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

class CreateTransferDtoWithoutReservationId extends OmitType(
  CreateTransferDto,
  ['reservationId', 'currency'] as const,
) {}

export class UpdateTransferDto extends PartialType(
  CreateTransferDtoWithoutReservationId,
) {
  @AtLeastOneField([
    'origin',
    'destination',
    'departureDate',
    'arrivalDate',
    'provider',
    'bookingReference',
    'transportType',
    'totalPrice',
    'amountPaid',
  ])
  private _atLeastOne!: true;
}
