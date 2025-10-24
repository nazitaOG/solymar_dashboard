import { Module } from '@nestjs/common';
import { PaxService } from './paxs.service';
import { PaxController } from './paxs.controller';

@Module({
  controllers: [PaxController],
  providers: [PaxService],
})
export class PaxModule {}
