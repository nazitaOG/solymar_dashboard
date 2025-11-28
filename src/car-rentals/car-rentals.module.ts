import { Module } from '@nestjs/common';
import { CarRentalsService } from './car-rentals.service';
import { CarRentalsController } from './car-rentals.controller';

@Module({
  controllers: [CarRentalsController],
  providers: [CarRentalsService],
})
export class CarRentalsModule {}
