import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaxService } from './paxs.service';
import { CreatePaxDto } from './dto/create-pax.dto';
import { UpdatePaxDto } from './dto/update-pax.dto';
import { Auth } from '@/auth/decorators/auth.decorator';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { FindAllPaxParams } from './paxs.service';

@Auth()
@Controller('pax')
export class PaxController {
  constructor(private readonly paxService: PaxService) {}

  @Post()
  create(@GetUser() user: User, @Body() createPaxDto: CreatePaxDto) {
    return this.paxService.create(user.username, createPaxDto);
  }

  @Get()
  findAll(@Query() params: FindAllPaxParams) {
    return this.paxService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paxService.findOne(id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaxDto: UpdatePaxDto,
  ) {
    return this.paxService.update(user.username, id, updatePaxDto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.paxService.remove(user.username, id);
  }
}
