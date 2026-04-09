-- Add guestName to Order so we can track which guest submitted each order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestName" TEXT;
