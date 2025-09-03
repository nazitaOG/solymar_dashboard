import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MedicalAssistsService } from './medical_assists.service';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';

@Controller('medical-assists')
export class MedicalAssistsController {
  constructor(private readonly medicalAssistsService: MedicalAssistsService) {}

  @Post()
  create(@Body() createMedicalAssistDto: CreateMedicalAssistDto) {
    return this.medicalAssistsService.create(createMedicalAssistDto);
  }

  @Get()
  findAll() {
    return this.medicalAssistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalAssistsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMedicalAssistDto: UpdateMedicalAssistDto) {
    return this.medicalAssistsService.update(+id, updateMedicalAssistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalAssistsService.remove(+id);
  }
}
