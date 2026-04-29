-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "TaxGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rateBps" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipPreset" (
    "id" TEXT NOT NULL,
    "chainId" TEXT,
    "restaurantId" TEXT,
    "rateBps" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chain" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "defaultTaxGroupId" TEXT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "zoneId" TEXT,
    "currency" TEXT NOT NULL,
    "defaultTaxGroupId" TEXT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "welcomeMessage" TEXT,
    "address" TEXT,
    "allowMobileOrdering" BOOLEAN NOT NULL DEFAULT true,
    "allowWaiterJoinTables" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "chainId" TEXT,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "description" TEXT,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "secondLastName" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "contextType" TEXT NOT NULL,
    "chainId" TEXT,
    "zoneId" TEXT,
    "restaurantId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "chainId" TEXT,
    "restaurantId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuTemplate" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateCategory" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePriceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateItemVariant" (
    "id" TEXT NOT NULL,
    "templateItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateItemVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantCategory" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "templateCategoryId" TEXT,
    "taxGroupId" TEXT,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantMenuItem" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "stationId" TEXT,
    "taxGroupId" TEXT,
    "templateItemId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isSoldOut" BOOLEAN NOT NULL DEFAULT false,
    "trackStock" BOOLEAN NOT NULL DEFAULT false,
    "stockQuantity" INTEGER,
    "lowStockThreshold" INTEGER,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantMenuItemVariant" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "templateVariantId" TEXT,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantMenuItemVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModifierGroup" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "minSelect" INTEGER NOT NULL DEFAULT 0,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModifierGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModifierOption" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceAdjustmentCents" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModifierOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItemModifierGroup" (
    "menuItemId" TEXT NOT NULL,
    "modifierGroupId" TEXT NOT NULL,

    CONSTRAINT "MenuItemModifierGroup_pkey" PRIMARY KEY ("menuItemId","modifierGroupId")
);

-- CreateTable
CREATE TABLE "DiningTable" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "publicCode" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "qrVersion" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'LIBRE',
    "posX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "posY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shape" TEXT NOT NULL DEFAULT 'rect',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiningTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiningSession" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "openedByUserId" TEXT NOT NULL,
    "closedByUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE_ACTIVACION',
    "joinCode" TEXT NOT NULL,
    "accessCodeHash" TEXT NOT NULL,
    "pax" INTEGER NOT NULL DEFAULT 1,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "firstOrderAt" TIMESTAMP(3),
    "liquidationStartedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiningSessionTable" (
    "id" TEXT NOT NULL,
    "diningSessionId" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "DiningSessionTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "diningSessionId" TEXT NOT NULL,
    "name" TEXT,
    "seatNumber" INTEGER,
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantOrder" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "diningSessionId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'WAITER',
    "status" TEXT NOT NULL DEFAULT 'ABIERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "RestaurantOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "variantId" TEXT,
    "guestId" TEXT,
    "stationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "itemNameSnapshot" TEXT NOT NULL,
    "variantNameSnapshot" TEXT,
    "stationNameSnapshot" TEXT,
    "taxRateBpsSnapshot" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "taxAmountCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemModifier" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "modifierOptionId" TEXT NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitAdjustmentCents" INTEGER NOT NULL,
    "totalAdjustmentCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemStatusEvent" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "changedByUserId" TEXT,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "diningSessionId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABIERTA',
    "splitMode" TEXT NOT NULL DEFAULT 'TOTAL',
    "subtotalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "tipAmountCents" INTEGER NOT NULL DEFAULT 0,
    "taxAmountCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "amountSettledCents" INTEGER NOT NULL DEFAULT 0,
    "remainingCents" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementAllocation" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "contributionId" TEXT,
    "orderItemId" TEXT,
    "guestId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementContribution" (
    "id" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "guestId" TEXT,
    "registeredByUserId" TEXT,
    "method" TEXT NOT NULL DEFAULT 'CASH',
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "amountCents" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppliedAdjustment" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "settlementId" TEXT,
    "approvedByUserId" TEXT,
    "type" TEXT NOT NULL,
    "calculationMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "valueBps" INTEGER,
    "valueCents" INTEGER,
    "amountCents" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppliedAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsJobRun" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "triggeredByUserId" TEXT,
    "dataWindowStart" TIMESTAMP(3),
    "dataWindowEnd" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "AnalyticsJobRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticSalesDaily" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "jobRunId" TEXT NOT NULL,
    "businessDate" DATE NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "grossConsumptionCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL,
    "netConsumptionCents" INTEGER NOT NULL,
    "avgServiceTimeSeconds" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticSalesDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticItemVelocity" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "jobRunId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "businessDate" DATE NOT NULL,
    "itemNameSnapshot" TEXT NOT NULL,
    "quantitySold" INTEGER NOT NULL,
    "grossConsumptionCents" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticItemVelocity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticServiceTimes" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "jobRunId" TEXT NOT NULL,
    "stationId" TEXT,
    "businessDate" DATE NOT NULL,
    "avgPrepSeconds" INTEGER NOT NULL,
    "p50PrepSeconds" INTEGER NOT NULL,
    "p90PrepSeconds" INTEGER NOT NULL,
    "delayedItemsCount" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticServiceTimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticDemandEstimate" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "jobRunId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "estimateDate" DATE NOT NULL,
    "expectedQuantity" INTEGER NOT NULL,
    "confidenceBps" INTEGER,
    "method" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticDemandEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TipPreset_chainId_idx" ON "TipPreset"("chainId");

-- CreateIndex
CREATE INDEX "TipPreset_restaurantId_idx" ON "TipPreset"("restaurantId");

-- CreateIndex
CREATE INDEX "Chain_createdBy_idx" ON "Chain"("createdBy");

-- CreateIndex
CREATE INDEX "Chain_currency_idx" ON "Chain"("currency");

-- CreateIndex
CREATE INDEX "Chain_defaultTaxGroupId_idx" ON "Chain"("defaultTaxGroupId");

-- CreateIndex
CREATE INDEX "Zone_chainId_idx" ON "Zone"("chainId");

-- CreateIndex
CREATE INDEX "Restaurant_chainId_idx" ON "Restaurant"("chainId");

-- CreateIndex
CREATE INDEX "Restaurant_zoneId_idx" ON "Restaurant"("zoneId");

-- CreateIndex
CREATE INDEX "Restaurant_currency_idx" ON "Restaurant"("currency");

-- CreateIndex
CREATE INDEX "Restaurant_defaultTaxGroupId_idx" ON "Restaurant"("defaultTaxGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "Role_chainId_idx" ON "Role"("chainId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "AppUser_email_idx" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "UserRole_chainId_idx" ON "UserRole"("chainId");

-- CreateIndex
CREATE INDEX "UserRole_zoneId_idx" ON "UserRole"("zoneId");

-- CreateIndex
CREATE INDEX "UserRole_restaurantId_idx" ON "UserRole"("restaurantId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_chainId_idx" ON "AuditLog"("chainId");

-- CreateIndex
CREATE INDEX "AuditLog_restaurantId_idx" ON "AuditLog"("restaurantId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Station_restaurantId_idx" ON "Station"("restaurantId");

-- CreateIndex
CREATE INDEX "MenuTemplate_chainId_idx" ON "MenuTemplate"("chainId");

-- CreateIndex
CREATE INDEX "TemplateCategory_templateId_idx" ON "TemplateCategory"("templateId");

-- CreateIndex
CREATE INDEX "TemplateItem_categoryId_idx" ON "TemplateItem"("categoryId");

-- CreateIndex
CREATE INDEX "TemplateItemVariant_templateItemId_idx" ON "TemplateItemVariant"("templateItemId");

-- CreateIndex
CREATE INDEX "RestaurantCategory_restaurantId_idx" ON "RestaurantCategory"("restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantCategory_templateCategoryId_idx" ON "RestaurantCategory"("templateCategoryId");

-- CreateIndex
CREATE INDEX "RestaurantCategory_taxGroupId_idx" ON "RestaurantCategory"("taxGroupId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_restaurantId_idx" ON "RestaurantMenuItem"("restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_categoryId_idx" ON "RestaurantMenuItem"("categoryId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_stationId_idx" ON "RestaurantMenuItem"("stationId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_taxGroupId_idx" ON "RestaurantMenuItem"("taxGroupId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItem_templateItemId_idx" ON "RestaurantMenuItem"("templateItemId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItemVariant_menuItemId_idx" ON "RestaurantMenuItemVariant"("menuItemId");

-- CreateIndex
CREATE INDEX "RestaurantMenuItemVariant_templateVariantId_idx" ON "RestaurantMenuItemVariant"("templateVariantId");

-- CreateIndex
CREATE INDEX "ModifierGroup_restaurantId_idx" ON "ModifierGroup"("restaurantId");

-- CreateIndex
CREATE INDEX "ModifierOption_groupId_idx" ON "ModifierOption"("groupId");

-- CreateIndex
CREATE INDEX "MenuItemModifierGroup_modifierGroupId_idx" ON "MenuItemModifierGroup"("modifierGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "DiningTable_publicCode_key" ON "DiningTable"("publicCode");

-- CreateIndex
CREATE INDEX "DiningTable_restaurantId_idx" ON "DiningTable"("restaurantId");

-- CreateIndex
CREATE INDEX "DiningTable_publicCode_idx" ON "DiningTable"("publicCode");

-- CreateIndex
CREATE UNIQUE INDEX "DiningSession_joinCode_key" ON "DiningSession"("joinCode");

-- CreateIndex
CREATE INDEX "DiningSession_restaurantId_idx" ON "DiningSession"("restaurantId");

-- CreateIndex
CREATE INDEX "DiningSession_openedByUserId_idx" ON "DiningSession"("openedByUserId");

-- CreateIndex
CREATE INDEX "DiningSession_joinCode_idx" ON "DiningSession"("joinCode");

-- CreateIndex
CREATE INDEX "DiningSession_status_idx" ON "DiningSession"("status");

-- CreateIndex
CREATE INDEX "DiningSessionTable_diningSessionId_idx" ON "DiningSessionTable"("diningSessionId");

-- CreateIndex
CREATE INDEX "DiningSessionTable_tableId_idx" ON "DiningSessionTable"("tableId");

-- CreateIndex
CREATE INDEX "Guest_diningSessionId_idx" ON "Guest"("diningSessionId");

-- CreateIndex
CREATE INDEX "RestaurantOrder_restaurantId_idx" ON "RestaurantOrder"("restaurantId");

-- CreateIndex
CREATE INDEX "RestaurantOrder_diningSessionId_idx" ON "RestaurantOrder"("diningSessionId");

-- CreateIndex
CREATE INDEX "RestaurantOrder_createdByUserId_idx" ON "RestaurantOrder"("createdByUserId");

-- CreateIndex
CREATE INDEX "RestaurantOrder_status_idx" ON "RestaurantOrder"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE INDEX "OrderItem_guestId_idx" ON "OrderItem"("guestId");

-- CreateIndex
CREATE INDEX "OrderItem_status_updatedAt_idx" ON "OrderItem"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "OrderItemModifier_orderItemId_idx" ON "OrderItemModifier"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderItemModifier_modifierOptionId_idx" ON "OrderItemModifier"("modifierOptionId");

-- CreateIndex
CREATE INDEX "OrderItemStatusEvent_orderItemId_idx" ON "OrderItemStatusEvent"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderItemStatusEvent_changedByUserId_idx" ON "OrderItemStatusEvent"("changedByUserId");

-- CreateIndex
CREATE INDEX "Settlement_restaurantId_idx" ON "Settlement"("restaurantId");

-- CreateIndex
CREATE INDEX "Settlement_diningSessionId_idx" ON "Settlement"("diningSessionId");

-- CreateIndex
CREATE INDEX "Settlement_status_idx" ON "Settlement"("status");

-- CreateIndex
CREATE INDEX "SettlementAllocation_settlementId_idx" ON "SettlementAllocation"("settlementId");

-- CreateIndex
CREATE INDEX "SettlementAllocation_contributionId_idx" ON "SettlementAllocation"("contributionId");

-- CreateIndex
CREATE INDEX "SettlementAllocation_orderItemId_idx" ON "SettlementAllocation"("orderItemId");

-- CreateIndex
CREATE INDEX "SettlementAllocation_guestId_idx" ON "SettlementAllocation"("guestId");

-- CreateIndex
CREATE INDEX "SettlementContribution_settlementId_idx" ON "SettlementContribution"("settlementId");

-- CreateIndex
CREATE INDEX "SettlementContribution_guestId_idx" ON "SettlementContribution"("guestId");

-- CreateIndex
CREATE INDEX "SettlementContribution_registeredByUserId_idx" ON "SettlementContribution"("registeredByUserId");

-- CreateIndex
CREATE INDEX "AppliedAdjustment_restaurantId_idx" ON "AppliedAdjustment"("restaurantId");

-- CreateIndex
CREATE INDEX "AppliedAdjustment_orderItemId_idx" ON "AppliedAdjustment"("orderItemId");

-- CreateIndex
CREATE INDEX "AppliedAdjustment_settlementId_idx" ON "AppliedAdjustment"("settlementId");

-- CreateIndex
CREATE INDEX "AppliedAdjustment_approvedByUserId_idx" ON "AppliedAdjustment"("approvedByUserId");

-- CreateIndex
CREATE INDEX "AnalyticsJobRun_restaurantId_idx" ON "AnalyticsJobRun"("restaurantId");

-- CreateIndex
CREATE INDEX "AnalyticsJobRun_triggeredByUserId_idx" ON "AnalyticsJobRun"("triggeredByUserId");

-- CreateIndex
CREATE INDEX "AnalyticsJobRun_status_idx" ON "AnalyticsJobRun"("status");

-- CreateIndex
CREATE INDEX "AnalyticSalesDaily_restaurantId_idx" ON "AnalyticSalesDaily"("restaurantId");

-- CreateIndex
CREATE INDEX "AnalyticSalesDaily_jobRunId_idx" ON "AnalyticSalesDaily"("jobRunId");

-- CreateIndex
CREATE INDEX "AnalyticSalesDaily_businessDate_idx" ON "AnalyticSalesDaily"("businessDate");

-- CreateIndex
CREATE INDEX "AnalyticItemVelocity_restaurantId_idx" ON "AnalyticItemVelocity"("restaurantId");

-- CreateIndex
CREATE INDEX "AnalyticItemVelocity_jobRunId_idx" ON "AnalyticItemVelocity"("jobRunId");

-- CreateIndex
CREATE INDEX "AnalyticItemVelocity_menuItemId_idx" ON "AnalyticItemVelocity"("menuItemId");

-- CreateIndex
CREATE INDEX "AnalyticItemVelocity_businessDate_idx" ON "AnalyticItemVelocity"("businessDate");

-- CreateIndex
CREATE INDEX "AnalyticServiceTimes_restaurantId_idx" ON "AnalyticServiceTimes"("restaurantId");

-- CreateIndex
CREATE INDEX "AnalyticServiceTimes_jobRunId_idx" ON "AnalyticServiceTimes"("jobRunId");

-- CreateIndex
CREATE INDEX "AnalyticServiceTimes_stationId_idx" ON "AnalyticServiceTimes"("stationId");

-- CreateIndex
CREATE INDEX "AnalyticServiceTimes_businessDate_idx" ON "AnalyticServiceTimes"("businessDate");

-- CreateIndex
CREATE INDEX "AnalyticDemandEstimate_restaurantId_idx" ON "AnalyticDemandEstimate"("restaurantId");

-- CreateIndex
CREATE INDEX "AnalyticDemandEstimate_jobRunId_idx" ON "AnalyticDemandEstimate"("jobRunId");

-- CreateIndex
CREATE INDEX "AnalyticDemandEstimate_menuItemId_idx" ON "AnalyticDemandEstimate"("menuItemId");

-- CreateIndex
CREATE INDEX "AnalyticDemandEstimate_estimateDate_idx" ON "AnalyticDemandEstimate"("estimateDate");

-- AddForeignKey
ALTER TABLE "TipPreset" ADD CONSTRAINT "TipPreset_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipPreset" ADD CONSTRAINT "TipPreset_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chain" ADD CONSTRAINT "Chain_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chain" ADD CONSTRAINT "Chain_defaultTaxGroupId_fkey" FOREIGN KEY ("defaultTaxGroupId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chain" ADD CONSTRAINT "Chain_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_defaultTaxGroupId_fkey" FOREIGN KEY ("defaultTaxGroupId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuTemplate" ADD CONSTRAINT "MenuTemplate_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateCategory" ADD CONSTRAINT "TemplateCategory_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MenuTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateItem" ADD CONSTRAINT "TemplateItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TemplateCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateItemVariant" ADD CONSTRAINT "TemplateItemVariant_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES "TemplateItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantCategory" ADD CONSTRAINT "RestaurantCategory_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantCategory" ADD CONSTRAINT "RestaurantCategory_templateCategoryId_fkey" FOREIGN KEY ("templateCategoryId") REFERENCES "TemplateCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantCategory" ADD CONSTRAINT "RestaurantCategory_taxGroupId_fkey" FOREIGN KEY ("taxGroupId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RestaurantCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_taxGroupId_fkey" FOREIGN KEY ("taxGroupId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItem" ADD CONSTRAINT "RestaurantMenuItem_templateItemId_fkey" FOREIGN KEY ("templateItemId") REFERENCES "TemplateItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItemVariant" ADD CONSTRAINT "RestaurantMenuItemVariant_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "RestaurantMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantMenuItemVariant" ADD CONSTRAINT "RestaurantMenuItemVariant_templateVariantId_fkey" FOREIGN KEY ("templateVariantId") REFERENCES "TemplateItemVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierOption" ADD CONSTRAINT "ModifierOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemModifierGroup" ADD CONSTRAINT "MenuItemModifierGroup_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "RestaurantMenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemModifierGroup" ADD CONSTRAINT "MenuItemModifierGroup_modifierGroupId_fkey" FOREIGN KEY ("modifierGroupId") REFERENCES "ModifierGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiningTable" ADD CONSTRAINT "DiningTable_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiningSession" ADD CONSTRAINT "DiningSession_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiningSession" ADD CONSTRAINT "DiningSession_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiningSessionTable" ADD CONSTRAINT "DiningSessionTable_diningSessionId_fkey" FOREIGN KEY ("diningSessionId") REFERENCES "DiningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiningSessionTable" ADD CONSTRAINT "DiningSessionTable_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiningTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_diningSessionId_fkey" FOREIGN KEY ("diningSessionId") REFERENCES "DiningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantOrder" ADD CONSTRAINT "RestaurantOrder_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantOrder" ADD CONSTRAINT "RestaurantOrder_diningSessionId_fkey" FOREIGN KEY ("diningSessionId") REFERENCES "DiningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantOrder" ADD CONSTRAINT "RestaurantOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "RestaurantOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "RestaurantMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "RestaurantMenuItemVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModifier" ADD CONSTRAINT "OrderItemModifier_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModifier" ADD CONSTRAINT "OrderItemModifier_modifierOptionId_fkey" FOREIGN KEY ("modifierOptionId") REFERENCES "ModifierOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemStatusEvent" ADD CONSTRAINT "OrderItemStatusEvent_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemStatusEvent" ADD CONSTRAINT "OrderItemStatusEvent_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_diningSessionId_fkey" FOREIGN KEY ("diningSessionId") REFERENCES "DiningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementAllocation" ADD CONSTRAINT "SettlementAllocation_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementAllocation" ADD CONSTRAINT "SettlementAllocation_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "SettlementContribution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementAllocation" ADD CONSTRAINT "SettlementAllocation_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementAllocation" ADD CONSTRAINT "SettlementAllocation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementContribution" ADD CONSTRAINT "SettlementContribution_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementContribution" ADD CONSTRAINT "SettlementContribution_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementContribution" ADD CONSTRAINT "SettlementContribution_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedAdjustment" ADD CONSTRAINT "AppliedAdjustment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedAdjustment" ADD CONSTRAINT "AppliedAdjustment_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedAdjustment" ADD CONSTRAINT "AppliedAdjustment_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedAdjustment" ADD CONSTRAINT "AppliedAdjustment_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsJobRun" ADD CONSTRAINT "AnalyticsJobRun_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsJobRun" ADD CONSTRAINT "AnalyticsJobRun_triggeredByUserId_fkey" FOREIGN KEY ("triggeredByUserId") REFERENCES "AppUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticSalesDaily" ADD CONSTRAINT "AnalyticSalesDaily_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticSalesDaily" ADD CONSTRAINT "AnalyticSalesDaily_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "AnalyticsJobRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticItemVelocity" ADD CONSTRAINT "AnalyticItemVelocity_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticItemVelocity" ADD CONSTRAINT "AnalyticItemVelocity_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "AnalyticsJobRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticItemVelocity" ADD CONSTRAINT "AnalyticItemVelocity_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "RestaurantMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticServiceTimes" ADD CONSTRAINT "AnalyticServiceTimes_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticServiceTimes" ADD CONSTRAINT "AnalyticServiceTimes_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "AnalyticsJobRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticServiceTimes" ADD CONSTRAINT "AnalyticServiceTimes_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticDemandEstimate" ADD CONSTRAINT "AnalyticDemandEstimate_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticDemandEstimate" ADD CONSTRAINT "AnalyticDemandEstimate_jobRunId_fkey" FOREIGN KEY ("jobRunId") REFERENCES "AnalyticsJobRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticDemandEstimate" ADD CONSTRAINT "AnalyticDemandEstimate_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "RestaurantMenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ==========================================
-- CHECK CONSTRAINTS (Postgres)
-- ==========================================

-- TipPreset: exclusividad chain/restaurant
ALTER TABLE "TipPreset" ADD CONSTRAINT "TipPreset_exclusive_owner_check"
CHECK (
  ("chainId" IS NOT NULL AND "restaurantId" IS NULL) OR
  ("chainId" IS NULL AND "restaurantId" IS NOT NULL)
);

-- UserRole: contextType debe coincidir con la FK poblada
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_contextType_check"
CHECK (
  ("contextType" = 'CHAIN' AND "chainId" IS NOT NULL AND "zoneId" IS NULL AND "restaurantId" IS NULL) OR
  ("contextType" = 'ZONE' AND "zoneId" IS NOT NULL AND "chainId" IS NULL AND "restaurantId" IS NULL) OR
  ("contextType" = 'RESTAURANT' AND "restaurantId" IS NOT NULL AND "chainId" IS NULL AND "zoneId" IS NULL) OR
  ("contextType" = 'PLATFORM' AND "chainId" IS NULL AND "zoneId" IS NULL AND "restaurantId" IS NULL)
);

