import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MedicalAssistsService } from './medical_assists.service';
import { CreateMedicalAssistDto } from './dto/create-medical_assist.dto';
import { UpdateMedicalAssistDto } from './dto/update-medical_assist.dto';
import { Auth } from '@/auth/decorators/auth.decorator';

@Auth()
@Controller('medical-assists')
export class MedicalAssistsController {
  constructor(private readonly medicalAssistsService: MedicalAssistsService) {}

  @Post()
  create(@Body() createMedicalAssistDto: CreateMedicalAssistDto) {
    return this.medicalAssistsService.create(createMedicalAssistDto);
  }

  // @Get()
  // findAll() {
  //   return this.medicalAssistsService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalAssistsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMedicalAssistDto: UpdateMedicalAssistDto,
  ) {
    return this.medicalAssistsService.update(id, updateMedicalAssistDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalAssistsService.remove(id);
  }
}
