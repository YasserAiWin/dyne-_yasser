-- Add per-shop Evolution API configuration managed by the super admin.
ALTER TABLE "ShopWhatsappSetting"
ADD COLUMN "apiUrl" TEXT,
ADD COLUMN "apiKey" TEXT,
ADD COLUMN "instanceName" TEXT,
ADD COLUMN "senderPhone" TEXT;

-- Track outgoing WhatsApp attempts without blocking the debt/payment workflow.
CREATE TABLE "WhatsappMessageLog" (
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

CREATE INDEX "WhatsappMessageLog_shopId_idx" ON "WhatsappMessageLog"("shopId");
CREATE INDEX "WhatsappMessageLog_customerId_idx" ON "WhatsappMessageLog"("customerId");
CREATE INDEX "WhatsappMessageLog_transactionId_idx" ON "WhatsappMessageLog"("transactionId");
