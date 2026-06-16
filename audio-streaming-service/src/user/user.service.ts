import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma-service/prisma-service.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password, country } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO users (email, password_hash, country)
      VALUES (${email}, ${hashedPassword}, ${country ?? null})
      RETURNING *;
    `;
    return result[0];
  }

  async findAll() {
    return this.prisma.$queryRaw<any[]>`SELECT * FROM users;`;
  }

  async findOne(id: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM users WHERE user_id = ${id}::uuid;
    `;
    if (!result || result.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result[0];
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      UPDATE users 
      SET 
        email = COALESCE(${updateUserDto.email ?? null}, email), 
        country = COALESCE(${updateUserDto.country ?? null}, country),
        updated_at = NOW()
      WHERE user_id = ${id}::uuid
      RETURNING *;
    `;
    return result[0];
  }

  async remove(id: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      DELETE FROM users WHERE user_id = ${id}::uuid RETURNING *;
    `;
    return result[0];
  }

  // Playlist Management
  async createPlaylist(userId: string, createPlaylistDto: CreatePlaylistDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO playlists (name, owner_id)
      VALUES (${createPlaylistDto.name}, ${userId}::uuid)
      RETURNING *;
    `;
    return result[0];
  }

  async updatePlaylist(playlistId: string, updatePlaylistDto: UpdatePlaylistDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      UPDATE playlists
      SET 
        name = COALESCE(${updatePlaylistDto.name ?? null}, name),
        updated_at = NOW()
      WHERE playlist_id = ${playlistId}::uuid
      RETURNING *;
    `;
    return result[0];
  }

  async deletePlaylist(playlistId: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      DELETE FROM playlists WHERE playlist_id = ${playlistId}::uuid RETURNING *;
    `;
    return result[0];
  }

  async addPlaylistItem(playlistId: string, addPlaylistItemDto: AddPlaylistItemDto) {
    const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO playlist_items (playlist_id, song_id, position)
      VALUES (${playlistId}::uuid, ${addPlaylistItemDto.songId}::uuid, ${addPlaylistItemDto.position})
      RETURNING *;
    `;
    return result[0];
  }

  async removePlaylistItem(playlistId: string, songId: string) {
    const result = await this.prisma.$queryRaw<any[]>`
      DELETE FROM playlist_items 
      WHERE playlist_id = ${playlistId}::uuid AND song_id = ${songId}::uuid 
      RETURNING *;
    `;
    return result[0];
  }
}
