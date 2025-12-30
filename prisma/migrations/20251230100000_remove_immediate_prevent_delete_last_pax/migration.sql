-- Migration: remove immediate BEFORE DELETE trigger that blocked deleting Pax during cascade
-- Keeps the deferred constraint trigger so a Reservation can't end up without Pax

BEGIN;

-- 1) Remove the immediate trigger (if present) and its function
DROP TRIGGER IF EXISTS trg_prevent_delete_last_pax ON "PaxReservation";
DROP FUNCTION IF EXISTS prevent_delete_last_pax();

-- 2) Ensure the deferred constraint function exists and is attached as a CONSTRAINT TRIGGER
CREATE OR REPLACE FUNCTION check_reservation_has_pax()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM 1
  FROM "Reservation" r
  WHERE r.id IN (NEW."reservationId", OLD."reservationId")
    AND NOT EXISTS (
      SELECT 1 FROM "PaxReservation" pr
      WHERE pr."reservationId" = r.id
    );

  IF FOUND THEN
    RAISE EXCEPTION 'La reserva % no puede quedar sin pasajeros',
      COALESCE(OLD."reservationId", NEW."reservationId");
  END IF;

  RETURN NULL; -- constraint trigger
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_reservation_has_pax ON "PaxReservation";
CREATE CONSTRAINT TRIGGER trg_check_reservation_has_pax
AFTER INSERT OR UPDATE OR DELETE ON "PaxReservation"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_reservation_has_pax();

COMMIT;
