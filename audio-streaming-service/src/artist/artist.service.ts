import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma-service.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { RmqService } from 'src/rabbitmq/rabbitmq.service';


@Injectable()
export class ArtistService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly rmqService: RmqService
    ) { }

    async createArtist({ name, bio, imageUrl }: CreateArtistDto) {
        // Execute both inserts in a single transaction
        const artist = await this.prisma.$transaction(async (tx) => {
            // Insert artist and get generated ID
            const insertedArtist = await tx.$queryRaw<{ artistId: string }>`
                INSERT INTO artists (name, bio, image_url)
                VALUES (${name}, ${bio}, ${imageUrl})
                RETURNING artist_id as "artistId"
            `;
            // Insert default "Misc" album for the new artist
            await tx.$queryRaw`
                INSERT INTO albums (title, artist_id)
                VALUES ('Misc', ${insertedArtist.artistId})
            `;
            return insertedArtist;
        });
        return artist;
    }

    async uploadSong(file: Express.Multer.File[]) {
        this.rmqService.sendMessage(file)
    }

    async updateArtist(artistId: string, { name, bio, imageUrl }: UpdateArtistDto) {
        return this.prisma.$queryRaw`UPDATE artists SET name = ${name}, bio = ${bio}, image_url = ${imageUrl} WHERE artist_id = ${artistId}`
    }
}
