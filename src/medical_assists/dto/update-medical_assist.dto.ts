import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalAssistDto } from './create-medical_assist.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdateMedicalAssistDto extends PartialType(
  CreateMedicalAssistDto,
) {
  @AtLeastOneField([
    'totalPrice',
    'amountPaid',
    'bookingReference',
    'assistType',
    'provider',
    'reservationId',
  ])
  private _atLeastOne!: true;
}
