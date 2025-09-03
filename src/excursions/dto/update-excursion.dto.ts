import { PartialType } from '@nestjs/mapped-types';
import { CreateExcursionDto } from './create-excursion.dto';

export class UpdateExcursionDto extends PartialType(CreateExcursionDto) {}
