-- Corrige/estandariza guards de Reservation y Pax/Documentos.
-- - check_reservation_has_pax: chequea OLD y NEW (mover pax A→B)
-- - check_pax_has_document: valida al COMMIT, se aplica en Passport/Dni
-- - Se elimina el trigger en Pax (causaba error al seed)
-- - Triggers DEFERRABLE para evaluar al COMMIT
-- - (Opcional) triggers inmediatos para evitar borrar el último doc

BEGIN;

-- =========================
-- Reservation: no dejar reservas sin pax
-- =========================

CREATE OR REPLACE FUNCTION check_reservation_has_pax()
RETURNS TRIGGER AS $$
BEGIN
  -- Chequear ambas reservas potencialmente afectadas (INSERT/UPDATE/DELETE)
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

-- (mantener este BEFORE DELETE inmediato si querés bloquear borrar "el último pax")
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


BEGIN;

-- =========================
-- Pax: exigir al menos un documento (Passport o Dni) al COMMIT
-- =========================

CREATE OR REPLACE FUNCTION check_pax_has_document()
RETURNS TRIGGER AS $$
DECLARE
  pid uuid;
BEGIN
  -- Esta función la llaman triggers en Passport/Dni: tomamos paxId de NEW/OLD
  pid := COALESCE(NEW."paxId", OLD."paxId");

  PERFORM 1
  FROM "Pax" p
  WHERE p.id = pid
    AND NOT EXISTS (SELECT 1 FROM "Passport" WHERE "paxId" = p.id)
    AND NOT EXISTS (SELECT 1 FROM "Dni"      WHERE "paxId" = p.id);

  IF FOUND THEN
    RAISE EXCEPTION 'El Pax % debe tener al menos un documento (DNI o Pasaporte)', pid;
  END IF;

  RETURN NULL; -- constraint trigger
END;
$$ LANGUAGE plpgsql;

-- Quitamos el trigger en Pax (causaba fallo al insertar Pax antes de docs)
DROP TRIGGER IF EXISTS trg_check_pax_has_document_on_pax ON "Pax";

-- Triggers DEFERRABLE en tablas de documentos (validan al COMMIT)
DROP TRIGGER IF EXISTS trg_check_pax_has_document_on_passport ON "Passport";
CREATE CONSTRAINT TRIGGER trg_check_pax_has_document_on_passport
AFTER INSERT OR UPDATE OR DELETE ON "Passport"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_pax_has_document();

DROP TRIGGER IF EXISTS trg_check_pax_has_document_on_dni ON "Dni";
CREATE CONSTRAINT TRIGGER trg_check_pax_has_document_on_dni
AFTER INSERT OR UPDATE OR DELETE ON "Dni"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_pax_has_document();

-- =========================
-- (Opcional) Triggers inmediatos para evitar borrar el ÚLTIMO documento
-- Nota: pueden bloquear escenarios "borro y creo" en misma transacción.
-- Si te molestan, podés eliminarlos y confiar solo en los DEFERRABLE.
-- =========================

CREATE OR REPLACE FUNCTION prevent_delete_last_passport()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Dni" d WHERE d."paxId" = OLD."paxId") THEN
    RAISE EXCEPTION 'No se puede eliminar el pasaporte: el Pax % quedaría sin documentos', OLD."paxId";
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_delete_last_passport ON "Passport";
CREATE TRIGGER trg_prevent_delete_last_passport
BEFORE DELETE ON "Passport"
FOR EACH ROW
EXECUTE FUNCTION prevent_delete_last_passport();

CREATE OR REPLACE FUNCTION prevent_delete_last_dni()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Passport" p WHERE p."paxId" = OLD."paxId") THEN
    RAISE EXCEPTION 'No se puede eliminar el DNI: el Pax % quedaría sin documentos', OLD."paxId";
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_delete_last_dni ON "Dni";
CREATE TRIGGER trg_prevent_delete_last_dni
BEFORE DELETE ON "Dni"
FOR EACH ROW
EXECUTE FUNCTION prevent_delete_last_dni();

COMMIT;
