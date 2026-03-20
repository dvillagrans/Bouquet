-- Add variants JSON column to MenuItem (stores size options with prices)
ALTER TABLE "MenuItem" ADD COLUMN "variants" JSONB NOT NULL DEFAULT '[]';

-- Add variantName to OrderItem to record which size was ordered
ALTER TABLE "OrderItem" ADD COLUMN "variantName" TEXT;
