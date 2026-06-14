import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma-service.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { CreateSongDto } from './dto/create-song.dto';
import { RmqService } from 'src/rabbitmq/rabbitmq.service';
import { Prisma } from '../../generated/prisma/client';


@Injectable()
export class ArtistService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly rmqService: RmqService
    ) { }

    async createArtist({ name, bio, imageUrl }: CreateArtistDto) {
        // Execute both inserts in a single transaction
        const [{ artistId }] = await this.prisma.$transaction(async (tx) => {
            // Insert artist and get generated ID
            const insertedArtist = await tx.$queryRaw<{ artistId: string }[]>`
                INSERT INTO artists (name, bio, image_url)
                VALUES (${name}, ${bio}, ${imageUrl})
                RETURNING artist_id as "artistId"
            `;
            // Insert default "Misc" album for the new artist
            await tx.$queryRaw`
                INSERT INTO albums (title, artist_id, is_default)
                VALUES ('Misc', ${insertedArtist[0].artistId}, true)
            `;
            return insertedArtist;
        });
        return artistId;
    }

    // NOTE : Though files are sent, we only use the first file for now.
    // since, uploadSong supports only 1 song at a time
    async uploadSong(body: CreateSongDto, files: Express.Multer.File[]) {
        let songId: string;
        try {
            songId = await this.prisma.$transaction(async (tx) => {
                const [{ albumId }] = await tx.$queryRaw<{ albumId: string }[]>`
                SELECT al.album_id FROM artists ar 
                INNER JOIN albums al 
                USING(artist_id) 
                WHERE ar.artist_id = ${body.mainArtistId} 
                AND al.is_default = true`;

                const [{ songId }] = await tx.$queryRaw<{ songId: string }[]>`
                INSERT INTO songs (title, genre, duration, release_date, artist_id, album_id)
                VALUES (
                    ${body.title},
                    ${body.genre},
                    ${Math.round((files[0] as any)?.duration || 0)},
                    ${body.releaseDate ? new Date(body.releaseDate) : null},
                    ${body.mainArtistId},
                    ${albumId || null}
                )
                RETURNING song_id as "songId"
            `;

                const allArtists = body.featuringArtistIds?.map((fa) => {
                    return {
                        songId: songId,
                        artistId: fa,
                    }
                }) || [];

                allArtists.push({
                    songId: songId,
                    artistId: body.mainArtistId,
                });

                await tx.$queryRaw`
                INSERT INTO artists_songs (song_id, artist_id)
                VALUES ${Prisma.join(allArtists.map(a => Prisma.sql`(${a.songId}, ${a.artistId})`))}
            `;

                return songId;
            });

            this.rmqService.sendMessage({ songId: songId, file: files[0], retries: 0 });
            return songId;
        } catch (error) {
            throw new HttpException("Failed to upload song", 500);
        }
    }

    async updateSongStatus(songId: string, status: string) {
        await this.prisma.$queryRaw`UPDATE songs SET status = ${status} WHERE song_id = ${songId} AND status != 'FAILED'`;
    }

    async updateArtist(artistId: string, { name, bio, imageUrl }: UpdateArtistDto) {
        return this.prisma.$queryRaw`UPDATE artists SET name = ${name}, bio = ${bio}, image_url = ${imageUrl} WHERE artist_id = ${artistId}`
    }
}
