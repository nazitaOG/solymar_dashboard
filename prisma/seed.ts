import { PrismaClient, Prisma, ReservationState } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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

  const [adminRole, userRole] = await Promise.all([
    prisma.role.create({ data: { description: 'Admin' } }),
    prisma.role.create({ data: { description: 'User' } }),
  ]);

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      username: 'user123',
      hashedPassword: await bcrypt.hash('password123', 10),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin123',
      hashedPassword: await bcrypt.hash('password123', 10),
    },
  });

  await prisma.roleUser.create({
    data: { roleId: adminRole.id, userId: admin.id },
  });
  await prisma.roleUser.create({
    data: { roleId: userRole.id, userId: user.id },
  });

  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      totalPrice: new Prisma.Decimal('120000.00'),
      state: ReservationState.CONFIRMED,
    },
  });

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

  const pax = await prisma.pax.create({
    data: {
      name: 'Juan Pérez',
      birthDate: new Date('1990-05-10'),
      nationality: 'Argentina',
    },
  });

  await prisma.dni.create({
    data: {
      dniNum: '12345678',
      expirationDate: new Date('2030-01-01'),
      paxId: pax.id,
    },
  });

  await prisma.passport.create({
    data: {
      passportNum: 'AA1234567',
      expirationDate: new Date('2031-03-01'),
      paxId: pax.id,
    },
  });

  await prisma.paxReservation.create({
    data: { paxId: pax.id, reservationId: reservation.id },
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
