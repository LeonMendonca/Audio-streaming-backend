import { IsArray, IsOptional, IsUUID, ArrayNotEmpty, IsString, IsDateString } from 'class-validator';

/**
 * DTO for creating a new Song.
 * - title: song title (required)
 * - genre: optional genre
 * - releaseDate: optional release date
 * - mainArtistId: the primary artist (required)
 * - featuringArtistIds: list of additional artists (required, non‑empty array)
 * - albumId: optional album reference
 */
export class CreateSongDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsUUID()
  mainArtistId: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  featuringArtistIds?: string[];

  @IsOptional()
  @IsUUID()
  albumId?: string;
}
