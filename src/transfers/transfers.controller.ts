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
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Auth()
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  create(@GetUser() user: User, @Body() createTransferDto: CreateTransferDto) {
    return this.transfersService.create(user.id, createTransferDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transfersService.findOne(id);
  }

  @Get('/reservation/:id')
  findByReservation(@Param('id') id: string) {
    return this.transfersService.findByReservation(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransferDto: UpdateTransferDto,
  ) {
    return this.transfersService.update(user.id, id, updateTransferDto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.transfersService.remove(user.id, id);
  }
}
