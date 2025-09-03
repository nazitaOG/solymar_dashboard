import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PaxModule } from './pax/pax.module';

@Module({
  imports: [
    ReservationsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PaxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
