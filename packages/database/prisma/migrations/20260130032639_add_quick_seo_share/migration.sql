-- AlterEnum
ALTER TYPE "ShareType" ADD VALUE 'QUICK_SEO';

-- CreateTable
CREATE TABLE "quickSeoData" (
    "id" TEXT NOT NULL,
    "seoData" JSONB NOT NULL,
    "exportOptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quickSeoData_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "share" ADD COLUMN "quickSeoDataId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "share_quickSeoDataId_key" ON "share"("quickSeoDataId");

-- AddForeignKey
ALTER TABLE "share" ADD CONSTRAINT "share_quickSeoDataId_fkey" FOREIGN KEY ("quickSeoDataId") REFERENCES "quickSeoData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
