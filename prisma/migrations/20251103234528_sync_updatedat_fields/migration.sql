/*
  Warnings:

  - You are about to drop the column `updatetAt` on the `Cruise` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Dni` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Excursion` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `MedicalAssist` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Pax` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `PaxReservation` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Plane` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `ReservationCurrencyTotal` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `RoleUser` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `updatetAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Cruise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Dni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Excursion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MedicalAssist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PaxReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Plane` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ReservationCurrencyTotal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cruise" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Dni" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Excursion" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Hotel" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."MedicalAssist" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Passport" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Pax" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PaxReservation" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Plane" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."ReservationCurrencyTotal" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Role" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."RoleUser" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Transfer" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "updatetAt",
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;
