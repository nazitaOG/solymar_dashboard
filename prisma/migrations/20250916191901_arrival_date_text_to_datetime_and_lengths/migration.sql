-- Align DTOs with Prisma schema: lengths & date casting
-- Seguro para datos existentes (no se dropea arrivalDate; se castea con USING)

BEGIN;

-- ====================
-- CRUISE
-- ====================
ALTER TABLE "public"."Cruise"
  ALTER COLUMN "bookingReference" DROP NOT NULL,
  ALTER COLUMN "bookingReference" SET DATA TYPE VARCHAR(255),
  ALTER COLUMN "provider"         SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "embarkationPort"  SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "arrivalPort"      SET DATA TYPE VARCHAR(128);

-- ====================
-- EXCURSION
-- ====================
-- Si el campo no existía antes, lo agregamos; si ya existía como TEXT y se migró, quedará en VARCHAR(128)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Excursion'
      AND column_name = 'bookingReference'
  ) THEN
    ALTER TABLE "public"."Excursion"
      ADD COLUMN "bookingReference" VARCHAR(128);
  END IF;
END$$;

ALTER TABLE "public"."Excursion"
  ALTER COLUMN "provider"      SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "excursionName" SET DATA TYPE VARCHAR(255),
  ALTER COLUMN "origin"        SET DATA TYPE VARCHAR(128);

-- Si preferís 255 para bookingReference en Excursion, descomentá:
-- ALTER TABLE "public"."Excursion"
--   ALTER COLUMN "bookingReference" SET DATA TYPE VARCHAR(255);

-- ====================
-- HOTEL
-- ====================
ALTER TABLE "public"."Hotel"
  ALTER COLUMN "city"            SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "hotelName"       SET DATA TYPE VARCHAR(255),
  ALTER COLUMN "bookingReference"SET DATA TYPE VARCHAR(255),
  ALTER COLUMN "roomType"        SET DATA TYPE VARCHAR(255),
  ALTER COLUMN "provider"        SET DATA TYPE VARCHAR(128);

-- ====================
-- MEDICAL ASSIST
-- ====================
ALTER TABLE "public"."MedicalAssist"
  ALTER COLUMN "bookingReference" SET DATA TYPE VARCHAR(255),
  ALTER COLUMN "assistType"       SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "provider"         SET DATA TYPE VARCHAR(128);

-- ====================
-- PLANE
-- ====================
ALTER TABLE "public"."Plane"
  ALTER COLUMN "departure"        SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "arrival"          SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "bookingReference" SET DATA TYPE VARCHAR(255),
  ALTER COLUMN "provider"         SET DATA TYPE VARCHAR(128);

-- ====================
-- TRANSFER
-- ====================
-- Agregar bookingReference si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Transfer'
      AND column_name = 'bookingReference'
  ) THEN
    ALTER TABLE "public"."Transfer"
      ADD COLUMN "bookingReference" VARCHAR(128);
  END IF;
END$$;

-- Longitudes de strings
ALTER TABLE "public"."Transfer"
  ALTER COLUMN "provider"    SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "destination" SET DATA TYPE VARCHAR(128),
  ALTER COLUMN "origin"      SET DATA TYPE VARCHAR(128);

-- arrivalDate: TEXT -> TIMESTAMP(3) (sin drop, casteando en sitio)
-- Si tus valores están en ISO 8601 o 'YYYY-MM-DD HH:MI:SS+TZ', esto funciona.
ALTER TABLE "public"."Transfer"
  ALTER COLUMN "arrivalDate" TYPE TIMESTAMP(3)
  USING ("arrivalDate")::timestamp;

-- Forzar NOT NULL (coincide con Prisma). Si hubiera nulos malos, fallará: corregir datos antes.
ALTER TABLE "public"."Transfer"
  ALTER COLUMN "arrivalDate" SET NOT NULL;

COMMIT;
