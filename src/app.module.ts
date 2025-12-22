import { Module } from '@nestjs/common';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PaxModule } from './paxs/paxs.module';
import { HotelsModule } from './hotels/hotels.module';
import { PlanesModule } from './planes/planes.module';
import { CruisesModule } from './cruises/cruises.module';
import { TransfersModule } from './transfers/transfers.module';
import { ExcursionsModule } from './excursions/excursions.module';
import { MedicalAssistsModule } from './medical_assists/medical_assists.module';
import { AuthModule } from './auth/auth.module';
import { CarRentalsModule } from './car-rentals/car-rentals.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ReservationsModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      cache: true,
      expandVariables: true, // habilita ${VAR} dentro del .env
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        DATABASE_URL: Joi.string()
          .uri({ scheme: ['postgres', 'postgresql'] })
          .required(),
        DB_USER: Joi.string().min(1).max(255).required(),
        DB_PASSWORD: Joi.string().min(1),
        DB_NAME: Joi.string().min(1),
        DB_HOST: Joi.alternatives().try(
          Joi.string().ip({ version: ['ipv4', 'ipv6'] }),
          Joi.string().hostname(),
        ),
        DB_PORT: Joi.number().port(),
        PEPPER: Joi.string().min(32).required(), // recomiendo >=32
        JWT_SECRET: Joi.string().min(32).required(), // idem, >=32
        JWT_EXPIRES_IN: Joi.string()
          .pattern(/^\d+(s|m|h|d)$/)
          .default('15m'),
        CORS_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),
        CORS_ORIGINS: Joi.string().default('*'),
      }),
      validationOptions: {
        allowUnknown: true, // no rompe por variables extra del entorno
        abortEarly: false, // muestra todos los errores de una
      },
    }),
    PaxModule,
    HotelsModule,
    PlanesModule,
    CruisesModule,
    TransfersModule,
    ExcursionsModule,
    MedicalAssistsModule,
    AuthModule,
    CarRentalsModule,
    MailModule,
  ],
})
export class AppModule {}
