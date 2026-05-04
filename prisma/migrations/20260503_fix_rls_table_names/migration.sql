-- Phase 5: Fix RLS table names for data-governance-hardening
-- Defense-in-depth: permissive SELECT policies until connection-level role switching is implemented.
-- NOTE: These policies target the Supabase 'authenticated' role. Prisma currently connects via
-- the pool user, so RLS is defense-in-depth only. Tenant isolation is enforced primarily in
-- application code via withAuth(). These policies will be tightened when connection-level role
-- switching is implemented.

-- ==========================================
-- 1. Drop old policies on tables that MAY exist (wrapped for safety)
--    These tables may or may not exist depending on if old migrations ran.
-- ==========================================

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'Restaurant') THEN
    DROP POLICY IF EXISTS "restaurant_tenant_isolation" ON "Restaurant";
    DROP POLICY IF EXISTS "restaurant_read_scope" ON "Restaurant";
    DROP POLICY IF EXISTS "restaurant_manage_scope" ON "Restaurant";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'Table') THEN
    DROP POLICY IF EXISTS "table_tenant_isolation" ON "Table";
    DROP POLICY IF EXISTS "table_read_scope" ON "Table";
    DROP POLICY IF EXISTS "table_mutation_scope" ON "Table";
    DROP POLICY IF EXISTS "Staff can view their assigned tables" ON "Table";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'Category') THEN
    DROP POLICY IF EXISTS "category_tenant_isolation" ON "Category";
    DROP POLICY IF EXISTS "category_read_scope" ON "Category";
    DROP POLICY IF EXISTS "category_manage_scope" ON "Category";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'MenuItem') THEN
    DROP POLICY IF EXISTS "menuitem_tenant_isolation" ON "MenuItem";
    DROP POLICY IF EXISTS "menuitem_read_scope" ON "MenuItem";
    DROP POLICY IF EXISTS "menuitem_manage_scope" ON "MenuItem";
    DROP POLICY IF EXISTS "Staff can view their restaurant menu" ON "MenuItem";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'Staff') THEN
    DROP POLICY IF EXISTS "staff_tenant_isolation" ON "Staff";
    DROP POLICY IF EXISTS "staff_manage_scope" ON "Staff";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'Session') THEN
    DROP POLICY IF EXISTS "session_tenant_isolation" ON "Session";
    DROP POLICY IF EXISTS "session_read_scope" ON "Session";
    DROP POLICY IF EXISTS "session_mutation_scope" ON "Session";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'Order') THEN
    DROP POLICY IF EXISTS "order_tenant_isolation" ON "Order";
    DROP POLICY IF EXISTS "order_select_scope" ON "Order";
    DROP POLICY IF EXISTS "order_insert_scope" ON "Order";
    DROP POLICY IF EXISTS "order_update_scope" ON "Order";
    DROP POLICY IF EXISTS "order_delete_scope" ON "Order";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'OrderItem') THEN
    DROP POLICY IF EXISTS "orderitem_tenant_isolation" ON "OrderItem";
    DROP POLICY IF EXISTS "orderitem_select_scope" ON "OrderItem";
    DROP POLICY IF EXISTS "orderitem_insert_scope" ON "OrderItem";
    DROP POLICY IF EXISTS "orderitem_update_scope" ON "OrderItem";
    DROP POLICY IF EXISTS "orderitem_delete_scope" ON "OrderItem";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'Payment') THEN
    DROP POLICY IF EXISTS "payment_tenant_isolation" ON "Payment";
    DROP POLICY IF EXISTS "payment_read_scope" ON "Payment";
    DROP POLICY IF EXISTS "payment_mutation_scope" ON "Payment";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_class WHERE relname = 'PaymentAllocation') THEN
    DROP POLICY IF EXISTS "paymentallocation_tenant_isolation" ON "PaymentAllocation";
    DROP POLICY IF EXISTS "paymentallocation_read_scope" ON "PaymentAllocation";
    DROP POLICY IF EXISTS "paymentallocation_mutation_scope" ON "PaymentAllocation";
  END IF;
END $$;

-- ==========================================
-- 2. Disable RLS on old/deprecated table names (IF EXISTS is safe)
-- ==========================================
ALTER TABLE IF EXISTS "Table" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "MenuItem" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Category" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Staff" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Payment" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PaymentAllocation" DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. Enable RLS on correct tables (current schema names)
-- ==========================================
ALTER TABLE IF EXISTS "DiningTable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "DiningSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "RestaurantOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "RestaurantMenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "RestaurantCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Settlement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SettlementAllocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Chain" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Zone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AppUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "UserRole" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AuditLog" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. Drop any existing policies on correct tables (idempotent re-runs)
-- ==========================================
DROP POLICY IF EXISTS "Users can view tables in their restaurant" ON "DiningTable";
DROP POLICY IF EXISTS "Users can view dining sessions in their restaurant" ON "DiningSession";
DROP POLICY IF EXISTS "Users can view orders in their restaurant" ON "RestaurantOrder";
DROP POLICY IF EXISTS "Users can view order items in their restaurant" ON "OrderItem";
DROP POLICY IF EXISTS "Users can view menu items in their restaurant" ON "RestaurantMenuItem";
DROP POLICY IF EXISTS "Users can view categories in their restaurant" ON "RestaurantCategory";
DROP POLICY IF EXISTS "Users can view settlements in their restaurant" ON "Settlement";
DROP POLICY IF EXISTS "Users can view settlement allocations in their restaurant" ON "SettlementAllocation";
DROP POLICY IF EXISTS "Users can view chains" ON "Chain";
DROP POLICY IF EXISTS "Users can view zones" ON "Zone";
DROP POLICY IF EXISTS "Users can view restaurants" ON "Restaurant";
DROP POLICY IF EXISTS "Users can view app users" ON "AppUser";
DROP POLICY IF EXISTS "Users can view user roles" ON "UserRole";
DROP POLICY IF EXISTS "Users can view audit logs" ON "AuditLog";

-- ==========================================
-- 5. Create fresh permissive SELECT policies
--    These will be tightened when authenticated role switching is implemented.
-- ==========================================
CREATE POLICY "Users can view tables in their restaurant" ON "DiningTable"
  FOR SELECT USING (true);

CREATE POLICY "Users can view dining sessions in their restaurant" ON "DiningSession"
  FOR SELECT USING (true);

CREATE POLICY "Users can view orders in their restaurant" ON "RestaurantOrder"
  FOR SELECT USING (true);

CREATE POLICY "Users can view order items in their restaurant" ON "OrderItem"
  FOR SELECT USING (true);

CREATE POLICY "Users can view menu items in their restaurant" ON "RestaurantMenuItem"
  FOR SELECT USING (true);

CREATE POLICY "Users can view categories in their restaurant" ON "RestaurantCategory"
  FOR SELECT USING (true);

CREATE POLICY "Users can view settlements in their restaurant" ON "Settlement"
  FOR SELECT USING (true);

CREATE POLICY "Users can view settlement allocations in their restaurant" ON "SettlementAllocation"
  FOR SELECT USING (true);

CREATE POLICY "Users can view chains" ON "Chain"
  FOR SELECT USING (true);

CREATE POLICY "Users can view zones" ON "Zone"
  FOR SELECT USING (true);

CREATE POLICY "Users can view restaurants" ON "Restaurant"
  FOR SELECT USING (true);

CREATE POLICY "Users can view app users" ON "AppUser"
  FOR SELECT USING (true);

CREATE POLICY "Users can view user roles" ON "UserRole"
  FOR SELECT USING (true);

CREATE POLICY "Users can view audit logs" ON "AuditLog"
  FOR SELECT USING (true);
