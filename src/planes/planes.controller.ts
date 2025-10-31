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
import { PlanesService } from './planes.service';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Post()
  create(@GetUser() user: User, @Body() createPlaneDto: CreatePlaneDto) {
    return this.planesService.create(user.id, createPlaneDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.planesService.findOne(id);
  }

  @Get('/reservation/:id')
  findByReservation(@Param('id') id: string) {
    return this.planesService.findByReservation(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlaneDto: UpdatePlaneDto,
  ) {
    return this.planesService.update(user.id, id, updatePlaneDto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.planesService.remove(user.id, id);
  }
}
