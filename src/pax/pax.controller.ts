import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PaxService } from './pax.service';
import { CreatePaxDto } from './dto/create-pax.dto';
import { UpdatePaxDto } from './dto/update-pax.dto';

@Controller('pax')
export class PaxController {
  constructor(private readonly paxService: PaxService) {}

  @Post()
  create(@Body() createPaxDto: CreatePaxDto) {
    return this.paxService.create(createPaxDto);
  }

  @Get()
  findAll() {
    return this.paxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.paxService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updatePaxDto: UpdatePaxDto,
  ) {
    return this.paxService.update(id, updatePaxDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.paxService.remove(id);
  }
}
