-- Borramos el trigger que bloquea el borrado inmediato del último pasajero
DROP TRIGGER IF EXISTS trg_prevent_delete_last_pax ON "PaxReservation";

-- Opcional: Borramos la función para mantener la DB limpia
DROP FUNCTION IF EXISTS prevent_delete_last_pax();