-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "onlineAccessInfo" JSONB,
    "userId" BIGINT,
    "userFirstName" TEXT,
    "userLastName" TEXT,
    "userEmail" TEXT,
    "isAccountOwner" BOOLEAN,
    "userLocale" TEXT,
    "isCollaborator" BOOLEAN,
    "isEmailVerified" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countdownWidget" (
    "content" TEXT NOT NULL,
    "shop" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "datePickerWidget" (
    "content" TEXT NOT NULL,
    "shop" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "dayDelivery" (
    "content" TEXT NOT NULL,
    "shop" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_shop_key" ON "stores"("shop");

-- CreateIndex
CREATE INDEX "stores_shop_idx" ON "stores"("shop");

-- CreateIndex
CREATE INDEX "session_id_idx" ON "session"("id");

-- CreateIndex
CREATE INDEX "session_shop_idx" ON "session"("shop");

-- CreateIndex
CREATE INDEX "session_isOnline_idx" ON "session"("isOnline");

-- CreateIndex
CREATE UNIQUE INDEX "countdownWidget_shop_key" ON "countdownWidget"("shop");

-- CreateIndex
CREATE INDEX "countdownWidget_shop_idx" ON "countdownWidget"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "datePickerWidget_shop_key" ON "datePickerWidget"("shop");

-- CreateIndex
CREATE INDEX "datePickerWidget_shop_idx" ON "datePickerWidget"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "dayDelivery_shop_key" ON "dayDelivery"("shop");

-- CreateIndex
CREATE INDEX "dayDelivery_shop_idx" ON "dayDelivery"("shop");
