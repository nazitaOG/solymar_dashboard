// prisma/seed.demo.ts
import { PrismaClient, Currency, ReservationState } from '@prisma/client';
import { randomUUID } from 'crypto';
// Ajustá la ruta relativa según tu estructura
import { hashPassword } from '../src/common/security/hash_password';

// Instancia global por si se ejecuta desde consola (CLI)
const prismaGlobal = new PrismaClient();

/**
 * Lógica principal del Seed.
 * Acepta una instancia de PrismaClient opcional.
 * NO usamos 'any'. PrismaService extiende de PrismaClient, así que es compatible.
 */
export async function seed(prismaService?: PrismaClient) {
  // Usamos el operador nullish coalescing (??) para elegir la instancia
  const prisma = prismaService ?? prismaGlobal;

  // Usamos el operador de aserción no nula (!) si estás seguro que la variable de entorno existe
  // O mejor, proveemos un fallback vacío para que hashPassword no falle por tipos.
  const pepper = process.env.PEPPER || '';

  console.log('🚀 [SEED DEMO] Iniciando restauración...');

  // =====================================================================
  // 1) LIMPIEZA TOTAL (TRUNCATE CASCADE)
  // =====================================================================

  // Tipamos explícitamente el resultado de la query raw
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    if (tables.length > 0) {
      console.log('🗑️  Limpiando tablas...');
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.warn('⚠️  Aviso al limpiar (posiblemente DB vacía):', error);
  }

  // =====================================================================
  // 2) ESTRUCTURA BASE
  // =====================================================================
  const SYSTEM_ID = randomUUID();

  await prisma.user.create({
    data: {
      id: SYSTEM_ID,
      email: 'system@local',
      username: 'system',
      hashedPassword: 'not-used-in-prod',
      isActive: true,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

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

  const demoUser = await prisma.user.create({
    data: {
      email: 'admin@seed.com',
      username: 'lopeznazarenoo',
      hashedPassword: await hashPassword('Admin123!', undefined, pepper),
      isActive: true,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  await prisma.roleUser.createMany({
    data: [superAdminRole, adminRole, userRole].map((role) => ({
      roleId: role.id,
      userId: demoUser.id,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    })),
  });

  console.log('👤 Admin y Roles creados.');

  // =====================================================================
  // 3) DATOS DEMO
  // =====================================================================

  const pax1 = await prisma.pax.create({
    data: {
      name: 'Lionel Messi',
      birthDate: new Date('1987-06-24'),
      nationality: 'Argentina',
      createdBy: demoUser.id,
      updatedBy: demoUser.id,
      passport: {
        create: {
          passportNum: 'ARG101010',
          expirationDate: new Date('2030-01-01'),
          createdBy: demoUser.id,
          updatedBy: demoUser.id,
        },
      },
    },
  });

  const pax2 = await prisma.pax.create({
    data: {
      name: 'Antonela Roccuzzo',
      birthDate: new Date('1988-02-26'),
      nationality: 'Argentina',
      createdBy: demoUser.id,
      updatedBy: demoUser.id,
      dni: {
        create: {
          dniNum: '33123456',
          createdBy: demoUser.id,
          updatedBy: demoUser.id,
        },
      },
    },
  });

  console.log('🔄 Generando 30 reservas de prueba...');

  for (let i = 1; i <= 30; i++) {
    // 1. Crear la Reserva
    const resMiami = await prisma.reservation.create({
      data: {
        name: `Vacaciones Miami 2026 - Demo #${i}`, // Agregamos el índice al nombre
        userId: demoUser.id,
        state: ReservationState.CONFIRMED,
        createdBy: demoUser.id,
        updatedBy: demoUser.id,
        notes: `Reserva generada automáticamente número ${i}`,
        currencyTotals: {
          create: {
            currency: Currency.USD,
            totalPrice: 4500.0,
            amountPaid: 2000.0,
          },
        },
        paxReservations: {
          create: [
            { paxId: pax1.id, createdBy: demoUser.id, updatedBy: demoUser.id },
            { paxId: pax2.id, createdBy: demoUser.id, updatedBy: demoUser.id },
          ],
        },
      },
    });

    // 2. Crear el Avión (AHORA DENTRO DEL LOOP)
    // Usamos resMiami.id que acaba de crearse en esta iteración
    await prisma.plane.create({
      data: {
        reservationId: resMiami.id,
        bookingReference: `AA-99${i}`, // Hacemos el código único
        provider: 'American Airlines',
        totalPrice: 2000.0,
        amountPaid: 2000.0,
        currency: Currency.USD,
        createdBy: demoUser.id,
        updatedBy: demoUser.id,
        segments: {
          create: [
            {
              segmentOrder: 1,
              departure: 'EZE',
              arrival: 'MIA',
              departureDate: new Date('2026-05-10T21:00:00Z'),
              arrivalDate: new Date('2026-05-11T05:00:00Z'),
              airline: 'American Airlines',
              flightNumber: `AA90${i}`,
              createdBy: demoUser.id,
              updatedBy: demoUser.id,
            },
          ],
        },
      },
    });

    // 3. Crear el Hotel (AHORA DENTRO DEL LOOP)
    await prisma.hotel.create({
      data: {
        reservationId: resMiami.id,
        provider: 'Expedia',
        hotelName: 'Fontainebleau Miami',
        city: 'Miami Beach',
        bookingReference: `EXP-55${i}`,
        startDate: new Date('2026-05-11'),
        endDate: new Date('2026-05-20'),
        totalPrice: 2400.0,
        amountPaid: 0,
        currency: Currency.USD,
        createdBy: demoUser.id,
        updatedBy: demoUser.id,
      },
    });
  }

  const resBrasil = await prisma.reservation.create({
    data: {
      name: 'Finde en Río',
      userId: demoUser.id,
      state: ReservationState.PENDING,
      createdBy: demoUser.id,
      updatedBy: demoUser.id,
      currencyTotals: {
        create: {
          currency: Currency.ARS,
          totalPrice: 1500000.0,
          amountPaid: 500000.0,
        },
      },
      paxReservations: {
        create: [
          { paxId: pax1.id, createdBy: demoUser.id, updatedBy: demoUser.id },
        ],
      },
    },
  });

  await prisma.hotel.create({
    data: {
      reservationId: resBrasil.id,
      provider: 'Despegar',
      hotelName: 'Copacabana Palace',
      city: 'Rio de Janeiro',
      bookingReference: 'DESP-1122',
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-02-18'),
      totalPrice: 1200000.0,
      amountPaid: 500000.0,
      currency: Currency.ARS,
      createdBy: demoUser.id,
      updatedBy: demoUser.id,
    },
  });

  console.log('✅ [SEED DEMO] Proceso finalizado correctamente.');
}

// Ejecución CLI
if (require.main === module) {
  seed()
    .catch((e) => {
      console.error('❌ Error en seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prismaGlobal.$disconnect();
    });
}
