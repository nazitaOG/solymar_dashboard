import { PartialType } from '@nestjs/mapped-types';
import { CreatePaxDto } from './create-pax.dto';

export class UpdatePaxDto extends PartialType(CreatePaxDto) {}
