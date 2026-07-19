-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingMethodCode" TEXT,
ADD COLUMN     "shippingMethodName" TEXT;

-- CreateIndex
CREATE INDEX "Order_shippingMethodId_idx" ON "Order"("shippingMethodId");
