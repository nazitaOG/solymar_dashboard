/*
  Warnings:

  - You are about to drop the column `arrival` on the `Plane` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalDate` on the `Plane` table. All the data in the column will be lost.
  - You are about to drop the column `departure` on the `Plane` table. All the data in the column will be lost.
  - You are about to drop the column `departureDate` on the `Plane` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plane" DROP COLUMN "arrival",
DROP COLUMN "arrivalDate",
DROP COLUMN "departure",
DROP COLUMN "departureDate";

-- CreateTable
CREATE TABLE "public"."PlaneSegment" (
    "id" UUID NOT NULL,
    "planeId" UUID NOT NULL,
    "segmentOrder" INTEGER NOT NULL,
    "departure" VARCHAR(128) NOT NULL,
    "arrival" VARCHAR(128) NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "airline" VARCHAR(128),
    "flightNumber" VARCHAR(64),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PlaneSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaneSegment_planeId_idx" ON "public"."PlaneSegment"("planeId");

-- CreateIndex
CREATE INDEX "PlaneSegment_segmentOrder_idx" ON "public"."PlaneSegment"("segmentOrder");

-- AddForeignKey
ALTER TABLE "public"."PlaneSegment" ADD CONSTRAINT "PlaneSegment_planeId_fkey" FOREIGN KEY ("planeId") REFERENCES "public"."Plane"("id") ON DELETE CASCADE ON UPDATE CASCADE;
