BEGIN;

-- =========================
-- Función: valida al COMMIT que el Pax tenga al menos un documento (Passport o Dni)
-- =========================
CREATE OR REPLACE FUNCTION check_pax_has_document()
RETURNS TRIGGER AS $$
DECLARE pid UUID;
BEGIN
  -- Identificamos el pax afectado según la tabla que dispara el trigger
  pid := COALESCE(
    -- si vino de Passport/Dni
    COALESCE(NEW."paxId", OLD."paxId"),
    -- si vino de Pax
    COALESCE(NEW."id", OLD."id")
  );

  -- ¿Existe al menos un documento para este pax?
  PERFORM 1
  FROM (
    SELECT 1 FROM "Passport" p WHERE p."paxId" = pid
    UNION ALL
    SELECT 1 FROM "Dni" d WHERE d."paxId" = pid
    LIMIT 1
  ) s;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El Pax % debe tener al menos un documento (DNI o Pasaporte)', pid;
  END IF;

  -- Constraint trigger: no modifica filas
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Constraint trigger DEFERRABLE sobre Passport
DROP TRIGGER IF EXISTS trg_check_pax_has_document_on_passport ON "Passport";
CREATE CONSTRAINT TRIGGER trg_check_pax_has_document_on_passport
AFTER INSERT OR UPDATE OR DELETE ON "Passport"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_pax_has_document();

-- Constraint trigger DEFERRABLE sobre Dni
DROP TRIGGER IF EXISTS trg_check_pax_has_document_on_dni ON "Dni";
CREATE CONSTRAINT TRIGGER trg_check_pax_has_document_on_dni
AFTER INSERT OR UPDATE OR DELETE ON "Dni"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_pax_has_document();

-- Constraint trigger DEFERRABLE sobre Pax (por si se crea/actualiza un Pax sin docs)
DROP TRIGGER IF EXISTS trg_check_pax_has_document_on_pax ON "Pax";
CREATE CONSTRAINT TRIGGER trg_check_pax_has_document_on_pax
AFTER INSERT OR UPDATE ON "Pax"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_pax_has_document();

-- =========================
-- (Opcional) Triggers inmediatos: evitar borrar el ÚLTIMO documento
-- =========================

-- Al borrar PASSPORT, si el Pax no tiene DNI, bloquear
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

-- Al borrar DNI, si el Pax no tiene PASSPORT, bloquear
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
