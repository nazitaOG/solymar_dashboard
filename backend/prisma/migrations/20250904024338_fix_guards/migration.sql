/*
  Warnings:

  - You are about to drop the column `arrival` on the `Cruise` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Cruise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Cruise" DROP COLUMN "arrival",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;
