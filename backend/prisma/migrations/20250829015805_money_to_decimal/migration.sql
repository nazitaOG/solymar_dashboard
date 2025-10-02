/*
  Warnings:

  - You are about to alter the column `totalPrice` on the `Cruise` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `amountPaid` on the `Cruise` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `totalPrice` on the `Excursion` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `amountPaid` on the `Excursion` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `totalPrice` on the `Hotel` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `amountPaid` on the `Hotel` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `totalPrice` on the `MedicalAssist` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `amountPaid` on the `MedicalAssist` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `totalPrice` on the `Plane` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `amountPaid` on the `Plane` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `totalPrice` on the `Reservation` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `totalPrice` on the `Transfer` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.
  - You are about to alter the column `amountPaid` on the `Transfer` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Decimal(18,2)`.

*/
-- AlterTable
ALTER TABLE "public"."Cruise" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."Excursion" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."Hotel" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."MedicalAssist" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."Plane" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."Reservation" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "public"."Transfer" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(18,2);
