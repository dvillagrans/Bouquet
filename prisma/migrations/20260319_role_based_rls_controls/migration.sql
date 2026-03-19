-- Role-based RLS controls (MVP)
-- Roles expected in context: OWNER, ADMIN, MESERO, COCINA, BARRA
-- Values can come from app.current_role or JWT claims (app_role / role).

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_restaurant_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.current_restaurant_id', true), ''),
    CASE
      WHEN current_setting('request.jwt.claims', true) IS NULL OR current_setting('request.jwt.claims', true) = '' THEN NULL
      ELSE (current_setting('request.jwt.claims', true)::jsonb ->> 'restaurant_id')
    END
  );
$$;

CREATE OR REPLACE FUNCTION app.current_app_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT UPPER(COALESCE(
    NULLIF(current_setting('app.current_role', true), ''),
    CASE
      WHEN current_setting('request.jwt.claims', true) IS NULL OR current_setting('request.jwt.claims', true) = '' THEN NULL
      ELSE COALESCE(
        current_setting('request.jwt.claims', true)::jsonb ->> 'app_role',
        current_setting('request.jwt.claims', true)::jsonb ->> 'role'
      )
    END,
    ''
  ));
$$;

CREATE OR REPLACE FUNCTION app.is_manager()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT app.current_app_role() IN ('OWNER', 'ADMIN');
$$;

CREATE OR REPLACE FUNCTION app.is_waiter()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT app.current_app_role() = 'MESERO';
$$;

CREATE OR REPLACE FUNCTION app.is_station_role(station TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT (
    (app.current_app_role() = 'COCINA' AND UPPER(station) = 'COCINA')
    OR
    (app.current_app_role() = 'BARRA' AND UPPER(station) = 'BARRA')
  );
$$;

ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Table" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentAllocation" ENABLE ROW LEVEL SECURITY;

-- Drop previous coarse-grained policies if present
DROP POLICY IF EXISTS "restaurant_tenant_isolation" ON "Restaurant";
DROP POLICY IF EXISTS "table_tenant_isolation" ON "Table";
DROP POLICY IF EXISTS "category_tenant_isolation" ON "Category";
DROP POLICY IF EXISTS "menuitem_tenant_isolation" ON "MenuItem";
DROP POLICY IF EXISTS "staff_tenant_isolation" ON "Staff";
DROP POLICY IF EXISTS "session_tenant_isolation" ON "Session";
DROP POLICY IF EXISTS "order_tenant_isolation" ON "Order";
DROP POLICY IF EXISTS "orderitem_tenant_isolation" ON "OrderItem";
DROP POLICY IF EXISTS "payment_tenant_isolation" ON "Payment";
DROP POLICY IF EXISTS "paymentallocation_tenant_isolation" ON "PaymentAllocation";

-- Drop/replace role-based policies to keep migration idempotent
DROP POLICY IF EXISTS "restaurant_read_scope" ON "Restaurant";
DROP POLICY IF EXISTS "restaurant_manage_scope" ON "Restaurant";

DROP POLICY IF EXISTS "table_read_scope" ON "Table";
DROP POLICY IF EXISTS "table_mutation_scope" ON "Table";

DROP POLICY IF EXISTS "category_read_scope" ON "Category";
DROP POLICY IF EXISTS "category_manage_scope" ON "Category";

DROP POLICY IF EXISTS "menuitem_read_scope" ON "MenuItem";
DROP POLICY IF EXISTS "menuitem_manage_scope" ON "MenuItem";

DROP POLICY IF EXISTS "staff_manage_scope" ON "Staff";

DROP POLICY IF EXISTS "session_read_scope" ON "Session";
DROP POLICY IF EXISTS "session_mutation_scope" ON "Session";

DROP POLICY IF EXISTS "order_select_scope" ON "Order";
DROP POLICY IF EXISTS "order_insert_scope" ON "Order";
DROP POLICY IF EXISTS "order_update_scope" ON "Order";
DROP POLICY IF EXISTS "order_delete_scope" ON "Order";

DROP POLICY IF EXISTS "orderitem_select_scope" ON "OrderItem";
DROP POLICY IF EXISTS "orderitem_insert_scope" ON "OrderItem";
DROP POLICY IF EXISTS "orderitem_update_scope" ON "OrderItem";
DROP POLICY IF EXISTS "orderitem_delete_scope" ON "OrderItem";

DROP POLICY IF EXISTS "payment_read_scope" ON "Payment";
DROP POLICY IF EXISTS "payment_mutation_scope" ON "Payment";

DROP POLICY IF EXISTS "paymentallocation_read_scope" ON "PaymentAllocation";
DROP POLICY IF EXISTS "paymentallocation_mutation_scope" ON "PaymentAllocation";

-- Restaurant
CREATE POLICY "restaurant_read_scope" ON "Restaurant"
  FOR SELECT TO authenticated
  USING ("id" = app.current_restaurant_id());

CREATE POLICY "restaurant_manage_scope" ON "Restaurant"
  FOR UPDATE TO authenticated
  USING (app.is_manager() AND "id" = app.current_restaurant_id())
  WITH CHECK (app.is_manager() AND "id" = app.current_restaurant_id());

-- Table
CREATE POLICY "table_read_scope" ON "Table"
  FOR SELECT TO authenticated
  USING ("restaurantId" = app.current_restaurant_id());

CREATE POLICY "table_mutation_scope" ON "Table"
  FOR ALL TO authenticated
  USING ((app.is_manager() OR app.is_waiter()) AND "restaurantId" = app.current_restaurant_id())
  WITH CHECK ((app.is_manager() OR app.is_waiter()) AND "restaurantId" = app.current_restaurant_id());

-- Category
CREATE POLICY "category_read_scope" ON "Category"
  FOR SELECT TO authenticated
  USING ("restaurantId" = app.current_restaurant_id());

CREATE POLICY "category_manage_scope" ON "Category"
  FOR ALL TO authenticated
  USING (app.is_manager() AND "restaurantId" = app.current_restaurant_id())
  WITH CHECK (app.is_manager() AND "restaurantId" = app.current_restaurant_id());

-- MenuItem
CREATE POLICY "menuitem_read_scope" ON "MenuItem"
  FOR SELECT TO authenticated
  USING ("restaurantId" = app.current_restaurant_id());

CREATE POLICY "menuitem_manage_scope" ON "MenuItem"
  FOR ALL TO authenticated
  USING (app.is_manager() AND "restaurantId" = app.current_restaurant_id())
  WITH CHECK (app.is_manager() AND "restaurantId" = app.current_restaurant_id());

-- Staff (solo managers)
CREATE POLICY "staff_manage_scope" ON "Staff"
  FOR ALL TO authenticated
  USING (app.is_manager() AND "restaurantId" = app.current_restaurant_id())
  WITH CHECK (app.is_manager() AND "restaurantId" = app.current_restaurant_id());

-- Session (manager + mesero)
CREATE POLICY "session_read_scope" ON "Session"
  FOR SELECT TO authenticated
  USING (
    (app.is_manager() OR app.is_waiter())
    AND EXISTS (
      SELECT 1
      FROM "Table" t
      WHERE t."id" = "Session"."tableId"
        AND t."restaurantId" = app.current_restaurant_id()
    )
  );

CREATE POLICY "session_mutation_scope" ON "Session"
  FOR ALL TO authenticated
  USING (
    (app.is_manager() OR app.is_waiter())
    AND EXISTS (
      SELECT 1
      FROM "Table" t
      WHERE t."id" = "Session"."tableId"
        AND t."restaurantId" = app.current_restaurant_id()
    )
  )
  WITH CHECK (
    (app.is_manager() OR app.is_waiter())
    AND EXISTS (
      SELECT 1
      FROM "Table" t
      WHERE t."id" = "Session"."tableId"
        AND t."restaurantId" = app.current_restaurant_id()
    )
  );

-- Order
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

-- OrderItem
CREATE POLICY "orderitem_select_scope" ON "OrderItem"
  FOR SELECT TO authenticated
  USING (
    (
      EXISTS (
        SELECT 1
        FROM "Order" o
        WHERE o."id" = "OrderItem"."orderId"
          AND o."restaurantId" = app.current_restaurant_id()
      )
      AND (app.is_manager() OR app.is_waiter())
    )
    OR
    EXISTS (
      SELECT 1
      FROM "Order" o
      JOIN "MenuItem" mi ON mi."id" = "OrderItem"."menuItemId"
      WHERE o."id" = "OrderItem"."orderId"
        AND o."restaurantId" = app.current_restaurant_id()
        AND app.is_station_role(mi."station"::text)
    )
  );

CREATE POLICY "orderitem_insert_scope" ON "OrderItem"
  FOR INSERT TO authenticated
  WITH CHECK (
    (app.is_manager() OR app.is_waiter())
    AND EXISTS (
      SELECT 1
      FROM "Order" o
      WHERE o."id" = "OrderItem"."orderId"
        AND o."restaurantId" = app.current_restaurant_id()
    )
  );

CREATE POLICY "orderitem_update_scope" ON "OrderItem"
  FOR UPDATE TO authenticated
  USING (
    (
      (app.is_manager() OR app.is_waiter())
      AND EXISTS (
        SELECT 1
        FROM "Order" o
        WHERE o."id" = "OrderItem"."orderId"
          AND o."restaurantId" = app.current_restaurant_id()
      )
    )
    OR
    EXISTS (
      SELECT 1
      FROM "Order" o
      JOIN "MenuItem" mi ON mi."id" = "OrderItem"."menuItemId"
      WHERE o."id" = "OrderItem"."orderId"
        AND o."restaurantId" = app.current_restaurant_id()
        AND app.is_station_role(mi."station"::text)
    )
  )
  WITH CHECK (
    (
      (app.is_manager() OR app.is_waiter())
      AND EXISTS (
        SELECT 1
        FROM "Order" o
        WHERE o."id" = "OrderItem"."orderId"
          AND o."restaurantId" = app.current_restaurant_id()
      )
    )
    OR
    EXISTS (
      SELECT 1
      FROM "Order" o
      JOIN "MenuItem" mi ON mi."id" = "OrderItem"."menuItemId"
      WHERE o."id" = "OrderItem"."orderId"
        AND o."restaurantId" = app.current_restaurant_id()
        AND app.is_station_role(mi."station"::text)
    )
  );

CREATE POLICY "orderitem_delete_scope" ON "OrderItem"
  FOR DELETE TO authenticated
  USING (
    app.is_manager()
    AND EXISTS (
      SELECT 1
      FROM "Order" o
      WHERE o."id" = "OrderItem"."orderId"
        AND o."restaurantId" = app.current_restaurant_id()
    )
  );

-- Payment (manager + mesero)
CREATE POLICY "payment_read_scope" ON "Payment"
  FOR SELECT TO authenticated
  USING ((app.is_manager() OR app.is_waiter()) AND "restaurantId" = app.current_restaurant_id());

CREATE POLICY "payment_mutation_scope" ON "Payment"
  FOR ALL TO authenticated
  USING ((app.is_manager() OR app.is_waiter()) AND "restaurantId" = app.current_restaurant_id())
  WITH CHECK ((app.is_manager() OR app.is_waiter()) AND "restaurantId" = app.current_restaurant_id());

-- PaymentAllocation (manager + mesero via payment)
CREATE POLICY "paymentallocation_read_scope" ON "PaymentAllocation"
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "Payment" p
      WHERE p."id" = "PaymentAllocation"."paymentId"
        AND p."restaurantId" = app.current_restaurant_id()
        AND (app.is_manager() OR app.is_waiter())
    )
  );

CREATE POLICY "paymentallocation_mutation_scope" ON "PaymentAllocation"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "Payment" p
      WHERE p."id" = "PaymentAllocation"."paymentId"
        AND p."restaurantId" = app.current_restaurant_id()
        AND (app.is_manager() OR app.is_waiter())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "Payment" p
      WHERE p."id" = "PaymentAllocation"."paymentId"
        AND p."restaurantId" = app.current_restaurant_id()
        AND (app.is_manager() OR app.is_waiter())
    )
  );
