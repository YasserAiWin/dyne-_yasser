-- Add per-shop Evolution API configuration managed by the super admin.
ALTER TABLE "ShopWhatsappSetting"
ADD COLUMN IF NOT EXISTS "apiUrl" TEXT,
ADD COLUMN IF NOT EXISTS "apiKey" TEXT,
ADD COLUMN IF NOT EXISTS "instanceName" TEXT,
ADD COLUMN IF NOT EXISTS "senderPhone" TEXT;

-- Track outgoing WhatsApp attempts without blocking the debt/payment workflow.
CREATE TABLE IF NOT EXISTS "WhatsappMessageLog" (
  "id" UUID NOT NULL,
  "shopId" UUID NOT NULL,
  "customerId" UUID,
  "transactionId" UUID,
  "recipient" TEXT NOT NULL,
  "messageType" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WhatsappMessageLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WhatsappMessageLog_shopId_idx" ON "WhatsappMessageLog"("shopId");
CREATE INDEX IF NOT EXISTS "WhatsappMessageLog_customerId_idx" ON "WhatsappMessageLog"("customerId");
CREATE INDEX IF NOT EXISTS "WhatsappMessageLog_transactionId_idx" ON "WhatsappMessageLog"("transactionId");
