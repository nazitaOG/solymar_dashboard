import { Injectable } from '@nestjs/common';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';

@Injectable()
export class MedicalAssistsService {
  create(createMedicalAssistDto: CreateMedicalAssistDto) {
    return 'This action adds a new medicalAssist';
  }

  findAll() {
    return `This action returns all medicalAssists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} medicalAssist`;
  }

  update(id: number, updateMedicalAssistDto: UpdateMedicalAssistDto) {
    return `This action updates a #${id} medicalAssist`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicalAssist`;
  }
}
