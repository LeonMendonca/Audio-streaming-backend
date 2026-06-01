/*
  Warnings:

  - The primary key for the `albums` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `AlbumID` on the `albums` table. All the data in the column will be lost.
  - You are about to drop the column `ArtistID` on the `albums` table. All the data in the column will be lost.
  - You are about to drop the column `ReleaseDate` on the `albums` table. All the data in the column will be lost.
  - You are about to drop the column `Title` on the `albums` table. All the data in the column will be lost.
  - The primary key for the `artists` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ArtistID` on the `artists` table. All the data in the column will be lost.
  - You are about to drop the column `Bio` on the `artists` table. All the data in the column will be lost.
  - You are about to drop the column `Country` on the `artists` table. All the data in the column will be lost.
  - You are about to drop the column `ImageUrl` on the `artists` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `artists` table. All the data in the column will be lost.
  - The primary key for the `playlists` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CreatedAt` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `OwnerID` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `PlaylistID` on the `playlists` table. All the data in the column will be lost.
  - The primary key for the `songs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `AlbumID` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `ArtistID` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedAt` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `Duration` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `Genre` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `ReleaseDate` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `SongID` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `Title` on the `songs` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `Email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `LastLogin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `PasswordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `SubscriptionType` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `UserID` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `artistssongs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlistitems` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - The required column `album_id` was added to the `albums` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `artist_id` to the `albums` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `albums` table without a default value. This is not possible if the table is not empty.
  - The required column `artist_id` was added to the `artists` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `artists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - The required column `playlist_id` was added to the `playlists` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `artist_id` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `songs` table without a default value. This is not possible if the table is not empty.
  - The required column `song_id` was added to the `songs` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `title` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.
  - The required column `user_id` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "albums" DROP CONSTRAINT "albums_ArtistID_fkey";

-- DropForeignKey
ALTER TABLE "artistssongs" DROP CONSTRAINT "artistssongs_ArtistID_fkey";

-- DropForeignKey
ALTER TABLE "artistssongs" DROP CONSTRAINT "artistssongs_SongID_fkey";

-- DropForeignKey
ALTER TABLE "playlistitems" DROP CONSTRAINT "playlistitems_PlaylistID_fkey";

-- DropForeignKey
ALTER TABLE "playlistitems" DROP CONSTRAINT "playlistitems_SongID_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_OwnerID_fkey";

-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_AlbumID_fkey";

-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_ArtistID_fkey";

-- DropIndex
DROP INDEX "users_Email_key";

-- AlterTable
ALTER TABLE "albums" DROP CONSTRAINT "albums_pkey",
DROP COLUMN "AlbumID",
DROP COLUMN "ArtistID",
DROP COLUMN "ReleaseDate",
DROP COLUMN "Title",
ADD COLUMN     "album_id" TEXT NOT NULL,
ADD COLUMN     "artist_id" TEXT NOT NULL,
ADD COLUMN     "release_date" DATE,
ADD COLUMN     "title" TEXT NOT NULL,
ADD CONSTRAINT "albums_pkey" PRIMARY KEY ("album_id");

-- AlterTable
ALTER TABLE "artists" DROP CONSTRAINT "artists_pkey",
DROP COLUMN "ArtistID",
DROP COLUMN "Bio",
DROP COLUMN "Country",
DROP COLUMN "ImageUrl",
DROP COLUMN "Name",
ADD COLUMN     "artist_id" TEXT NOT NULL,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "name" VARCHAR(100) NOT NULL,
ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("artist_id");

-- AlterTable
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_pkey",
DROP COLUMN "CreatedAt",
DROP COLUMN "Name",
DROP COLUMN "OwnerID",
DROP COLUMN "PlaylistID",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "owner_id" TEXT NOT NULL,
ADD COLUMN     "playlist_id" TEXT NOT NULL,
ADD CONSTRAINT "playlists_pkey" PRIMARY KEY ("playlist_id");

-- AlterTable
ALTER TABLE "songs" DROP CONSTRAINT "songs_pkey",
DROP COLUMN "AlbumID",
DROP COLUMN "ArtistID",
DROP COLUMN "CreatedAt",
DROP COLUMN "Duration",
DROP COLUMN "Genre",
DROP COLUMN "ReleaseDate",
DROP COLUMN "SongID",
DROP COLUMN "Status",
DROP COLUMN "Title",
ADD COLUMN     "album_id" TEXT,
ADD COLUMN     "artist_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "release_date" DATE,
ADD COLUMN     "song_id" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "title" TEXT NOT NULL,
ADD CONSTRAINT "songs_pkey" PRIMARY KEY ("song_id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "Country",
DROP COLUMN "CreatedAt",
DROP COLUMN "Email",
DROP COLUMN "LastLogin",
DROP COLUMN "PasswordHash",
DROP COLUMN "SubscriptionType",
DROP COLUMN "UserID",
ADD COLUMN     "country" TEXT,
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "last_login" TIMESTAMPTZ(6),
ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "subscription_type" TEXT,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

-- DropTable
DROP TABLE "artistssongs";

-- DropTable
DROP TABLE "playlistitems";

-- CreateTable
CREATE TABLE "playlist_items" (
    "playlist_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("playlist_id","song_id")
);

-- CreateTable
CREATE TABLE "artists_songs" (
    "song_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,

    CONSTRAINT "artists_songs_pkey" PRIMARY KEY ("song_id","artist_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("playlist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("song_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("album_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artists_songs" ADD CONSTRAINT "artists_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("song_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artists_songs" ADD CONSTRAINT "artists_songs_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;
