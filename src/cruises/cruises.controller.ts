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
import { CruisesService } from './cruises.service';
import { CreateCruiseDto } from './dto/create-cruise.dto';
import { UpdateCruiseDto } from './dto/update-cruise.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('cruises')
export class CruisesController {
  constructor(private readonly cruisesService: CruisesService) {}

  @Post()
  create(@GetUser() user: User, @Body() createCruiseDto: CreateCruiseDto) {
    return this.cruisesService.create(user.username, createCruiseDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cruisesService.findOne(id);
  }

  @Get('/reservation/:id')
  findByReservation(@Param('id', ParseUUIDPipe) id: string) {
    return this.cruisesService.findByReservation(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCruiseDto: UpdateCruiseDto,
  ) {
    return this.cruisesService.update(user.username, id, updateCruiseDto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.cruisesService.remove(user.username, id);
  }
}
