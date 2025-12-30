-- Migration: remove immediate triggers that prevented deleting the last document
-- We want to keep the DEFERRABLE constraint triggers (check_pax_has_document)
-- which validate at COMMIT, but remove the BEFORE DELETE triggers
-- prevent_delete_last_passport / prevent_delete_last_dni that caused
-- errors when deleting docs inside transactions (eg: delete pax with cascade).

BEGIN;

-- Drop immediate trigger on Passport that blocked deleting the only passport
DROP TRIGGER IF EXISTS trg_prevent_delete_last_passport ON "Passport";
DROP FUNCTION IF EXISTS prevent_delete_last_passport();

-- Drop immediate trigger on Dni that blocked deleting the only dni
DROP TRIGGER IF EXISTS trg_prevent_delete_last_dni ON "Dni";
DROP FUNCTION IF EXISTS prevent_delete_last_dni();

COMMIT;
