import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/playlists')
  createPlaylist(@Param('id') id: string, @Body() createPlaylistDto: CreatePlaylistDto) {
    return this.userService.createPlaylist(id, createPlaylistDto);
  }

  @Patch('playlists/:playlistId')
  updatePlaylist(@Param('playlistId') playlistId: string, @Body() updatePlaylistDto: UpdatePlaylistDto) {
    return this.userService.updatePlaylist(playlistId, updatePlaylistDto);
  }

  @Delete('playlists/:playlistId')
  deletePlaylist(@Param('playlistId') playlistId: string) {
    return this.userService.deletePlaylist(playlistId);
  }

  @Post('playlists/:playlistId/items')
  addPlaylistItem(@Param('playlistId') playlistId: string, @Body() addPlaylistItemDto: AddPlaylistItemDto) {
    return this.userService.addPlaylistItem(playlistId, addPlaylistItemDto);
  }

  @Delete('playlists/:playlistId/items/:songId')
  removePlaylistItem(@Param('playlistId') playlistId: string, @Param('songId') songId: string) {
    return this.userService.removePlaylistItem(playlistId, songId);
  }
}
