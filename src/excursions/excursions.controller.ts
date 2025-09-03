import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExcursionsService } from './excursions.service';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';

@Controller('excursions')
export class ExcursionsController {
  constructor(private readonly excursionsService: ExcursionsService) {}

  @Post()
  create(@Body() createExcursionDto: CreateExcursionDto) {
    return this.excursionsService.create(createExcursionDto);
  }

  @Get()
  findAll() {
    return this.excursionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.excursionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExcursionDto: UpdateExcursionDto) {
    return this.excursionsService.update(+id, updateExcursionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.excursionsService.remove(+id);
  }
}
