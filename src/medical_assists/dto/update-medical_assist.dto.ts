import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicalAssistDto } from './create-medical_assist.dto';

export class UpdateMedicalAssistDto extends PartialType(CreateMedicalAssistDto) {}
