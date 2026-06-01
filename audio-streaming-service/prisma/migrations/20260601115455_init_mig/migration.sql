-- CreateTable
CREATE TABLE "users" (
    "UserID" TEXT NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "CreatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastLogin" TIMESTAMPTZ(6),
    "SubscriptionType" TEXT,
    "Country" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "playlists" (
    "PlaylistID" TEXT NOT NULL,
    "OwnerID" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "CreatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("PlaylistID")
);

-- CreateTable
CREATE TABLE "playlistitems" (
    "PlaylistID" TEXT NOT NULL,
    "SongID" TEXT NOT NULL,
    "Position" INTEGER NOT NULL,
    "AddedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlistitems_pkey" PRIMARY KEY ("PlaylistID","SongID")
);

-- CreateTable
CREATE TABLE "songs" (
    "SongID" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Genre" TEXT,
    "Duration" INTEGER NOT NULL,
    "ReleaseDate" DATE,
    "CreatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ArtistID" TEXT,
    "AlbumID" TEXT,
    "Status" TEXT NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("SongID")
);

-- CreateTable
CREATE TABLE "artists" (
    "ArtistID" TEXT NOT NULL,
    "Name" VARCHAR(100) NOT NULL,
    "Country" TEXT,
    "Bio" TEXT,
    "ImageUrl" TEXT,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("ArtistID")
);

-- CreateTable
CREATE TABLE "albums" (
    "AlbumID" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "ReleaseDate" DATE,
    "ArtistID" TEXT NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("AlbumID")
);

-- CreateTable
CREATE TABLE "artistssongs" (
    "SongID" TEXT NOT NULL,
    "ArtistID" TEXT NOT NULL,

    CONSTRAINT "artistssongs_pkey" PRIMARY KEY ("SongID","ArtistID")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_Email_key" ON "users"("Email");

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_OwnerID_fkey" FOREIGN KEY ("OwnerID") REFERENCES "users"("UserID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlistitems" ADD CONSTRAINT "playlistitems_PlaylistID_fkey" FOREIGN KEY ("PlaylistID") REFERENCES "playlists"("PlaylistID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlistitems" ADD CONSTRAINT "playlistitems_SongID_fkey" FOREIGN KEY ("SongID") REFERENCES "songs"("SongID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_ArtistID_fkey" FOREIGN KEY ("ArtistID") REFERENCES "artists"("ArtistID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_AlbumID_fkey" FOREIGN KEY ("AlbumID") REFERENCES "albums"("AlbumID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_ArtistID_fkey" FOREIGN KEY ("ArtistID") REFERENCES "artists"("ArtistID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artistssongs" ADD CONSTRAINT "artistssongs_SongID_fkey" FOREIGN KEY ("SongID") REFERENCES "songs"("SongID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artistssongs" ADD CONSTRAINT "artistssongs_ArtistID_fkey" FOREIGN KEY ("ArtistID") REFERENCES "artists"("ArtistID") ON DELETE RESTRICT ON UPDATE CASCADE;
