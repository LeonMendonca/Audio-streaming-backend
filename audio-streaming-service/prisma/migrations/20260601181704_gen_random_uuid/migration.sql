-- AlterTable
ALTER TABLE "albums" ALTER COLUMN "album_id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "artists" ALTER COLUMN "artist_id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "playlists" ALTER COLUMN "playlist_id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "songs" ALTER COLUMN "song_id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "user_id" SET DEFAULT gen_random_uuid();
