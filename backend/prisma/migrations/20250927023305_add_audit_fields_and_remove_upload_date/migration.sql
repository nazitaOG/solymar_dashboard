/*
  Warnings:

  - You are about to drop the column `uploadDate` on the `Cruise` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Dni` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Excursion` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `MedicalAssist` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Pax` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `PaxReservation` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Plane` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `RoleUser` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `User` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Cruise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Cruise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Cruise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Dni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Dni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Dni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Excursion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Excursion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Excursion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `MedicalAssist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `MedicalAssist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `MedicalAssist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Pax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Pax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Pax` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `PaxReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `PaxReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `PaxReservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Plane` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Plane` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Plane` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatetAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cruise" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Dni" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Excursion" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Hotel" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."MedicalAssist" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Passport" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Pax" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PaxReservation" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Plane" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Role" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."RoleUser" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Transfer" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "updatedBy" UUID NOT NULL,
ADD COLUMN     "updatetAt" TIMESTAMP(3) NOT NULL;
