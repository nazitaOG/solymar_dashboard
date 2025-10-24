import { Module } from '@nestjs/common';
import { MedicalAssistsService } from './medical_assists.service';
import { MedicalAssistsController } from './medical_assists.controller';

@Module({
  controllers: [MedicalAssistsController],
  providers: [MedicalAssistsService],
})
export class MedicalAssistsModule {}
