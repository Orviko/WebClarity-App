-- AlterEnum: Add IMAGES_ALT and SOCIAL_VIEW to ShareType
ALTER TYPE "ShareType" ADD VALUE 'IMAGES_ALT';
ALTER TYPE "ShareType" ADD VALUE 'SOCIAL_VIEW';

-- CreateTable: ImagesAltData
CREATE TABLE "imagesAltData" (
    "id" TEXT NOT NULL,
    "imagesData" JSONB NOT NULL,
    "exportOptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagesAltData_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SocialViewData
CREATE TABLE "socialViewData" (
    "id" TEXT NOT NULL,
    "socialData" JSONB NOT NULL,
    "exportOptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "socialViewData_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add foreign keys to share
ALTER TABLE "share" ADD COLUMN "imagesAltDataId" TEXT;
ALTER TABLE "share" ADD COLUMN "socialViewDataId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "share_imagesAltDataId_key" ON "share"("imagesAltDataId");
CREATE UNIQUE INDEX "share_socialViewDataId_key" ON "share"("socialViewDataId");

-- AddForeignKey
ALTER TABLE "share" ADD CONSTRAINT "share_imagesAltDataId_fkey" FOREIGN KEY ("imagesAltDataId") REFERENCES "imagesAltData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "share" ADD CONSTRAINT "share_socialViewDataId_fkey" FOREIGN KEY ("socialViewDataId") REFERENCES "socialViewData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
