import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMedicalAssistDto } from './create-medical_assist.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

class CreateMedicalAssistDtoWithoutReservationId extends OmitType(
  CreateMedicalAssistDto,
  ['reservationId', 'currency'] as const,
) {}

export class UpdateMedicalAssistDto extends PartialType(
  CreateMedicalAssistDtoWithoutReservationId,
) {
  @AtLeastOneField([
    'totalPrice',
    'amountPaid',
    'bookingReference',
    'assistType',
    'provider',
  ])
  private _atLeastOne!: true;
}
