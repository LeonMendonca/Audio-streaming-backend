-- DropForeignKey
ALTER TABLE "artists_songs" DROP CONSTRAINT "artists_songs_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "artists_songs" DROP CONSTRAINT "artists_songs_song_id_fkey";

-- AddForeignKey
ALTER TABLE "artists_songs" ADD CONSTRAINT "artists_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("song_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artists_songs" ADD CONSTRAINT "artists_songs_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE CASCADE ON UPDATE CASCADE;
