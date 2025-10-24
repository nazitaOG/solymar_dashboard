import { Module } from '@nestjs/common';
import { CruisesService } from './cruises.service';
import { CruisesController } from './cruises.controller';

@Module({
  controllers: [CruisesController],
  providers: [CruisesService],
})
export class CruisesModule {}
