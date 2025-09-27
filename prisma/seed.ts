/// <reference types="node" />

import {
  PrismaClient,
  Prisma,
  ReservationState,
  TransportType,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { hashPassword } from '../src/common/security/hash_password';

const pepper = process.env.PEPPER;
const prisma = new PrismaClient();

async function main() {
  // 1) BORRADO LIMPIO
  await prisma.$executeRaw`SET session_replication_role = replica;`;
  try {
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
  } finally {
    await prisma.$executeRaw`SET session_replication_role = DEFAULT;`;
  }

  // 2) USUARIO SYSTEM (para createdBy/updatedBy)
  const SYSTEM_ID = randomUUID();
  const systemUser = await prisma.user.create({
    data: {
      id: SYSTEM_ID,
      email: 'system@local',
      username: 'system',
      hashedPassword: 'not-used-in-dev',
      isActive: true,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });
  console.log('System user created:', systemUser);

  // 3) ROLES
  const [adminRole, userRole, superAdminRole] = await Promise.all([
    prisma.role.create({
      data: {
        description: 'admin',
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    }),
    prisma.role.create({
      data: {
        description: 'user',
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    }),
    prisma.role.create({
      data: {
        description: 'super_admin',
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    }),
  ]);

  // 4) USERS
  const [user, admin, superAdmin] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'user123',
        hashedPassword: await hashPassword('password123', undefined, pepper),
        isActive: true,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin123',
        hashedPassword: await hashPassword('password123', undefined, pepper),
        isActive: true,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    }),
    prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        username: 'superadmin123',
        hashedPassword: await hashPassword('password123', undefined, pepper),
        isActive: true,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    }),
  ]);

  // 5) ROLE-USER (M2M)
  await prisma.roleUser.createMany({
    data: [
      // admin tiene admin y user
      {
        roleId: adminRole.id,
        userId: admin.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
      {
        roleId: userRole.id,
        userId: admin.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
      // user tiene user
      {
        roleId: userRole.id,
        userId: user.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
      // superAdmin tiene admin, user y super_admin
      {
        roleId: superAdminRole.id,
        userId: superAdmin.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
      {
        roleId: adminRole.id,
        userId: superAdmin.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
      {
        roleId: userRole.id,
        userId: superAdmin.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    ],
    skipDuplicates: true,
  });

  // 6) RESERVA
  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      totalPrice: new Prisma.Decimal('120000.00'), // denormalizado (luego lo automatizamos)
      state: ReservationState.CONFIRMED,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // 7) ITEMS DE RESERVA
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
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // Plane
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
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // Cruise
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
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // Transfer (arrivalDate es DateTime en tu schema)
  await prisma.transfer.create({
    data: {
      reservationId: reservation.id,
      origin: 'Aeropuerto MIA',
      destination: 'Hotel Central',
      departureDate: new Date('2025-11-02T06:30:00Z'),
      arrivalDate: new Date('2025-11-02T07:10:00Z'),
      provider: 'Shuttle Co.',
      totalPrice: new Prisma.Decimal('5000.00'),
      amountPaid: new Prisma.Decimal('5000.00'),
      transportType: TransportType.PICKUP,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // Transfer extra (BUS)
  await prisma.transfer.create({
    data: {
      reservationId: reservation.id,
      origin: 'Miami Downtown',
      destination: 'Orlando Station',
      departureDate: new Date('2025-11-06T08:00:00Z'),
      arrivalDate: new Date('2025-11-06T12:15:00Z'),
      provider: 'Greyhound',
      totalPrice: new Prisma.Decimal('3000.00'),
      amountPaid: new Prisma.Decimal('3000.00'),
      transportType: TransportType.BUS,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // Excursion
  await prisma.excursion.create({
    data: {
      reservationId: reservation.id,
      origin: 'Miami',
      provider: 'City Tours',
      excursionName: 'City Highlights',
      excursionDate: new Date('2025-11-05T14:00:00Z'),
      totalPrice: new Prisma.Decimal('7000.00'),
      amountPaid: new Prisma.Decimal('0.00'),
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // Medical Assist
  await prisma.medicalAssist.create({
    data: {
      reservationId: reservation.id,
      bookingReference: 'MED-777',
      assistType: 'Full',
      provider: 'AssistCard',
      totalPrice: new Prisma.Decimal('8000.00'),
      amountPaid: new Prisma.Decimal('8000.00'),
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // 8) PAX + DOCUMENTOS
  const pax1 = await prisma.pax.create({
    data: {
      name: 'Juan Pérez',
      birthDate: new Date('1990-05-10T00:00:00Z'),
      nationality: 'Argentina',
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
      dni: {
        create: {
          dniNum: '12345678',
          expirationDate: new Date('2030-01-01T00:00:00Z'),
          createdBy: SYSTEM_ID,
          updatedBy: SYSTEM_ID,
        },
      },
      passport: {
        create: {
          passportNum: 'AA1234567',
          expirationDate: new Date('2031-03-01T00:00:00Z'),
          createdBy: SYSTEM_ID,
          updatedBy: SYSTEM_ID,
        },
      },
    },
  });

  const pax2 = await prisma.pax.create({
    data: {
      name: 'Ana Gómez',
      birthDate: new Date('1992-07-10T00:00:00Z'),
      nationality: 'Argentina',
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
      dni: {
        create: {
          dniNum: '35123456',
          expirationDate: new Date('2029-10-20T00:00:00Z'),
          createdBy: SYSTEM_ID,
          updatedBy: SYSTEM_ID,
        },
      },
    },
  });

  // 9) JOIN PAX-RESERVATION
  await prisma.paxReservation.createMany({
    data: [
      {
        paxId: pax1.id,
        reservationId: reservation.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
      {
        paxId: pax2.id,
        reservationId: reservation.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completado (reset + carga de datos de ejemplo).');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
