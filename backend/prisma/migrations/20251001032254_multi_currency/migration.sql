/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `currency` to the `Cruise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Excursion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Hotel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `MedicalAssist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Plane` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Transfer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('USD', 'ARS');

-- AlterTable
ALTER TABLE "public"."Cruise" ADD COLUMN     "currency" "public"."Currency" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Excursion" ADD COLUMN     "currency" "public"."Currency" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Hotel" ADD COLUMN     "currency" "public"."Currency" NOT NULL;

-- AlterTable
ALTER TABLE "public"."MedicalAssist" ADD COLUMN     "currency" "public"."Currency" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Plane" ADD COLUMN     "currency" "public"."Currency" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "amountPaid",
DROP COLUMN "totalPrice";

-- AlterTable
ALTER TABLE "public"."Transfer" ADD COLUMN     "currency" "public"."Currency" NOT NULL;

-- CreateTable
CREATE TABLE "public"."ReservationCurrencyTotal" (
    "id" UUID NOT NULL,
    "reservationId" UUID NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "totalPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationCurrencyTotal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationCurrencyTotal_reservationId_idx" ON "public"."ReservationCurrencyTotal"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationCurrencyTotal_currency_idx" ON "public"."ReservationCurrencyTotal"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationCurrencyTotal_reservationId_currency_key" ON "public"."ReservationCurrencyTotal"("reservationId", "currency");

-- CreateIndex
CREATE INDEX "Cruise_currency_idx" ON "public"."Cruise"("currency");

-- CreateIndex
CREATE INDEX "Excursion_currency_idx" ON "public"."Excursion"("currency");

-- CreateIndex
CREATE INDEX "Hotel_currency_idx" ON "public"."Hotel"("currency");

-- CreateIndex
CREATE INDEX "MedicalAssist_currency_idx" ON "public"."MedicalAssist"("currency");

-- CreateIndex
CREATE INDEX "Plane_currency_idx" ON "public"."Plane"("currency");

-- CreateIndex
CREATE INDEX "Transfer_currency_idx" ON "public"."Transfer"("currency");

-- AddForeignKey
ALTER TABLE "public"."ReservationCurrencyTotal" ADD CONSTRAINT "ReservationCurrencyTotal_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
