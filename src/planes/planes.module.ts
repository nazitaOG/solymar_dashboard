import { Module } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';

@Module({
  controllers: [PlanesController],
  providers: [PlanesService],
})
export class PlanesModule {}
