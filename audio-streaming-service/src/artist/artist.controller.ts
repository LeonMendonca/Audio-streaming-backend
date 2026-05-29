import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseBoolPipe, ParseFilePipe, Put, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Body, Post } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

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
      // Validates file size in bytes
      new MaxFileSizeValidator({
        maxSize: 10 * 1024 * 1024,
        errorMessage: 'File size must be less than 10MB'
      }),
      // Validates mimetype
      new FileTypeValidator({
        fileType: /audio\/(mpeg|mp3|wav|ogg)/,
        errorMessage: 'File type must be valid'
      }),
    ]
  })) file: Express.Multer.File[]) {
    return "OK"
  }

  @Put()
  async updateArtist(@Query('artist_id') artistId: string, @Body() body: UpdateArtistDto) {
    console.log(artistId, body)
    return body;
    //return this.artistService.updateArtist(artistId, body)
  }
}
