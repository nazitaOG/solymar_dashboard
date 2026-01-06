/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { hashPassword } from '../src/common/security/hash_password';

const pepper = process.env.PEPPER;
const prisma = new PrismaClient();

async function main(): Promise<void> {
  // =====================================================================
  // 1) LIMPIEZA SEGURA (NEON COMPATIBLE) 🛡️
  // Usamos TRUNCATE CASCADE en lugar de session_replication_role
  // =====================================================================

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
      console.log('🗑️  Limpiando base de datos (Producción)...');
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.error('Error limpiando DB:', error);
  }

  // =====================================================================
  // 2) USUARIO SYSTEM (Necesario para campos de auditoría)
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
  console.log('✅ Usuario System creado.');

  // =====================================================================
  // 3) ROLES
  // =====================================================================
  // Necesitamos guardar los roles para asignar el ID después
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
  console.log('✅ Roles creados.');

  // =====================================================================
  // 4) TU SUPER ADMIN (Único usuario real)
  // =====================================================================
  const demoUser = await prisma.user.create({
    data: {
      email: 'admin@seed.com',
      username: 'lopeznazarenoo',
      // Asegúrate de cambiar 'password123' si quieres otra pass inicial
      hashedPassword: await hashPassword('Admin123!', undefined, pepper),
      isActive: true,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    },
  });

  // =====================================================================
  // 5) ASIGNAR TODOS LOS ROLES (SUPER_ADMIN, ADMIN, USER)
  // =====================================================================

  // 1. Definimos qué roles queremos asignar
  const rolesToAssign = [superAdminRole, adminRole, userRole];

  // 2. Usamos createMany para insertar las 3 filas de golpe
  await prisma.roleUser.createMany({
    data: rolesToAssign.map((role) => ({
      roleId: role.id,
      userId: demoUser.id,
      createdBy: SYSTEM_ID,
      updatedBy: SYSTEM_ID,
    })),
    skipDuplicates: true, // Por seguridad, si ya existe la relación no falla
  });

  console.log(
    `✅ Seed de Producción completado. Super Admin: ${demoUser.email}`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
