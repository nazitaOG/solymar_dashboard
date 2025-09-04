-- This is an empty migration.
-- Garantía dura: ninguna Reservation puede quedar sin PaxReservation

BEGIN;

-- =========================
-- Función (constraint deferred)
-- =========================
CREATE OR REPLACE FUNCTION check_reservation_has_pax()
RETURNS TRIGGER AS $$ -- significa que esta funcion solo puede usarse como parte de un trigger
BEGIN
  -- Reserva afectada (INSERT/UPDATE usa NEW; DELETE usa OLD)
  PERFORM 1 -- en PL/pgSQL se usa cuando querés ejecutar un SELECT y no te importa el resultado (en este caso, no nos importa el resultado, solo que exista una reserva con un pax)
  FROM "Reservation" r
  WHERE r.id = COALESCE(NEW."reservationId", OLD."reservationId") -- COALESCE es una funcion que devuelve el primer argumento que no es NULL (si NEW es NULL, devuelve OLD)
    AND NOT EXISTS (
      SELECT 1 FROM "PaxReservation" pr WHERE pr."reservationId" = r.id 
    );

  IF FOUND THEN
    RAISE EXCEPTION 'La reserva % no puede quedar sin pasajeros', COALESCE(NEW."reservationId", OLD."reservationId");
  END IF;

  RETURN NULL; -- constraint trigger, no altera filas
END;
$$ LANGUAGE plpgsql; -- significa que esta funcion esta escrita en plpgsql (plpgsql es el lenguaje de programacion de postgres)

-- Constraint trigger DEFERRABLE (se evalúa al COMMIT)
DROP TRIGGER IF EXISTS trg_check_reservation_has_pax ON "PaxReservation";
CREATE CONSTRAINT TRIGGER trg_check_reservation_has_pax
AFTER INSERT OR UPDATE OR DELETE ON "PaxReservation"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_reservation_has_pax();

-- =========================
-- Función (inmediato antes de DELETE)
-- =========================
CREATE OR REPLACE FUNCTION prevent_delete_last_pax()
RETURNS TRIGGER AS $$
DECLARE remaining_count INT;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM "PaxReservation"
  WHERE "reservationId" = OLD."reservationId"
    AND "paxId" <> OLD."paxId";

  IF remaining_count = 0 THEN
    RAISE EXCEPTION 'No se puede eliminar el último pasajero de la reserva %', OLD."reservationId";
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_delete_last_pax ON "PaxReservation";
CREATE TRIGGER trg_prevent_delete_last_pax
BEFORE DELETE ON "PaxReservation"
FOR EACH ROW
EXECUTE FUNCTION prevent_delete_last_pax();

COMMIT;
