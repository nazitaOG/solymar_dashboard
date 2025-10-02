/*
  Warnings:

  - You are about to drop the column `bookingReference` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `dropOff` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `pickup` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `pickupDate` on the `Transfer` table. All the data in the column will be lost.
  - Added the required column `origin` to the `Excursion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrivalDate` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureDate` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Transfer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TransportType" AS ENUM ('PICKUP', 'BUS', 'TRAIN', 'FERRY', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Cruise" ALTER COLUMN "arrivalPort" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Excursion" ADD COLUMN     "origin" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."MedicalAssist" ALTER COLUMN "assistType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Plane" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "arrival" DROP NOT NULL,
ALTER COLUMN "arrivalDate" DROP NOT NULL,
ALTER COLUMN "provider" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Transfer" DROP COLUMN "bookingReference",
DROP COLUMN "dropOff",
DROP COLUMN "pickup",
DROP COLUMN "pickupDate",
ADD COLUMN     "arrivalDate" TEXT NOT NULL,
ADD COLUMN     "departureDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "transportType" "public"."TransportType" NOT NULL DEFAULT 'PICKUP';
