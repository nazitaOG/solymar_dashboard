import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCruiseDto } from './create-cruise.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

class CreateCruiseDtoWithoutReservationId extends OmitType(CreateCruiseDto, [
  'reservationId',
  'currency',
] as const) {}

export class UpdateCruiseDto extends PartialType(
  CreateCruiseDtoWithoutReservationId,
) {
  @AtLeastOneField([
    'startDate',
    'endDate',
    'bookingReference',
    'provider',
    'embarkationPort',
    'arrivalPort',
    'totalPrice',
    'amountPaid',
  ])
  private _atLeastOne!: true;
}
