import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-service/prisma-service.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistService {
    constructor(private readonly prisma: PrismaService) { }

    async createArtist({ name, bio, imageUrl }: CreateArtistDto) {
        return this.prisma.$queryRaw`INSERT INTO artists (name, bio, image_url) VALUES (${name}, ${bio}, ${imageUrl})`
    }

    async updateArtist(artistId: string, { name, bio, imageUrl }: UpdateArtistDto) {
        return this.prisma.$queryRaw`UPDATE artists SET name = ${name}, bio = ${bio}, image_url = ${imageUrl} WHERE artist_id = ${artistId}`
    }
}
