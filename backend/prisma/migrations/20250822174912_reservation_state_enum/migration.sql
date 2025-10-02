/*
  Warnings:

  - The `state` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ReservationState" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "state",
ADD COLUMN     "state" "public"."ReservationState" NOT NULL DEFAULT 'PENDING';
