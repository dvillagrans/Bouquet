-- Fixes for role-based RLS:
-- 1) grant access to app schema/functions for authenticated users
-- 2) remove recursive dependency between Order and OrderItem policies

GRANT USAGE ON SCHEMA app TO authenticated;
GRANT USAGE ON SCHEMA app TO anon;

GRANT EXECUTE ON FUNCTION app.current_restaurant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION app.current_restaurant_id() TO anon;
GRANT EXECUTE ON FUNCTION app.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION app.current_app_role() TO anon;
GRANT EXECUTE ON FUNCTION app.is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_manager() TO anon;
GRANT EXECUTE ON FUNCTION app.is_waiter() TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_waiter() TO anon;
GRANT EXECUTE ON FUNCTION app.is_station_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_station_role(TEXT) TO anon;

-- Replace Order policies (keep role fragmentation, avoid recursion)
DROP POLICY IF EXISTS "order_select_scope" ON "Order";
DROP POLICY IF EXISTS "order_insert_scope" ON "Order";
DROP POLICY IF EXISTS "order_update_scope" ON "Order";
DROP POLICY IF EXISTS "order_delete_scope" ON "Order";

CREATE POLICY "order_select_scope" ON "Order"
  FOR SELECT TO authenticated
  USING (
    (
      (app.is_manager() OR app.is_waiter())
      AND "restaurantId" = app.current_restaurant_id()
    )
    OR
    (
      "restaurantId" = app.current_restaurant_id()
      AND EXISTS (
        SELECT 1
        FROM "OrderItem" oi
        JOIN "MenuItem" mi ON mi."id" = oi."menuItemId"
        WHERE oi."orderId" = "Order"."id"
          AND app.is_station_role(mi."station"::text)
      )
    )
  );

CREATE POLICY "order_insert_scope" ON "Order"
  FOR INSERT TO authenticated
  WITH CHECK ((app.is_manager() OR app.is_waiter()) AND "restaurantId" = app.current_restaurant_id());

CREATE POLICY "order_update_scope" ON "Order"
  FOR UPDATE TO authenticated
  USING (
    (
      (app.is_manager() OR app.is_waiter())
      AND "restaurantId" = app.current_restaurant_id()
    )
    OR
    (
      "restaurantId" = app.current_restaurant_id()
      AND EXISTS (
        SELECT 1
        FROM "OrderItem" oi
        JOIN "MenuItem" mi ON mi."id" = oi."menuItemId"
        WHERE oi."orderId" = "Order"."id"
          AND app.is_station_role(mi."station"::text)
      )
    )
  )
  WITH CHECK (
    (
      (app.is_manager() OR app.is_waiter())
      AND "restaurantId" = app.current_restaurant_id()
    )
    OR
    (
      "restaurantId" = app.current_restaurant_id()
      AND EXISTS (
        SELECT 1
        FROM "OrderItem" oi
        JOIN "MenuItem" mi ON mi."id" = oi."menuItemId"
        WHERE oi."orderId" = "Order"."id"
          AND app.is_station_role(mi."station"::text)
      )
    )
  );

CREATE POLICY "order_delete_scope" ON "Order"
  FOR DELETE TO authenticated
  USING (app.is_manager() AND "restaurantId" = app.current_restaurant_id());

-- Replace OrderItem policies using Session->Table for tenant scope (no Order reference)
DROP POLICY IF EXISTS "orderitem_select_scope" ON "OrderItem";
DROP POLICY IF EXISTS "orderitem_insert_scope" ON "OrderItem";
DROP POLICY IF EXISTS "orderitem_update_scope" ON "OrderItem";
DROP POLICY IF EXISTS "orderitem_delete_scope" ON "OrderItem";

CREATE POLICY "orderitem_select_scope" ON "OrderItem"
  FOR SELECT TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1
        FROM "Session" s
        JOIN "Table" t ON t."id" = s."tableId"
        WHERE s."id" = "OrderItem"."sessionId"
          AND t."restaurantId" = app.current_restaurant_id()
      )
      AND (app.is_manager() OR app.is_waiter())
    )
    OR
    (
      EXISTS (
        SELECT 1
        FROM "Session" s
        JOIN "Table" t ON t."id" = s."tableId"
        WHERE s."id" = "OrderItem"."sessionId"
          AND t."restaurantId" = app.current_restaurant_id()
      )
      AND EXISTS (
        SELECT 1
        FROM "MenuItem" mi
        WHERE mi."id" = "OrderItem"."menuItemId"
          AND app.is_station_role(mi."station"::text)
      )
    )
  );

CREATE POLICY "orderitem_insert_scope" ON "OrderItem"
  FOR INSERT TO authenticated
  WITH CHECK (
    (app.is_manager() OR app.is_waiter())
    AND EXISTS (
      SELECT 1
      FROM "Session" s
      JOIN "Table" t ON t."id" = s."tableId"
      WHERE s."id" = "OrderItem"."sessionId"
        AND t."restaurantId" = app.current_restaurant_id()
    )
  );

CREATE POLICY "orderitem_update_scope" ON "OrderItem"
  FOR UPDATE TO authenticated
  USING (
    (
      (app.is_manager() OR app.is_waiter())
      AND EXISTS (
        SELECT 1
        FROM "Session" s
        JOIN "Table" t ON t."id" = s."tableId"
        WHERE s."id" = "OrderItem"."sessionId"
          AND t."restaurantId" = app.current_restaurant_id()
      )
    )
    OR
    (
      EXISTS (
        SELECT 1
        FROM "Session" s
        JOIN "Table" t ON t."id" = s."tableId"
        WHERE s."id" = "OrderItem"."sessionId"
          AND t."restaurantId" = app.current_restaurant_id()
      )
      AND EXISTS (
        SELECT 1
        FROM "MenuItem" mi
        WHERE mi."id" = "OrderItem"."menuItemId"
          AND app.is_station_role(mi."station"::text)
      )
    )
  )
  WITH CHECK (
    (
      (app.is_manager() OR app.is_waiter())
      AND EXISTS (
        SELECT 1
        FROM "Session" s
        JOIN "Table" t ON t."id" = s."tableId"
        WHERE s."id" = "OrderItem"."sessionId"
          AND t."restaurantId" = app.current_restaurant_id()
      )
    )
    OR
    (
      EXISTS (
        SELECT 1
        FROM "Session" s
        JOIN "Table" t ON t."id" = s."tableId"
        WHERE s."id" = "OrderItem"."sessionId"
          AND t."restaurantId" = app.current_restaurant_id()
      )
      AND EXISTS (
        SELECT 1
        FROM "MenuItem" mi
        WHERE mi."id" = "OrderItem"."menuItemId"
          AND app.is_station_role(mi."station"::text)
      )
    )
  );

CREATE POLICY "orderitem_delete_scope" ON "OrderItem"
  FOR DELETE TO authenticated
  USING (
    app.is_manager()
    AND EXISTS (
      SELECT 1
      FROM "Session" s
      JOIN "Table" t ON t."id" = s."tableId"
      WHERE s."id" = "OrderItem"."sessionId"
        AND t."restaurantId" = app.current_restaurant_id()
    )
  );
