-- MVP hardening: integrity, uniqueness, indexes, timestamps, and RLS by restaurant.

-- 1) Data integrity checks on Payment
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_splitCount_check') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_splitCount_check" CHECK ("splitCount" >= 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_paxPaid_check') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paxPaid_check" CHECK ("paxPaid" >= 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_subtotal_check') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subtotal_check" CHECK ("subtotal" >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_tipAmount_check') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tipAmount_check" CHECK ("tipAmount" >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_totalAmount_check') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_totalAmount_check" CHECK ("totalAmount" >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_amountPaid_check') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amountPaid_check" CHECK ("amountPaid" >= 0);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_total_ge_subtotal_check') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_total_ge_subtotal_check" CHECK ("totalAmount" >= "subtotal");
  END IF;
END
$$;

-- 2) Operational uniqueness: one table number per restaurant
CREATE UNIQUE INDEX IF NOT EXISTS "Table_restaurantId_number_key" ON "Table"("restaurantId", "number");

-- 3) Real-world indexes
CREATE INDEX IF NOT EXISTS "Order_restaurantId_createdAt_idx" ON "Order"("restaurantId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_restaurantId_createdAt_idx" ON "Payment"("restaurantId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_sessionId_createdAt_idx" ON "Payment"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- 4) Minimal audit consistency: updatedAt on operational tables
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "PaymentAllocation" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 5) RLS by restaurant (tenant isolation)
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Restaurant' AND policyname = 'restaurant_tenant_isolation') THEN
    CREATE POLICY "restaurant_tenant_isolation" ON "Restaurant"
      FOR ALL TO authenticated
      USING ("id" = app.current_restaurant_id())
      WITH CHECK ("id" = app.current_restaurant_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Table' AND policyname = 'table_tenant_isolation') THEN
    CREATE POLICY "table_tenant_isolation" ON "Table"
      FOR ALL TO authenticated
      USING ("restaurantId" = app.current_restaurant_id())
      WITH CHECK ("restaurantId" = app.current_restaurant_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Category' AND policyname = 'category_tenant_isolation') THEN
    CREATE POLICY "category_tenant_isolation" ON "Category"
      FOR ALL TO authenticated
      USING ("restaurantId" = app.current_restaurant_id())
      WITH CHECK ("restaurantId" = app.current_restaurant_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'MenuItem' AND policyname = 'menuitem_tenant_isolation') THEN
    CREATE POLICY "menuitem_tenant_isolation" ON "MenuItem"
      FOR ALL TO authenticated
      USING ("restaurantId" = app.current_restaurant_id())
      WITH CHECK ("restaurantId" = app.current_restaurant_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Staff' AND policyname = 'staff_tenant_isolation') THEN
    CREATE POLICY "staff_tenant_isolation" ON "Staff"
      FOR ALL TO authenticated
      USING ("restaurantId" = app.current_restaurant_id())
      WITH CHECK ("restaurantId" = app.current_restaurant_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Order' AND policyname = 'order_tenant_isolation') THEN
    CREATE POLICY "order_tenant_isolation" ON "Order"
      FOR ALL TO authenticated
      USING ("restaurantId" = app.current_restaurant_id())
      WITH CHECK ("restaurantId" = app.current_restaurant_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Payment' AND policyname = 'payment_tenant_isolation') THEN
    CREATE POLICY "payment_tenant_isolation" ON "Payment"
      FOR ALL TO authenticated
      USING ("restaurantId" = app.current_restaurant_id())
      WITH CHECK ("restaurantId" = app.current_restaurant_id());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Session' AND policyname = 'session_tenant_isolation') THEN
    CREATE POLICY "session_tenant_isolation" ON "Session"
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM "Table" t
          WHERE t."id" = "Session"."tableId"
            AND t."restaurantId" = app.current_restaurant_id()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM "Table" t
          WHERE t."id" = "Session"."tableId"
            AND t."restaurantId" = app.current_restaurant_id()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'OrderItem' AND policyname = 'orderitem_tenant_isolation') THEN
    CREATE POLICY "orderitem_tenant_isolation" ON "OrderItem"
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM "Order" o
          WHERE o."id" = "OrderItem"."orderId"
            AND o."restaurantId" = app.current_restaurant_id()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM "Order" o
          WHERE o."id" = "OrderItem"."orderId"
            AND o."restaurantId" = app.current_restaurant_id()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'PaymentAllocation' AND policyname = 'paymentallocation_tenant_isolation') THEN
    CREATE POLICY "paymentallocation_tenant_isolation" ON "PaymentAllocation"
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM "Payment" p
          WHERE p."id" = "PaymentAllocation"."paymentId"
            AND p."restaurantId" = app.current_restaurant_id()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM "Payment" p
          WHERE p."id" = "PaymentAllocation"."paymentId"
            AND p."restaurantId" = app.current_restaurant_id()
        )
      );
  END IF;
END
$$;
