import { PrismaClient, ReservationState } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 0) LIMPIEZA en orden seguro por FKs (o usá migrate reset y te ahorrás esto)
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

  // 1) ROLES
  const [adminRole, userRole] = await Promise.all([
    prisma.role.create({ data: { description: 'Admin' } }),
    prisma.role.create({ data: { description: 'User' } }),
  ]);

  // 2) USUARIO
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

  // 3) VÍNCULO USER-ROLE (User)
  await prisma.roleUser.create({
    data: { roleId: userRole.id, userId: user.id },
  });

  // 4) RESERVA
  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      totalPrice: 120000n, // BigInt
      state: ReservationState.CONFIRMED,
      // uploadDate: now() por default
    },
  });

  // 5) SERVICIOS
  await prisma.hotel.create({
    data: {
      reservationId: reservation.id,
      startDate: new Date('2025-11-01T12:00:00Z'),
      endDate: new Date('2025-11-10T10:00:00Z'),
      city: 'Buenos Aires',
      hotelName: 'Hotel Central',
      bookingReference: 'HOTEL-123',
      totalPrice: 80000n,
      amountPaid: 40000n,
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
      totalPrice: 30000n,
      amountPaid: 30000n,
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
      totalPrice: 5000n,
      amountPaid: 5000n,
    },
  });

  await prisma.excursion.create({
    data: {
      reservationId: reservation.id,
      provider: 'City Tours',
      excursionName: 'City Highlights',
      excursionDate: new Date('2025-11-05T14:00:00Z'),
      totalPrice: 7000n,
      amountPaid: 0n,
    },
  });

  await prisma.medicalAssist.create({
    data: {
      reservationId: reservation.id,
      bookingReference: 'MED-777',
      assistType: 'Full',
      provider: 'AssistCard',
      totalPrice: 8000n,
      amountPaid: 8000n,
    },
  });

  // 6) PAX + DOCUMENTOS + LINK A RESERVA
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
