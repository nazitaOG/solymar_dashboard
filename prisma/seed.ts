/// <reference types="node" />

import {
  PrismaClient,
  Prisma,
  ReservationState,
  TransportType,
} from '@prisma/client';
import { hashPassword } from '../src/common/security/hash_password';

const pepper = process.env.PEPPER;

const prisma = new PrismaClient();

async function main() {
  // deshabilitar constraints
  await prisma.$executeRaw`SET session_replication_role = replica;`;
  try {
    // purgar datos en orden seguro
    await prisma.$transaction([
      prisma.roleUser.deleteMany({}),
      prisma.hotel.deleteMany({}),
      prisma.plane.deleteMany({}),
      prisma.cruise.deleteMany({}),
      prisma.transfer.deleteMany({}),
      prisma.excursion.deleteMany({}),
      prisma.medicalAssist.deleteMany({}),
      prisma.paxReservation.deleteMany({}),
      prisma.passport.deleteMany({}),
      prisma.dni.deleteMany({}),
      prisma.reservation.deleteMany({}),
      prisma.pax.deleteMany({}),
      prisma.role.deleteMany({}),
      prisma.user.deleteMany({}),
    ]);

    // habilitar constraints
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
  } catch (error) {
    // habilitar constraints en caso de error
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
    throw error;
  }

  // Roles
  const [adminRole, userRole, superAdminRole] = await Promise.all([
    prisma.role.create({ data: { description: 'admin' } }),
    prisma.role.create({ data: { description: 'user' } }),
    prisma.role.create({ data: { description: 'super_admin' } }),
  ]);

  // Users
  const [user, admin, superAdmin] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'user123',
        hashedPassword: await hashPassword('password123', undefined, pepper),
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin123',
        hashedPassword: await hashPassword('password123', undefined, pepper),
      },
    }),
    prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        username: 'superadmin123',
        hashedPassword: await hashPassword('password123', undefined, pepper),
      },
    }),
  ]);

  await prisma.roleUser.createMany({
    data: [
      // admin tiene admin y user
      { roleId: adminRole.id, userId: admin.id },
      { roleId: userRole.id, userId: admin.id },
      // user tiene user
      { roleId: userRole.id, userId: user.id },
      // superAdmin tiene admin, user y super_admin
      { roleId: superAdminRole.id, userId: superAdmin.id },
      { roleId: adminRole.id, userId: superAdmin.id },
      { roleId: userRole.id, userId: superAdmin.id },
    ],
    skipDuplicates: true,
  });

  // Reserva principal
  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      totalPrice: new Prisma.Decimal('120000.00'),
      state: ReservationState.CONFIRMED,
    },
  });

  // Hotel
  await prisma.hotel.create({
    data: {
      reservationId: reservation.id,
      startDate: new Date('2025-11-01T12:00:00Z'),
      endDate: new Date('2025-11-10T10:00:00Z'),
      city: 'Buenos Aires',
      hotelName: 'Hotel Central',
      bookingReference: 'HOTEL-123',
      totalPrice: new Prisma.Decimal('80000.00'),
      amountPaid: new Prisma.Decimal('40000.00'),
      roomType: 'Doble',
      provider: 'Booking.com',
    },
  });

  // Vuelo (arrival/arrivalDate/provider ahora pueden ser opcionales, pero los cargamos igual)
  await prisma.plane.create({
    data: {
      reservationId: reservation.id,
      departure: 'EZE',
      arrival: 'MIA',
      departureDate: new Date('2025-11-01T20:00:00Z'),
      arrivalDate: new Date('2025-11-02T05:00:00Z'),
      totalPrice: new Prisma.Decimal('30000.00'),
      amountPaid: new Prisma.Decimal('30000.00'),
      bookingReference: 'PLN-456',
      provider: 'Aerolíneas Argentinas',
      notes: 'Asiento 12A, equipaje incluido.',
    },
  });

  // Crucero (endDate/arrivalPort son opcionales)
  await prisma.cruise.create({
    data: {
      reservationId: reservation.id,
      startDate: new Date('2025-11-03T17:00:00Z'),
      endDate: new Date('2025-11-08T08:00:00Z'),
      embarkationPort: 'Miami',
      arrivalPort: 'Cozumel',
      bookingReference: 'CRS-999',
      provider: 'Royal Caribbean',
      totalPrice: new Prisma.Decimal('20000.00'),
      amountPaid: new Prisma.Decimal('10000.00'),
    },
  });

  // Transfers (nuevo modelo: origin/destination/departureDate/arrivalDate:string/transportType)
  await prisma.transfer.create({
    data: {
      reservationId: reservation.id,
      origin: 'Aeropuerto MIA',
      destination: 'Hotel Central',
      departureDate: new Date('2025-11-02T06:30:00Z'),
      // arrivalDate es String en el schema → le pasamos texto (ISO o "07:10")
      arrivalDate: '2025-11-02T07:10:00Z',
      provider: 'Shuttle Co.',
      totalPrice: new Prisma.Decimal('5000.00'),
      amountPaid: new Prisma.Decimal('5000.00'),
      transportType: TransportType.PICKUP,
    },
  });

  // Ejemplo extra de BUS
  await prisma.transfer.create({
    data: {
      reservationId: reservation.id,
      origin: 'Miami Downtown',
      destination: 'Orlando Station',
      departureDate: new Date('2025-11-06T08:00:00Z'),
      arrivalDate: '2025-11-06T12:15:00Z',
      provider: 'Greyhound',
      totalPrice: new Prisma.Decimal('3000.00'),
      amountPaid: new Prisma.Decimal('3000.00'),
      transportType: TransportType.BUS,
    },
  });

  // Excursión (ahora requiere origin)
  await prisma.excursion.create({
    data: {
      reservationId: reservation.id,
      origin: 'Miami',
      provider: 'City Tours',
      excursionName: 'City Highlights',
      excursionDate: new Date('2025-11-05T14:00:00Z'),
      totalPrice: new Prisma.Decimal('7000.00'),
      amountPaid: new Prisma.Decimal('0.00'),
    },
  });

  // Asistencia médica (assistType es opcional)
  await prisma.medicalAssist.create({
    data: {
      reservationId: reservation.id,
      bookingReference: 'MED-777',
      assistType: 'Full',
      provider: 'AssistCard',
      totalPrice: new Prisma.Decimal('8000.00'),
      amountPaid: new Prisma.Decimal('8000.00'),
    },
  });

  // Pax con documentos (cumple los triggers "pax con docs")
  const [pax1, pax2] = await Promise.all([
    prisma.pax.create({
      data: {
        name: 'Juan Pérez',
        birthDate: new Date('1990-05-10T00:00:00Z'),
        nationality: 'Argentina',
        dni: {
          create: {
            dniNum: '12345678',
            expirationDate: new Date('2030-01-01T00:00:00Z'),
          },
        },
        passport: {
          create: {
            passportNum: 'AA1234567',
            expirationDate: new Date('2031-03-01T00:00:00Z'),
          },
        },
      },
    }),
    prisma.pax.create({
      data: {
        name: 'Ana Gómez',
        birthDate: new Date('1992-07-10T00:00:00Z'),
        nationality: 'Argentina',
        dni: {
          create: {
            dniNum: '35123456',
            expirationDate: new Date('2029-10-20T00:00:00Z'),
          },
        },
      },
    }),
  ]);

  // Vincular pax a la reserva
  await prisma.paxReservation.createMany({
    data: [
      { paxId: pax1.id, reservationId: reservation.id },
      { paxId: pax2.id, reservationId: reservation.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completado (limpia + crea).');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
