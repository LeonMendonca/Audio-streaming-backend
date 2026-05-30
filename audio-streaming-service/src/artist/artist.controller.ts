import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseBoolPipe, ParseFilePipe, Put, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Body, Post } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AudioPipe } from './pipes/audio.pipe';

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) { }

  @Post()
  async createArtist(@Body() body: CreateArtistDto) {
    return this.artistService.createArtist(body)
  }

  @UseInterceptors(FilesInterceptor('songs', 10))
  @Post('upload')
  async uploadSong(@UploadedFiles(new ParseFilePipe({
    validators: [
      new AudioPipe(
        {
          maxDuration: 600,
          minBitrate: 128000,
          allowedCodecs: ['mp3', 'aac', 'opus'],
          allowedExtensions: ['mp3', 'wav', 'ogg', 'mpeg'],
          maxFileSize: 10 * 1024 * 1024
        }
      )
    ]
  })) files: Express.Multer.File[]) {
    console.log("FLE", files)
    this.artistService.uploadSong(files)
    return "OK"
  }

  @Put()
  async updateArtist(@Query('artist_id') artistId: string, @Body() body: UpdateArtistDto) {
    console.log(artistId, body)
    return body;
    //return this.artistService.updateArtist(artistId, body)
  }
}
