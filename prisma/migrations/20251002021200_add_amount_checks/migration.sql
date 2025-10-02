ALTER TABLE "Hotel"
  ADD CONSTRAINT "hotel_amount_nonnegative_ck" CHECK ("totalPrice" >= 0 AND "amountPaid" >= 0),
  ADD CONSTRAINT "hotel_amount_paid_lte_total_ck" CHECK ("amountPaid" <= "totalPrice");

ALTER TABLE "Plane"
  ADD CONSTRAINT "plane_amount_nonnegative_ck" CHECK ("totalPrice" >= 0 AND "amountPaid" >= 0),
  ADD CONSTRAINT "plane_amount_paid_lte_total_ck" CHECK ("amountPaid" <= "totalPrice");

ALTER TABLE "Cruise"
  ADD CONSTRAINT "cruise_amount_nonnegative_ck" CHECK ("totalPrice" >= 0 AND "amountPaid" >= 0),
  ADD CONSTRAINT "cruise_amount_paid_lte_total_ck" CHECK ("amountPaid" <= "totalPrice");

ALTER TABLE "Transfer"
  ADD CONSTRAINT "transfer_amount_nonnegative_ck" CHECK ("totalPrice" >= 0 AND "amountPaid" >= 0),
  ADD CONSTRAINT "transfer_amount_paid_lte_total_ck" CHECK ("amountPaid" <= "totalPrice");

ALTER TABLE "Excursion"
  ADD CONSTRAINT "excursion_amount_nonnegative_ck" CHECK ("totalPrice" >= 0 AND "amountPaid" >= 0),
  ADD CONSTRAINT "excursion_amount_paid_lte_total_ck" CHECK ("amountPaid" <= "totalPrice");

ALTER TABLE "MedicalAssist"
  ADD CONSTRAINT "medicalassist_amount_nonnegative_ck" CHECK ("totalPrice" >= 0 AND "amountPaid" >= 0),
  ADD CONSTRAINT "medicalassist_amount_paid_lte_total_ck" CHECK ("amountPaid" <= "totalPrice");

ALTER TABLE "ReservationCurrencyTotal"
  ADD CONSTRAINT "rct_amount_nonnegative_ck" CHECK ("totalPrice" >= 0 AND "amountPaid" >= 0),
  ADD CONSTRAINT "rct_amount_paid_lte_total_ck" CHECK ("amountPaid" <= "totalPrice");
