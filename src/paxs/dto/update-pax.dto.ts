import { PartialType } from '@nestjs/mapped-types';
import { CreatePaxDto } from './create-pax.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdatePaxDto extends PartialType(CreatePaxDto) {
  @AtLeastOneField([
    'name',
    'birthDate',
    'nationality',
    'passportNum',
    'passportExpirationDate',
    'dniNum',
    'dniExpirationDate',
  ])
  private _atLeastOne!: true;
}
