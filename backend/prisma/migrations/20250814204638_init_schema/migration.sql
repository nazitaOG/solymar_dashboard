-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoleUser" (
    "roleId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "RoleUser_pkey" PRIMARY KEY ("roleId","userId")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPrice" BIGINT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Hotel" (
    "id" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "totalPrice" BIGINT NOT NULL,
    "amountPaid" BIGINT NOT NULL,
    "roomType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reservationId" UUID NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plane" (
    "id" UUID NOT NULL,
    "departure" TEXT NOT NULL,
    "arrival" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" BIGINT NOT NULL,
    "amountPaid" BIGINT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reservationId" UUID NOT NULL,

    CONSTRAINT "Plane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cruise" (
    "id" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "embarkationPort" TEXT NOT NULL,
    "arrival" TEXT NOT NULL,
    "arrivalPort" TEXT NOT NULL,
    "totalPrice" BIGINT NOT NULL,
    "amountPaid" BIGINT NOT NULL,
    "reservationId" UUID NOT NULL,

    CONSTRAINT "Cruise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transfer" (
    "id" UUID NOT NULL,
    "pickup" TEXT NOT NULL,
    "dropOff" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reservationId" UUID NOT NULL,
    "totalPrice" BIGINT NOT NULL,
    "amountPaid" BIGINT NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Excursion" (
    "id" UUID NOT NULL,
    "totalPrice" BIGINT NOT NULL,
    "amountPaid" BIGINT NOT NULL,
    "provider" TEXT NOT NULL,
    "excursionDate" TIMESTAMP(3) NOT NULL,
    "excursionName" TEXT NOT NULL,
    "reservationId" UUID NOT NULL,

    CONSTRAINT "Excursion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalAssist" (
    "id" UUID NOT NULL,
    "totalPrice" BIGINT NOT NULL,
    "amountPaid" BIGINT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "assistType" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reservationId" UUID NOT NULL,

    CONSTRAINT "MedicalAssist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pax" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "nationality" TEXT NOT NULL,

    CONSTRAINT "Pax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Passport" (
    "id" UUID NOT NULL,
    "passportNum" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "paxId" UUID NOT NULL,

    CONSTRAINT "Passport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Dni" (
    "id" UUID NOT NULL,
    "dniNum" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "paxId" UUID NOT NULL,

    CONSTRAINT "Dni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaxReservation" (
    "id" UUID NOT NULL,
    "paxId" UUID NOT NULL,
    "reservationId" UUID NOT NULL,

    CONSTRAINT "PaxReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "Hotel_reservationId_idx" ON "public"."Hotel"("reservationId");

-- CreateIndex
CREATE INDEX "Plane_reservationId_idx" ON "public"."Plane"("reservationId");

-- CreateIndex
CREATE INDEX "Cruise_reservationId_idx" ON "public"."Cruise"("reservationId");

-- CreateIndex
CREATE INDEX "Transfer_reservationId_idx" ON "public"."Transfer"("reservationId");

-- CreateIndex
CREATE INDEX "Excursion_reservationId_idx" ON "public"."Excursion"("reservationId");

-- CreateIndex
CREATE INDEX "MedicalAssist_reservationId_idx" ON "public"."MedicalAssist"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_passportNum_key" ON "public"."Passport"("passportNum");

-- CreateIndex
CREATE UNIQUE INDEX "Passport_paxId_key" ON "public"."Passport"("paxId");

-- CreateIndex
CREATE UNIQUE INDEX "Dni_dniNum_key" ON "public"."Dni"("dniNum");

-- CreateIndex
CREATE UNIQUE INDEX "Dni_paxId_key" ON "public"."Dni"("paxId");

-- CreateIndex
CREATE INDEX "PaxReservation_reservationId_idx" ON "public"."PaxReservation"("reservationId");

-- CreateIndex
CREATE INDEX "PaxReservation_paxId_idx" ON "public"."PaxReservation"("paxId");

-- CreateIndex
CREATE UNIQUE INDEX "PaxReservation_paxId_reservationId_key" ON "public"."PaxReservation"("paxId", "reservationId");

-- AddForeignKey
ALTER TABLE "public"."RoleUser" ADD CONSTRAINT "RoleUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoleUser" ADD CONSTRAINT "RoleUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hotel" ADD CONSTRAINT "Hotel_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plane" ADD CONSTRAINT "Plane_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cruise" ADD CONSTRAINT "Cruise_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transfer" ADD CONSTRAINT "Transfer_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Excursion" ADD CONSTRAINT "Excursion_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalAssist" ADD CONSTRAINT "MedicalAssist_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Passport" ADD CONSTRAINT "Passport_paxId_fkey" FOREIGN KEY ("paxId") REFERENCES "public"."Pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Dni" ADD CONSTRAINT "Dni_paxId_fkey" FOREIGN KEY ("paxId") REFERENCES "public"."Pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaxReservation" ADD CONSTRAINT "PaxReservation_paxId_fkey" FOREIGN KEY ("paxId") REFERENCES "public"."Pax"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaxReservation" ADD CONSTRAINT "PaxReservation_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "public"."Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
