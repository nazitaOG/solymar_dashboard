-- AlterTable
ALTER TABLE "public"."Dni" ALTER COLUMN "expirationDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Passport" ALTER COLUMN "expirationDate" DROP NOT NULL;
