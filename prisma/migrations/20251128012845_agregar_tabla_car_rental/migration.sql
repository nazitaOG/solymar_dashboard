-- CreateTable
CREATE TABLE "public"."CarRental" (
    "id" UUID NOT NULL,
    "reservationId" UUID NOT NULL,
    "provider" VARCHAR(128) NOT NULL,
    "bookingReference" VARCHAR(255),
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "dropoffDate" TIMESTAMP(3) NOT NULL,
    "pickupLocation" VARCHAR(128) NOT NULL,
    "dropoffLocation" VARCHAR(128) NOT NULL,
    "carCategory" VARCHAR(128) NOT NULL,
    "carModel" VARCHAR(255),
    "totalPrice" DECIMAL(18,2) NOT NULL,
    "amountPaid" DECIMAL(18,2) NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    "updatedBy" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CarRental_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarRental_reservationId_idx" ON "public"."CarRental"("reservationId");

-- CreateIndex
CREATE INDEX "CarRental_currency_idx" ON "public"."CarRental"("currency");

-- AddForeignKey
ALTER TABLE "public"."CarRental" ADD CONSTRAINT "CarRental_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
