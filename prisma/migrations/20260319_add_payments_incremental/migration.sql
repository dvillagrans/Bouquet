-- Incremental, idempotent migration for existing databases
-- Adds payment domain without recreating existing core enums/tables.

-- 1) Create new enums only if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'PaymentStatus' AND n.nspname = 'public') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'PaymentMethod' AND n.nspname = 'public') THEN
    CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'OTHER');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'PaymentSplitMode' AND n.nspname = 'public') THEN
    CREATE TYPE "PaymentSplitMode" AS ENUM ('EQUAL', 'FULL');
  END IF;
END
$$;

-- 2) Create payment tables (idempotent)
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "tableId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "orderId" TEXT,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "method" "PaymentMethod" NOT NULL DEFAULT 'CARD',
  "splitMode" "PaymentSplitMode" NOT NULL DEFAULT 'FULL',
  "splitCount" INTEGER NOT NULL DEFAULT 1,
  "paxPaid" INTEGER NOT NULL DEFAULT 1,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DOUBLE PRECISION NOT NULL,
  "tipRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tipAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "amountPaid" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PaymentAllocation" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "sessionId" TEXT,
  "guestName" TEXT,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- 3) Add FKs only if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_restaurantId_fkey') THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_restaurantId_fkey"
      FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_tableId_fkey') THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_tableId_fkey"
      FOREIGN KEY ("tableId") REFERENCES "Table"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_sessionId_fkey') THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_sessionId_fkey"
      FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_orderId_fkey') THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentAllocation_paymentId_fkey') THEN
    ALTER TABLE "PaymentAllocation"
      ADD CONSTRAINT "PaymentAllocation_paymentId_fkey"
      FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentAllocation_sessionId_fkey') THEN
    ALTER TABLE "PaymentAllocation"
      ADD CONSTRAINT "PaymentAllocation_sessionId_fkey"
      FOREIGN KEY ("sessionId") REFERENCES "Session"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- 4) Add indexes if missing (existing + new, aligned with Prisma schema)
CREATE INDEX IF NOT EXISTS "Table_restaurantId_idx" ON "Table"("restaurantId");
CREATE INDEX IF NOT EXISTS "Category_restaurantId_idx" ON "Category"("restaurantId");
CREATE INDEX IF NOT EXISTS "MenuItem_restaurantId_idx" ON "MenuItem"("restaurantId");
CREATE INDEX IF NOT EXISTS "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");
CREATE INDEX IF NOT EXISTS "Staff_restaurantId_idx" ON "Staff"("restaurantId");
CREATE INDEX IF NOT EXISTS "Session_tableId_idx" ON "Session"("tableId");
CREATE INDEX IF NOT EXISTS "Session_isActive_createdAt_idx" ON "Session"("isActive", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_restaurantId_idx" ON "Order"("restaurantId");
CREATE INDEX IF NOT EXISTS "Order_tableId_idx" ON "Order"("tableId");
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_sessionId_idx" ON "OrderItem"("sessionId");
CREATE INDEX IF NOT EXISTS "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

CREATE INDEX IF NOT EXISTS "Payment_restaurantId_createdAt_idx" ON "Payment"("restaurantId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_tableId_createdAt_idx" ON "Payment"("tableId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_sessionId_createdAt_idx" ON "Payment"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "PaymentAllocation_paymentId_idx" ON "PaymentAllocation"("paymentId");
CREATE INDEX IF NOT EXISTS "PaymentAllocation_sessionId_idx" ON "PaymentAllocation"("sessionId");
