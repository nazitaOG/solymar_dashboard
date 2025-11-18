/*
  Warnings:

  - You are about to alter the column `departure` on the `PlaneSegment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(128)` to `VarChar(3)`.
  - You are about to alter the column `arrival` on the `PlaneSegment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(128)` to `VarChar(3)`.

*/
-- AlterTable
ALTER TABLE "public"."PlaneSegment" ALTER COLUMN "departure" SET DATA TYPE VARCHAR(3),
ALTER COLUMN "arrival" SET DATA TYPE VARCHAR(3);
