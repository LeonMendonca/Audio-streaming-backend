-- AlterTable
ALTER TABLE "albums" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "artists" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "artists_songs" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "playlist_items" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "playlists" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "songs" ALTER COLUMN "updated_at" DROP NOT NULL;
