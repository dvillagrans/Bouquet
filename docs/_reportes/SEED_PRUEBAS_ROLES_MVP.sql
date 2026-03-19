-- SEED DE PRUEBAS PARA RLS POR ROLES (MVP)
-- Ejecutar con permisos de admin en SQL Editor.

DO $$
DECLARE
  v_restaurant_id text;
  v_table_id text;
  v_session_id text;
  v_order_id text;
  v_item_cocina text;
  v_item_barra text;
BEGIN
  SELECT "id" INTO v_restaurant_id
  FROM "Restaurant"
  ORDER BY "createdAt" ASC
  LIMIT 1;

  IF v_restaurant_id IS NULL THEN
    INSERT INTO "Restaurant" ("id", "name", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, 'Restaurante MVP', now(), now())
    RETURNING "id" INTO v_restaurant_id;
  END IF;

  -- Staff por rol
  INSERT INTO "Staff" ("id", "restaurantId", "name", "role", "pin", "isActive", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_restaurant_id, 'Owner Demo', 'ADMIN', '9001', true, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "Staff" s WHERE s."restaurantId" = v_restaurant_id AND s."name" = 'Owner Demo'
  );

  INSERT INTO "Staff" ("id", "restaurantId", "name", "role", "pin", "isActive", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_restaurant_id, 'Mesero Demo', 'MESERO', '9002', true, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "Staff" s WHERE s."restaurantId" = v_restaurant_id AND s."name" = 'Mesero Demo'
  );

  INSERT INTO "Staff" ("id", "restaurantId", "name", "role", "pin", "isActive", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_restaurant_id, 'Cocina Demo', 'COCINA', '9003', true, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "Staff" s WHERE s."restaurantId" = v_restaurant_id AND s."name" = 'Cocina Demo'
  );

  INSERT INTO "Staff" ("id", "restaurantId", "name", "role", "pin", "isActive", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_restaurant_id, 'Barra Demo', 'BARRA', '9004', true, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "Staff" s WHERE s."restaurantId" = v_restaurant_id AND s."name" = 'Barra Demo'
  );

  -- Tabla de prueba
  SELECT t."id" INTO v_table_id
  FROM "Table" t
  WHERE t."restaurantId" = v_restaurant_id
  ORDER BY t."number" ASC
  LIMIT 1;

  IF v_table_id IS NULL THEN
    INSERT INTO "Table" ("id", "restaurantId", "number", "capacity", "qrCode", "status", "posX", "posY", "shape", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text,
      v_restaurant_id,
      99,
      4,
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
      'OCUPADA',
      80,
      80,
      'rect',
      now(),
      now()
    )
    RETURNING "id" INTO v_table_id;
  END IF;

  -- Categoria de prueba
  INSERT INTO "Category" ("id", "restaurantId", "name", "order", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_restaurant_id, 'MVP Test', 999, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "Category" c WHERE c."restaurantId" = v_restaurant_id AND c."name" = 'MVP Test'
  );

  -- Menu item cocina y barra
  SELECT m."id" INTO v_item_cocina
  FROM "MenuItem" m
  WHERE m."restaurantId" = v_restaurant_id AND m."name" = 'MVP Platillo Cocina'
  LIMIT 1;

  IF v_item_cocina IS NULL THEN
    INSERT INTO "MenuItem" (
      "id", "restaurantId", "categoryId", "name", "description", "price", "station", "createdAt", "updatedAt"
    )
    SELECT gen_random_uuid()::text, v_restaurant_id, c."id", 'MVP Platillo Cocina', 'Prueba RLS', 120, 'COCINA', now(), now()
    FROM "Category" c
    WHERE c."restaurantId" = v_restaurant_id AND c."name" = 'MVP Test'
    LIMIT 1
    RETURNING "id" INTO v_item_cocina;
  END IF;

  SELECT m."id" INTO v_item_barra
  FROM "MenuItem" m
  WHERE m."restaurantId" = v_restaurant_id AND m."name" = 'MVP Bebida Barra'
  LIMIT 1;

  IF v_item_barra IS NULL THEN
    INSERT INTO "MenuItem" (
      "id", "restaurantId", "categoryId", "name", "description", "price", "station", "createdAt", "updatedAt"
    )
    SELECT gen_random_uuid()::text, v_restaurant_id, c."id", 'MVP Bebida Barra', 'Prueba RLS', 85, 'BARRA', now(), now()
    FROM "Category" c
    WHERE c."restaurantId" = v_restaurant_id AND c."name" = 'MVP Test'
    LIMIT 1
    RETURNING "id" INTO v_item_barra;
  END IF;

  -- Session activa de prueba
  INSERT INTO "Session" ("id", "tableId", "guestName", "pax", "isActive", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_table_id, 'Cliente MVP', 2, true, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "Session" s WHERE s."tableId" = v_table_id AND s."isActive" = true
  );

  SELECT s."id" INTO v_session_id
  FROM "Session" s
  WHERE s."tableId" = v_table_id
  ORDER BY s."createdAt" DESC
  LIMIT 1;

  -- Orden de prueba
  INSERT INTO "Order" ("id", "restaurantId", "tableId", "status", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_restaurant_id, v_table_id, 'PENDING', now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "Order" o WHERE o."tableId" = v_table_id AND o."status" IN ('PENDING', 'PREPARING')
  );

  SELECT o."id" INTO v_order_id
  FROM "Order" o
  WHERE o."tableId" = v_table_id
  ORDER BY o."createdAt" DESC
  LIMIT 1;

  -- Items mixtos (cocina + barra)
  INSERT INTO "OrderItem" ("id", "orderId", "menuItemId", "sessionId", "quantity", "priceAtTime", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_order_id, v_item_cocina, v_session_id, 1, 120, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "OrderItem" oi WHERE oi."orderId" = v_order_id AND oi."menuItemId" = v_item_cocina
  );

  INSERT INTO "OrderItem" ("id", "orderId", "menuItemId", "sessionId", "quantity", "priceAtTime", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, v_order_id, v_item_barra, v_session_id, 1, 85, now(), now()
  WHERE NOT EXISTS (
    SELECT 1 FROM "OrderItem" oi WHERE oi."orderId" = v_order_id AND oi."menuItemId" = v_item_barra
  );

  RAISE NOTICE 'Seed listo. restaurant_id=% table_id=% session_id=% order_id=%', v_restaurant_id, v_table_id, v_session_id, v_order_id;
END
$$;
