import { Module } from '@nestjs/common';
import { PaxService } from './pax.service';
import { PaxController } from './pax.controller';

@Module({
  controllers: [PaxController],
  providers: [PaxService],
})
export class PaxModule {}
