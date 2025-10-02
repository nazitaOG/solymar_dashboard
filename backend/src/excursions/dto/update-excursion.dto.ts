import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateExcursionDto } from './create-excursion.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

class CreateExcursionDtoWithoutReservationId extends OmitType(
  CreateExcursionDto,
  ['reservationId', 'currency'] as const,
) {}

export class UpdateExcursionDto extends PartialType(
  CreateExcursionDtoWithoutReservationId,
) {
  @AtLeastOneField([
    'totalPrice',
    'amountPaid',
    'origin',
    'excursionName',
    'provider',
    'bookingReference',
    'excursionDate',
  ])
  private _atLeastOne!: true;
}
