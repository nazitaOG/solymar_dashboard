import { Injectable } from '@nestjs/common';
import { CreateExcursionDto } from './dto/create-excursion.dto';
import { UpdateExcursionDto } from './dto/update-excursion.dto';

@Injectable()
export class ExcursionsService {
  create(createExcursionDto: CreateExcursionDto) {
    return 'This action adds a new excursion';
  }

  findAll() {
    return `This action returns all excursions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} excursion`;
  }

  update(id: number, updateExcursionDto: UpdateExcursionDto) {
    return `This action updates a #${id} excursion`;
  }

  remove(id: number) {
    return `This action removes a #${id} excursion`;
  }
}
