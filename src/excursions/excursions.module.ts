import { Module } from '@nestjs/common';
import { ExcursionsService } from './excursions.service';
import { ExcursionsController } from './excursions.controller';

@Module({
  controllers: [ExcursionsController],
  providers: [ExcursionsService],
})
export class ExcursionsModule {}
