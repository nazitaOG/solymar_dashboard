import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PaxModule } from './paxs/paxs.module';
import { HotelsModule } from './hotels/hotels.module';
import { PlanesModule } from './planes/planes.module';
import { CruisesModule } from './cruises/cruises.module';
import { TransfersModule } from './transfers/transfers.module';
import { ExcursionsModule } from './excursions/excursions.module';
import { MedicalAssistsModule } from './medical_assists/medical_assists.module';

@Module({
  imports: [
    ReservationsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PaxModule,
    HotelsModule,
    PlanesModule,
    CruisesModule,
    TransfersModule,
    ExcursionsModule,
    MedicalAssistsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
