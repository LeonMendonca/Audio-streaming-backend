/*
  Warnings:

  - Made the column `ArtistID` on table `songs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_ArtistID_fkey";

-- AlterTable
ALTER TABLE "songs" ALTER COLUMN "ArtistID" SET NOT NULL,
ALTER COLUMN "Status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_ArtistID_fkey" FOREIGN KEY ("ArtistID") REFERENCES "artists"("ArtistID") ON DELETE RESTRICT ON UPDATE CASCADE;
