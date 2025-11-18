import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePlaneDto } from './create-plane.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';
import { ValidateNested, IsOptional, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlaneSegmentDto } from './create-plane-segment.dto';

class UpdatePlaneBaseDto extends PartialType(
  OmitType(CreatePlaneDto, ['reservationId'] as const),
) {}

export class UpdatePlaneDto extends UpdatePlaneBaseDto {
  @AtLeastOneField([
    'bookingReference',
    'provider',
    'totalPrice',
    'amountPaid',
    'currency',
    'notes',
    'segments',
  ])
  private _atLeastOne!: true;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreatePlaneSegmentDto)
  @ArrayMinSize(1)
  segments?: CreatePlaneSegmentDto[];
}
