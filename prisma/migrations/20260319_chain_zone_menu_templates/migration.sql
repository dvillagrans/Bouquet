-- Migration: Chain, Zone, ChainStaff, MenuTemplate, Overrides
-- Jerarquía: Chain → Zone → Restaurant
-- Menú heredado: Template (cadena) → ZoneMenuOverride → RestaurantMenuOverride

-- ------------------------------------
-- 1. Chain
-- ------------------------------------
CREATE TABLE "Chain" (
  "id"            TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "logoUrl"       TEXT,
  "currency"      TEXT NOT NULL DEFAULT 'MXN',
  "taxRate"       DOUBLE PRECISION NOT NULL DEFAULT 16.0,
  "suggestedTips" TEXT NOT NULL DEFAULT '10,15,20',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- ------------------------------------
-- 2. Zone
-- ------------------------------------
CREATE TABLE "Zone" (
  "id"        TEXT NOT NULL,
  "chainId"   TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Zone_chainId_idx" ON "Zone"("chainId");

ALTER TABLE "Zone"
  ADD CONSTRAINT "Zone_chainId_fkey"
  FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ------------------------------------
-- 3. ChainStaff
-- ------------------------------------
CREATE TYPE "ChainRole" AS ENUM ('CHAIN_ADMIN', 'ZONE_MANAGER');

CREATE TABLE "ChainStaff" (
  "id"        TEXT NOT NULL,
  "chainId"   TEXT NOT NULL,
  "zoneId"    TEXT,
  "name"      TEXT NOT NULL,
  "role"      "ChainRole" NOT NULL,
  "pin"       TEXT NOT NULL,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ChainStaff_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChainStaff_chainId_idx" ON "ChainStaff"("chainId");
CREATE INDEX "ChainStaff_zoneId_idx"  ON "ChainStaff"("zoneId");

ALTER TABLE "ChainStaff"
  ADD CONSTRAINT "ChainStaff_chainId_fkey"
  FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ------------------------------------
-- 4. Vincular Restaurant con Zone
-- ------------------------------------
ALTER TABLE "Restaurant"
  ADD COLUMN "zoneId"         TEXT,
  ADD COLUMN "address"        TEXT,
  ADD COLUMN "menuTemplateId" TEXT;

CREATE INDEX "Restaurant_zoneId_idx" ON "Restaurant"("zoneId");

ALTER TABLE "Restaurant"
  ADD CONSTRAINT "Restaurant_zoneId_fkey"
  FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------
-- 5. MenuTemplate
-- ------------------------------------
CREATE TABLE "MenuTemplate" (
  "id"        TEXT NOT NULL,
  "chainId"   TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MenuTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MenuTemplate_chainId_idx" ON "MenuTemplate"("chainId");

ALTER TABLE "MenuTemplate"
  ADD CONSTRAINT "MenuTemplate_chainId_fkey"
  FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FK Restaurant → MenuTemplate (después de crear la tabla)
ALTER TABLE "Restaurant"
  ADD CONSTRAINT "Restaurant_menuTemplateId_fkey"
  FOREIGN KEY ("menuTemplateId") REFERENCES "MenuTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------
-- 6. TemplateCategory
-- ------------------------------------
CREATE TABLE "TemplateCategory" (
  "id"         TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "order"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TemplateCategory_templateId_idx" ON "TemplateCategory"("templateId");

ALTER TABLE "TemplateCategory"
  ADD CONSTRAINT "TemplateCategory_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "MenuTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ------------------------------------
-- 7. TemplateItem
-- ------------------------------------
CREATE TABLE "TemplateItem" (
  "id"          TEXT NOT NULL,
  "categoryId"  TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "basePrice"   DOUBLE PRECISION NOT NULL,
  "imageUrl"    TEXT,
  "isPopular"   BOOLEAN NOT NULL DEFAULT false,
  "station"     "Station" NOT NULL DEFAULT 'COCINA',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TemplateItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TemplateItem_categoryId_idx" ON "TemplateItem"("categoryId");

ALTER TABLE "TemplateItem"
  ADD CONSTRAINT "TemplateItem_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "TemplateCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ------------------------------------
-- 8. ZoneMenuOverride
-- ------------------------------------
CREATE TABLE "ZoneMenuOverride" (
  "id"             TEXT NOT NULL,
  "zoneId"         TEXT NOT NULL,
  "templateId"     TEXT NOT NULL,
  "templateItemId" TEXT NOT NULL,
  "restaurantId"   TEXT NOT NULL,
  "customPrice"    DOUBLE PRECISION,
  "isSoldOut"      BOOLEAN NOT NULL DEFAULT false,
  "isHidden"       BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ZoneMenuOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ZoneMenuOverride_zoneId_templateItemId_key"
  ON "ZoneMenuOverride"("zoneId", "templateItemId");

CREATE INDEX "ZoneMenuOverride_zoneId_idx"       ON "ZoneMenuOverride"("zoneId");
CREATE INDEX "ZoneMenuOverride_restaurantId_idx" ON "ZoneMenuOverride"("restaurantId");

ALTER TABLE "ZoneMenuOverride"
  ADD CONSTRAINT "ZoneMenuOverride_zoneId_fkey"
    FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ZoneMenuOverride_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "MenuTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ZoneMenuOverride_templateItemId_fkey"
    FOREIGN KEY ("templateItemId") REFERENCES "TemplateItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "ZoneMenuOverride_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ------------------------------------
-- 9. RestaurantMenuOverride
-- ------------------------------------
CREATE TABLE "RestaurantMenuOverride" (
  "id"             TEXT NOT NULL,
  "restaurantId"   TEXT NOT NULL,
  "templateItemId" TEXT NOT NULL,
  "customPrice"    DOUBLE PRECISION,
  "isSoldOut"      BOOLEAN NOT NULL DEFAULT false,
  "isHidden"       BOOLEAN NOT NULL DEFAULT false,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RestaurantMenuOverride_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RestaurantMenuOverride_restaurantId_templateItemId_key"
  ON "RestaurantMenuOverride"("restaurantId", "templateItemId");

CREATE INDEX "RestaurantMenuOverride_restaurantId_idx" ON "RestaurantMenuOverride"("restaurantId");

ALTER TABLE "RestaurantMenuOverride"
  ADD CONSTRAINT "RestaurantMenuOverride_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "RestaurantMenuOverride_templateItemId_fkey"
    FOREIGN KEY ("templateItemId") REFERENCES "TemplateItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
