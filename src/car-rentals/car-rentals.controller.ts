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
import { CarRentalsService } from './car-rentals.service';
import { CreateCarRentalDto } from './dto/create-car-rental.dto';
import { UpdateCarRentalDto } from './dto/update-car-rental.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('car-rentals')
export class CarRentalsController {
  constructor(private readonly carRentalsService: CarRentalsService) {}

  @Post()
  create(
    @GetUser() user: User,
    @Body() createCarRentalDto: CreateCarRentalDto,
  ) {
    return this.carRentalsService.create(user.username, createCarRentalDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carRentalsService.findOne(id);
  }

  @Get('/reservation/:id')
  findByReservation(@Param('id') id: string) {
    return this.carRentalsService.findByReservation(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCarRentalDto: UpdateCarRentalDto,
  ) {
    return this.carRentalsService.update(user.username, id, updateCarRentalDto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.carRentalsService.remove(user.username, id);
  }
}
