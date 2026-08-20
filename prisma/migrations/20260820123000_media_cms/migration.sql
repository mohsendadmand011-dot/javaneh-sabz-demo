-- Expand persistent media metadata without invalidating existing uploads.
ALTER TABLE "Media" ADD COLUMN "originalFilename" TEXT;
ALTER TABLE "Media" ADD COLUMN "storedFilename" TEXT;
ALTER TABLE "Media" ADD COLUMN "fileType" TEXT;
ALTER TABLE "Media" ADD COLUMN "width" INTEGER;
ALTER TABLE "Media" ADD COLUMN "height" INTEGER;
ALTER TABLE "Media" ADD COLUMN "duration" INTEGER;
ALTER TABLE "Media" ADD COLUMN "caption" TEXT;
ALTER TABLE "Media" ADD COLUMN "uploadedByUserId" TEXT;
ALTER TABLE "Media" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Media" SET
  "originalFilename" = "name",
  "storedFilename" = COALESCE("storageKey", "id"),
  "storageKey" = COALESCE("storageKey", "id"),
  "fileType" = CASE WHEN "mimeType" LIKE 'video/%' THEN 'VIDEO' ELSE 'IMAGE' END;

ALTER TABLE "Media" ALTER COLUMN "originalFilename" SET NOT NULL;
ALTER TABLE "Media" ALTER COLUMN "storedFilename" SET NOT NULL;
ALTER TABLE "Media" ALTER COLUMN "storageKey" SET NOT NULL;
ALTER TABLE "Media" ALTER COLUMN "fileType" SET NOT NULL;

ALTER TABLE "Article" ADD COLUMN "coverMediaId" TEXT;
ALTER TABLE "Event" ADD COLUMN "coverMediaId" TEXT;

CREATE TABLE "ProductVideo" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ArticleMedia" (
  "id" TEXT NOT NULL,
  "articleId" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'INLINE',
  "order" INTEGER NOT NULL DEFAULT 0,
  "caption" TEXT,
  CONSTRAINT "ArticleMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Media_storedFilename_key" ON "Media"("storedFilename");
CREATE UNIQUE INDEX "Media_storageKey_key" ON "Media"("storageKey");
CREATE INDEX "Media_fileType_createdAt_idx" ON "Media"("fileType", "createdAt");
CREATE INDEX "Media_uploadedByUserId_idx" ON "Media"("uploadedByUserId");
CREATE UNIQUE INDEX "ProductVideo_productId_mediaId_key" ON "ProductVideo"("productId", "mediaId");
CREATE INDEX "ProductVideo_productId_order_idx" ON "ProductVideo"("productId", "order");
CREATE UNIQUE INDEX "ArticleMedia_articleId_mediaId_role_key" ON "ArticleMedia"("articleId", "mediaId", "role");
CREATE INDEX "ArticleMedia_articleId_order_idx" ON "ArticleMedia"("articleId", "order");

ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductVideo" ADD CONSTRAINT "ProductVideo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductVideo" ADD CONSTRAINT "ProductVideo_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ArticleMedia" ADD CONSTRAINT "ArticleMedia_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ArticleMedia" ADD CONSTRAINT "ArticleMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
