import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePlaneDto } from './create-plane.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

class CreatePlaneDtoWithoutReservationId extends OmitType(CreatePlaneDto, [
  'reservationId',
] as const) {}

export class UpdatePlaneDto extends PartialType(
  CreatePlaneDtoWithoutReservationId,
) {
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
  ])
  private _atLeastOne!: true;
}
