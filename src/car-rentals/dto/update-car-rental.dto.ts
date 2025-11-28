import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCarRentalDto } from './create-car-rental.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

class CreateCarRentalDtoWithoutImmutableFields extends OmitType(
  CreateCarRentalDto,
  ['reservationId', 'currency'] as const,
) {}

export class UpdateCarRentalDto extends PartialType(
  CreateCarRentalDtoWithoutImmutableFields,
) {
  @AtLeastOneField([
    'provider',
    'bookingReference',
    'pickupDate',
    'dropoffDate',
    'pickupLocation',
    'dropoffLocation',
    'carCategory',
    'carModel',
    'totalPrice',
    'amountPaid',
  ])
  private _atLeastOne!: true;
}
