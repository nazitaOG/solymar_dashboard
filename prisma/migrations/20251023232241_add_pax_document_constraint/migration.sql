-- This is an empty migration.-- ===============================================
-- Garantiza que todo Pax tenga al menos un documento (DNI o Pasaporte)
-- ===============================================

BEGIN;

CREATE OR REPLACE FUNCTION check_pax_has_document()
RETURNS TRIGGER AS $$
DECLARE
  pid uuid;
BEGIN
  pid := COALESCE(NEW."paxId", OLD."paxId");

  PERFORM 1
  FROM "Pax" p
  WHERE p.id = pid
    AND NOT EXISTS (SELECT 1 FROM "Passport" WHERE "paxId" = p.id)
    AND NOT EXISTS (SELECT 1 FROM "Dni"      WHERE "paxId" = p.id);

  IF FOUND THEN
    RAISE EXCEPTION
      'El Pax % debe tener al menos un documento (DNI o Pasaporte)',
      pid;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers diferidos: se evalúan solo al COMMIT
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

COMMIT;
