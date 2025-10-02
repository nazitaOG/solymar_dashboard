ALTER TABLE "Plane"
  ADD CONSTRAINT "plane_departure_arrival_diff_ck"
  CHECK (
    "arrival" IS NULL
    OR lower(btrim("arrival")) <> lower(btrim("departure"))
  );