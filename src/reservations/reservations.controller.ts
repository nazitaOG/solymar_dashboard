import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { FindAllReservationsParams } from './reservations.service';

@Auth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateReservationDto) {
    dto.userId = user.id; // fuerza que el userId del body sea siempre el del token
    return this.reservationsService.create(user.id, dto);
  }

  @Get()
  findAll(@Query() params: FindAllReservationsParams) {
    return this.reservationsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.remove(user.id, id);
  }
}
