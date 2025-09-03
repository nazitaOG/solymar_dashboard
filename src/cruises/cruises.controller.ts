import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CruisesService } from './cruises.service';
import { CreateCruiseDto } from './dto/create-cruise.dto';
import { UpdateCruiseDto } from './dto/update-cruise.dto';

@Controller('cruises')
export class CruisesController {
  constructor(private readonly cruisesService: CruisesService) {}

  @Post()
  create(@Body() createCruiseDto: CreateCruiseDto) {
    return this.cruisesService.create(createCruiseDto);
  }

  @Get()
  findAll() {
    return this.cruisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cruisesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCruiseDto: UpdateCruiseDto) {
    return this.cruisesService.update(+id, updateCruiseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cruisesService.remove(+id);
  }
}
