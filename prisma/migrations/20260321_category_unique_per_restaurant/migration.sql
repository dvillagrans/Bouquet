-- Unifica categorías duplicadas (mismo restaurante + nombre) y aplica restricción única.

UPDATE "MenuItem" AS mi
SET "categoryId" = sub.keeper_id
FROM (
  SELECT c.id AS old_id, k.keeper_id
  FROM "Category" c
  INNER JOIN (
    SELECT DISTINCT ON ("restaurantId", name)
      id AS keeper_id,
      "restaurantId",
      name
    FROM "Category"
    ORDER BY "restaurantId", name, "order" ASC, "createdAt" ASC
  ) k ON c."restaurantId" = k."restaurantId" AND c.name = k.name AND c.id <> k.keeper_id
) AS sub
WHERE mi."categoryId" = sub.old_id;

DELETE FROM "Category" c
WHERE c.id IN (
  SELECT c2.id
  FROM "Category" c2
  INNER JOIN (
    SELECT DISTINCT ON ("restaurantId", name)
      id AS keeper_id,
      "restaurantId",
      name
    FROM "Category"
    ORDER BY "restaurantId", name, "order" ASC, "createdAt" ASC
  ) k ON c2."restaurantId" = k."restaurantId" AND c2.name = k.name AND c2.id <> k.keeper_id
);

CREATE UNIQUE INDEX "Category_restaurantId_name_key" ON "Category"("restaurantId", name);
