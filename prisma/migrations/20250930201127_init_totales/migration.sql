-- AlterTable
ALTER TABLE "public"."Reservation" ADD COLUMN     "amountPaid" DECIMAL(18,2) NOT NULL DEFAULT 0,
ALTER COLUMN "totalPrice" SET DEFAULT 0;
