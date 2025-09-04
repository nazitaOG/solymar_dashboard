/// <reference types="node" />

import { PrismaClient, Prisma, ReservationState } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpieza en orden seguro (FKs)
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

  // Roles
  const [adminRole, userRole] = await Promise.all([
    prisma.role.create({ data: { description: 'Admin' } }),
    prisma.role.create({ data: { description: 'User' } }),
  ]);

  // Users
  const [user, admin] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'user123',
        hashedPassword: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin123',
        hashedPassword: await bcrypt.hash('password123', 10),
      },
    }),
  ]);

  await prisma.roleUser.createMany({
    data: [
      { roleId: adminRole.id, userId: admin.id },
      { roleId: userRole.id, userId: user.id },
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

  // Ítems de la reserva
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
      provider: 'Aerolíneas',
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
      provider: 'Royal',
      totalPrice: new Prisma.Decimal('20000.00'),
      amountPaid: new Prisma.Decimal('10000.00'),
    },
  });

  await prisma.transfer.create({
    data: {
      reservationId: reservation.id,
      pickup: 'Aeropuerto MIA',
      dropOff: 'Hotel Central',
      pickupDate: new Date('2025-11-02T06:30:00Z'),
      bookingReference: 'TRF-555',
      provider: 'Shuttle Co.',
      totalPrice: new Prisma.Decimal('5000.00'),
      amountPaid: new Prisma.Decimal('5000.00'),
    },
  });

  await prisma.excursion.create({
    data: {
      reservationId: reservation.id,
      provider: 'City Tours',
      excursionName: 'City Highlights',
      excursionDate: new Date('2025-11-05T14:00:00Z'),
      totalPrice: new Prisma.Decimal('7000.00'),
      amountPaid: new Prisma.Decimal('0.00'),
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
    },
  });

  // Pax con documentos (nested create para cumplir trigger de "pax con docs")
  const [pax1, pax2] = await Promise.all([
    prisma.pax.create({
      data: {
        name: 'Juan Pérez',
        birthDate: new Date('1990-05-10T12:00:00Z'),
        nationality: 'Argentina',
        dni: {
          create: {
            dniNum: '12345678',
            expirationDate: new Date('2030-01-01T12:00:00Z'),
          },
        },
        passport: {
          create: {
            passportNum: 'AA1234567',
            expirationDate: new Date('2031-03-01T12:00:00Z'),
          },
        },
      },
    }),
    prisma.pax.create({
      data: {
        name: 'Ana Gómez',
        birthDate: new Date('1992-07-10T12:00:00Z'),
        nationality: 'Argentina',
        // solo DNI
        dni: {
          create: {
            dniNum: '35123456',
            expirationDate: new Date('2029-10-20T12:00:00Z'),
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
