/// <reference types="node" />

import {
  PrismaClient,
  Prisma,
  ReservationState,
  TransportType,
  Currency,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { hashPassword } from '../src/common/security/hash_password';

const pepper = process.env.PEPPER;
const prisma = new PrismaClient();

async function main(): Promise<void> {
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
      prisma.reservationCurrencyTotal.deleteMany({}),
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
  console.log('System user created:', systemUser.username);

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
      data: { description: 'user', createdBy: SYSTEM_ID, updatedBy: SYSTEM_ID },
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
      {
        roleId: userRole.id,
        userId: user.id,
        createdBy: SYSTEM_ID,
        updatedBy: SYSTEM_ID,
      },
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

  // 6) RESERVA (sin totales agregados en Reservation)
  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      state: ReservationState.CONFIRMED,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // 7) ITEMS (cada uno con `currency`)
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
      currency: Currency.ARS,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

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
      currency: Currency.USD,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

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
      currency: Currency.USD,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

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
      currency: Currency.ARS,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

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
      currency: Currency.ARS,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  await prisma.excursion.create({
    data: {
      reservationId: reservation.id,
      origin: 'Miami',
      provider: 'City Tours',
      excursionName: 'City Highlights',
      excursionDate: new Date('2025-11-05T14:00:00Z'),
      totalPrice: new Prisma.Decimal('7000.00'),
      amountPaid: new Prisma.Decimal('0.00'),
      currency: Currency.ARS,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  await prisma.medicalAssist.create({
    data: {
      reservationId: reservation.id,
      bookingReference: 'MED-777',
      assistType: 'Full',
      provider: 'AssistCard',
      totalPrice: new Prisma.Decimal('8000.00'),
      amountPaid: new Prisma.Decimal('8000.00'),
      currency: Currency.ARS,
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

  // 10) TOTALES POR MONEDA (inline, sin función)
  {
    const toNumber = (d: Prisma.Decimal | null): number => Number(d ?? 0);

    const [gHotels, gPlanes, gCruises, gTransfers, gExcursions, gMedicals] =
      await Promise.all([
        prisma.hotel.groupBy({
          by: ['currency'],
          where: { reservationId: reservation.id },
          _sum: { totalPrice: true, amountPaid: true },
        }),
        prisma.plane.groupBy({
          by: ['currency'],
          where: { reservationId: reservation.id },
          _sum: { totalPrice: true, amountPaid: true },
        }),
        prisma.cruise.groupBy({
          by: ['currency'],
          where: { reservationId: reservation.id },
          _sum: { totalPrice: true, amountPaid: true },
        }),
        prisma.transfer.groupBy({
          by: ['currency'],
          where: { reservationId: reservation.id },
          _sum: { totalPrice: true, amountPaid: true },
        }),
        prisma.excursion.groupBy({
          by: ['currency'],
          where: { reservationId: reservation.id },
          _sum: { totalPrice: true, amountPaid: true },
        }),
        prisma.medicalAssist.groupBy({
          by: ['currency'],
          where: { reservationId: reservation.id },
          _sum: { totalPrice: true, amountPaid: true },
        }),
      ]);

    const buckets = new Map<
      Currency,
      { totalPrice: number; amountPaid: number }
    >();

    const fold = (
      rows: Array<{
        currency: Currency;
        _sum: {
          totalPrice: Prisma.Decimal | null;
          amountPaid: Prisma.Decimal | null;
        };
      }>,
    ): void => {
      for (const r of rows) {
        const prev = buckets.get(r.currency) ?? {
          totalPrice: 0,
          amountPaid: 0,
        };
        prev.totalPrice += toNumber(r._sum.totalPrice);
        prev.amountPaid += toNumber(r._sum.amountPaid);
        buckets.set(r.currency, prev);
      }
    };

    fold(gHotels);
    fold(gPlanes);
    fold(gCruises);
    fold(gTransfers);
    fold(gExcursions);
    fold(gMedicals);

    const writes = [
      ...Array.from(buckets.entries()).map(([currency, sums]) =>
        prisma.reservationCurrencyTotal.upsert({
          where: {
            reservationId_currency: { reservationId: reservation.id, currency },
          },
          update: { totalPrice: sums.totalPrice, amountPaid: sums.amountPaid },
          create: {
            reservationId: reservation.id,
            currency,
            totalPrice: sums.totalPrice,
            amountPaid: sums.amountPaid,
          },
        }),
      ),
      prisma.reservationCurrencyTotal.deleteMany({
        where: {
          reservationId: reservation.id,
          currency: { notIn: Array.from(buckets.keys()) },
        },
      }),
    ];

    await prisma.$transaction(writes);
  }

  console.log('✅ Seed completado (reset + datos + totales por moneda).');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
