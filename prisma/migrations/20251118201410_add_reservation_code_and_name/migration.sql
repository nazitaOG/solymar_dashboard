/*
  Warnings:

  - The values [PICKUP] on the enum `TransportType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TransportType_new" AS ENUM ('TRANSFER', 'BUS', 'TRAIN', 'FERRY', 'OTHER');
ALTER TABLE "public"."Transfer" ALTER COLUMN "transportType" DROP DEFAULT;
ALTER TABLE "public"."Transfer" ALTER COLUMN "transportType" TYPE "public"."TransportType_new" USING ("transportType"::text::"public"."TransportType_new");
ALTER TYPE "public"."TransportType" RENAME TO "TransportType_old";
ALTER TYPE "public"."TransportType_new" RENAME TO "TransportType";
DROP TYPE "public"."TransportType_old";
ALTER TABLE "public"."Transfer" ALTER COLUMN "transportType" SET DEFAULT 'TRANSFER';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Reservation" ADD COLUMN     "code" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'RES';

-- AlterTable
ALTER TABLE "public"."Transfer" ALTER COLUMN "transportType" SET DEFAULT 'TRANSFER';

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_code_key" ON "public"."Reservation"("code");
