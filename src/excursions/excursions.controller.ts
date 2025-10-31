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
import { ExcursionsService } from './excursions.service';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('excursions')
export class ExcursionsController {
  constructor(private readonly excursionsService: ExcursionsService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() createExcursionDto: CreateExcursionDto,
  ) {
    return this.excursionsService.create(user.id, createExcursionDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.excursionsService.findOne(id);
  }

  @Get('/reservation/:id')
  findByReservation(@Param('id', ParseUUIDPipe) id: string) {
    return this.excursionsService.findByReservation(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExcursionDto: UpdateExcursionDto,
  ) {
    return this.excursionsService.update(user.id, id, updateExcursionDto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.excursionsService.remove(user.id, id);
  }
}
