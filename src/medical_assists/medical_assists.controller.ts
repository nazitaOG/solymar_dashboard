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
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('medical-assists')
export class MedicalAssistsController {
  constructor(private readonly medicalAssistsService: MedicalAssistsService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateMedicalAssistDto) {
    return this.medicalAssistsService.create(user.username, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalAssistsService.findOne(id);
  }

  @Get('/reservation/:id')
  findByReservation(@Param('id') id: string) {
    return this.medicalAssistsService.findByReservation(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicalAssistDto,
  ) {
    return this.medicalAssistsService.update(user.username, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.medicalAssistsService.remove(user.username, id);
  }
}
