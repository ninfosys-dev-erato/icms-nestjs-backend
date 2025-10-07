/*
  Warnings:

  - You are about to drop the column `caption` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `mediaType` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `backgroundPhoto` on the `office_settings` table. All the data in the column will be lost.
  - Added the required column `category` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentType` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileId` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folder` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."media_album_media" DROP CONSTRAINT "media_album_media_mediaId_fkey";

-- AlterTable
ALTER TABLE "public"."employees" ADD COLUMN     "photoMediaId" TEXT;

-- AlterTable
ALTER TABLE "public"."media" DROP COLUMN "caption",
DROP COLUMN "duration",
DROP COLUMN "filePath",
DROP COLUMN "fileSize",
DROP COLUMN "height",
DROP COLUMN "mediaType",
DROP COLUMN "mimeType",
DROP COLUMN "width",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fileId" TEXT NOT NULL,
ADD COLUMN     "folder" TEXT NOT NULL,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "title" TEXT,
ADD COLUMN     "uploadedBy" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "altText" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."office_settings" DROP COLUMN "backgroundPhoto",
ADD COLUMN     "backgroundPhotoId" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "profilePictureId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."office_settings" ADD CONSTRAINT "office_settings_backgroundPhotoId_fkey" FOREIGN KEY ("backgroundPhotoId") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employees" ADD CONSTRAINT "employees_photoMediaId_fkey" FOREIGN KEY ("photoMediaId") REFERENCES "public"."media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
